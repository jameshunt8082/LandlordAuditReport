// Page Header Component
import jsPDF from 'jspdf';
import { LAYOUT, COLORS, setDrawColorHex, setTextColorHex } from '../styles';

/**
 * Add page header with decorative line and page number
 */
export function addPageHeader(
  doc: jsPDF,
  pageNumber: number,
  totalPages: number
): void {
  const { margins, pageWidth } = LAYOUT;
  
  // Add decorative green line
  setDrawColorHex(doc, COLORS.primaryGreen);
  doc.setLineWidth(0.5);
  doc.line(margins.left, margins.top - 5, pageWidth - margins.right, margins.top - 5);
  
  // Add page number (right-aligned)
  doc.setFontSize(9);
  setTextColorHex(doc, COLORS.mediumGray);
  doc.text(
    `Page ${pageNumber} of ${totalPages}`,
    pageWidth - margins.right,
    margins.top - 8,
    { align: 'right' }
  );
}

