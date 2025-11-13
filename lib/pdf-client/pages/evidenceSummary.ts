// Evidence Summary Page
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ReportData } from '@/lib/pdf/formatters';
import { COLORS, FONTS, LAYOUT, setTextColorHex } from '../styles';
import { addPageHeader } from '../components/header';
import { addPageFooter } from '../components/footer';
import { drawTrafficLight } from '../components/trafficLight';

/**
 * Generate Evidence Summary Page
 */
export async function evidenceSummary(doc: jsPDF, data: ReportData): Promise<void> {
  const { margins } = LAYOUT;
  const startX = margins.left;
  
  doc.addPage();
  addPageHeader(doc, doc.getCurrentPageInfo().pageNumber, 999);
  
  let yPos = margins.top + 15;
  
  // Title
  doc.setFontSize(FONTS.h1.size);
  doc.setFont('helvetica', FONTS.h1.style);
  setTextColorHex(doc, COLORS.primaryGreen);
  doc.text('Evidence & Documentation Summary', startX, yPos);
  yPos += 20;
  
  // Table data from subcategories
  const evidenceData = data.subcategoryScores.map(subcat => [
    subcat.category,
    subcat.name,
    subcat.color, // Will draw traffic light
    subcat.score >= 7 ? 'Comprehensive' : subcat.score >= 4 ? 'Partial' : 'Inadequate',
  ]);
  
  autoTable(doc, {
    startY: yPos,
    head: [['Category', 'Subcategory', 'Status', 'Notes']],
    body: evidenceData.map(row => [row[0], row[1], '', row[3]]),
    theme: 'grid',
    headStyles: {
      fillColor: hexToRgb(COLORS.paleBlue),
      textColor: hexToRgb(COLORS.black),
      fontSize: 11,
      fontStyle: 'bold',
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 10,
      textColor: hexToRgb(COLORS.black),
    },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: 50 },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 50 },
    },
    didDrawCell: (cellData) => {
      // Draw traffic lights in Status column
      if (cellData.column.index === 2 && cellData.section === 'body') {
        const rowIndex = cellData.row.index;
        const color = evidenceData[rowIndex][2] as 'red' | 'orange' | 'green';
        const cellX = cellData.cell.x + cellData.cell.width / 2;
        const cellY = cellData.cell.y + cellData.cell.height / 2;
        drawTrafficLight(doc, cellX, cellY, color, 2);
      }
    },
    margin: { left: startX },
  });
  
  addPageFooter(doc);
}

function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return [0, 0, 0];
  return [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16),
  ];
}

