// Page Footer Component
import jsPDF from 'jspdf';
import { LAYOUT, COLORS, setTextColorHex } from '../styles';

/**
 * Add page footer with copyright notice
 */
export function addPageFooter(doc: jsPDF): void {
  const { margins, pageWidth, pageHeight } = LAYOUT;
  const year = new Date().getFullYear();
  
  doc.setFontSize(10);
  setTextColorHex(doc, COLORS.mediumGray);
  doc.text(
    `© ${year} Landlord Safeguarding. All rights reserved.`,
    pageWidth / 2,
    pageHeight - margins.bottom + 15,
    { align: 'center' }
  );
}

