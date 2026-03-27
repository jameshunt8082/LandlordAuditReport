// Evidence Summary Page (Simplified per James feedback)
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ReportData, SubcategoryScore } from '@/lib/pdf/formatters';
import { COLORS, FONTS, LAYOUT, setTextColorHex } from '../styles';
import { addPageHeader } from '../components/header';
import { addPageFooter } from '../components/footer';
import { drawTrafficLight } from '../components/trafficLight';
import { addNewPageIfNeeded } from '../utils';

/**
 * Generate Evidence Summary Page
 * Per James feedback: 1 table per category, only Subcategory + Status columns
 * Ordered: Red top, Orange middle, Green bottom
 */
export async function evidenceSummary(doc: jsPDF, data: ReportData): Promise<void> {
  const { margins } = LAYOUT;
  const startX = margins.left;
  
  doc.addPage();
  addPageHeader(doc, doc.getCurrentPageInfo().pageNumber, 999);
  
  let yPos = margins.top + 15;
  
  // Main Title
  doc.setFontSize(FONTS.h1.size);
  doc.setFont('helvetica', FONTS.h1.style);
  setTextColorHex(doc, COLORS.primaryGreen);
  doc.text('Score Summary', startX, yPos);
  yPos += 20;
  
  // Group subcategories by category
  const categories = [
    { 
      name: 'Documentation', 
      subcats: data.subcategoryScores.filter(s => s.category === 'Documentation') 
    },
    { 
      name: 'Landlord-Tenant Communication', 
      subcats: data.subcategoryScores.filter(s => s.category === 'Landlord-Tenant Communication') 
    },
    { 
      name: 'Evidence Gathering Systems and Procedures', 
      subcats: data.subcategoryScores.filter(s => s.category === 'Evidence Gathering Systems and Procedures') 
    },
  ];
  
  // Generate one table per category
  categories.forEach((category, index) => {
    if (category.subcats.length === 0) return;
    
    // Sort by color: red first, then orange, then green
    const sortedSubcats = [...category.subcats].sort((a, b) => {
      const colorOrder = { red: 1, orange: 2, green: 3 };
      return colorOrder[a.color] - colorOrder[b.color];
    });
    
    // Category header
    yPos = addNewPageIfNeeded(doc, yPos, 40); // Ensure space for header + at least 2 rows
    
    doc.setFontSize(FONTS.h2.size);
    doc.setFont('helvetica', FONTS.h2.style);
    setTextColorHex(doc, COLORS.blue);
    doc.text(category.name, startX, yPos);
    yPos += 12;
    
    // Table body: Status (traffic light) first, then Subcategory name
    // Swapped columns: Status on left, Subcategory on right
    const tableBody = sortedSubcats.map(subcat => [
      '', // Empty for traffic light (Status column - now on left)
      subcat.name,
    ]);
    
    // Extract colors for didDrawCell
    const rowColors = sortedSubcats.map(subcat => subcat.color);
    
    autoTable(doc, {
      startY: yPos,
      head: [], // Remove header row as requested
      body: tableBody,
      theme: 'grid',
      bodyStyles: {
        fontSize: 10,
        textColor: hexToRgb(COLORS.black),
      },
      columnStyles: {
        0: { cellWidth: 40, halign: 'center' }, // Status with traffic light (now on left)
        1: { cellWidth: 130 }, // Subcategory takes most space (now on right)
      },
      didDrawCell: (cellData) => {
        // Draw traffic lights in Status column (index 0 - now on left)
        if (cellData.column.index === 0 && cellData.section === 'body') {
          const rowIndex = cellData.row.index;
          if (rowIndex < rowColors.length) {
            const color = rowColors[rowIndex] as 'red' | 'orange' | 'green';
            const cellX = cellData.cell.x + cellData.cell.width / 2;
            const cellY = cellData.cell.y + cellData.cell.height / 2;
            drawTrafficLight(doc, cellX, cellY, color, 2);
          }
        }
      },
      didDrawPage: () => {
        addPageFooter(doc);
      },
      margin: { 
        left: startX,
        top: margins.top + 10,
        bottom: margins.bottom + 5,
      },
    });
    
    // Update yPos after table and add spacing between categories
    yPos = (doc as any).lastAutoTable.finalY + 15;
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

