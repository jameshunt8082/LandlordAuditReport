// Cover Page Component (Merged with Introduction layout)
import jsPDF from 'jspdf';
import { ReportData } from '@/lib/pdf/formatters';
import { COLORS, LAYOUT, setFillColorHex, setTextColorHex, setDrawColorHex } from '../styles';
import { addPageFooter } from '../components/footer';
import { drawTrafficLight } from '../components/trafficLight';
import { drawWarningTriangle, drawTrendArrow, drawShieldCheck } from '../components/icons';

/**
 * Generate highly custom Cover/Intro Page
 */
export async function coverPage(doc: jsPDF, data: ReportData): Promise<void> {
  const { pageWidth, pageHeight } = LAYOUT;

  // 1. Draw Page Background (Beige)
  setFillColorHex(doc, COLORS.pageBeige || '#f4f3ed');
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // 2. Draw Top Headers
  const headerHeight = 70;
  const splitX = 135;

  // Header Left (Sage)
  setFillColorHex(doc, COLORS.headerSage || '#c6cebf');
  doc.rect(0, 0, splitX, headerHeight, 'F');

  // Header Right (White)
  setFillColorHex(doc, COLORS.white);
  doc.rect(splitX, 0, pageWidth - splitX, headerHeight, 'F');

  // 3. Header Left Text
  setTextColorHex(doc, COLORS.brandBlue || '#213a69');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.text('Landlord Risk', 15, 25);
  doc.text('Audit Report', 15, 37);

  doc.setFontSize(14);
  doc.text(`Property: ${data.propertyAddress}`, 15, 52);

  doc.setFontSize(10);
  const auditDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  doc.text(`Audit Date: ${auditDate} | Client: ${data.landlordName || 'N/A'}`, 15, 61);

  // 4. Header Right Text - Perfectly Center-Aligned
  const rightCenterX = splitX + ((pageWidth - splitX) / 2);
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  setTextColorHex(doc, COLORS.footerOlive || '#6b7654');
  doc.text('YOUR RISK SCORE', rightCenterX, 22, { align: 'center' });

  // Dynamic Score Coloring
  let scoreColorHex = COLORS.scoreOrange || '#f1ad33';
  if (data.overallScore >= 7) scoreColorHex = COLORS.bannerGreenBorder || '#7dc08e';
  else if (data.overallScore < 4) scoreColorHex = COLORS.bannerRedBorder || '#e0807f';

  doc.setFontSize(44);
  setTextColorHex(doc, scoreColorHex);
  doc.text(`${data.overallScore.toFixed(1)}/10`, rightCenterX, 38, { align: 'center' });

  // Divider Line
  setDrawColorHex(doc, '#e5e7eb');
  doc.setLineWidth(0.3);
  doc.line(splitX + 15, 43, pageWidth - 15, 43);

  const compliantAreas = data.subcategoryScores.filter(s => s.color === 'green').length;
  const nonCompliantAreas = data.subcategoryScores.filter(s => s.color === 'red').length;
  const totalAreas = data.subcategoryScores.length;

  doc.setFontSize(9);
  setTextColorHex(doc, COLORS.mediumGray || '#555555');
  doc.setFont('helvetica', 'normal');
  const statusLine = `COMPLIANCE STATUS\n${compliantAreas} of ${totalAreas} areas meet standards\n(${nonCompliantAreas} require immediate action)`;
  doc.text(statusLine, rightCenterX, 50, { align: 'center', lineHeightFactor: 1.3 });

  // 5. Traffic Light Banners
  let by = 130; // Banner start Y
  const bx = 15; // Banner start X
  const bw = pageWidth - 45; // Banner width
  const bh = 26; // Banner height
  const gap = 1.5; // Gap between banners

  // --- RED BANNER ---
  drawBanner(doc, bx, by, bw, bh, {
    bgColor: COLORS.bannerRedBg || '#fae9e9',
    borderColor: COLORS.bannerRedBorder || '#e0807f',
    lightColor: 'red',
    title: 'RED (Low Scoring - 1-3).',
    desc: 'CRITICAL compliance issues requiring immediate attention.',
    iconType: 'warning'
  });
  by += bh + gap;

  // --- ORANGE BANNER ---
  drawBanner(doc, bx, by, bw, bh, {
    bgColor: COLORS.bannerOrangeBg || '#fceedb',
    borderColor: COLORS.bannerOrangeBorder || '#e9b76e',
    lightColor: 'orange',
    title: 'ORANGE (Medium Scoring - 4-6).',
    desc: 'Areas that need improvement.',
    iconType: 'trend'
  });
  by += bh + gap;

  // --- GREEN BANNER ---
  drawBanner(doc, bx, by, bw, bh, {
    bgColor: COLORS.bannerGreenBg || '#e6f4ea',
    borderColor: COLORS.bannerGreenBorder || '#7dc08e',
    lightColor: 'green',
    title: 'GREEN (High Scoring - 7-10).',
    desc: 'Well-managed areas demonstrating good compliance practices.',
    iconType: 'shield'
  });

  // Footer will be drawn last
  addPageFooter(doc);
}

/**
 * Helper to draw the complex traffic light banners matching the mockup
 */
function drawBanner(
  doc: jsPDF, x: number, y: number, w: number, h: number, 
  config: { bgColor: string, borderColor: string, lightColor: 'red'|'orange'|'green', title: string, desc: string, iconType: string }
) {
  // Main Banner Box
  setFillColorHex(doc, config.bgColor);
  setDrawColorHex(doc, config.borderColor);
  doc.setLineWidth(0.5);
  doc.roundedRect(x, y, w, h, 3, 3, 'FD');

  // Left Dark Square for Light
  const sqW = 28;
  setFillColorHex(doc, COLORS.bannerLeftDark || '#59595b');
  // First draw rounded rect
  doc.roundedRect(x, y, sqW, h, 3, 3, 'F');
  // Then draw square rect to cover right border radius of the clipping box
  doc.rect(x + sqW - 3, y, 3, h, 'F');

  // Draw Glowing traffic light
  drawTrafficLight(doc, x + sqW/2, y + h/2, config.lightColor, 8);

  // Text
  const textX = x + sqW + 3;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  setTextColorHex(doc, COLORS.black);
  doc.text(config.title, textX, y + 9);
  
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  setTextColorHex(doc, COLORS.darkGray);
  
  // Basic text wrap implementation
  const descLines = doc.splitTextToSize(config.desc, w - sqW - 25);
  doc.text(descLines, textX, y + 16.5);

  // Icon
  const iconX = x + w - 18;
  const iconY = y + h/2;
  if (config.iconType === 'warning') {
    drawWarningTriangle(doc, iconX, iconY + 1, 12, '#990000');
  } else if (config.iconType === 'trend') {
    drawTrendArrow(doc, iconX, iconY, 12, '#996600');
  } else if (config.iconType === 'shield') {
    drawShieldCheck(doc, iconX, iconY, 12, '#006600');
  }
}
