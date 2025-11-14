// Recommended Actions Page (Grouped by category per James feedback)
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ReportData, SubcategoryScore } from '@/lib/pdf/formatters';
import { COLORS, FONTS, LAYOUT, setTextColorHex } from '../styles';
import { addPageHeader } from '../components/header';
import { addPageFooter } from '../components/footer';
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
  setTextColorHex(doc, COLORS.primaryGreen);
  doc.text('Recommended Actions', startX, yPos);
  yPos += 12;
  
  // Subtitle
  doc.setFontSize(FONTS.h2.size);
  doc.setFont('helvetica', FONTS.h2.style);
  setTextColorHex(doc, COLORS.blue);
  doc.text('Suggestions for Improvement', startX, yPos);
  yPos += 15;
  
  // Introductory text
  doc.setFontSize(FONTS.body.size);
  doc.setFont('helvetica', 'normal');
  setTextColorHex(doc, COLORS.black);
  
  // Introductory text about red/orange scores
  const intro1 = 'The following factors that were in the red or orange score zones require your attention. We have suggestions for improvements that you could action.';
  const wrapped1 = doc.splitTextToSize(intro1, contentWidth);
  doc.text(wrapped1, startX, yPos);
  yPos += wrapped1.length * 4 + 8;
  
  const intro2 = 'Green scores are not shown as they reflect a higher degree of positivity associated with those factors.';
  const wrapped2 = doc.splitTextToSize(intro2, contentWidth);
  doc.text(wrapped2, startX, yPos);
  yPos += wrapped2.length * 4 + 20;
  
  // Filter only red and orange subcategories
  const lowScoringSubcats = data.subcategoryScores.filter(
    subcat => subcat.color === 'red' || subcat.color === 'orange'
  );
  
  // Group by category
  const categories = [
    { 
      name: 'Documentation', 
      subcats: lowScoringSubcats.filter(s => s.category === 'Documentation') 
    },
    { 
      name: 'Landlord-Tenant Communication', 
      subcats: lowScoringSubcats.filter(s => s.category === 'Landlord-Tenant Communication') 
    },
    { 
      name: 'Evidence Gathering Systems and Procedures', 
      subcats: lowScoringSubcats.filter(s => s.category === 'Evidence Gathering Systems and Procedures') 
    },
  ];
  
  // Generate one table per category
  categories.forEach((category) => {
    if (category.subcats.length === 0) return;
    
    // Category header
    yPos = addNewPageIfNeeded(doc, yPos, 40);
    
    doc.setFontSize(FONTS.h2.size);
    doc.setFont('helvetica', FONTS.h2.style);
    setTextColorHex(doc, COLORS.blue);
    doc.text(category.name, startX, yPos);
    yPos += 12;
    
    // Table body: subcategory with score + suggestion
    const tableBody = category.subcats.map(subcat => {
      // First column: Subcategory name + score on separate lines
      const subcatText = `${subcat.name}\nScore: ${subcat.score.toFixed(2)}`;
      
      // Second column: Suggestion (placeholder for now - will pull from spreadsheet logic)
      const suggestion = generateSuggestion(subcat, data);
      
      return [subcatText, `• ${suggestion}`];
    });
    
    autoTable(doc, {
      startY: yPos,
      head: [['Subcategory', 'Suggestions for Improvement']],
      body: tableBody,
      theme: 'grid',
      headStyles: {
        fillColor: hexToRgb(COLORS.paleBlue),
        textColor: hexToRgb(COLORS.black),
        fontSize: 11,
        fontStyle: 'bold',
        halign: 'left',
      },
      bodyStyles: {
        fontSize: 10,
        textColor: hexToRgb(COLORS.black),
        cellPadding: 4,
      },
      columnStyles: {
        0: { cellWidth: 60, valign: 'top' },
        1: { cellWidth: 110, valign: 'top' },
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
  
  // If no low-scoring subcategories exist
  if (lowScoringSubcats.length === 0) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'italic');
    setTextColorHex(doc, COLORS.mediumGray);
    doc.text('No immediate service recommendations - compliance is generally strong.', startX, yPos);
  }
  
  addPageFooter(doc);
}

/**
 * Generate suggestion text based on subcategory score
 * Uses Scoring Guidance (reason_text) from Edit Questions based on the actual answer score
 */
function generateSuggestion(subcat: SubcategoryScore, data: ReportData): string {
  // Find questions for this subcategory (across all color groups)
  const allQuestions = [
    ...data.questionResponses.red,
    ...data.questionResponses.orange,
    ...data.questionResponses.green,
  ];
  
  const subcatQuestions = allQuestions.filter(
    q => q.subcategory === subcat.name && q.category === subcat.category
  );
  
  // Find questions with score_examples (Scoring Guidance)
  // Use the question with the worst score (lowest) to get the most relevant guidance
  // Sort by score (lowest first) to prioritize worst-scoring questions
  const questionsWithGuidance = subcatQuestions
    .filter(q => q.score_examples && q.score_examples.length > 0)
    .sort((a, b) => a.score - b.score); // Sort by score ascending (worst first)
  
  for (const question of questionsWithGuidance) {
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
      
      if (matchingExample) {
        // Combine reason_text and report_action from Scoring Guidance
        const parts: string[] = [];
        
        // Add reason text if available
        if (matchingExample.reason_text && matchingExample.reason_text.trim()) {
          // Determine label based on score level
          let reasonLabel = '';
          if (scoreLevel === 'low') {
            reasonLabel = 'Reasons for low score';
          } else if (scoreLevel === 'medium') {
            reasonLabel = 'Reasons for medium score';
          } else {
            reasonLabel = 'Reasons for high score';
          }
          parts.push(`${reasonLabel}: ${matchingExample.reason_text}`);
        }
        
        // Add action to take if available
        if (matchingExample.report_action && matchingExample.report_action.trim()) {
          parts.push(`Action to take: ${matchingExample.report_action}`);
        }
        
        // Return combined text
        if (parts.length > 0) {
          return parts.join(' ');
        }
      }
    }
  }
  
  // Fallback 1: Try using CSV data (report_action, red_score_example, orange_score_example)
  const questionWithAction = subcatQuestions.find(q => q.report_action);
  if (questionWithAction && questionWithAction.report_action) {
    return questionWithAction.report_action;
  }
  
  // Fallback 2: Try using score-specific examples from CSV
  if (subcat.color === 'red') {
    const questionWithRedExample = subcatQuestions.find(q => q.red_score_example);
    if (questionWithRedExample && questionWithRedExample.red_score_example) {
      return questionWithRedExample.red_score_example;
    }
  } else if (subcat.color === 'orange') {
    const questionWithOrangeExample = subcatQuestions.find(q => q.orange_score_example);
    if (questionWithOrangeExample && questionWithOrangeExample.orange_score_example) {
      return questionWithOrangeExample.orange_score_example;
    }
  }
  
  // Fallback 3: Check suggested services
  const service = data.suggestedServices.find(
    s => s.lowScoringArea.toLowerCase().includes(subcat.name.toLowerCase())
  );
  
  if (service) {
    return service.suggestedService;
  }
  
  // Final fallback: Generic suggestions based on score/color
  if (subcat.color === 'red') {
    return `Statutory requirement improvement needed in ${subcat.name}. Immediate professional review recommended.`;
  } else {
    return `Areas for improvement identified in ${subcat.name}. Consider implementing best practices.`;
  }
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

