import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { toPublicQuestion } from "@/lib/public-question";
import { sortByQuestionNumber } from "@/lib/question-sort";

// GET - Get all active questions for a specific tier (public endpoint)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ tier: string }> }
) {
  try {
    const { tier } = await params;
    console.log('\n🎯 GET /api/questions/for-tier/' + tier);

    // Validate tier
    const validTiers = ["tier_0", "tier_1", "tier_2", "tier_3", "tier_4"];
    if (!validTiers.includes(tier)) {
      return NextResponse.json(
        { error: "Invalid tier" },
        { status: 400 }
      );
    }

    // Get questions with answer options and score examples for this tier
    console.log('📋 Fetching questions from DB...');
    const result = await sql`
      SELECT 
        qt.id,
        qt.category,
        qt.sub_category,
        qt.question_number,
        qt.question_text,
        qt.question_type,
        qt.is_critical,
        qt.motivation_learning_point,
        qt.comment,
        (
          SELECT json_agg(
            jsonb_build_object(
              'value', qao2.score_value,
              'label', qao2.option_text
            ) ORDER BY qao2.option_order
          )
          FROM question_answer_options qao2
          WHERE qao2.question_template_id = qt.id
            AND qao2.is_example = FALSE
        ) as options
        -- weight and score_examples are intentionally NOT selected: this is a public,
        -- unauthenticated endpoint and those fields are internal scoring guidance.
      FROM question_templates qt
      WHERE qt.is_active = TRUE
        AND qt.applicable_tiers @> ${JSON.stringify([tier])}::jsonb
      ORDER BY qt.category, qt.question_number
    `;

    console.log('   Found', result.rows.length, 'questions');

    // Log each question with its option count
    result.rows.forEach(row => {
      const optionCount = row.options ? row.options.length : 0;
      console.log(`   Q${row.question_number}: ${optionCount} options`);
    });

    // Map to the public shape (omits internal scoring fields) and sort numerically,
    // since the SQL ORDER BY on the VARCHAR question_number is only lexicographic.
    const questions = sortByQuestionNumber(
      result.rows.map((row) => toPublicQuestion(row, tier)),
      { category: (q) => q.category, number: (q) => q.id }
    );

    console.log('✅ Returning', questions.length, 'questions\n');
    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Get questions for tier error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

