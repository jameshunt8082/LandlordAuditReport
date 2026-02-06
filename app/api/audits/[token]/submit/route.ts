import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { z } from "zod";

const submitSchema = z.object({
  responses: z
    .array(
      z.object({
        question_id: z.string(),
        answer_value: z.union([z.literal(1), z.literal(5), z.literal(10)]),
        comment: z.string().nullable().optional(), // Optional comment from landlord
      }),
    )
    .min(1, "At least one response is required"),
});

// Submit form responses
export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await params;
    const body = await request.json();
    const { responses } = submitSchema.parse(body);

    // Get audit
    const auditResult = await sql`
      SELECT id, status, risk_audit_tier, payment_status FROM audits WHERE token = ${token}
    `;

    if (auditResult.rows.length === 0) {
      return NextResponse.json({ error: "Audit not found" }, { status: 404 });
    }

    const audit = auditResult.rows[0];

    // Verify payment is confirmed (or created by auditor - no payment_status)
    if (audit.payment_status && audit.payment_status !== "paid") {
      return NextResponse.json(
        { error: "Payment not confirmed for this audit" },
        { status: 403 },
      );
    }

    if (audit.status !== "pending") {
      return NextResponse.json(
        { error: "This audit has already been submitted" },
        { status: 400 },
      );
    }

    // FLEXIBLE VALIDATION: Validate each submitted question individually
    // This allows for questionnaire evolution (new questions added, old ones removed)
    console.log(
      "🔄 Validating submitted questions for tier:",
      audit.risk_audit_tier,
    );

    const submittedQuestionIds = responses.map((r) => r.question_id);
    console.log("   Submitted questions count:", submittedQuestionIds.length);
    console.log("   Question IDs:", submittedQuestionIds);

    // Fetch ALL questions that could be valid for this tier (active + inactive)
    // This allows audits to be completed even if questions were added/removed
    // SECURITY FIX: Use parameterized queries to prevent SQL injection
    const allQuestionsResult = await sql`
      SELECT 
        qt.question_number as id,
        qt.is_active,
        qt.applicable_tiers
      FROM question_templates qt
      WHERE qt.question_number = ANY(${submittedQuestionIds as unknown as string})
    `;

    const validQuestionMap = new Map(
      allQuestionsResult.rows.map((q) => [q.id, q]),
    );

    console.log("   Found in DB:", allQuestionsResult.rows.length);

    // Validate each submitted question
    const invalidQuestions: string[] = [];
    const wrongTierQuestions: string[] = [];

    for (const questionId of submittedQuestionIds) {
      const questionData = validQuestionMap.get(questionId);

      if (!questionData) {
        // Question doesn't exist in database at all
        invalidQuestions.push(questionId);
        console.log(`   ❌ Question ${questionId}: NOT FOUND in database`);
      } else {
        // Check if question is applicable to this tier
        const tiers = questionData.applicable_tiers || [];
        if (!tiers.includes(audit.risk_audit_tier)) {
          wrongTierQuestions.push(questionId);
          console.log(
            `   ⚠️  Question ${questionId}: Wrong tier (applicable to: ${tiers.join(", ")})`,
          );
        } else {
          // Question is valid (exists and correct tier)
          const status = questionData.is_active
            ? "✅ VALID"
            : "⚠️  INACTIVE but ACCEPTED";
          console.log(`   ${status} Question ${questionId}`);
        }
      }
    }

    // Only reject if questions don't exist OR wrong tier
    if (invalidQuestions.length > 0) {
      console.log(
        "\n❌ Invalid questions (not found in DB):",
        invalidQuestions,
      );
      return NextResponse.json(
        {
          error: `Invalid question IDs: ${invalidQuestions.join(", ")}. These questions do not exist.`,
        },
        { status: 400 },
      );
    }

    if (wrongTierQuestions.length > 0) {
      console.log("\n❌ Wrong tier questions:", wrongTierQuestions);
      return NextResponse.json(
        {
          error: `Questions not applicable to tier ${audit.risk_audit_tier}: ${wrongTierQuestions.join(", ")}`,
        },
        { status: 400 },
      );
    }

    console.log("✅ All submitted questions validated successfully");
    console.log(
      `   Accepting ${submittedQuestionIds.length} responses (allows questionnaire evolution)\n`,
    );

    // Insert all form responses (with optional comments)
    for (const response of responses) {
      const comment = response.comment || null;
      await sql`
        INSERT INTO form_responses (audit_id, question_id, answer_value, comment, created_at)
        VALUES (${audit.id}, ${response.question_id}, ${response.answer_value}, ${comment}, NOW())
        ON CONFLICT (audit_id, question_id)
        DO UPDATE SET answer_value = ${response.answer_value}, comment = ${comment}
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
        { status: 400 },
      );
    }

    console.error("Submit audit error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
