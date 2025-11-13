// Introduction Page
import jsPDF from 'jspdf';
import { ReportData } from '@/lib/pdf/formatters';
import { COLORS, FONTS, LAYOUT, setFillColorHex, setTextColorHex } from '../styles';
import { addPageHeader } from '../components/header';
import { addPageFooter } from '../components/footer';
import { drawTrafficLight } from '../components/trafficLight';

/**
 * Generate Introduction Page
 */
export async function introduction(doc: jsPDF, data: ReportData): Promise<void> {
  const { margins, contentWidth } = LAYOUT;
  const startX = margins.left;
  
  doc.addPage();
  addPageHeader(doc, doc.getCurrentPageInfo().pageNumber, 999);
  
  let yPos = margins.top + 15;
  
  // Title
  doc.setFontSize(FONTS.h1.size);
  doc.setFont('helvetica', FONTS.h1.style);
  setTextColorHex(doc, COLORS.primaryGreen);
  doc.text('Introduction to This Report', startX, yPos);
  yPos += 20;
  
  // Purpose
  doc.setFontSize(FONTS.body.size);
  doc.setFont('helvetica', 'normal');
  setTextColorHex(doc, COLORS.black);
  
  const purposeText = 'This report provides a comprehensive assessment of your compliance with landlord legal obligations and industry best practices. It identifies areas of strength and highlights critical gaps requiring immediate attention to avoid legal penalties, financial losses, and reputational damage.';
  const wrapped = doc.splitTextToSize(purposeText, contentWidth);
  doc.text(wrapped, startX, yPos);
  yPos += wrapped.length * 4 + 20;
  
  // Traffic Light System section
  doc.setFontSize(FONTS.h2.size);
  doc.setFont('helvetica', FONTS.h2.style);
  doc.text('What the Colours and Scores Mean', startX, yPos);
  yPos += 15;
  
  // Red (1-3)
  const trafficLightX = startX + 5;
  drawTrafficLight(doc, trafficLightX, yPos - 1.5, 'red', 2.5);
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  setTextColorHex(doc, COLORS.red);
  doc.text('Red (Low Scoring - 1-3):', startX + 15, yPos);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  setTextColorHex(doc, COLORS.black);
  const redText = 'Critical issues requiring immediate attention and corrective action.';
  const redWrapped = doc.splitTextToSize(redText, contentWidth - 15);
  doc.text(redWrapped, startX + 15, yPos + 5);
  yPos += redWrapped.length * 4 + 10;
  
  // Orange (4-6)
  drawTrafficLight(doc, trafficLightX, yPos - 1.5, 'orange', 2.5);
  
  doc.setFont('helvetica', 'bold');
  setTextColorHex(doc, COLORS.orange);
  doc.text('Orange (Medium Scoring - 4-6):', startX + 15, yPos);
  
  doc.setFont('helvetica', 'normal');
  setTextColorHex(doc, COLORS.black);
  const orangeText = 'Areas that need improvement to meet compliance standards.';
  const orangeWrapped = doc.splitTextToSize(orangeText, contentWidth - 15);
  doc.text(orangeWrapped, startX + 15, yPos + 5);
  yPos += orangeWrapped.length * 4 + 10;
  
  // Green (7-10)
  drawTrafficLight(doc, trafficLightX, yPos - 1.5, 'green', 2.5);
  
  doc.setFont('helvetica', 'bold');
  setTextColorHex(doc, COLORS.green);
  doc.text('Green (High Scoring - 7-10):', startX + 15, yPos);
  
  doc.setFont('helvetica', 'normal');
  setTextColorHex(doc, COLORS.black);
  const greenText = 'Well-managed areas demonstrating good compliance practices.';
  const greenWrapped = doc.splitTextToSize(greenText, contentWidth - 15);
  doc.text(greenWrapped, startX + 15, yPos + 5);
  yPos += greenWrapped.length * 4 + 20;
  
  // How to use this report section
  doc.setFontSize(FONTS.h2.size);
  doc.setFont('helvetica', 'bold');
  setTextColorHex(doc, COLORS.black);
  doc.text('How to Use This Report', startX, yPos);
  yPos += 12;
  
  doc.setFontSize(FONTS.body.size);
  doc.setFont('helvetica', 'normal');
  
  const steps = [
    'Review the Executive Summary for an overview of your compliance status',
    'Address all Critical Findings (red items) within 7 days to avoid legal penalties',
    'Implement the Priority Action Plan for medium-term improvements',
    'Use the Detailed Results section to understand specific compliance gaps',
    'Consider the recommended follow-on services for professional assistance',
  ];
  
  steps.forEach((step, idx) => {
    const stepText = `${idx + 1}. ${step}`;
    const stepWrapped = doc.splitTextToSize(stepText, contentWidth - 10);
    doc.text(stepWrapped, startX + 5, yPos);
    yPos += stepWrapped.length * 4 + 5;
  });
  
  addPageFooter(doc);
}

