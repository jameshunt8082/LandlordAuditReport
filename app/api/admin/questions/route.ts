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

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const tier = searchParams.get("tier");
    const activeOnly = searchParams.get("active") !== "false";

    // Single optimized query with JOINs - 51 queries reduced to 1
    let result;
    
    if (category && category !== "all") {
      result = await sql`
        SELECT 
          qt.*,
          COALESCE(
            json_agg(
              jsonb_build_object(
                'id', qao.id,
                'option_text', qao.option_text,
                'score_value', qao.score_value,
                'option_order', qao.option_order,
                'is_example', qao.is_example
              ) ORDER BY qao.option_order
            ) FILTER (WHERE qao.id IS NOT NULL),
            '[]'
          ) as answer_options,
          COALESCE(
            json_agg(
              DISTINCT jsonb_build_object(
                'id', qse.id,
                'score_level', qse.score_level,
                'reason_text', qse.reason_text,
                'report_action', qse.report_action
              )
            ) FILTER (WHERE qse.id IS NOT NULL),
            '[]'
          ) as score_examples
        FROM question_templates qt
        LEFT JOIN question_answer_options qao ON qt.id = qao.question_template_id
        LEFT JOIN question_score_examples qse ON qt.id = qse.question_template_id
        WHERE qt.is_active = TRUE
          AND qt.category = ${category}
        GROUP BY qt.id
        ORDER BY qt.category, qt.question_number
      `;
    } else {
      result = await sql`
        SELECT 
          qt.*,
          COALESCE(
            json_agg(
              jsonb_build_object(
                'id', qao.id,
                'option_text', qao.option_text,
                'score_value', qao.score_value,
                'option_order', qao.option_order,
                'is_example', qao.is_example
              ) ORDER BY qao.option_order
            ) FILTER (WHERE qao.id IS NOT NULL),
            '[]'
          ) as answer_options,
          COALESCE(
            json_agg(
              DISTINCT jsonb_build_object(
                'id', qse.id,
                'score_level', qse.score_level,
                'reason_text', qse.reason_text,
                'report_action', qse.report_action
              )
            ) FILTER (WHERE qse.id IS NOT NULL),
            '[]'
          ) as score_examples
        FROM question_templates qt
        LEFT JOIN question_answer_options qao ON qt.id = qao.question_template_id
        LEFT JOIN question_score_examples qse ON qt.id = qse.question_template_id
        WHERE qt.is_active = TRUE
        GROUP BY qt.id
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
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const data = createQuestionSchema.parse(body);

    // Auto-generate question number
    const existingResult = await sql`
      SELECT question_number FROM question_templates
      WHERE category = ${data.category} AND sub_category = ${data.sub_category}
      ORDER BY question_number DESC
      LIMIT 1
    `;

    let questionNumber: string;
    if (existingResult.rows.length === 0) {
      // First question in this sub-category
      const categoryCount = await sql`
        SELECT COUNT(DISTINCT sub_category) as count
        FROM question_templates
        WHERE category = ${data.category}
      `;
      const majorNumber = (categoryCount.rows[0].count || 0) + 1;
      questionNumber = `${majorNumber}.1`;
    } else {
      const lastNumber = existingResult.rows[0].question_number;
      const parts = lastNumber.split('.');
      const nextMinor = parseInt(parts[1] || '0') + 1;
      questionNumber = `${parts[0]}.${nextMinor}`;
    }

    // Insert question template
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
        ${data.motivation_learning_point || null},
        ${session.user.id}
      )
      RETURNING *
    `;

    const template = templateResult.rows[0];

    // Insert answer options
    for (let i = 0; i < data.answer_options.length; i++) {
      const option = data.answer_options[i];
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
          ${i},
          ${option.is_example || false}
        )
      `;
    }

    // Insert score examples
    if (data.score_examples && data.score_examples.length > 0) {
      for (const example of data.score_examples) {
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
    }

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
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error("Create question error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

