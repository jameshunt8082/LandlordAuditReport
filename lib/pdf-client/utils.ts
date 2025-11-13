// PDF Utility Functions
import jsPDF from 'jspdf';
import { LAYOUT } from './styles';

/**
 * Wrap text to fit within max width
 */
export function wrapText(
  doc: jsPDF,
  text: string,
  maxWidth: number
): string[] {
  return doc.splitTextToSize(text, maxWidth);
}

/**
 * Calculate height required for wrapped text
 */
export function calculateTextHeight(
  doc: jsPDF,
  text: string,
  maxWidth: number,
  lineHeight: number = 1.15
): number {
  const lines = wrapText(doc, text, maxWidth);
  const fontSize = doc.getFontSize();
  // Convert pt to mm: 1pt = 0.352778mm
  return lines.length * fontSize * lineHeight * 0.352778;
}

/**
 * Add new page if needed, returns current Y position
 */
export function addNewPageIfNeeded(
  doc: jsPDF,
  currentY: number,
  requiredSpace: number,
  addHeader: boolean = true
): number {
  if (currentY + requiredSpace > LAYOUT.pageHeight - LAYOUT.margins.bottom) {
    doc.addPage();
    return LAYOUT.margins.top + (addHeader ? 20 : 0);
  }
  return currentY;
}

/**
 * Check if new page is needed (without adding it)
 */
export function needsNewPage(currentY: number, requiredSpace: number): boolean {
  return currentY + requiredSpace > LAYOUT.pageHeight - LAYOUT.margins.bottom;
}

/**
 * Center text horizontally on page
 */
export function getCenterX(): number {
  return LAYOUT.pageWidth / 2;
}

/**
 * Get content start X (left margin)
 */
export function getContentX(): number {
  return LAYOUT.margins.left;
}

/**
 * Get content width (page width minus margins)
 */
export function getContentWidth(): number {
  return LAYOUT.contentWidth;
}

/**
 * Draw a rounded rectangle
 */
export function drawRoundedRect(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  style: 'F' | 'S' | 'FD' = 'S'
): void {
  doc.roundedRect(x, y, width, height, radius, radius, style);
}

/**
 * Format date for report (e.g., "12-Nov-2024")
 */
export function formatReportDate(date: Date): string {
  const day = date.getDate();
  const month = date.toLocaleString('en-US', { month: 'short' });
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

/**
 * Generate report ID based on property address hash
 */
export function generateReportId(propertyAddress: string, date: Date): string {
  const addressHash = propertyAddress
    .split('')
    .reduce((hash, char) => ((hash << 5) - hash) + char.charCodeAt(0), 0)
    .toString(36)
    .substring(0, 6)
    .toUpperCase();
    
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  
  return `LRA-${year}-${month}-${addressHash}`;
}

