import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

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
        qt.weight,
        qt.is_critical,
        qt.motivation_learning_point,
        json_agg(
          DISTINCT jsonb_build_object(
            'value', qao.score_value,
            'label', qao.option_text
          ) ORDER BY qao.option_order
        ) FILTER (WHERE qao.id IS NOT NULL AND qao.is_example = FALSE) as options,
        json_agg(
          DISTINCT jsonb_build_object(
            'score_level', qse.score_level,
            'reason_text', qse.reason_text,
            'report_action', qse.report_action
          ) ORDER BY qse.score_level
        ) FILTER (WHERE qse.id IS NOT NULL) as score_examples
      FROM question_templates qt
      LEFT JOIN question_answer_options qao ON qt.id = qao.question_template_id
      LEFT JOIN question_score_examples qse ON qt.id = qse.question_template_id
      WHERE qt.is_active = TRUE
        AND qt.applicable_tiers @> ${JSON.stringify([tier])}::jsonb
      GROUP BY qt.id
      ORDER BY qt.category, qt.question_number
    `;

    console.log('   Found', result.rows.length, 'questions');
    
    // Log each question with its option count
    result.rows.forEach(row => {
      const optionCount = row.options ? row.options.length : 0;
      const scoreExamplesCount = row.score_examples ? row.score_examples.length : 0;
      console.log(`   Q${row.question_number}: ${optionCount} options, ${scoreExamplesCount} score_examples`);
      
      // Debug Q1.2 specifically
      if (row.question_number === '1.2') {
        console.log('   [Q1.2 Debug] score_examples from DB:', {
          raw: row.score_examples,
          isArray: Array.isArray(row.score_examples),
          length: row.score_examples?.length,
          first: row.score_examples?.[0]
        });
      }
    });

    // Transform to match the Question interface from lib/questions.ts
    const questions = result.rows.map((row) => ({
      id: row.question_number,
      category: row.category,
      section: row.sub_category,
      text: row.question_text,
      critical: row.is_critical,
      tiers: [tier],
      weight: parseFloat(row.weight),
      options: row.options || [],
      motivation_learning_point: row.motivation_learning_point,
      score_examples: row.score_examples || [],
    }));

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

