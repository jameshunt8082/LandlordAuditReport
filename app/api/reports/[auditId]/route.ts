// PDF Report Generation API Endpoint
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { sql } from '@vercel/postgres';
import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import { ReportDocument, generateReportFilename } from '@/components/pdf/ReportDocument';
import { transformAuditToReportData } from '@/lib/pdf/formatters';
import { generatePillarsChart, generateSubcategoryChart } from '@/lib/pdf/chartGenerators';
import { getCachedPDF, setCachedPDF } from '@/lib/pdf/cache';
import { calculateAuditScores } from '@/lib/scoring';

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
    
    // 3. Check cache first
    const cachedPDF = getCachedPDF(auditId, new Date(audit.updated_at || audit.created_at));
    if (cachedPDF) {
      const cacheTime = Date.now() - startTime;
      console.log(`[PDF] ✓ Cache hit for audit ${auditId} (${cacheTime}ms)`);
      
      const filename = generateReportFilename(
        transformAuditToReportData(audit, [], [], {
          categoryScores: [],
          overallScore: { score: 0, riskLevel: 'high', color: 'red' },
          recommendedActions: []
        })
      );
      
      return new Response(new Uint8Array(cachedPDF.pdf), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Content-Length': cachedPDF.pdf.length.toString(),
          'Cache-Control': 'public, max-age=86400',
        },
      });
    }
    
    console.log(`[PDF] Cache miss - generating new PDF...`);
    
    // 4. Fetch form responses
    const responsesResult = await sql`
      SELECT * FROM form_responses
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
    
    // 5. Fetch questions for this tier
    let questions: any[] = [];
    try {
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
      const questionsResponse = await fetch(
        `${baseUrl}/api/questions/for-tier/${audit.risk_audit_tier}`
      );
      
      if (questionsResponse.ok) {
        const questionsData = await questionsResponse.json();
        questions = questionsData.questions || [];
      }
    } catch (error) {
      console.error('[PDF] Error fetching questions:', error);
    }
    
    if (questions.length === 0) {
      // Fallback to static questions
      const { getQuestionsByTier } = await import('@/lib/questions');
      questions = getQuestionsByTier(audit.risk_audit_tier);
    }
    
    console.log(`[PDF] Loaded ${questions.length} questions for tier ${audit.risk_audit_tier}`);
    
    // 6. Calculate scores
    const scores = calculateAuditScores(responses, questions);
    console.log(`[PDF] Calculated scores: Overall ${scores.overallScore.score}`);
    
    // 7. Transform data to report format
    const reportData = transformAuditToReportData(audit, responses, questions, scores);
    console.log(`[PDF] Transformed data: ${reportData.questionResponses.red.length} red, ${reportData.questionResponses.orange.length} orange, ${reportData.questionResponses.green.length} green`);
    
    // 8. Generate charts in parallel
    // Charts removed from PDF (not rendering properly)
    
    // 9. Render PDF
    console.log('[PDF] Rendering PDF document...');
    const pdfBuffer = await renderToBuffer(
      React.createElement(ReportDocument, {
        data: reportData,
      }) as any
    );
    
    const pdfSize = Math.round(pdfBuffer.length / 1024);
    console.log(`[PDF] ✓ PDF rendered (${pdfSize} KB)`);
    
    // 10. Store in cache
    setCachedPDF(
      auditId,
      new Date(audit.updated_at || audit.created_at),
      pdfBuffer,
      {} // No charts
    );
    
    // 11. Generate filename
    const filename = generateReportFilename(reportData);
    
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
    
  } catch (error) {
    const errorTime = Date.now() - startTime;
    console.error('[PDF] Generation error:', error);
    console.error('[PDF] Stack trace:', (error as Error).stack);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate PDF report',
        details: (error as Error).message,
        time: errorTime
      },
      { status: 500 }
    );
  }
}

