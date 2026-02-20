// Methodology Page
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ReportData } from '@/lib/pdf/formatters';
import { COLORS, FONTS, LAYOUT, setFillColorHex, setTextColorHex, setDrawColorHex } from '../styles';
import { addPageHeader } from '../components/header';
import { addPageFooter } from '../components/footer';

/**
 * Generate Methodology Page
 */
export async function methodology(doc: jsPDF, data: ReportData): Promise<void> {
  const { margins, contentWidth } = LAYOUT;
  const startX = margins.left;
  
  doc.addPage();
  addPageHeader(doc, doc.getCurrentPageInfo().pageNumber, 999);
  
  let yPos = margins.top + 15;
  
  // Title
  doc.setFontSize(FONTS.h1.size);
  doc.setFont('helvetica', FONTS.h1.style);
  setTextColorHex(doc, COLORS.primaryGreen);
  doc.text('Audit Methodology', startX, yPos);
  yPos += 20;
  
  // Methodology description
  doc.setFontSize(FONTS.body.size);
  doc.setFont('helvetica', 'normal');
  setTextColorHex(doc, COLORS.black);
  
  const methodologyText = 'This compliance audit was conducted using a structured assessment framework designed to evaluate landlord practices against legal requirements and industry best practices. The methodology ensures comprehensive coverage of legal requirement compliance areas while maintaining objectivity and consistency.';
  const wrapped = doc.splitTextToSize(methodologyText, contentWidth);
  doc.text(wrapped, startX, yPos);
  yPos += wrapped.length * 4 + 15;
  
  // Audit Scope section
  doc.setFontSize(FONTS.h2.size);
  doc.setFont('helvetica', FONTS.h2.style);
  setTextColorHex(doc, COLORS.black);
  doc.text('Audit Scope', startX, yPos);
  yPos += 12;
  
  doc.setFontSize(FONTS.body.size);
  doc.setFont('helvetica', 'normal');
  doc.text('This audit examined the following areas:', startX, yPos);
  yPos += 10;
  
  // Bullet points
  const bulletPoints = [
    {
      title: 'Documentation Systems:',
      text: 'Safety certificates, tenancy agreements, council licensing, financial records, maintenance logs, and tenant communications.',
    },
    {
      title: 'Communication Protocols:',
      text: 'Written record systems, complaint handling procedures, notice protocols, response time tracking, and tenant accessibility.',
    },
    {
      title: 'Evidence Collection:',
      text: 'Photographic evidence, inspection procedures, witness statements, timestamping protocols, and secure storage systems.',
    },
  ];
  
  bulletPoints.forEach(item => {
    doc.setFont('helvetica', 'bold');
    doc.text(`• ${item.title}`, startX + 5, yPos);
    
    doc.setFont('helvetica', 'normal');
    const itemText = doc.splitTextToSize(item.text, contentWidth - 20);
    doc.text(itemText, startX + 10, yPos + 5);
    yPos += itemText.length * 4 + 8;
  });
  
  yPos += 10;
  
  // Total questions info box
  const totalQuestions = data.questionResponses.red.length + 
                        data.questionResponses.orange.length + 
                        data.questionResponses.green.length;
  
  setFillColorHex(doc, '#f8f9fa');
  setDrawColorHex(doc, COLORS.blue);
  doc.setLineWidth(0.8);
  doc.roundedRect(startX, yPos, contentWidth, 20, 2, 2, 'FD');
  
  doc.setFontSize(10);
  setTextColorHex(doc, COLORS.black);
  doc.text(
    `Total Assessment Questions: ${totalQuestions} | Categories Assessed: 3 | Subcategories: ${data.subcategoryScores.length}`,
    startX + 10,
    yPos + 12
  );
  
  yPos += 30;
  
  // Audit Scope Table
  doc.setFontSize(FONTS.h3.size);
  doc.setFont('helvetica', FONTS.h3.style);
  doc.text('Assessment Components', startX, yPos);
  yPos += 10;
  
  const scopeData = [
    ['Documentation Review', 'Completed'],
    ['Records Examination', 'Completed'],
    ['Site Inspection', 'Not Included'],
    ['Tenant Interviews', 'Not Included'],
  ];
  
  autoTable(doc, {
    startY: yPos,
    head: [['Component', 'Status']],
    body: scopeData,
    theme: 'grid',
    headStyles: {
      fillColor: hexToRgb(COLORS.paleBlue),
      textColor: hexToRgb(COLORS.black),
      fontSize: 12,
      fontStyle: 'bold',
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 11,
    },
    columnStyles: {
      0: { cellWidth: 100 },
      1: { cellWidth: 70, halign: 'center' },
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

