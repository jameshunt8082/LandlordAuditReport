import jsPDF from 'jspdf';
import { setDrawColorHex, setFillColorHex, setTextColorHex, COLORS } from '../styles';

import { WARNING_TRIANGLE_BASE64 } from './logoBase64';

/**
 * Draws the user-provided warning triangle icon, compiled flawlessly into a 
 * High-Resolution base64 PNG vector equivalent to match exact aesthetic constraints.
 */
export function drawWarningTriangle(doc: jsPDF, x: number, y: number, size: number, colorHex: string) {
  // Center image relative to x, y
  const offset = size * 1.1; 
  doc.addImage(WARNING_TRIANGLE_BASE64, 'PNG', x - offset/2, y - offset/2, offset, offset);
}

import { TREND_ARROW_BASE64 } from './logoBase64';

/**
 * Draws the user-provided arrow-trend-up icon, compiled perfectly into a 
 * High-Resolution base64 PNG vector equivalent to match exact aesthetic expectations.
 */
export function drawTrendArrow(doc: jsPDF, x: number, y: number, size: number, colorHex: string) {
  // Center image relative to x, y
  const offset = size * 1.05; 
  doc.addImage(TREND_ARROW_BASE64, 'PNG', x - offset/2, y - offset/2, offset, offset);
}

/**
 * Draws a shield with a checkmark.
 */
export function drawShieldCheck(doc: jsPDF, x: number, y: number, size: number, colorHex: string) {
  setDrawColorHex(doc, colorHex);
  doc.setLineWidth(1.2);
  
  const w = size;
  const h = size * 1.2;
  const topY = y - h / 2;
  const botY = y + h / 2;
  const leftX = x - w / 2;
  const rightX = x + w / 2;

  // Simple shield using lines and curves
  // To avoid complex bezier, we'll draw a flat top, straight sides down, then lines meeting at bottom center
  doc.line(leftX, topY, rightX, topY);
  doc.line(leftX, topY, leftX, topY + h * 0.6);
  doc.line(rightX, topY, rightX, topY + h * 0.6);
  doc.line(leftX, topY + h * 0.6, x, botY);
  doc.line(rightX, topY + h * 0.6, x, botY);
  
  // Checkmark inside
  doc.setLineWidth(1);
  doc.line(x - w * 0.25, y + h * 0.05, x - w * 0.05, y + h * 0.25);
  doc.line(x - w * 0.05, y + h * 0.25, x + w * 0.3, y - h * 0.15);
}

/**
 * Draws the brand logo: a House with a Shield and Checkmark inside.
 */
export function drawBrandLogo(doc: jsPDF, x: number, y: number, height: number) {
  const w = height; // overall width usually square-ish bounds
  
  // White color for logo
  setDrawColorHex(doc, '#ffffff');
  doc.setLineWidth(1);
  doc.setLineCap('round');
  doc.setLineJoin('round');

  // House Roof
  const roofTopY = y;
  const roofBotY = y + height * 0.4;
  const leftX = x;
  const rightX = x + w * 0.8;
  const midX = x + w * 0.4;
  
  // Left roof
  doc.line(leftX, roofBotY, midX, roofTopY);
  // Right roof
  doc.line(midX, roofTopY, rightX, roofBotY);
  
  // Small chimney
  doc.line(leftX + w * 0.15, roofBotY - height * 0.15, leftX + w * 0.15, roofTopY);
  doc.line(leftX + w * 0.15, roofTopY, leftX + w * 0.25, roofTopY);
  doc.line(leftX + w * 0.25, roofTopY, leftX + w * 0.25, roofBotY - height * 0.25);

  // House walls
  const wallLeftX = leftX + w * 0.1;
  const wallRightX = rightX - w * 0.1;
  const botY = y + height;
  doc.line(wallLeftX, roofBotY - height * 0.05, wallLeftX, botY);
  // doc.line(wallRightX, roofBotY - height * 0.05, wallRightX, botY); // Right side hidden by shield

  // Floor
  doc.line(wallLeftX, botY, wallLeftX + w*0.3, botY);
  
  // Door on left side
  doc.line(wallLeftX + w * 0.15, botY, wallLeftX + w * 0.15, botY - height*0.3);
  doc.line(wallLeftX + w * 0.15, botY - height*0.3, wallLeftX + w * 0.25, botY - height*0.3);
  doc.line(wallLeftX + w * 0.25, botY - height*0.3, wallLeftX + w * 0.25, botY);

  // Giant Shield overlapping right side of the house
  const sx = x + w * 0.6;
  const sy = y + height * 0.5;
  const sh = height * 0.55;
  const sw = sh * 0.8;
  
  // Draw Shield Background (Optional)
  // Fill the shield with the olive bg to mask the house behind it
  setFillColorHex(doc, COLORS.footerOlive);
  // Actually doc doesn't have an easy polygon fill. Let's just draw over it.
  
  // Shield Outline
  const sTopY = sy - sh / 2;
  const sBotY = sy + sh / 2;
  const sLeftX = sx - sw / 2;
  const sRightX = sx + sw / 2;
  doc.line(sLeftX, sTopY, sRightX, sTopY); // top
  doc.line(sLeftX, sTopY, sLeftX, sTopY + sh * 0.6); // left down
  doc.line(sRightX, sTopY, sRightX, sTopY + sh * 0.6); // right down
  doc.line(sLeftX, sTopY + sh * 0.6, sx, sBotY); // left angled to bot
  doc.line(sRightX, sTopY + sh * 0.6, sx, sBotY); // right angled to bot
  
  // Checkmark inside shield
  doc.setLineWidth(0.8);
  doc.line(sx - sw * 0.2, sy + sh * 0.05, sx - sw * 0.05, sy + sh * 0.2);
  doc.line(sx - sw * 0.05, sy + sh * 0.2, sx + sw * 0.25, sy - sh * 0.15);
}
