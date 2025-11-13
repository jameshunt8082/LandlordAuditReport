// Detailed Results Page
import jsPDF from 'jspdf';
import { ReportData, QuestionResponseData } from '@/lib/pdf/formatters';
import { COLORS, FONTS, LAYOUT, setFillColorHex, setTextColorHex, setDrawColorHex } from '../styles';
import { addNewPageIfNeeded } from '../utils';
import { addPageHeader } from '../components/header';
import { addPageFooter } from '../components/footer';
import { drawTrafficLight } from '../components/trafficLight';

/**
 * Draw a question card
 */
function drawQuestionCard(
  doc: jsPDF,
  question: QuestionResponseData,
  startX: number,
  yPos: number,
  contentWidth: number
): number {
  const cardPadding = 8;
  let cardY = yPos;
  
  // Card background
  setFillColorHex(doc, COLORS.white);
  setDrawColorHex(doc, COLORS.lightGray);
  doc.setLineWidth(0.2);
  
  // We'll draw the border after we know the height
  const borderY = cardY;
  cardY += cardPadding;
  
  // Question number and category
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  setTextColorHex(doc, COLORS.blue);
  doc.text(`Q${question.number}`, startX + cardPadding, cardY);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  setTextColorHex(doc, COLORS.mediumGray);
  doc.text(`${question.category} | ${question.subcategory}`, startX + cardPadding + 25, cardY);
  cardY += 8;
  
  // Question text
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  setTextColorHex(doc, COLORS.black);
  const questionWrapped = doc.splitTextToSize(question.questionText, contentWidth - cardPadding * 3);
  doc.text(questionWrapped, startX + cardPadding, cardY);
  cardY += questionWrapped.length * 4 + 5;
  
  // Answer label
  doc.setFont('helvetica', 'bold');
  doc.text('Answer:', startX + cardPadding, cardY);
  cardY += 5;
  
  // Answer text with traffic light as bullet
  doc.setFont('helvetica', 'normal');
  
  // Draw traffic light BEFORE text (as bullet replacement)
  const bulletX = startX + cardPadding + 2;
  const bulletY = cardY - 1.5;
  drawTrafficLight(doc, bulletX, bulletY, question.color, 1.5);
  
  // Answer text (NO bullet character, traffic light IS the bullet)
  const answerTextX = startX + cardPadding + 8; // Start after traffic light
  const answerMaxWidth = contentWidth - cardPadding * 3 - 8;
  const answerWrapped = doc.splitTextToSize(question.answer, answerMaxWidth);
  doc.text(answerWrapped, answerTextX, cardY);
  
  cardY += answerWrapped.length * 4 + cardPadding;
  
  // Draw card border now that we know height
  const cardHeight = cardY - borderY;
  setDrawColorHex(doc, COLORS.lightGray);
  doc.setLineWidth(0.2);
  doc.roundedRect(startX, borderY, contentWidth, cardHeight, 1, 1, 'S');
  
  return cardY;
}

/**
 * Generate Detailed Results Page
 */
export async function detailedResults(doc: jsPDF, data: ReportData): Promise<void> {
  const { margins, contentWidth } = LAYOUT;
  const startX = margins.left;
  
  doc.addPage();
  addPageHeader(doc, doc.getCurrentPageInfo().pageNumber, 999);
  
  let yPos = margins.top + 15;
  
  // Title
  doc.setFontSize(FONTS.h1.size);
  doc.setFont('helvetica', FONTS.h1.style);
  setTextColorHex(doc, COLORS.primaryGreen);
  doc.text('Detailed Results', startX, yPos);
  yPos += 20;
  
  // Introduction
  doc.setFontSize(FONTS.body.size);
  doc.setFont('helvetica', 'normal');
  setTextColorHex(doc, COLORS.black);
  
  const introText = 'This section provides a comprehensive breakdown of all audit questions, categorized by their scoring level. Each question includes the selected answer, any additional comments provided, and the associated score.';
  const introWrapped = doc.splitTextToSize(introText, contentWidth);
  doc.text(introWrapped, startX, yPos);
  yPos += introWrapped.length * 4 + 10;
  
  const categoryText = 'Questions are organized into three traffic light categories:';
  doc.text(categoryText, startX, yPos);
  yPos += 8;
  
  // Traffic light explanations
  const bulletX = startX + 5;
  
  drawTrafficLight(doc, bulletX, yPos - 1.5, 'red', 1.5);
  doc.setFont('helvetica', 'bold');
  setTextColorHex(doc, COLORS.red);
  doc.text('Red (Low Scoring - 1-3):', bulletX + 8, yPos);
  doc.setFont('helvetica', 'normal');
  setTextColorHex(doc, COLORS.black);
  doc.text('Critical issues requiring immediate attention and corrective action.', bulletX + 8, yPos + 4);
  yPos += 10;
  
  drawTrafficLight(doc, bulletX, yPos - 1.5, 'orange', 1.5);
  doc.setFont('helvetica', 'bold');
  setTextColorHex(doc, COLORS.orange);
  doc.text('Orange (Medium Scoring - 4-6):', bulletX + 8, yPos);
  doc.setFont('helvetica', 'normal');
  setTextColorHex(doc, COLORS.black);
  doc.text('Areas that need improvement to meet compliance standards.', bulletX + 8, yPos + 4);
  yPos += 10;
  
  drawTrafficLight(doc, bulletX, yPos - 1.5, 'green', 1.5);
  doc.setFont('helvetica', 'bold');
  setTextColorHex(doc, COLORS.green);
  doc.text('Green (High Scoring - 7-10):', bulletX + 8, yPos);
  doc.setFont('helvetica', 'normal');
  setTextColorHex(doc, COLORS.black);
  doc.text('Well-managed areas demonstrating good compliance practices.', bulletX + 8, yPos + 4);
  yPos += 20;
  
  // RED QUESTIONS SECTION
  doc.setFontSize(FONTS.h2.size);
  doc.setFont('helvetica', FONTS.h2.style);
  setTextColorHex(doc, COLORS.black);
  doc.text('Red (Low) Scoring Answers', startX, yPos);
  yPos += 12;
  
  if (data.questionResponses.red.length === 0) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    setTextColorHex(doc, COLORS.darkGreen);
    doc.text('Excellent! You have no critical issues. All questions scored above the red threshold.', startX, yPos);
    yPos += 15;
  } else {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'italic');
    setTextColorHex(doc, COLORS.mediumGray);
    const redIntro = 'These questions received low scores (1-3) and require immediate attention. Critical compliance issues that could result in fines or legal action.';
    const redIntroWrapped = doc.splitTextToSize(redIntro, contentWidth);
    doc.text(redIntroWrapped, startX, yPos);
    yPos += redIntroWrapped.length * 4 + 10;
    
    data.questionResponses.red.forEach((question, idx) => {
      // Ensure card doesn't split across pages
      yPos = addNewPageIfNeeded(doc, yPos, 40);
      
      const cardEndY = drawQuestionCard(doc, question, startX, yPos, contentWidth);
      yPos = cardEndY + 12; // Spacing between cards
    });
  }
  
  yPos += 10;
  
  // ORANGE QUESTIONS SECTION
  yPos = addNewPageIfNeeded(doc, yPos, 30);
  
  doc.setFontSize(FONTS.h2.size);
  doc.setFont('helvetica', FONTS.h2.style);
  setTextColorHex(doc, COLORS.black);
  doc.text('Orange (Medium) Scoring Answers', startX, yPos);
  yPos += 12;
  
  if (data.questionResponses.orange.length === 0) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    setTextColorHex(doc, COLORS.darkGreen);
    doc.text('Great! You have no medium-level issues.', startX, yPos);
    yPos += 15;
  } else {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'italic');
    setTextColorHex(doc, COLORS.mediumGray);
    const orangeIntro = 'These questions scored 4-6 and represent areas for improvement to achieve full compliance.';
    const orangeIntroWrapped = doc.splitTextToSize(orangeIntro, contentWidth);
    doc.text(orangeIntroWrapped, startX, yPos);
    yPos += orangeIntroWrapped.length * 4 + 10;
    
    data.questionResponses.orange.forEach((question, idx) => {
      yPos = addNewPageIfNeeded(doc, yPos, 40);
      
      const cardEndY = drawQuestionCard(doc, question, startX, yPos, contentWidth);
      yPos = cardEndY + 12;
    });
  }
  
  yPos += 10;
  
  // GREEN QUESTIONS SECTION
  yPos = addNewPageIfNeeded(doc, yPos, 30);
  
  doc.setFontSize(FONTS.h2.size);
  doc.setFont('helvetica', FONTS.h2.style);
  setTextColorHex(doc, COLORS.black);
  doc.text('Green (High) Scoring Answers', startX, yPos);
  yPos += 12;
  
  if (data.questionResponses.green.length === 0) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    setTextColorHex(doc, COLORS.mediumGray);
    doc.text('No high-scoring answers in this audit.', startX, yPos);
  } else {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'italic');
    setTextColorHex(doc, COLORS.mediumGray);
    const greenIntro = 'These questions scored 7-10, demonstrating strong compliance and good practices.';
    const greenIntroWrapped = doc.splitTextToSize(greenIntro, contentWidth);
    doc.text(greenIntroWrapped, startX, yPos);
    yPos += greenIntroWrapped.length * 4 + 10;
    
    data.questionResponses.green.forEach((question, idx) => {
      yPos = addNewPageIfNeeded(doc, yPos, 40);
      
      const cardEndY = drawQuestionCard(doc, question, startX, yPos, contentWidth);
      yPos = cardEndY + 12;
    });
  }
  
  addPageFooter(doc);
}

