// Subcategory Scores Page with Horizontal Bar Charts
import jsPDF from 'jspdf';
import { ReportData, SubcategoryScore } from '@/lib/pdf/formatters';
import { COLORS, FONTS, LAYOUT, setFillColorHex, setTextColorHex, setDrawColorHex, hexToRgb } from '../styles';
import { addNewPageIfNeeded } from '../utils';
import { addPageHeader } from '../components/header';
import { addPageFooter } from '../components/footer';


/**
 * Generate Subcategory Scores Page with Bar Charts
 */
export async function subcategoryScores(doc: jsPDF, data: ReportData): Promise<void> {
  const { margins, contentWidth } = LAYOUT;
  const startX = margins.left;
  
  doc.addPage();
  addPageHeader(doc, doc.getCurrentPageInfo().pageNumber, 999);
  
  let yPos = margins.top + 15;
  
  // Title
  doc.setFontSize(FONTS.h1.size);
  doc.setFont('helvetica', FONTS.h1.style);
  setTextColorHex(doc, COLORS.primaryGreen);
  doc.text('Subcategory Scores', startX, yPos);
  yPos += 15;
  
  // Description
  doc.setFontSize(FONTS.body.size);
  doc.setFont('helvetica', 'normal');
  setTextColorHex(doc, COLORS.black);
  const descText = 'Each score represents an average of all responses for the questions within that subcategory. The minimum score is 1, the maximum 10. Any that are red require your immediate attention (see Recommended Actions section below).';
  const wrapped = doc.splitTextToSize(descText, contentWidth);
  doc.text(wrapped, startX, yPos);
  yPos += wrapped.length * 4 + 20;
  
  // Main title for grouped charts
  doc.setFontSize(FONTS.h2.size);
  doc.setFont('helvetica', FONTS.h2.style);
  setTextColorHex(doc, COLORS.blue);
  doc.text('Landlord Legal Audit - Performance by Category', startX, yPos);
  yPos += 15;
  
  // Group subcategories by category
  const categories = [
    { name: 'Documentation', subcats: data.subcategoryScores.filter(s => s.category === 'Documentation') },
    { name: 'Landlord-Tenant Communication', subcats: data.subcategoryScores.filter(s => s.category === 'Landlord-Tenant Communication') },
    { name: 'Evidence Gathering Systems and Procedures', subcats: data.subcategoryScores.filter(s => s.category === 'Evidence Gathering Systems and Procedures') },
  ];
  
  categories.forEach((category, catIdx) => {
    if (category.subcats.length === 0) return;
    
    // Category header (check if we have space for at least header + 2 bars)
    yPos = addNewPageIfNeeded(doc, yPos, 20 + (Math.min(2, category.subcats.length) * 10));
    
    doc.setFontSize(FONTS.h3.size);
    doc.setFont('helvetica', FONTS.h3.style);
    setTextColorHex(doc, COLORS.darkGray);
    doc.text(category.name, startX, yPos);
    yPos += 10;
    
    // Draw bars for each subcategory
    category.subcats.forEach((subcat, idx) => {
      // Check if we need a new page (bar + spacing + footer margin)
      yPos = addNewPageIfNeeded(doc, yPos, 15);
      
      const labelWidth = 65; // Fixed width for subcategory name
      const barX = startX + 5 + labelWidth;
      const barHeight = 6;
      const maxBarWidth = (contentWidth - 10) - labelWidth - 15; // Reserve space for label and score
      const barWidth = (subcat.score / 10) * maxBarWidth;
      
      // Subcategory name (left side, aligned with bar)
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      const [rBlack, gBlack, bBlack] = hexToRgb(COLORS.black);
      doc.setTextColor(rBlack, gBlack, bBlack);
      
      // Truncate if too long
      const subcatName = subcat.name.length > 30 ? subcat.name.substring(0, 27) + '...' : subcat.name;
      
      // Wrap to max 2 lines if needed
      const wrapped = doc.splitTextToSize(subcatName, labelWidth - 2);
      const textLines = wrapped.slice(0, 2); // Max 2 lines
      
      // Draw text aligned with bar vertically
      textLines.forEach((line: string, lineIdx: number) => {
        doc.text(line, startX + 5, yPos + 3 + (lineIdx * 3.5));
      });
      
      // Filled bar (colored portion)
      const barColor = COLORS[subcat.color];
      const [r, g, b] = hexToRgb(barColor);
      doc.setFillColor(r, g, b);
      doc.roundedRect(barX, yPos, barWidth, barHeight, 1, 1, 'F');
      
      // Bar outline (full scale)
      const [rGray, gGray, bGray] = hexToRgb(COLORS.lightGray);
      doc.setDrawColor(rGray, gGray, bGray);
      doc.setLineWidth(0.1);
      doc.roundedRect(barX, yPos, maxBarWidth, barHeight, 1, 1, 'S');
      
      // Score label at the end of bar (aligned vertically with bar)
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(rBlack, gBlack, bBlack);
      doc.text(subcat.score.toFixed(1), barX + maxBarWidth + 2, yPos + 4.5);
      
      yPos += barHeight + 4;
    });
    
    yPos += 8; // Space between categories
  });
  
  addPageFooter(doc);
}

