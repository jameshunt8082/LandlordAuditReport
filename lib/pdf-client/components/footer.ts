// Page Footer Component
import jsPDF from 'jspdf';
import { LAYOUT, COLORS, setFillColorHex } from '../styles';
import { BRAND_LOGO_BASE64 } from './logoBase64';
import { drawTrafficLightGraphic } from './trafficLight';

/**
 * Add custom full-width olive page footer
 */
export function addPageFooter(doc: jsPDF): void {
  const { pageWidth, pageHeight } = LAYOUT;
  
  const footerHeight = 22;
  const footerY = pageHeight - footerHeight;

  // Draw full-width olive background
  setFillColorHex(doc, COLORS.footerOlive || '#6b7654');
  doc.rect(0, footerY, pageWidth, footerHeight, 'F');

  // Left Side: Brand Logo (Actual PNG Image)
  const startX = 15;
  const logoHeight = 14; 
  // Dimensions 756x225 -> width is ~3.36 x height
  const logoWidth = logoHeight * (756 / 225); 
  doc.addImage(BRAND_LOGO_BASE64, 'PNG', startX, footerY + 4, logoWidth, logoHeight);

  // Right Side: Graphic Traffic Lights Strip Embed
  const graphicHeight = 16;
  const graphicWidth = graphicHeight * (200 / 621);
  const endX = pageWidth - 15 - graphicWidth;
  const centeredY = footerY + (footerHeight - graphicHeight) / 2;

  drawTrafficLightGraphic(doc, endX, centeredY, graphicWidth, graphicHeight, graphicHeight * 0.04);
}
