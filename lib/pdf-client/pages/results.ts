// Results Page
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ReportData } from '@/lib/pdf/formatters';
import { COLORS, FONTS, LAYOUT, setTextColorHex, formatScore } from '../styles';
import { addPageHeader } from '../components/header';
import { addPageFooter } from '../components/footer';
import { drawTrafficLight } from '../components/trafficLight';

/**
 * Generate Results Page
 */
export async function results(doc: jsPDF, data: ReportData): Promise<void> {
  const { margins } = LAYOUT;
  const startX = margins.left;
  
  doc.addPage();
  addPageHeader(doc, doc.getCurrentPageInfo().pageNumber, 999);
  
  let yPos = margins.top + 15;
  
  // Title
  doc.setFontSize(FONTS.h1.size);
  doc.setFont('helvetica', FONTS.h1.style);
  setTextColorHex(doc, COLORS.primaryGreen);
  doc.text('Category Scores', startX, yPos);
  yPos += 20;
  
  // Category scores table
  const categoryData = [
    {
      category: 'Documentation',
      score: data.categoryScores.documentation.score,
      color: data.categoryScores.documentation.color,
    },
    {
      category: 'Landlord-Tenant Communication',
      score: data.categoryScores.communication.score,
      color: data.categoryScores.communication.color,
    },
    {
      category: 'Evidence Gathering Systems and Procedures',
      score: data.categoryScores.evidenceGathering.score,
      color: data.categoryScores.evidenceGathering.color,
    },
  ];
  
  const tableBody = categoryData.map(cat => [
    cat.category,
    formatScore(cat.score),
    '', // Traffic light
  ]);
  
  autoTable(doc, {
    startY: yPos,
    head: [['Category', 'Score', 'Rating']],
    body: tableBody,
    theme: 'grid',
    headStyles: {
      fillColor: hexToRgb(COLORS.paleBlue),
      textColor: hexToRgb(COLORS.black),
      fontSize: 12,
      fontStyle: 'bold',
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 11,
      textColor: hexToRgb(COLORS.black),
    },
    columnStyles: {
      0: { cellWidth: 110, halign: 'left' },
      1: { cellWidth: 30, halign: 'center' },
      2: { cellWidth: 30, halign: 'center' },
    },
    didDrawCell: (cellData) => {
      // Draw traffic lights in Rating column
      if (cellData.column.index === 2 && cellData.section === 'body') {
        const rowIndex = cellData.row.index;
        const color = categoryData[rowIndex].color as 'red' | 'orange' | 'green';
        const cellX = cellData.cell.x + cellData.cell.width / 2;
        const cellY = cellData.cell.y + cellData.cell.height / 2;
        drawTrafficLight(doc, cellX, cellY, color, 2.5);
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

