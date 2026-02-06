// PDF Report Generation API Endpoint
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { sql } from '@vercel/postgres';
import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import { transformAuditToReportData, formatReportDate, sanitizeAddressForFilename } from '@/lib/pdf/formatters';
import { calculateAuditScores } from '@/lib/scoring';
import { generatePDFFromHTML } from '@/lib/pdf/puppeteer-generator';
import { generateMinimalReportHTML } from '@/components/pdf-html/MinimalReportHTML';

/**
 * GET /api/reports/[auditId]
 * Generate and download PDF report for an audit
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ auditId: string }> }
) {
  const startTime = Date.now();
  
  try {
    // 1. Auth check
    const session = await auth();
    if (!session?.user?.id) {
      console.log('[PDF] Unauthorized access attempt');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { auditId } = await params;
    console.log(`[PDF] Generating report for audit ${auditId}...`);
    
    // 2. Fetch audit from DB (with ownership check)
    const auditResult = await sql`
      SELECT * FROM audits
      WHERE id = ${auditId} AND auditor_id = ${session.user.id}
    `;
    
    if (auditResult.rows.length === 0) {
      console.log(`[PDF] Audit ${auditId} not found or access denied`);
      return NextResponse.json(
        { error: 'Audit not found' },
        { status: 404 }
      );
    }
    
    const audit = auditResult.rows[0] as any;
    
    // Check if audit is submitted
    if (audit.status !== 'submitted' && audit.status !== 'completed') {
      console.log(`[PDF] Audit ${auditId} not submitted yet`);
      return NextResponse.json(
        { error: 'Audit must be submitted before generating report' },
        { status: 400 }
      );
    }
    
    // 3. SKIP CACHE TEMPORARILY FOR DEBUGGING
    console.log(`[PDF] Cache disabled for debugging - generating fresh PDF...`);
    
    // 4. Fetch form responses (including comments)
    const responsesResult = await sql`
      SELECT id, audit_id, question_id, answer_value, comment, created_at
      FROM form_responses
      WHERE audit_id = ${auditId}
      ORDER BY question_id
    `;
    
    const responses = responsesResult.rows as any[];
    
    if (responses.length === 0) {
      console.log(`[PDF] No responses found for audit ${auditId}`);
      return NextResponse.json(
        { error: 'No audit responses found' },
        { status: 404 }
      );
    }
    
    
    // 5. Fetch questions for this tier (direct import to avoid SSRF risk)
    console.log(`[PDF] Step 5: Fetching questions for tier ${audit.risk_audit_tier}...`);
    let questions: any[] = [];
    try {
      // SECURITY FIX: Use direct function import instead of HTTP fetch
      // This eliminates SSRF risk and reduces latency
      const { getQuestionsForTier } = await import('@/lib/questions-db');
      questions = await getQuestionsForTier(audit.risk_audit_tier);
      console.log(`[PDF] Fetched ${questions.length} questions from DB`);
    } catch (error) {
      console.error('[PDF] Error fetching questions from DB:', error);
      console.error('[PDF] Error details:', (error as Error).message);
    }
    
    if (questions.length === 0) {
      console.log('[PDF] No questions from DB, falling back to static questions...');
      const { getQuestionsByTier } = await import('@/lib/questions');
      questions = getQuestionsByTier(audit.risk_audit_tier);
      console.log(`[PDF] Loaded ${questions.length} static fallback questions`);
    }
    
    console.log(`[PDF] ✓ Total questions loaded: ${questions.length} for tier ${audit.risk_audit_tier}`);
    
    // 6. Calculate scores
    console.log(`[PDF] Step 6: Calculating scores with ${responses.length} responses and ${questions.length} questions...`);
    try {
      const scores = calculateAuditScores(responses, questions);
      console.log(`[PDF] ✓ Calculated scores: Overall ${scores.overallScore.score}, Risk Level: ${scores.overallScore.riskLevel}`);
    
      // 7. Transform data to report format (comments are now in form_responses)
      console.log(`[PDF] Step 7: Transforming audit data to report format...`);
      const reportData = transformAuditToReportData(audit, responses, questions, scores);
      console.log(`[PDF] ✓ Transformed data:`);
      console.log(`[PDF]   - Red questions: ${reportData.questionResponses.red.length}`);
      console.log(`[PDF]   - Orange questions: ${reportData.questionResponses.orange.length}`);
      console.log(`[PDF]   - Green questions: ${reportData.questionResponses.green.length}`);
      console.log(`[PDF]   - Recommendations: ${Object.keys(reportData.recommendationsByCategory).length} categories`);
      console.log(`[PDF]   - Subcategory scores: ${reportData.subcategoryScores.length}`);
    
    // 8. Generate charts in parallel
    // Charts removed from PDF (not rendering properly)
    
      // 9. Generate PDF using Puppeteer (Vercel compatible)
      console.log('[PDF] Step 9: Generating HTML template...');
      const reportId = `LRA-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-XXXXXX`;
      const html = generateMinimalReportHTML({
        propertyAddress: reportData.propertyAddress,
        landlordName: reportData.landlordName,
        auditorName: reportData.auditorName,
        overallScore: reportData.overallScore,
        riskTier: reportData.riskTier,
        reportId,
        reportDate: formatReportDate(reportData.auditEndDate),
      });
      
      console.log('[PDF] Step 10: Rendering PDF with Puppeteer...');
      const pdfBuffer = await generatePDFFromHTML(html);
      
      const pdfSize = Math.round(pdfBuffer.length / 1024);
      console.log(`[PDF] ✓ PDF rendered successfully (${pdfSize} KB)`);
    
    // 10. SKIP CACHE STORAGE FOR DEBUGGING
    console.log(`[PDF] Cache storage disabled for debugging`);
    
    // 11. Generate filename
    const sanitizedAddress = sanitizeAddressForFilename(reportData.propertyAddress);
    const date = new Date().toISOString().split('T')[0];
    const filename = `landlord-audit-report-${sanitizedAddress}-${date}.pdf`;
    
    // 12. Return PDF
    const totalTime = Date.now() - startTime;
    console.log(`[PDF] ✓ Report generated successfully for audit ${auditId} (${totalTime}ms, ${pdfSize} KB)`);
    
    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
        'Cache-Control': 'public, max-age=86400',
        'X-Generation-Time': totalTime.toString(),
      },
    });
    
    } catch (scoreError) {
      console.error('[PDF] ❌ Score calculation failed:', scoreError);
      throw scoreError;
    }
    
  } catch (error) {
    const errorTime = Date.now() - startTime;
    console.error('[PDF] ❌ Generation error at step:', error);
    console.error('[PDF] Error name:', (error as Error).name);
    console.error('[PDF] Error message:', (error as Error).message);
    console.error('[PDF] Stack trace:', (error as Error).stack);
    
    // Check if it's a specific type of error
    if ((error as Error).message.includes('options')) {
      console.error('[PDF] ⚠️  This appears to be a question options error');
    }
    if ((error as Error).message.includes('undefined')) {
      console.error('[PDF] ⚠️  This appears to be an undefined value error');
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to generate PDF report',
        details: (error as Error).message,
        errorName: (error as Error).name,
        time: errorTime
      },
      { status: 500 }
    );
  }
}

