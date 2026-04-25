// Cover Page Component (Merged with Introduction layout)
import jsPDF from 'jspdf';
import { ReportData } from '@/lib/pdf/formatters';
import { COLORS, LAYOUT, setFillColorHex, setTextColorHex } from '../styles';
import { addPageFooter } from '../components/footer';
import { drawTrafficLegend } from '../components/trafficLegend';
import { SCORE_TRAFFIC_LIGHT_BASE64 } from '../components/scoreTrafficLightBase64';

/**
 * Generate highly custom Cover/Intro Page
 */
export async function coverPage(doc: jsPDF, data: ReportData): Promise<void> {
  const { pageWidth, pageHeight } = LAYOUT;
  const maxPropertyChars = 38;
  const propertyAddress = data.propertyAddress.slice(0, maxPropertyChars);

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
  doc.text('Property:', 15, 49);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  const wrappedAddress = doc.splitTextToSize(propertyAddress, splitX - 30);
  doc.text(wrappedAddress, 15, 57);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  const auditDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  doc.text(`Audit Date: ${auditDate} | Client: ${data.landlordName || 'N/A'}`, 15, 68);

  // 4. Header Right Text
  const scoreLightHeight = 36;
  const scoreLightWidth = scoreLightHeight * (200 / 621);
  const scoreLightX = pageWidth - 5 - scoreLightWidth;
  const scoreLightY = (headerHeight - scoreLightHeight) / 2;
  const rightCenterX = splitX + ((scoreLightX - splitX) / 2);
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  setTextColorHex(doc, COLORS.black);
  doc.text('YOUR RISK SCORE', rightCenterX, 20, { align: 'center' });

  // Dynamic Score Coloring
  let scoreColorHex = COLORS.scoreOrange || '#f1ad33';
  let scoreTrafficLight: 'red' | 'orange' | 'green' = 'orange';
  if (data.overallScore >= 7) scoreColorHex = COLORS.bannerGreenBorder || '#7dc08e';
  else if (data.overallScore < 4) {
    scoreColorHex = COLORS.bannerRedBorder || '#e0807f';
    scoreTrafficLight = 'red';
  } else {
    scoreTrafficLight = 'orange';
  }
  if (data.overallScore >= 7) scoreTrafficLight = 'green';

  const scoreText = data.overallScore.toFixed(1);
  const scoreSuffix = '/10';
  doc.setFontSize(34);
  doc.setFont('helvetica', 'bold');
  setTextColorHex(doc, scoreColorHex);
  const scoreWidth = doc.getTextWidth(scoreText);
  doc.setFontSize(20);
  const suffixWidth = doc.getTextWidth(scoreSuffix);
  const scoreStartX = rightCenterX - ((scoreWidth + suffixWidth) / 2);
  doc.setFontSize(34);
  doc.text(scoreText, scoreStartX, 38);
  doc.setFontSize(20);
  doc.text(scoreSuffix, scoreStartX + scoreWidth, 38);

  doc.addImage(
    SCORE_TRAFFIC_LIGHT_BASE64[scoreTrafficLight],
    'PNG',
    scoreLightX,
    scoreLightY,
    scoreLightWidth,
    scoreLightHeight
  );

  const nonCompliantAreas = data.subcategoryScores.filter(s => s.color === 'red').length;
  const totalAreas = data.subcategoryScores.length;
  const statusLine = `${nonCompliantAreas} out of ${totalAreas} areas require immediate attention.`;

  doc.setFontSize(9.5);
  setTextColorHex(doc, COLORS.black);
  doc.setFont('helvetica', 'bold');
  const statusLines = doc.splitTextToSize(statusLine, pageWidth - splitX - 28);
  doc.text(statusLines, rightCenterX, 52, { align: 'center', lineHeightFactor: 1.2 });

  // 5. Traffic light legend with centered shared image
  drawTrafficLegend(doc, 132, {
    lightWidth: 20,
    segmentHeight: 26,
    segmentGap: 2,
    panelGap: 0,
    panelWidth: 100,
  });

  // Footer will be drawn last
  addPageFooter(doc);
}
