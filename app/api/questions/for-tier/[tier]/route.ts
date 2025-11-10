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

    // Get questions with answer options for this tier
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
        json_agg(
          jsonb_build_object(
            'value', qao.score_value,
            'label', qao.option_text
          ) ORDER BY qao.option_order
        ) FILTER (WHERE qao.id IS NOT NULL AND qao.is_example = FALSE) as options
      FROM question_templates qt
      LEFT JOIN question_answer_options qao ON qt.id = qao.question_template_id
      WHERE qt.is_active = TRUE
        AND qt.applicable_tiers @> ${JSON.stringify([tier])}::jsonb
      GROUP BY qt.id
      ORDER BY qt.category, qt.question_number
    `;

    console.log('   Found', result.rows.length, 'questions');
    
    // Log each question with its option count
    result.rows.forEach(row => {
      const optionCount = row.options ? row.options.length : 0;
      console.log(`   Q${row.question_number}: ${optionCount} options ${optionCount === 0 ? '⚠️  NO OPTIONS!' : ''}`);
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

