// Executive Summary Page
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ReportData } from '@/lib/pdf/formatters';
import { COLORS, FONTS, LAYOUT, setFillColorHex, setTextColorHex, setDrawColorHex, getTrafficLightColor, formatScore } from '../styles';
import { formatReportDate, generateReportId, addNewPageIfNeeded } from '../utils';
import { addPageHeader } from '../components/header';
import { addPageFooter } from '../components/footer';
import { drawTrafficLight } from '../components/trafficLight';

/**
 * Generate Executive Summary Page
 */
export async function executiveSummary(doc: jsPDF, data: ReportData): Promise<void> {
  const { pageWidth, margins, contentWidth } = LAYOUT;
  const startX = margins.left;
  
  // Add new page
  doc.addPage();
  
  // Page header (will update page numbers at the end)
  addPageHeader(doc, doc.getCurrentPageInfo().pageNumber, 999);
  
  let yPos = margins.top + 15;
  
  // Title
  doc.setFontSize(FONTS.h1.size);
  doc.setFont('helvetica', FONTS.h1.style);
  setTextColorHex(doc, COLORS.primaryGreen);
  doc.text('Executive Summary', startX, yPos);
  yPos += 25;
  
  // Generate Report ID
  const reportId = generateReportId(data.propertyAddress, data.auditEndDate);
  
  // Metadata Grid
  doc.setFontSize(10);
  setTextColorHex(doc, COLORS.black);
  
  const metadataRows: [string, string][] = [
    ['Property', data.propertyAddress],
    ['Client', data.landlordName],
    ['Report ID', reportId],
    ['Report Date', formatReportDate(data.auditEndDate)],
  ];
  
  autoTable(doc, {
    startY: yPos,
    head: [],
    body: metadataRows,
    theme: 'plain',
    styles: {
      fontSize: 11,
      cellPadding: 2,
    },
    columnStyles: {
      0: { fontStyle: 'bold', textColor: hexToRgb(COLORS.mediumGray), cellWidth: 60 },
      1: { fontStyle: 'bold', textColor: hexToRgb(COLORS.black) },
    },
    margin: { 
      left: startX,
      top: margins.top + 10,
      bottom: margins.bottom + 5,
    },
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 15;
  
  // Decorative line
  setDrawColorHex(doc, COLORS.primaryGreen);
  doc.setLineWidth(0.5);
  doc.line(startX, yPos, pageWidth - margins.right, yPos);
  yPos += 20;
  
  // Overall Risk Box (blue background)
  const boxHeight = 55;
  setFillColorHex(doc, COLORS.paleBlue);
  setDrawColorHex(doc, COLORS.blue);
  doc.setLineWidth(0.5);
  doc.roundedRect(startX, yPos, contentWidth, boxHeight, 2, 2, 'FD');
  
  const boxY = yPos + 8;
  
  // "Overall Compliance Score" label
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  setTextColorHex(doc, COLORS.black);
  doc.text('Overall Compliance Score', startX + 10, boxY);
  
  // Score and traffic light
  const scoreY = boxY + 15;
  doc.setFontSize(36);
  doc.setFont('helvetica', 'bold');
  setTextColorHex(doc, COLORS.black);
  const scoreText = formatScore(data.overallScore);
  doc.text(scoreText, startX + 10, scoreY);
  
  // Traffic light next to score (calculate position based on score text width)
  const scoreWidth = doc.getTextWidth(scoreText);
  const trafficLightColor = getTrafficLightColor(data.overallScore);
  // Position traffic light 12mm to the right of score text end (more spacing)
  drawTrafficLight(doc, startX + 10 + scoreWidth + 12, scoreY - 4, trafficLightColor, 3);
  
  // Risk Classification and Compliance Status
  const detailsY = scoreY + 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  setTextColorHex(doc, COLORS.black);
  
  const tierNumber = parseInt(data.riskTier.split('_')[1]);
  const riskLabels = ['Minimal Risk', 'Low Risk', 'Moderate Risk', 'High Risk', 'Severe Risk'];
  const riskLabel = riskLabels[tierNumber] || 'Unknown';
  
  doc.text(`Risk Classification: Tier ${tierNumber} - ${riskLabel}`, startX + 10, detailsY);
  
  // Count areas meeting standards
  const totalAreas = data.subcategoryScores.length;
  const meetingStandards = data.subcategoryScores.filter(s => s.score >= 7).length;
  const needingAction = data.subcategoryScores.filter(s => s.score < 4).length;
  
  doc.text(
    `Compliance Status: ${meetingStandards} of ${totalAreas} areas meet standards (${needingAction} require immediate action)`,
    startX + 10,
    detailsY + 7,
    { maxWidth: contentWidth - 20 }
  );
  
  yPos += boxHeight + 20;
  
  // Compliance by Category Table
  doc.setFontSize(FONTS.h3.size);
  doc.setFont('helvetica', FONTS.h3.style);
  setTextColorHex(doc, COLORS.black);
  doc.text('Compliance by Category', startX, yPos);
  yPos += 10;
  
  const complianceCategories = [
    {
      category: 'Documentation',
      score: data.categoryScores.documentation.score,
      color: getTrafficLightColor(data.categoryScores.documentation.score),
    },
    {
      category: 'Landlord-Tenant Communication',
      score: data.categoryScores.communication.score,
      color: getTrafficLightColor(data.categoryScores.communication.score),
    },
    {
      category: 'Evidence Gathering',
      score: data.categoryScores.evidenceGathering.score,
      color: getTrafficLightColor(data.categoryScores.evidenceGathering.score),
    },
  ];
  
  // Extract colors for didDrawCell scope
  const complianceColors = complianceCategories.map(c => c.color);
  
  autoTable(doc, {
    startY: yPos,
    head: [['Category', 'Score', 'Status']],
    body: complianceCategories.map(item => [
      item.category,
      formatScore(item.score),
      '', // Traffic light will be drawn in didDrawCell
    ]),
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
      textColor: hexToRgb(COLORS.black),
    },
    columnStyles: {
      0: { cellWidth: 100, halign: 'left' },
      1: { cellWidth: 35, halign: 'center' },
      2: { cellWidth: 35, halign: 'center' },
    },
    didDrawCell: (cellData) => {
      // Draw traffic lights in Status column
      if (cellData.column.index === 2 && cellData.section === 'body') {
        const rowIndex = cellData.row.index;
        if (rowIndex < complianceColors.length) {
          const color = complianceColors[rowIndex];
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
  
  yPos = (doc as any).lastAutoTable.finalY + 20;
  
  // Critical Findings Summary
  if (data.questionResponses.red.length > 0) {
    yPos = addNewPageIfNeeded(doc, yPos, 50);
    
    doc.setFontSize(FONTS.h3.size);
    doc.setFont('helvetica', FONTS.h3.style);
    setTextColorHex(doc, COLORS.black);
    doc.text('Legal Requirement Findings Requiring Immediate Action', startX, yPos);
    yPos += 10;
    
    // List up to 5 critical findings
    const criticalItems = data.questionResponses.red.slice(0, 5);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    setTextColorHex(doc, COLORS.black);
    
    criticalItems.forEach((item, index) => {
      const text = `${index + 1}. ${item.subcategory}: ${item.questionText.substring(0, 100)}${item.questionText.length > 100 ? '...' : ''}`;
      const wrappedText = doc.splitTextToSize(text, contentWidth - 10);
      
      yPos = addNewPageIfNeeded(doc, yPos, wrappedText.length * 4);
      
      doc.text(wrappedText, startX + 5, yPos);
      yPos += wrappedText.length * 4 + 3;
    });
  }
  
  // Add footer
  addPageFooter(doc);
}

/**
 * Helper to convert hex to RGB array
 */
function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return [0, 0, 0];
  return [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16),
  ];
}

