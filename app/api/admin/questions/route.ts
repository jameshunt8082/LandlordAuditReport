import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sql } from "@vercel/postgres";
import { z } from "zod";

const createQuestionSchema = z.object({
  category: z.string().min(1, "Category is required"),
  sub_category: z.string().min(1, "Sub-category is required"),
  question_text: z.string().min(10, "Question must be at least 10 characters"),
  question_type: z.enum(["yes_no", "multiple_choice"]),
  applicable_tiers: z.array(z.enum(["tier_0", "tier_1", "tier_2", "tier_3", "tier_4"])).min(1),
  weight: z.number().min(0.5).max(2.0),
  is_critical: z.boolean(),
  comment: z.string().optional(),
  motivation_learning_point: z.string().optional(),
  answer_options: z.array(
    z.object({
      option_text: z.string().min(1),
      score_value: z.number().min(1).max(10),
      is_example: z.boolean().optional(),
    })
  ).min(2, "At least 2 answer options required"),
  score_examples: z.array(
    z.object({
      score_level: z.enum(["low", "medium", "high"]),
      reason_text: z.string().min(1),
      report_action: z.string().optional(),
    })
  ).optional(),
});

// GET - List all questions
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // RBAC: Only admin users can access admin endpoints
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const tier = searchParams.get("tier");
    const activeOnly = searchParams.get("active") !== "false";

    // Optimized query using subqueries to avoid Cartesian product
    // Previously caused 9 duplicates (3 options × 3 examples = 9)
    let result;
    
    if (category && category !== "all") {
      result = await sql`
        SELECT 
          qt.*,
          COALESCE(
            (
              SELECT json_agg(
                jsonb_build_object(
                  'id', qao.id,
                  'option_text', qao.option_text,
                  'score_value', qao.score_value,
                  'option_order', qao.option_order,
                  'is_example', qao.is_example
                ) ORDER BY qao.option_order
              )
              FROM question_answer_options qao
              WHERE qao.question_template_id = qt.id
            ),
            '[]'
          ) as answer_options,
          COALESCE(
            (
              SELECT json_agg(
                jsonb_build_object(
                  'id', qse.id,
                  'score_level', qse.score_level,
                  'reason_text', qse.reason_text,
                  'report_action', qse.report_action
                )
              )
              FROM question_score_examples qse
              WHERE qse.question_template_id = qt.id
            ),
            '[]'
          ) as score_examples
        FROM question_templates qt
        WHERE qt.is_active = TRUE
          AND qt.category = ${category}
        ORDER BY qt.category, qt.question_number
      `;
    } else {
      result = await sql`
        SELECT 
          qt.*,
          COALESCE(
            (
              SELECT json_agg(
                jsonb_build_object(
                  'id', qao.id,
                  'option_text', qao.option_text,
                  'score_value', qao.score_value,
                  'option_order', qao.option_order,
                  'is_example', qao.is_example
                ) ORDER BY qao.option_order
              )
              FROM question_answer_options qao
              WHERE qao.question_template_id = qt.id
            ),
            '[]'
          ) as answer_options,
          COALESCE(
            (
              SELECT json_agg(
                jsonb_build_object(
                  'id', qse.id,
                  'score_level', qse.score_level,
                  'reason_text', qse.reason_text,
                  'report_action', qse.report_action
                )
              )
              FROM question_score_examples qse
              WHERE qse.question_template_id = qt.id
            ),
            '[]'
          ) as score_examples
        FROM question_templates qt
        WHERE qt.is_active = TRUE
        ORDER BY qt.category, qt.question_number
      `;
    }

    return NextResponse.json({
      questions: result.rows,
      total: result.rows.length,
    });
  } catch (error: any) {
    console.error("Get questions error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create new question
export async function POST(request: Request) {
  try {
    console.log('\n🔵 POST /api/admin/questions - START');
    
    const session = await auth();
    if (!session?.user?.id) {
      console.log('❌ Unauthorized - no session');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // RBAC: Only admin users can access admin endpoints
    if (session.user.role !== 'admin') {
      console.log('❌ Forbidden - not admin');
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }
    console.log('✅ Session validated:', session.user.id);

    const body = await request.json();
    console.log('📦 Request body:', JSON.stringify(body, null, 2));
    
    console.log('🔍 Validating with Zod schema...');
    const data = createQuestionSchema.parse(body);
    console.log('✅ Zod validation passed');
    console.log('   Category:', data.category);
    console.log('   Sub-category:', data.sub_category);
    console.log('   Answer options count:', data.answer_options.length);
    console.log('   Score examples count:', data.score_examples?.length || 0);

    // Auto-generate question number
    console.log('🔢 Generating question number...');
    const existingResult = await sql`
      SELECT question_number FROM question_templates
      WHERE category = ${data.category} AND sub_category = ${data.sub_category}
      ORDER BY question_number DESC
      LIMIT 1
    `;
    console.log('   Existing questions in sub-category:', existingResult.rows.length);

    let questionNumber: string;
    if (existingResult.rows.length === 0) {
      console.log('   First question in this sub-category');
      // First question in this sub-category
      const categoryCount = await sql`
        SELECT COUNT(DISTINCT sub_category) as count
        FROM question_templates
        WHERE category = ${data.category}
      `;
      const majorNumber = (categoryCount.rows[0].count || 0) + 1;
      questionNumber = `${majorNumber}.1`;
      console.log('   Generated number:', questionNumber);
    } else {
      const lastNumber = existingResult.rows[0].question_number;
      console.log('   Last number in sub-category:', lastNumber);
      const parts = lastNumber.split('.');
      const nextMinor = parseInt(parts[1] || '0') + 1;
      questionNumber = `${parts[0]}.${nextMinor}`;
      console.log('   Generated number:', questionNumber);
    }

    // Insert question template
    console.log('📝 Inserting question template...');
    console.log('   applicable_tiers:', data.applicable_tiers);
    const templateResult = await sql`
      INSERT INTO question_templates (
        category,
        sub_category,
        question_number,
        question_text,
        question_type,
        applicable_tiers,
        weight,
        is_critical,
        comment,
        motivation_learning_point,
        created_by_auditor_id
      ) VALUES (
        ${data.category},
        ${data.sub_category},
        ${questionNumber},
        ${data.question_text},
        ${data.question_type},
        ${JSON.stringify(data.applicable_tiers)},
        ${data.weight},
        ${data.is_critical},
        ${data.comment || null},
        ${data.motivation_learning_point || null},
        ${session.user.id}
      )
      RETURNING *
    `;
    console.log('✅ Template inserted, ID:', templateResult.rows[0].id);

    const template = templateResult.rows[0];

    // Insert answer options
    console.log('📋 Inserting answer options...');
    for (let i = 0; i < data.answer_options.length; i++) {
      const option = data.answer_options[i];
      console.log(`   Option ${i + 1}:`, {
        text: option.option_text.substring(0, 50) + '...',
        score: option.score_value,
        order: i + 1  // Start from 1, not 0
      });
      
      await sql`
        INSERT INTO question_answer_options (
          question_template_id,
          option_text,
          score_value,
          option_order,
          is_example
        ) VALUES (
          ${template.id},
          ${option.option_text},
          ${option.score_value},
          ${i + 1},
          ${option.is_example || false}
        )
      `;
    }
    console.log('✅ All answer options inserted');

    // Insert score examples
    console.log('📊 Inserting score examples...');
    if (data.score_examples && data.score_examples.length > 0) {
      for (const example of data.score_examples) {
        console.log(`   Example (${example.score_level}):`, example.reason_text.substring(0, 50) + '...');
        
        await sql`
          INSERT INTO question_score_examples (
            question_template_id,
            score_level,
            reason_text,
            report_action
          ) VALUES (
            ${template.id},
            ${example.score_level},
            ${example.reason_text},
            ${example.report_action || null}
          )
        `;
      }
      console.log('✅ All score examples inserted');
    } else {
      console.log('⚠️  No score examples provided');
    }

    console.log('🎉 Question created successfully!');
    console.log('🔵 POST /api/admin/questions - END\n');

    return NextResponse.json(
      {
        message: "Question created successfully",
        question: {
          ...template,
          question_number: questionNumber,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      console.error('❌ Zod validation error:', JSON.stringify(error.issues, null, 2));
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error('❌ Create question error:', error);
    console.error('   Error type:', error?.constructor?.name);
    console.error('   Error message:', error?.message);
    console.error('   Error stack:', error?.stack);
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

