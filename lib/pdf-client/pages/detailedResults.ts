// Detailed Results Page
import jsPDF from 'jspdf';
import { ReportData, QuestionResponseData } from '@/lib/pdf/formatters';
import { COLORS, FONTS, LAYOUT, setFillColorHex, setTextColorHex, setDrawColorHex } from '../styles';
import { addNewPageIfNeeded } from '../utils';
import { addPageHeader } from '../components/header';
import { addPageFooter } from '../components/footer';

/**
 * Draw a question in table row format
 */
function drawQuestionRow(
  doc: jsPDF,
  question: QuestionResponseData,
  startX: number,
  yPos: number,
  contentWidth: number
): number {
  const columnWidths = {
    question: contentWidth * 0.35,
    answer: contentWidth * 0.35,
    comment: contentWidth * 0.30,
  };
  
  const padding = 4;
  const fontSize = 9;
  const lineHeight = 3.5;
  
  doc.setFontSize(fontSize);
  doc.setFont('helvetica', 'normal');
  setTextColorHex(doc, COLORS.black);
  
  // Calculate row height based on text wrapping
  const questionWrapped = doc.splitTextToSize(question.questionText, columnWidths.question - padding * 2);
  const answerWrapped = doc.splitTextToSize(question.answer, columnWidths.answer - padding * 2);
  const commentWrapped = question.comment 
    ? doc.splitTextToSize(question.comment, columnWidths.comment - padding * 2)
    : [''];
  
  const maxLines = Math.max(questionWrapped.length, answerWrapped.length, commentWrapped.length);
  const rowHeight = maxLines * lineHeight + padding * 2;
  
  // Draw row border
  setDrawColorHex(doc, COLORS.mediumGray);
  doc.setLineWidth(0.3);
  doc.line(startX, yPos + rowHeight, startX + contentWidth, yPos + rowHeight);
  
  // Draw question text
  doc.text(questionWrapped, startX + padding, yPos + padding + lineHeight);
  
  // Draw answer text
  doc.text(answerWrapped, startX + columnWidths.question + padding, yPos + padding + lineHeight);
  
  // Draw comment text
  if (question.comment) {
    setTextColorHex(doc, COLORS.mediumGray);
    doc.text(commentWrapped, startX + columnWidths.question + columnWidths.answer + padding, yPos + padding + lineHeight);
  }
  
  return yPos + rowHeight;
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
  
  const introText = 'This section provides a comprehensive breakdown of all audit questions. Each question includes the selected answer and any additional comments provided.';
  const introWrapped = doc.splitTextToSize(introText, contentWidth);
  doc.text(introWrapped, startX, yPos);
  yPos += introWrapped.length * 4 + 15;
  
  // Table Header
  const columnWidths = {
    question: contentWidth * 0.35,
    answer: contentWidth * 0.35,
    comment: contentWidth * 0.30,
  };
  
  const headerHeight = 10;
  setFillColorHex(doc, COLORS.lightGray);
  doc.rect(startX, yPos, contentWidth, headerHeight, 'F');
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  setTextColorHex(doc, COLORS.black);
  doc.text('Question', startX + 4, yPos + 6.5);
  doc.text('Answer', startX + columnWidths.question + 4, yPos + 6.5);
  doc.text('Comment', startX + columnWidths.question + columnWidths.answer + 4, yPos + 6.5);
  
  setDrawColorHex(doc, COLORS.mediumGray);
  doc.setLineWidth(0.5);
  doc.line(startX, yPos + headerHeight, startX + contentWidth, yPos + headerHeight);
  
  yPos += headerHeight;
  
  // Combine all questions
  const allQuestions = [
    ...data.questionResponses.red,
    ...data.questionResponses.orange,
    ...data.questionResponses.green
  ];
  
  // Draw all questions as table rows
  allQuestions.forEach((question) => {
    // Check if we need a new page (estimate 20mm min space needed)
    yPos = addNewPageIfNeeded(doc, yPos, 20);
    
    yPos = drawQuestionRow(doc, question, startX, yPos, contentWidth);
  });
  
  addPageFooter(doc);
}

