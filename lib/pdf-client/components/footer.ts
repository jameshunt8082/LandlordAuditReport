// Page Footer Component
import jsPDF from 'jspdf';
import { LAYOUT, COLORS, setFillColorHex, setTextColorHex } from '../styles';
import { BRAND_LOGO_BASE64, TRAFFIC_LIGHT_BASE64 } from './logoBase64';

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
  // The provided traffic-light.png is a 512x512 square, so we MUST 
  // lock the width and height to a 1:1 aspect ratio to avoid distortion.
  const imageSize = 16;
  const endX = pageWidth - 15 - imageSize;
  const centeredY = footerY + (footerHeight - imageSize) / 2;
  
  doc.addImage(TRAFFIC_LIGHT_BASE64, 'PNG', endX, centeredY, imageSize, imageSize);
}

