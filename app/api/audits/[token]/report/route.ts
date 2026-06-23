// Public PDF Report API - authenticated by token instead of session
// Used for self-service questionnaire users who are not logged in
import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { generateCompletePDF } from '@/lib/pdf-client/generator';
import { transformAuditToReportData, formatReportDate, sanitizeAddressForFilename } from '@/lib/pdf/formatters';
import { calculateAuditScores } from '@/lib/scoring';

/**
 * GET /api/audits/[token]/report
 * Generate and download PDF report for a submitted audit (public, token-authenticated)
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const startTime = Date.now();

  try {
    const { token } = await params;
    console.log(`[PDF-Public] Generating report for token ${token}...`);

    // 1. Fetch audit by token (no auth required - token IS the auth)
    const auditResult = await sql`
      SELECT * FROM audits WHERE token = ${token}
    `;

    if (auditResult.rows.length === 0) {
      console.log(`[PDF-Public] Audit not found for token ${token}`);
      return NextResponse.json({ error: 'Audit not found' }, { status: 404 });
    }

    const audit = auditResult.rows[0] as any;

    // 2. Security checks
    if (audit.payment_status && audit.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Payment not confirmed for this audit' },
        { status: 403 }
      );
    }

    if (audit.status !== 'submitted' && audit.status !== 'completed') {
      return NextResponse.json(
        { error: 'Audit must be submitted before generating a report' },
        { status: 400 }
      );
    }

    // 3. Fetch form responses
    const responsesResult = await sql`
      SELECT id, audit_id, question_id, answer_value, comment, created_at
      FROM form_responses
      WHERE audit_id = ${audit.id}
      ORDER BY question_id
    `;

    const responses = responsesResult.rows as any[];

    if (responses.length === 0) {
      console.log(`[PDF-Public] No responses found for audit ${audit.id}`);
      return NextResponse.json({ error: 'No audit responses found' }, { status: 404 });
    }

    // 4. Fetch questions for this tier
    console.log(`[PDF-Public] Fetching questions for tier ${audit.risk_audit_tier}...`);
    // No static fallback: a report must be scored against the same question set the
    // landlord answered. Falling back to lib/questions.ts can silently diverge from
    // the DB and produce an inconsistent document, so abort instead.
    const { getQuestionsForTier } = await import('@/lib/questions-db');
    const questions: any[] = await getQuestionsForTier(audit.risk_audit_tier);
    console.log(`[PDF-Public] Fetched ${questions.length} questions from DB`);

    if (questions.length === 0) {
      return NextResponse.json(
        { error: "Question set is currently unavailable; report generation was aborted to avoid an inconsistent document." },
        { status: 503 }
      );
    }

    // 5. Calculate scores
    const scores = calculateAuditScores(responses, questions);
    console.log(`[PDF-Public] Scores: Overall ${scores.overallScore.score}, Risk: ${scores.overallScore.riskLevel}`);

    // 6. Transform to report format
    const reportData = transformAuditToReportData(audit, responses, questions, scores);

    // 7. Render PDF using jsPDF
    console.log('[PDF-Public] Rendering PDF with jsPDF...');
    const doc = await generateCompletePDF(reportData);
    const pdfArrayBuffer = doc.output('arraybuffer');
    const pdfBuffer = Buffer.from(pdfArrayBuffer);
    const pdfSize = Math.round(pdfBuffer.length / 1024);
    console.log(`[PDF-Public] PDF rendered (${pdfSize} KB)`);

    // 8. Generate filename and return
    const sanitizedAddress = sanitizeAddressForFilename(reportData.propertyAddress);
    const date = new Date().toISOString().split('T')[0];
    const filename = `landlord-audit-report-${sanitizedAddress}-${date}.pdf`;

    const totalTime = Date.now() - startTime;
    console.log(`[PDF-Public] Report generated for token ${token} (${totalTime}ms, ${pdfSize} KB)`);

    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
        'Cache-Control': 'public, max-age=86400',
        'X-Generation-Time': totalTime.toString(),
      },
    });

  } catch (error) {
    const errorTime = Date.now() - startTime;
    console.error('[PDF-Public] Generation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate PDF report',
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
