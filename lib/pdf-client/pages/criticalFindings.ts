// Critical Findings Page
import jsPDF from 'jspdf';
import { ReportData, QuestionResponseData } from '@/lib/pdf/formatters';
import { COLORS, FONTS, LAYOUT, setFillColorHex, setTextColorHex, setDrawColorHex } from '../styles';
import { addNewPageIfNeeded, wrapText } from '../utils';
import { addPageHeader } from '../components/header';
import { addPageFooter } from '../components/footer';

/**
 * Get legal consequence text for a question
 */
function getConsequence(questionNumber: string): string {
  if (questionNumber.startsWith('1.1') || questionNumber.startsWith('1.2')) {
    return 'Fines exceeding £5,000 per certificate violation. Personal liability for tenant injuries. Prosecution for non-compliance with safety regulations.';
  }
  if (questionNumber.startsWith('3.1')) {
    return 'Fines up to £30,000 per property. Rent repayment orders covering 12 months. Property prohibition preventing legal letting.';
  }
  if (questionNumber.startsWith('1.5')) {
    return 'Unlimited fines for HMO fire safety violations. Potential imprisonment if fire incident occurs. Prohibition orders preventing occupation.';
  }
  if (questionNumber.startsWith('19.')) {
    return 'Compensation claims of 1-3x deposit amount. Automatic tribunal ruling against landlord. Cannot enforce any deposit deductions.';
  }
  if (questionNumber.startsWith('9.')) {
    return 'Eviction proceedings invalidated entirely. Legal fees wasted. Must restart process from beginning with 6+ month delays.';
  }
  
  return 'Tribunal claims and potential financial penalties. Enforcement action possible. Licensing authority sanctions may apply.';
}

/**
 * Generate Critical Findings Page
 */
export async function criticalFindings(doc: jsPDF, data: ReportData): Promise<void> {
  const { pageWidth, margins, contentWidth } = LAYOUT;
  const startX = margins.left;
  
  doc.addPage();
  addPageHeader(doc, doc.getCurrentPageInfo().pageNumber, 999);
  
  let yPos = margins.top + 15;
  
  // Title
  doc.setFontSize(FONTS.h1.size);
  doc.setFont('helvetica', FONTS.h1.style);
  setTextColorHex(doc, COLORS.primaryGreen);
  doc.text('Critical Findings Summary', startX, yPos);
  yPos += 20;
  
  const criticalQuestions = data.questionResponses.red;
  
  if (criticalQuestions.length > 0) {
    // Alert Box (red border, light red background) - Dynamic height
    const alertY = yPos;
    
    // Calculate alert text height first
    doc.setFontSize(10);
    const alertText = 'The following findings expose you to immediate legal action, prosecution, and substantial financial penalties. These items require urgent remediation within 7 days. Professional legal consultation is strongly recommended for items involving statutory violations.';
    const wrappedAlert = doc.splitTextToSize(alertText, contentWidth - 16);
    const alertTextHeight = wrappedAlert.length * 4;
    const alertHeight = 20 + alertTextHeight;
    
    // Draw alert box
    setFillColorHex(doc, '#fff5f5');
    setDrawColorHex(doc, COLORS.red);
    doc.setLineWidth(0.5);
    doc.roundedRect(startX, alertY, contentWidth, alertHeight, 2, 2, 'FD');
    
    // Alert title (remove Unicode warning symbol)
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    setTextColorHex(doc, COLORS.red);
    doc.text(
      `URGENT: ${criticalQuestions.length} Critical Non-Compliance Issue${criticalQuestions.length > 1 ? 's' : ''} Identified`,
      startX + 8,
      alertY + 10
    );
    
    // Alert description
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    setTextColorHex(doc, COLORS.black);
    doc.text(wrappedAlert, startX + 8, alertY + 17);
    
    yPos = alertY + alertHeight + 15;
    
    // Section title
    doc.setFontSize(FONTS.h2.size);
    doc.setFont('helvetica', FONTS.h2.style);
    setTextColorHex(doc, COLORS.red);
    doc.text('Items Requiring Immediate Action', startX, yPos);
    yPos += 12;
    
    // Finding cards
    criticalQuestions.forEach((question, idx) => {
      const cardHeight = 50; // Estimated height
      yPos = addNewPageIfNeeded(doc, yPos, cardHeight);
      
      const cardY = yPos;
      
      // Card background with red left border
      setFillColorHex(doc, COLORS.white);
      doc.roundedRect(startX, cardY, contentWidth, 1, 1, 1, 'F'); // Will adjust height after content
      
      setDrawColorHex(doc, COLORS.red);
      doc.setLineWidth(1);
      doc.line(startX, cardY, startX, cardY + 45);
      
      setDrawColorHex(doc, '#e5e7eb');
      doc.setLineWidth(0.2);
      doc.roundedRect(startX, cardY, contentWidth, 1, 1, 1, 'S'); // Will adjust
      
      let cardYPos = cardY + 8;
      
      // Header: Question number and category
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      setTextColorHex(doc, COLORS.red);
      doc.text(`Q${question.number}`, startX + 8, cardYPos);
      
      // Category text with wrapping to prevent overflow
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      setTextColorHex(doc, COLORS.mediumGray);
      const categoryText = `${question.category} / ${question.subcategory}`;
      // Available width: contentWidth - card padding (8mm each side) - Q number space (30mm)
      const categoryMaxWidth = contentWidth - 46;
      const categoryWrapped = doc.splitTextToSize(categoryText, categoryMaxWidth);
      doc.text(categoryWrapped, startX + 38, cardYPos);
      
      cardYPos += Math.max(10, categoryWrapped.length * 3.5);
      
      // Separator
      setDrawColorHex(doc, '#e5e7eb');
      doc.setLineWidth(0.1);
      doc.line(startX + 8, cardYPos, pageWidth - margins.right - 8, cardYPos);
      cardYPos += 6;
      
      // Issue
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      setTextColorHex(doc, COLORS.black);
      doc.text('Issue: ', startX + 8, cardYPos);
      
      doc.setFont('helvetica', 'normal');
      const questionWrapped = doc.splitTextToSize(question.questionText, contentWidth - 35);
      doc.text(questionWrapped, startX + 22, cardYPos);
      cardYPos += questionWrapped.length * 4 + 4;
      
      // Current Status
      doc.setFont('helvetica', 'bold');
      doc.text('Current Status: ', startX + 8, cardYPos);
      
      doc.setFont('helvetica', 'normal');
      const answerWrapped = doc.splitTextToSize(question.answer, contentWidth - 40);
      doc.text(answerWrapped, startX + 35, cardYPos);
      cardYPos += answerWrapped.length * 4 + 4;
      
      // Legal Consequences Box
      const consequenceBoxY = cardYPos;
      const consequenceBoxHeight = 18;
      setFillColorHex(doc, '#fef2f2');
      doc.rect(startX + 8, consequenceBoxY, contentWidth - 16, consequenceBoxHeight, 'F');
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      setTextColorHex(doc, COLORS.red);
      doc.text('Legal Consequences:', startX + 12, consequenceBoxY + 6);
      
      doc.setFont('helvetica', 'normal');
      setTextColorHex(doc, COLORS.black);
      const consequenceText = doc.splitTextToSize(getConsequence(question.number), contentWidth - 24);
      doc.text(consequenceText, startX + 12, consequenceBoxY + 11);
      
      cardYPos = consequenceBoxY + consequenceBoxHeight + 3;
      
      // Draw actual card border now that we know height
      const actualCardHeight = cardYPos - cardY;
      setDrawColorHex(doc, '#e5e7eb');
      doc.setLineWidth(0.2);
      doc.roundedRect(startX, cardY, contentWidth, actualCardHeight, 1, 1, 'S');
      
      yPos = cardYPos + 10;
    });
  } else {
    // No critical issues - green success box
    const boxHeight = 35;
    setFillColorHex(doc, '#f0fdf4');
    setDrawColorHex(doc, COLORS.darkGreen);
    doc.setLineWidth(0.5);
    doc.roundedRect(startX, yPos, contentWidth, boxHeight, 2, 2, 'FD');
    
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    setTextColorHex(doc, COLORS.darkGreen);
    doc.text('No Critical Non-Compliance Issues Identified', startX + 10, yPos + 12);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    setTextColorHex(doc, COLORS.black);
    const successText = 'This audit identified no critical statutory violations. You are not currently exposed to immediate prosecution or prohibition orders. Continue maintaining current compliance standards and address medium-priority items within recommended timeframes.';
    const wrappedSuccess = doc.splitTextToSize(successText, contentWidth - 20);
    doc.text(wrappedSuccess, startX + 10, yPos + 20);
  }
  
  addPageFooter(doc);
}

/**
 * Helper to convert hex to RGB
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

