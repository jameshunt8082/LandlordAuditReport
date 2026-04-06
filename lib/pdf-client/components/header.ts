// Page Header Component
import jsPDF from 'jspdf';
import { LAYOUT, COLORS, setDrawColorHex, setTextColorHex } from '../styles';

/**
 * Add page header with decorative line only
 * Page numbers are added later via updateAllPageNumbers()
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
  
  // Page number will be added later by updateAllPageNumbers()
}

/**
 * Update page numbers on a specific page
 * Called after all pages are generated
 */
export function updatePageNumber(
  doc: jsPDF,
  pageNumber: number,
  totalPages: number
): void {
  const { margins, pageWidth } = LAYOUT;
  
  // Add page number (right-aligned) perfectly to the top right
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  setTextColorHex(doc, COLORS.mediumGray || '#888888');
  
  // Ensure perfectly flush with the right margin, raised slightly above the line
  doc.text(
    `PAGE ${pageNumber} OF ${totalPages}`,
    pageWidth - margins.right,
    margins.top - 7.5,
    { align: 'right' }
  );
}

