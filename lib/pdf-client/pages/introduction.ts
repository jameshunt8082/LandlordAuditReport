// Introduction Page
import jsPDF from 'jspdf';
import { ReportData } from '@/lib/pdf/formatters';
import { COLORS, FONTS, LAYOUT, setFillColorHex, setTextColorHex } from '../styles';
import { addPageHeader } from '../components/header';
import { addPageFooter } from '../components/footer';
import { drawTrafficLight } from '../components/trafficLight';

/**
 * Generate Introduction Page
 */
export async function introduction(doc: jsPDF, data: ReportData): Promise<void> {
  const { margins, contentWidth } = LAYOUT;
  const startX = margins.left;
  
  doc.addPage();
  addPageHeader(doc, doc.getCurrentPageInfo().pageNumber, 999);
  
  let yPos = margins.top + 15;
  
  // Title
  doc.setFontSize(FONTS.h1.size);
  doc.setFont('helvetica', FONTS.h1.style);
  setTextColorHex(doc, COLORS.primaryGreen);
  doc.text('Introduction to This Report', startX, yPos);
  yPos += 20;
  
  // Purpose
  doc.setFontSize(FONTS.body.size);
  doc.setFont('helvetica', 'normal');
  setTextColorHex(doc, COLORS.black);
  
  const purposeText = 'This report provides a comprehensive assessment of the risks you face as a landlord. It identifies areas of greatest risk that require your immediate attention, and provides practical recommended actions to mitigate them. Doing so will help you avoid future legal penalties, financial losses, and reputational damage.';
  const wrapped = doc.splitTextToSize(purposeText, contentWidth);
  doc.text(wrapped, startX, yPos);
  yPos += wrapped.length * 4 + 20;
  
  // Traffic Light System section
  doc.setFontSize(FONTS.h2.size);
  doc.setFont('helvetica', FONTS.h2.style);
  doc.text('What the Colours and Scores Mean', startX, yPos);
  yPos += 15;
  
  // Red (1-3)
  const trafficLightX = startX + 5;
  drawTrafficLight(doc, trafficLightX, yPos - 1.5, 'red', 2.5);
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  setTextColorHex(doc, COLORS.red);
  doc.text('Red (Low Scoring - 1-3):', startX + 15, yPos);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  setTextColorHex(doc, COLORS.black);
  const redText = 'High risk issues requiring immediate attention and corrective action.';
  const redWrapped = doc.splitTextToSize(redText, contentWidth - 15);
  doc.text(redWrapped, startX + 15, yPos + 5);
  yPos += redWrapped.length * 4 + 10;
  
  // Orange (4-6)
  drawTrafficLight(doc, trafficLightX, yPos - 1.5, 'orange', 2.5);
  
  doc.setFont('helvetica', 'bold');
  setTextColorHex(doc, COLORS.orange);
  doc.text('Orange (Medium Scoring - 4-6):', startX + 15, yPos);
  
  doc.setFont('helvetica', 'normal');
  setTextColorHex(doc, COLORS.black);
  const orangeText = 'Medium risk issues that need corrective action.';
  const orangeWrapped = doc.splitTextToSize(orangeText, contentWidth - 15);
  doc.text(orangeWrapped, startX + 15, yPos + 5);
  yPos += orangeWrapped.length * 4 + 10;
  
  // Green (7-10)
  drawTrafficLight(doc, trafficLightX, yPos - 1.5, 'green', 2.5);
  
  doc.setFont('helvetica', 'bold');
  setTextColorHex(doc, COLORS.green);
  doc.text('Green (High Scoring - 7-10):', startX + 15, yPos);
  
  doc.setFont('helvetica', 'normal');
  setTextColorHex(doc, COLORS.black);
  const greenText = 'Well-managed areas that demonstrate good practice but would benefit from future monitoring.';
  const greenWrapped = doc.splitTextToSize(greenText, contentWidth - 15);
  doc.text(greenWrapped, startX + 15, yPos + 5);
  yPos += greenWrapped.length * 4 + 18;

  // ── Overall Compliance Score Box ──
  const tierNumber = data.riskTier.split('_')[1];
  const tierLabel =
    tierNumber === '0' ? 'Minimal Risk' :
    tierNumber === '1' ? 'Low Risk' :
    tierNumber === '2' ? 'Moderate Risk' :
    tierNumber === '3' ? 'High Risk' : 'Severe Risk';

  const compliantAreas = data.subcategoryScores.filter(s => s.color === 'green').length;
  const nonCompliantAreas = data.subcategoryScores.filter(s => s.color === 'red').length;
  const totalAreas = data.subcategoryScores.length;

  const scoreColor =
    data.overallScore >= 7 ? COLORS.green :
    data.overallScore >= 4 ? COLORS.orange : COLORS.red;

  const boxHeight = 52;
  const boxY = yPos;

  // Background fill (pale blue)
  setFillColorHex(doc, COLORS.paleBlue);
  doc.rect(startX, boxY, contentWidth, boxHeight, 'F');

  // Blue border
  doc.setDrawColor(11, 83, 148); // COLORS.blue as RGB
  doc.setLineWidth(0.5);
  doc.rect(startX, boxY, contentWidth, boxHeight, 'S');

  // "Overall Compliance Score" label
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  setTextColorHex(doc, COLORS.black);
  doc.text('Overall Compliance Score', startX + 6, boxY + 10);

  // Large score number
  doc.setFontSize(30);
  doc.setFont('helvetica', 'bold');
  setTextColorHex(doc, scoreColor);
  doc.text(data.overallScore.toFixed(1), startX + 6, boxY + 26);

  // Traffic light dot next to score
  drawTrafficLight(doc, startX + 32, boxY + 21, data.overallScore >= 7 ? 'green' : data.overallScore >= 4 ? 'orange' : 'red', 4);

  // Risk Classification
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  setTextColorHex(doc, COLORS.black);
  doc.text(`Risk Classification:`, startX + 6, boxY + 37);
  doc.setFont('helvetica', 'bold');
  doc.text(`Tier ${tierNumber} - ${tierLabel}`, startX + 44, boxY + 37);

  // Compliance Status
  doc.setFont('helvetica', 'normal');
  doc.text(`Compliance Status:`, startX + 6, boxY + 45);
  doc.setFont('helvetica', 'bold');
  doc.text(`${compliantAreas} of ${totalAreas} areas meet standards (${nonCompliantAreas} require immediate action)`, startX + 44, boxY + 45);

  addPageFooter(doc);
}

