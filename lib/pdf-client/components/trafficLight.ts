// Traffic Light Component
import jsPDF from 'jspdf';
import { COLORS, setFillColorHex } from '../styles';

/**
 * Draw a circular traffic light indicator
 * 
 * @param doc - jsPDF instance
 * @param x - X coordinate (center of circle)
 * @param y - Y coordinate (center of circle)
 * @param color - Traffic light color
 * @param size - Radius in mm (default: 2mm for small indicators)
 */

export function drawTrafficLight(
  doc: jsPDF,
  x: number,
  y: number,
  color: 'red' | 'orange' | 'green',
  size: number = 2
): void {
  const fillColor = COLORS[color];
  setFillColorHex(doc, fillColor);
  doc.circle(x, y, size, 'F');
}

/**
 * Draw a stacked traffic light graphic matching the report legend/footer style.
 */
export function drawTrafficLightGraphic(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  height: number,
  gap: number
): void {
  const segmentHeight = (height - gap * 2) / 3;
  const radius = Math.min(width, segmentHeight) * 0.22;
  const lightRadius = Math.min(width, segmentHeight) * 0.32;
  const colors = ['#f44336', '#ffb21f', '#37b055'] as const;

  colors.forEach((color, index) => {
    const segmentY = y + index * (segmentHeight + gap);
    setFillColorHex(doc, '#626267');
    doc.roundedRect(x, segmentY, width, segmentHeight, radius, radius, 'F');

    setFillColorHex(doc, color);
    doc.circle(x + width / 2, segmentY + segmentHeight / 2, lightRadius, 'F');
  });
}

/**
 * Draw traffic light with vertical centering relative to text
 * 
 * @param doc - jsPDF instance
 * @param x - X coordinate
 * @param textY - Y coordinate of text baseline
 * @param color - Traffic light color
 * @param size - Radius in mm
 * @returns Y coordinate where circle was drawn
 */
export function drawTrafficLightAligned(
  doc: jsPDF,
  x: number,
  textY: number,
  color: 'red' | 'orange' | 'green',
  size: number = 2
): number {
  // Adjust Y to center circle with text baseline
  // Text baseline is at textY, so we need to move up by approximately fontSize/3
  const fontSize = doc.getFontSize();
  const adjustedY = textY - (fontSize * 0.352778 / 3); // Convert pt to mm and adjust
  
  drawTrafficLight(doc, x, adjustedY, color, size);
  return adjustedY;
}
