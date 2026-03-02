// Generate Test PDF Locally using jsPDF (working approach)
import { sql } from '@vercel/postgres';
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { generateCompletePDF } from '../lib/pdf-client/generator';
import { transformAuditToReportData } from '../lib/pdf/formatters';
import { calculateAuditScores } from '../lib/scoring';

dotenv.config({ path: '.env.local' });

async function generateTestPDF() {
  console.log('Generating Test PDF Locally (jsPDF)...');
  console.log('='.repeat(60) + '\n');

  try {
    // 1. Find a submitted audit
    console.log('[1] Fetching submitted audits...');
    const audits = await sql`
      SELECT id, property_address, client_name, risk_audit_tier, status
      FROM audits
      WHERE status = 'submitted'
      ORDER BY created_at DESC
      LIMIT 5
    `;

    if (audits.rows.length === 0) {
      console.log('No submitted audits found. Create and submit an audit first.');
      process.exit(1);
    }

    console.log(`\nFound ${audits.rows.length} submitted audit(s):`);
    audits.rows.forEach((a, i) => {
      console.log(`   ${i + 1}. ID ${a.id}: ${a.property_address} (${a.risk_audit_tier})`);
    });

    // Use the most recent one
    const audit = audits.rows[0] as any;
    console.log(`\nUsing Audit ID ${audit.id}: ${audit.property_address}`);

    // 2. Fetch full audit data
    console.log('\n[2] Fetching full audit data...');
    const auditFull = await sql`SELECT * FROM audits WHERE id = ${audit.id}`;
    const auditData = auditFull.rows[0] as any;

    // 3. Fetch responses
    console.log('[3] Fetching responses...');
    const responsesResult = await sql`
      SELECT * FROM form_responses
      WHERE audit_id = ${audit.id}
      ORDER BY question_id
    `;
    const responses = responsesResult.rows as any[];
    console.log(`   ${responses.length} responses loaded`);

    // 4. Fetch questions
    console.log('[4] Fetching questions...');
    const questionsResult = await sql`
      SELECT 
        qt.id,
        qt.category,
        qt.sub_category,
        qt.question_number,
        qt.question_text,
        qt.question_type,
        qt.weight,
        qt.is_critical,
        json_agg(
          jsonb_build_object(
            'value', qao.score_value,
            'label', qao.option_text
          ) ORDER BY qao.option_order
        ) FILTER (WHERE qao.id IS NOT NULL AND qao.is_example = FALSE) as options
      FROM question_templates qt
      LEFT JOIN question_answer_options qao ON qt.id = qao.question_template_id
      WHERE qt.is_active = TRUE
        AND qt.applicable_tiers @> ${JSON.stringify([auditData.risk_audit_tier])}::jsonb
      GROUP BY qt.id
      ORDER BY qt.category, qt.question_number
    `;

    const questions = questionsResult.rows.map((row: any) => ({
      id: row.question_number,
      category: row.category,
      section: row.sub_category,
      text: row.question_text,
      critical: row.is_critical,
      tiers: [auditData.risk_audit_tier],
      weight: parseFloat(row.weight),
      options: row.options || [],
    }));

    console.log(`   ${questions.length} questions loaded`);

    // 5. Calculate scores
    console.log('\n[5] Calculating scores...');
    const scores = calculateAuditScores(responses, questions);
    console.log(`   Overall score: ${scores.overallScore.score.toFixed(1)}`);
    console.log(`   Category scores: ${scores.categoryScores.length}`);
    console.log(`   Recommended actions: ${scores.recommendedActions.length}`);

    // 6. Transform data
    console.log('\n[6] Transforming data to report format...');
    const reportData = transformAuditToReportData(auditData, responses, questions, scores);
    console.log(`   Red questions: ${reportData.questionResponses.red.length}`);
    console.log(`   Orange questions: ${reportData.questionResponses.orange.length}`);
    console.log(`   Green questions: ${reportData.questionResponses.green.length}`);

    // 7. Generate PDF using jsPDF (working approach)
    console.log('\n[7] Generating PDF with jsPDF...');
    const startTime = Date.now();

    const doc = await generateCompletePDF(reportData);
    const pdfArrayBuffer = doc.output('arraybuffer');
    const pdfBuffer = Buffer.from(pdfArrayBuffer);

    const renderTime = Date.now() - startTime;
    const sizeKB = Math.round(pdfBuffer.length / 1024);
    console.log(`   PDF generated in ${renderTime}ms (${sizeKB} KB)`);

    // 8. Save to file
    const outputPath = path.join(process.cwd(), 'test-report.pdf');
    fs.writeFileSync(outputPath, pdfBuffer);
    console.log(`\nPDF saved to: ${outputPath}`);

    console.log('\n' + '='.repeat(60));
    console.log('                    SUCCESS');
    console.log('='.repeat(60));
    console.log(`\nProperty: ${reportData.propertyAddress}`);
    console.log(`Overall Score: ${reportData.overallScore.toFixed(1)}/10`);
    console.log(`File Size: ${sizeKB} KB`);
    console.log(`Generation Time: ${renderTime}ms`);
    console.log(`\nOpening PDF...`);

    // Open PDF (Linux)
    const { exec } = require('child_process');
    exec(`xdg-open "${outputPath}"`);

    process.exit(0);

  } catch (error) {
    console.error('\nERROR:', error);
    console.error('\nStack:', (error as Error).stack);
    process.exit(1);
  }
}

generateTestPDF();
