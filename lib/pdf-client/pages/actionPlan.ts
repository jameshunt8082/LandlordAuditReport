// Action Plan Page
import jsPDF from 'jspdf';
import { ReportData } from '@/lib/pdf/formatters';
import { COLORS, FONTS, LAYOUT, setFillColorHex, setTextColorHex, setDrawColorHex, formatScore } from '../styles';
import { addNewPageIfNeeded } from '../utils';
import { addPageHeader } from '../components/header';
import { addPageFooter } from '../components/footer';

/**
 * Generate Action Plan Page
 */
export async function actionPlan(doc: jsPDF, data: ReportData): Promise<void> {
  const { margins, contentWidth } = LAYOUT;
  const startX = margins.left;
  
  doc.addPage();
  addPageHeader(doc, doc.getCurrentPageInfo().pageNumber, 999);
  
  let yPos = margins.top + 15;
  
  // Title
  doc.setFontSize(FONTS.h1.size);
  doc.setFont('helvetica', FONTS.h1.style);
  setTextColorHex(doc, COLORS.primaryGreen);
  doc.text('Suggestions for Improvement', startX, yPos);
  yPos += 20;
  
  // Description
  doc.setFontSize(FONTS.body.size);
  doc.setFont('helvetica', 'normal');
  setTextColorHex(doc, COLORS.black);
  
  const descText = 'This action plan provides a prioritized timeline for addressing findings identified in this audit. Actions are categorized by urgency and legal risk, with immediate actions requiring attention within 7 days to avoid legal exposure.';
  const wrapped = doc.splitTextToSize(descText, contentWidth);
  doc.text(wrapped, startX, yPos);
  yPos += wrapped.length * 4 + 20;
  
  // Categorize actions by priority/timeline (only 2 sections per James feedback)
  // Now using score_examples from question_score_examples table
  const immediateActions = data.questionResponses.red;
  const shortTermActions = data.questionResponses.orange;
  
  // IMMEDIATE ACTIONS
  if (immediateActions.length > 0) {
    yPos = addNewPageIfNeeded(doc, yPos, 30);
    
    // Timeline header
    const headerY = yPos;
    setFillColorHex(doc, COLORS.paleBlue);
    doc.rect(startX, headerY, contentWidth, 12, 'F');
    
    setDrawColorHex(doc, COLORS.blue);
    doc.setLineWidth(0.5);
    doc.line(startX, headerY, startX + contentWidth, headerY);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    setTextColorHex(doc, COLORS.red);
    doc.text('⚠ CRITICAL COMPLIANCE - IMMEDIATE ACTIONS (0-7 Days)', startX + 8, headerY + 8);
    yPos += 12;
    
    // Description
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    setTextColorHex(doc, COLORS.red);
    doc.text('Legal requirement compliance issues exposing you to immediate fines or prosecution.', startX + 8, yPos + 5);
    yPos += 10;
    
    // Action items (using score_examples from question_score_examples table)
    immediateActions.forEach((q, idx) => {
      // Use reason_text from score_examples for left column, report_action for right column
      const lowExample = q.score_examples?.find(ex => ex.score_level === 'low');
      const leftColumnText = lowExample?.reason_text || 'Legal requirement issue identified';
      const rightColumnText = lowExample?.report_action || `${q.subcategory}: ${q.questionText}`;
      
      const leftWrapped = doc.splitTextToSize(leftColumnText, 65);
      const rightWrapped = doc.splitTextToSize(rightColumnText, contentWidth - 80);
      const actionHeight = Math.max(leftWrapped.length * 4, rightWrapped.length * 4) + 10;
      
      yPos = addNewPageIfNeeded(doc, yPos, actionHeight);
      
      setDrawColorHex(doc, COLORS.lightGray);
      doc.setLineWidth(0.1);
      doc.line(startX, yPos, startX + contentWidth, yPos);
      
      // Left column: reason_text from score_examples (low score)
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      setTextColorHex(doc, COLORS.red);
      doc.text(leftWrapped, startX + 8, yPos + 6);
      
      // Right column: report_action from score_examples (low score)
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      setTextColorHex(doc, COLORS.black);
      doc.text(rightWrapped, startX + 80, yPos + 6);
      
      yPos += actionHeight;
    });
    
    yPos += 15;
  }
  
  // SHORT-TERM ACTIONS
  if (shortTermActions.length > 0) {
    yPos = addNewPageIfNeeded(doc, yPos, 30);
    
    const headerY = yPos;
    setFillColorHex(doc, COLORS.paleBlue);
    doc.rect(startX, headerY, contentWidth, 12, 'F');
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    setTextColorHex(doc, '#dc2626'); // Red for HIGH priority consistency
    doc.text('SHORT-TERM ACTIONS (1-4 Weeks)', startX + 8, headerY + 8);
    yPos += 12;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text('Areas needing improvement to meet compliance standards.', startX + 8, yPos + 5);
    yPos += 10;
    
    // Action items (using score_examples from question_score_examples table)
    shortTermActions.forEach((q, idx) => {
      // Use reason_text from score_examples for left column, report_action for right column
      const mediumExample = q.score_examples?.find(ex => ex.score_level === 'medium');
      const leftColumnText = mediumExample?.reason_text || 'Improvement needed';
      const rightColumnText = mediumExample?.report_action || `${q.subcategory}: ${q.questionText}`;
      
      const leftWrapped = doc.splitTextToSize(leftColumnText, 65);
      const rightWrapped = doc.splitTextToSize(rightColumnText, contentWidth - 80);
      const actionHeight = Math.max(leftWrapped.length * 4, rightWrapped.length * 4) + 10;
      
      yPos = addNewPageIfNeeded(doc, yPos, actionHeight);
      
      setDrawColorHex(doc, COLORS.lightGray);
      doc.setLineWidth(0.1);
      doc.line(startX, yPos, startX + contentWidth, yPos);
      
      // Left column: reason_text from score_examples (medium score)
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      setTextColorHex(doc, '#dc2626'); // Red for HIGH priority consistency
      doc.text(leftWrapped, startX + 8, yPos + 6);
      
      // Right column: report_action from score_examples (medium score)
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      setTextColorHex(doc, COLORS.black);
      doc.text(rightWrapped, startX + 80, yPos + 6);
      
      yPos += actionHeight;
    });
    
    yPos += 15;
  }
  
  // REMOVED PER JAMES FEEDBACK: MEDIUM-TERM ACTIONS section
  // James said: "don't split them" - keep only 2 sections (Critical + Short-term)
  // Previously had a 3rd section that was splitting orange scores
  
  addPageFooter(doc);
}

