// Cover Page
import jsPDF from 'jspdf';
import { ReportData } from '@/lib/pdf/formatters';
import { COLORS, LAYOUT, setFillColorHex, setTextColorHex, setDrawColorHex, getTrafficLightColor, formatScore } from '../styles';
import { formatReportDate, generateReportId } from '../utils';
import { addPageFooter } from '../components/footer';

/**
 * Generate Cover Page
 */
export async function coverPage(doc: jsPDF, data: ReportData): Promise<void> {
  const { pageWidth, margins } = LAYOUT;
  const centerX = pageWidth / 2;
  
  // Generate Report ID
  const reportId = generateReportId(data.propertyAddress, data.auditEndDate);
  
  // Get risk tier info
  const tierNumber = parseInt(data.riskTier.split('_')[1]);
  const trafficLightColor = getTrafficLightColor(data.overallScore);
  
  // Tier color mapping
  const tierColors: Record<number, string> = {
    0: COLORS.green,
    1: COLORS.darkGreen,
    2: COLORS.orange,
    3: COLORS.orange,
    4: COLORS.red,
  };
  const tierColor = tierColors[tierNumber] || COLORS.mediumGray;
  
  // 1. Decorative top bar (green)
  setFillColorHex(doc, COLORS.primaryGreen);
  doc.rect(0, 0, pageWidth, 15, 'F');
  
  // 2. Metadata - Top Right
  const metadataX = pageWidth - margins.right - 8;
  let metadataY = 25;
  
  doc.setFontSize(9);
  setTextColorHex(doc, COLORS.mediumGray);
  doc.text(`Report ID: ${reportId}`, metadataX, metadataY, { align: 'right' });
  metadataY += 5;
  
  doc.text(`Report Date: ${formatReportDate(data.auditEndDate)}`, metadataX, metadataY, { align: 'right' });
  metadataY += 5;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  setTextColorHex(doc, tierColor);
  doc.text(`Risk Tier ${tierNumber}`, metadataX, metadataY, { align: 'right' });
  
  // 3. Title Section (centered, starting at ~100mm from top)
  let yPos = 100;
  
  // Main Title
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  setTextColorHex(doc, COLORS.black);
  doc.text('Landlord Risk Audit Report', centerX, yPos, { align: 'center' });
  yPos += 15;
  
  // Separator line
  setDrawColorHex(doc, COLORS.lightGray);
  doc.setLineWidth(0.2);
  doc.line(margins.left + 20, yPos, pageWidth - margins.right - 20, yPos);
  yPos += 15;
  
  // Green banner with "COMPLIANCE ASSESSMENT"
  const bannerWidth = pageWidth * 0.8;
  const bannerX = (pageWidth - bannerWidth) / 2;
  const bannerHeight = 15;
  
  setFillColorHex(doc, COLORS.primaryGreen);
  doc.rect(bannerX, yPos, bannerWidth, bannerHeight, 'F');
  
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  setTextColorHex(doc, COLORS.white);
  doc.text('COMPLIANCE ASSESSMENT', centerX, yPos + 10, { align: 'center' });
  yPos += bannerHeight + 20;
  
  // Property Info
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  setTextColorHex(doc, COLORS.black);
  doc.text(`Report for ${data.propertyAddress}`, centerX, yPos, { align: 'center' });
  yPos += 8;
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  setTextColorHex(doc, COLORS.mediumGray);
  doc.text(`Client: ${data.landlordName}`, centerX, yPos, { align: 'center' });
  yPos += 20;
  
  // Green decorative line
  const lineWidth = pageWidth * 0.5;
  const lineX = (pageWidth - lineWidth) / 2;
  setDrawColorHex(doc, COLORS.primaryGreen);
  doc.setLineWidth(0.3);
  doc.line(lineX, yPos, lineX + lineWidth, yPos);
  yPos += 25;
  
  // Date range
  doc.setFontSize(12);
  setTextColorHex(doc, COLORS.mediumGray);
  doc.text(
    `Conducted ${formatReportDate(data.auditStartDate)} to ${formatReportDate(data.auditEndDate)}`,
    centerX,
    yPos,
    { align: 'center' }
  );
  yPos += 8;
  
  // Auditor
  doc.setFontSize(11);
  doc.text(`Audited by: ${data.auditorName}`, centerX, yPos, { align: 'center' });
  yPos += 25;
  
  // Confidential label
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  setTextColorHex(doc, COLORS.darkGray);
  doc.text('Confidential Contents', centerX, yPos, { align: 'center' });
  
  // Footer
  addPageFooter(doc);
}

