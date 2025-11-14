// Main PDF Generator - Client-side PDF generation using jsPDF
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { ReportData } from '@/lib/pdf/formatters';
import { coverPage } from './pages/coverPage';
import { auditScope } from './pages/auditScope';
// import { executiveSummary } from './pages/executiveSummary'; // REMOVED
// import { criticalFindings } from './pages/criticalFindings'; // REMOVED
// import { methodology } from './pages/methodology'; // REMOVED (replaced with auditScope)
// import { riskRating } from './pages/riskRating'; // REMOVED
// import { complianceStatus } from './pages/complianceStatus'; // REMOVED
import { evidenceSummary } from './pages/evidenceSummary';
import { introduction } from './pages/introduction';
import { results } from './pages/results';
import { subcategoryScores } from './pages/subcategoryScores';
import { recommendations } from './pages/recommendations';
import { actionPlan } from './pages/actionPlan';
import { detailedResults } from './pages/detailedResults';

/**
 * Generate complete professional PDF report
 * 
 * @param data - Transformed audit data
 * @returns jsPDF instance ready to be saved or downloaded
 */
export async function generateCompletePDF(data: ReportData): Promise<jsPDF> {
  console.log('[PDF Generator] Starting PDF generation...');
  const startTime = Date.now();
  
  // Create PDF document
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });
  
  try {
    // Page 1: Cover Page
    console.log('[PDF Generator] Generating cover page...');
    await coverPage(doc, data);
    
    // Page 2: Introduction (moved to beginning per James feedback, removed "How to Use" section)
    console.log('[PDF Generator] Generating introduction...');
    await introduction(doc, data);
    
    // Page 3: Audit Scope (simplified - removed full methodology per James feedback)
    console.log('[PDF Generator] Generating audit scope...');
    await auditScope(doc, data);
    
    // REMOVED PER JAMES FEEDBACK: Executive Summary
    // console.log('[PDF Generator] Generating executive summary...');
    // await executiveSummary(doc, data);
    
    // REMOVED PER JAMES FEEDBACK: Critical Findings Summary
    // if (data.questionResponses.red.length > 0) {
    //   console.log('[PDF Generator] Generating critical findings...');
    //   await criticalFindings(doc, data);
    // }
    
    // REMOVED PER JAMES FEEDBACK: Understanding Your Risk Rating (tiers relate to product tiers, not risk)
    // console.log('[PDF Generator] Generating risk rating...');
    // await riskRating(doc, data);
    
    // REMOVED PER JAMES FEEDBACK: Legal Compliance Status
    // console.log('[PDF Generator] Generating compliance status...');
    // await complianceStatus(doc, data);
    
    // Evidence Summary
    console.log('[PDF Generator] Generating evidence summary...');
    await evidenceSummary(doc, data);
    
    // Results
    console.log('[PDF Generator] Generating results...');
    await results(doc, data);
    
    // Subcategory Scores (Bar Charts)
    console.log('[PDF Generator] Generating subcategory scores...');
    await subcategoryScores(doc, data);
    
    // Recommendations
    console.log('[PDF Generator] Generating recommendations...');
    await recommendations(doc, data);
    
    // Action Plan
    console.log('[PDF Generator] Generating action plan...');
    await actionPlan(doc, data);
    
    // Detailed Results
    console.log('[PDF Generator] Generating detailed results...');
    await detailedResults(doc, data);
    
    const totalTime = Date.now() - startTime;
    const pageCount = doc.getNumberOfPages();
    
    // Update page numbers in headers (they were set to 999 as placeholder)
    console.log('[PDF Generator] Updating page numbers...');
    updatePageNumbers(doc, pageCount);
    
    console.log(`[PDF Generator] ✅ Generated ${pageCount} pages in ${totalTime}ms`);
    
    return doc;
  } catch (error) {
    console.error('[PDF Generator] Error generating PDF:', error);
    throw error;
  }
}

/**
 * Update page numbers in all headers after generation
 */
function updatePageNumbers(doc: jsPDF, totalPages: number): void {
  const pageCount = doc.getNumberOfPages();
  
  // Import updatePageNumber function
  const { updatePageNumber } = require('./components/header');
  
  // Skip page 1 (cover page has no header/page number)
  for (let i = 2; i <= pageCount; i++) {
    doc.setPage(i);
    updatePageNumber(doc, i, totalPages);
  }
  
  console.log(`[PDF Generator] Updated page numbers: 1-${totalPages}`);
}

