// Compliance Status Page
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ReportData } from '@/lib/pdf/formatters';
import { COLORS, FONTS, LAYOUT, setFillColorHex, setTextColorHex, setDrawColorHex } from '../styles';
import { addNewPageIfNeeded } from '../utils';
import { addPageHeader } from '../components/header';
import { addPageFooter } from '../components/footer';
import { drawTrafficLight } from '../components/trafficLight';

interface ComplianceItem {
  requirement: string;
  status: 'PASS' | 'FAIL' | 'PARTIAL';
  action: string;
}

/**
 * Determine compliance status for a question
 */
function getComplianceStatus(data: ReportData, questionNumber: string): 'PASS' | 'FAIL' | 'PARTIAL' {
  const allQuestions = [
    ...data.questionResponses.red,
    ...data.questionResponses.orange,
    ...data.questionResponses.green,
  ];
  const question = allQuestions.find(q => q.number === questionNumber);
  if (!question) return 'PARTIAL';
  
  if (question.score >= 7) return 'PASS';
  if (question.score <= 3) return 'FAIL';
  return 'PARTIAL';
}

/**
 * Generate Compliance Status Page
 */
export async function complianceStatus(doc: jsPDF, data: ReportData): Promise<void> {
  const { margins, contentWidth } = LAYOUT;
  const startX = margins.left;
  
  doc.addPage();
  addPageHeader(doc, doc.getCurrentPageInfo().pageNumber, 999);
  
  let yPos = margins.top + 15;
  
  // Title
  doc.setFontSize(FONTS.h1.size);
  doc.setFont('helvetica', FONTS.h1.style);
  setTextColorHex(doc, COLORS.primaryGreen);
  doc.text('Legal Compliance Status', startX, yPos);
  yPos += 20;
  
  // Count statutory violations
  const statutoryViolations = data.questionResponses.red.filter(q => 
    q.number.startsWith('1.1') || q.number.startsWith('1.2') || q.number.startsWith('3.1')
  ).length;
  
  // Critical warning box if statutory violations exist
  if (statutoryViolations > 0) {
    const warningHeight = 30;
    
    // Ensure warning doesn't split across pages
    yPos = addNewPageIfNeeded(doc, yPos, warningHeight + 5);
    
    setFillColorHex(doc, '#fff5f5');
    setDrawColorHex(doc, COLORS.red);
    doc.setLineWidth(0.8);
    doc.roundedRect(startX, yPos, contentWidth, warningHeight, 2, 2, 'FD');
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    setTextColorHex(doc, COLORS.red);
    doc.text(`CRITICAL COMPLIANCE: ${statutoryViolations} Legal Violations`, startX + 10, yPos + 10);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    setTextColorHex(doc, COLORS.black);
    const warningText = 'You are currently in violation of legal requirements. This exposes you to immediate prosecution, substantial fines, and potential prohibition from letting. Urgent remediation within 7 days is required. Professional legal advice is strongly recommended.';
    const wrapped = doc.splitTextToSize(warningText, contentWidth - 20);
    doc.text(wrapped, startX + 10, yPos + 18);
    
    yPos += warningHeight + 15;
  }
  
  // Compliance requirements
  const complianceItems: ComplianceItem[] = [
    {
      requirement: 'Current Gas Safety Certificate',
      status: getComplianceStatus(data, '1.1'),
      action: 'Obtain valid certificate within 7 days if missing',
    },
    {
      requirement: 'Current EICR',
      status: getComplianceStatus(data, '1.1'),
      action: 'Required for all tenancies',
    },
    {
      requirement: 'Current EPC (Rated E or above)',
      status: getComplianceStatus(data, '1.1'),
      action: 'Cannot legally let without valid EPC',
    },
    {
      requirement: 'Certificate Provision to Tenants',
      status: getComplianceStatus(data, '1.2'),
      action: 'Provide copies within 28 days',
    },
    {
      requirement: 'Deposit Protection',
      status: getComplianceStatus(data, '19.1'),
      action: 'Protect within 30 days of receipt',
    },
    {
      requirement: 'Section 21 Compliance',
      status: getComplianceStatus(data, '9.1'),
      action: 'Ensure all prerequisites met before serving',
    },
  ];
  
  // Extract status as colors for didDrawCell
  const statusColors = complianceItems.map(item => {
    if (item.status === 'FAIL') return 'red';
    if (item.status === 'PARTIAL') return 'orange';
    return 'green';
  });
  
  const tableData = complianceItems.map(item => [
    item.requirement,
    '', // Empty for traffic light
    item.action,
  ]);
  
  autoTable(doc, {
    startY: yPos,
    head: [['Requirement', 'Status', 'Action Required']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: hexToRgb(COLORS.paleBlue),
      textColor: hexToRgb(COLORS.black),
      fontSize: 11,
      fontStyle: 'bold',
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 10,
      textColor: hexToRgb(COLORS.black),
    },
    columnStyles: {
      0: { cellWidth: 70, halign: 'left' },
      1: { cellWidth: 25, halign: 'center' },
      2: { cellWidth: 75, halign: 'left' },
    },
    didDrawCell: (cellData) => {
      // Draw traffic lights in Status column
      if (cellData.column.index === 1 && cellData.section === 'body') {
        const rowIndex = cellData.row.index;
        if (rowIndex < statusColors.length) {
          const color = statusColors[rowIndex] as 'red' | 'orange' | 'green';
          const cellX = cellData.cell.x + cellData.cell.width / 2;
          const cellY = cellData.cell.y + cellData.cell.height / 2;
          drawTrafficLight(doc, cellX, cellY, color, 2);
        }
      }
    },
    margin: { 
      left: startX,
      top: margins.top + 10,
      bottom: margins.bottom + 5,
    },
  });
  
  addPageFooter(doc);
}

function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return [0, 0, 0];
  return [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16),
  ];
}

