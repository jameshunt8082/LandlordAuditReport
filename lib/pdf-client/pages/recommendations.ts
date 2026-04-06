// Recommended Actions Page (Grouped by category per James feedback)
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ReportData, SubcategoryScore, QuestionResponseData } from '@/lib/pdf/formatters';
import { COLORS, FONTS, LAYOUT, setTextColorHex } from '../styles';
import { addPageHeader } from '../components/header';
import { addPageFooter } from '../components/footer';
import { drawTrafficLight } from '../components/trafficLight';
import { addNewPageIfNeeded } from '../utils';

/**
 * Generate Recommended Actions Page
 * Per James feedback: 3 tables by category, only red/orange subcategories,
 * with subcategory name + score in first column, suggestions in second
 */
export async function recommendations(doc: jsPDF, data: ReportData): Promise<void> {
  const { margins, contentWidth } = LAYOUT;
  const startX = margins.left;

  doc.addPage();
  addPageHeader(doc, doc.getCurrentPageInfo().pageNumber, 999);

  let yPos = margins.top + 15;

  // Main Title
  doc.setFontSize(FONTS.h1.size);
  doc.setFont('helvetica', FONTS.h1.style);
  setTextColorHex(doc, COLORS.black);
  doc.text('Recommended Actions', startX, yPos);
  yPos += 20;

  // Introductory text
  doc.setFontSize(FONTS.body.size);
  doc.setFont('helvetica', 'normal');
  setTextColorHex(doc, COLORS.black);

  // Introductory text about red/orange scores
  const intro1 = 'The following is a prioritised list of actions we recommend you take. Upgrading to an on-site audit includes a full inspection, advice and guidance and ensures there are no important details that you have overlooked.';
  const wrapped1 = doc.splitTextToSize(intro1, contentWidth);
  doc.text(wrapped1, startX, yPos);
  yPos += wrapped1.length * 4 + 8;

  const intro2 = 'Green scores are not shown as they reflect a higher degree of positivity associated with those factors.';
  const wrapped2 = doc.splitTextToSize(intro2, contentWidth);
  doc.text(wrapped2, startX, yPos);
  yPos += wrapped2.length * 4 + 20;

  // Get all red and orange questions (low scoring)
  const allQuestions = [
    ...data.questionResponses.red,
    ...data.questionResponses.orange,
  ];

  // Group questions by category
  const categories = [
    {
      name: 'Documentation',
      questions: allQuestions.filter(q => q.category === 'Documentation')
    },
    {
      name: 'Landlord-Tenant Communication',
      questions: allQuestions.filter(q => q.category === 'Landlord-Tenant Communication')
    },
    {
      name: 'Evidence Gathering Systems and Procedures',
      questions: allQuestions.filter(q => q.category === 'Evidence Gathering Systems and Procedures')
    },
  ];

  // Generate one table per category
  categories.forEach((category) => {
    if (category.questions.length === 0) return;

    // Category header
    yPos = addNewPageIfNeeded(doc, yPos, 50);

    doc.setFontSize(FONTS.h2.size);
    doc.setFont('helvetica', FONTS.h2.style);
    setTextColorHex(doc, COLORS.blue);
    doc.text(category.name, startX, yPos);
    yPos += 12;

    // Prepare table body with 3 columns: Status, Subcategory, Recommended Actions
    const tableBody = category.questions.map(question => {
      const recommendedAction = getRecommendedAction(question, data);

      return [
        '', // Status column - will be drawn with traffic light
        question.subcategory || '',
        recommendedAction,
      ];
    });

    // Extract colors for didDrawCell
    const rowColors = category.questions.map(q => q.color as 'red' | 'orange');

    autoTable(doc, {
      startY: yPos,
      head: [['Status', 'Subcategory', 'Recommended Actions']],
      body: tableBody,
      theme: 'grid',
      headStyles: {
        fillColor: hexToRgb(COLORS.paleBlue),
        textColor: hexToRgb(COLORS.black),
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'center',
      },
      bodyStyles: {
        fontSize: 9,
        textColor: hexToRgb(COLORS.black),
        cellPadding: 3,
      },
      columnStyles: {
        0: { cellWidth: 15, halign: 'center' }, // Status (traffic light)
        1: { cellWidth: 50, valign: 'top' }, // Subcategory
        2: { cellWidth: 105, valign: 'top' }, // Recommended Actions
      },
      didDrawCell: (cellData) => {
        // Draw traffic lights in Status column (index 0)
        if (cellData.column.index === 0 && cellData.section === 'body') {
          const rowIndex = cellData.row.index;
          if (rowIndex < rowColors.length) {
            const color = rowColors[rowIndex];
            const cellX = cellData.cell.x + cellData.cell.width / 2;
            
            // Align horizontally with the first line of top-aligned text. 
            // cellPadding is 3. The font is 9pt (~3mm). So +5mm pushes the circle perfectly into the top line of text.
            const cellY = cellData.cell.y + 5; 
            
            drawTrafficLight(doc, cellX, cellY, color, 1.5);
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

  // If no low-scoring questions exist
  if (allQuestions.length === 0) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'italic');
    setTextColorHex(doc, COLORS.mediumGray);
    doc.text('No immediate service recommendations - compliance is generally strong.', startX, yPos);
  }

  addPageFooter(doc);
}

/**
 * Get reason for low score from question's score_examples
 * Multiple fallbacks: score_examples > CSV data > generic
 */
function getReasonForLowScore(question: QuestionResponseData): string {
  // Priority 1: Use score_examples (Scoring Guidance from Edit Questions)
  if (question.score_examples && question.score_examples.length > 0) {
    // Map answer score to score_level
    // score 1 = 'low', score 5 = 'medium', score 10 = 'high'
    let scoreLevel: 'low' | 'medium' | 'high';
    if (question.score === 1) {
      scoreLevel = 'low';
    } else if (question.score === 5) {
      scoreLevel = 'medium';
    } else {
      scoreLevel = 'high';
    }

    // Find the matching score_example
    const matchingExample = question.score_examples.find(
      ex => ex.score_level === scoreLevel
    );

    if (matchingExample && matchingExample.reason_text && matchingExample.reason_text.trim()) {
      return matchingExample.reason_text.trim();
    }
  }

  // Fallback: Generic reason based on score/color
  if (question.color === 'red') {
    return `Legal requirement issue identified in ${question.subcategory || question.category}.`;
  } else if (question.color === 'orange') {
    return `Improvement needed in ${question.subcategory || question.category}.`;
  }

  return '';
}

/**
 * Get recommended action from question's score_examples
 * Fallbacks: score_examples > suggestedServices > generic
 */
function getRecommendedAction(question: QuestionResponseData, data?: ReportData): string {
  // Priority 1: Use report_action from score_examples (Scoring Guidance from Edit Questions)
  if (question.score_examples && question.score_examples.length > 0) {
    // Map answer score to score_level
    let scoreLevel: 'low' | 'medium' | 'high';
    if (question.score === 1) {
      scoreLevel = 'low';
    } else if (question.score === 5) {
      scoreLevel = 'medium';
    } else {
      scoreLevel = 'high';
    }

    const matchingExample = question.score_examples.find(
      ex => ex.score_level === scoreLevel
    );

    if (matchingExample && matchingExample.report_action && matchingExample.report_action.trim()) {
      return matchingExample.report_action.trim();
    }
  }

  // Fallback: Check suggested services (if data available)
  if (data && data.suggestedServices) {
    const service = data.suggestedServices.find(
      s => s.lowScoringArea.toLowerCase().includes((question.subcategory || question.category).toLowerCase())
    );
    if (service && service.suggestedService) {
      return service.suggestedService;
    }
  }

  // Fallback 3: Generic action based on score/color
  if (question.color === 'red') {
    return `Immediately address this legal requirement issue. Professional legal consultation is strongly recommended to avoid prosecution and financial penalties.`;
  } else if (question.color === 'orange') {
    return `Take action to improve compliance in this area. Consider implementing best practices to reduce risk.`;
  }

  return '';
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

