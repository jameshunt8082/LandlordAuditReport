import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { z } from "zod";

const submitSchema = z.object({
  responses: z.array(
    z.object({
      question_id: z.string(),
      answer_value: z.union([z.literal(1), z.literal(5), z.literal(10)]),
    })
  ).min(1, "At least one response is required"),
});

// Submit form responses
export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const body = await request.json();
    const { responses } = submitSchema.parse(body);

    // Get audit
    const auditResult = await sql`
      SELECT id, status, risk_audit_tier FROM audits WHERE token = ${token}
    `;

    if (auditResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Audit not found" },
        { status: 404 }
      );
    }

    const audit = auditResult.rows[0];

    if (audit.status !== "pending") {
      return NextResponse.json(
        { error: "This audit has already been submitted" },
        { status: 400 }
      );
    }

    // Validate all required questions are answered for this tier
    // Fetch questions dynamically from DB (same as the form does)
    console.log('🔄 Fetching questions from DB for tier:', audit.risk_audit_tier);
    const questionsResult = await sql`
      SELECT 
        qt.question_number as id
      FROM question_templates qt
      WHERE qt.is_active = TRUE
        AND qt.applicable_tiers @> ${JSON.stringify([audit.risk_audit_tier])}::jsonb
      ORDER BY qt.category, qt.question_number
    `;
    
    const requiredQuestionIds = questionsResult.rows.map((q) => q.id);
    const submittedQuestionIds = responses.map((r) => r.question_id);
    
    console.log('   Fetched', requiredQuestionIds.length, 'active questions from DB');

    // Debug: Log question ID comparison
    console.log('\n🔍 QUESTION ID VALIDATION');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 Required questions (from DB for this tier):');
    console.log('   Count:', requiredQuestionIds.length);
    console.log('   IDs:', requiredQuestionIds);
    console.log('\n📦 Submitted questions (from form):');
    console.log('   Count:', submittedQuestionIds.length);
    console.log('   IDs:', submittedQuestionIds);
    
    // Check if all required questions are answered
    const missingQuestions = requiredQuestionIds.filter(
      (id) => !submittedQuestionIds.includes(id)
    );

    if (missingQuestions.length > 0) {
      console.log('\n❌ Missing questions:', missingQuestions);
      return NextResponse.json(
        { 
          error: `Missing responses for ${missingQuestions.length} question(s): ${missingQuestions.join(", ")}`,
          missingQuestions,
        },
        { status: 400 }
      );
    }

    // Validate no extra questions submitted
    const extraQuestions = submittedQuestionIds.filter(
      (id) => !requiredQuestionIds.includes(id)
    );

    if (extraQuestions.length > 0) {
      console.log('\n❌ INVALID QUESTIONS DETECTED!');
      console.log('   Extra questions submitted:', extraQuestions);
      console.log('\n🔍 Detailed comparison:');
      extraQuestions.forEach(extraId => {
        console.log(`   "${extraId}" (${typeof extraId}) not found in required:`, requiredQuestionIds);
        console.log(`   Exact matches: ${requiredQuestionIds.map(id => `"${id}" === "${extraId}": ${id === extraId}`).join(', ')}`);
      });
      
      return NextResponse.json(
        { 
          error: `Invalid question IDs submitted: ${extraQuestions.join(", ")}`,
        },
        { status: 400 }
      );
    }
    
    console.log('✅ All question IDs validated successfully\n');

    // Insert all form responses
    for (const response of responses) {
      await sql`
        INSERT INTO form_responses (audit_id, question_id, answer_value, created_at)
        VALUES (${audit.id}, ${response.question_id}, ${response.answer_value}, NOW())
        ON CONFLICT (audit_id, question_id)
        DO UPDATE SET answer_value = ${response.answer_value}
      `;
    }

    // Update audit status to submitted
    await sql`
      UPDATE audits
      SET status = 'submitted', submitted_at = NOW()
      WHERE id = ${audit.id}
    `;

    return NextResponse.json({
      message: "Audit submitted successfully",
      audit_id: audit.id,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error("Submit audit error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

