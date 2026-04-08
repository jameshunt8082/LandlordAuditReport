// Detailed Results Page
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ReportData } from '@/lib/pdf/formatters';
import { COLORS, FONTS, LAYOUT, setTextColorHex } from '../styles';
import { addPageHeader } from '../components/header';
import { addPageFooter } from '../components/footer';
import { drawJustifiedText } from '../utils';

/**
 * Generate Detailed Results Page
 * Uses the same autoTable styling approach as Recommended Actions for consistency.
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
  const introWrapped = drawJustifiedText(doc, introText, startX, yPos, contentWidth);
  yPos += introWrapped.length * 4 + 15;

  // Combine all questions
  const allQuestions = [
    ...data.questionResponses.red,
    ...data.questionResponses.orange,
    ...data.questionResponses.green,
  ];

  const tableBody = allQuestions.map((question) => [
    question.questionText,
    question.answer,
    question.comment || '-',
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [['Question', 'Answer', 'Comment']],
    body: tableBody,
    theme: 'grid',
    headStyles: {
      fillColor: hexToRgb(COLORS.paleBlue),
      textColor: hexToRgb(COLORS.black),
      fontSize: 10,
      fontStyle: 'bold',
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 9,
      textColor: hexToRgb(COLORS.black),
      cellPadding: 3,
      valign: 'top',
    },
    columnStyles: {
      0: { cellWidth: 65 },
      1: { cellWidth: 55 },
      2: { cellWidth: 50 },
    },
    didDrawPage: () => {
      addPageFooter(doc);
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
