import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sql, db } from "@vercel/postgres";
import { z } from "zod";
import { buildAdminQuestionsListQuery } from "@/lib/admin-questions-query";
import { sortByQuestionNumber } from "@/lib/question-sort";
import { questionNumberLockArg, nextMinorNumber } from "@/lib/question-number";

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

    // Build the list query from the actual filters. The `active` and `tier` params
    // were previously parsed but never applied. Uses parameterized subqueries to avoid
    // the Cartesian product that previously duplicated rows (3 options × 3 examples = 9).
    const { text, params } = buildAdminQuestionsListQuery({ category, tier, activeOnly });
    const result = await sql.query(text, params);

    // question_number is VARCHAR, so the SQL ORDER BY is lexicographic ("10.1" before
    // "2.1"). Re-sort numerically for a stable, correct order in the admin UI.
    const questions = sortByQuestionNumber(result.rows, {
      category: (q: any) => q.category,
      number: (q: any) => q.question_number,
    });

    return NextResponse.json({
      questions,
      total: questions.length,
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
    const data = createQuestionSchema.parse(body);
    console.log('✅ Zod validation passed');
    console.log('   Category:', data.category);
    console.log('   Sub-category:', data.sub_category);
    console.log('   Answer options count:', data.answer_options.length);
    console.log('   Score examples count:', data.score_examples?.length || 0);

    // Everything below runs in one transaction. A transaction-scoped advisory lock
    // keyed on (category, sub_category) serializes concurrent inserts so the
    // read-generate-insert of question_number cannot race two requests into the same
    // number (which would violate UNIQUE(category, question_number) and 500). The lock
    // and the multi-table write are released/committed atomically.
    console.log('🔢 Generating question number (under advisory lock)...');
    const client = await db.connect();
    let template: any;
    try {
      await client.query("BEGIN");
      await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [
        questionNumberLockArg(data.category, data.sub_category),
      ]);

      // Fetch all numbers for the sub-category (no SQL ORDER BY: question_number is
      // VARCHAR so a SQL sort is lexicographic — "2.9" would outrank "2.10" and we'd
      // regenerate an existing number). Pick the numeric max in JS instead.
      const existingResult = await client.query(
        `SELECT question_number FROM question_templates
         WHERE category = $1 AND sub_category = $2`,
        [data.category, data.sub_category]
      );

      let questionNumber: string;
      if (existingResult.rows.length === 0) {
        // First question in a new sub-category. NOTE: two concurrent POSTs creating
        // two *different* new sub-categories in the same category are not serialized
        // (different lock keys) and could compute the same major number; the UNIQUE
        // constraint catches that and one request 500s. Rare admin op, acceptable.
        const categoryCount = await client.query(
          `SELECT COUNT(DISTINCT sub_category) as count
           FROM question_templates WHERE category = $1`,
          [data.category]
        );
        const majorNumber = (Number(categoryCount.rows[0].count) || 0) + 1;
        questionNumber = `${majorNumber}.1`;
      } else {
        questionNumber = nextMinorNumber(
          existingResult.rows.map((r: any) => r.question_number as string)
        );
      }
      console.log('   Generated number:', questionNumber);

      const templateResult = await client.query(
        `INSERT INTO question_templates (
          category, sub_category, question_number, question_text, question_type,
          applicable_tiers, weight, is_critical, comment, motivation_learning_point,
          created_by_auditor_id
        ) VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, $8, $9, $10, $11)
        RETURNING *`,
        [
          data.category,
          data.sub_category,
          questionNumber,
          data.question_text,
          data.question_type,
          JSON.stringify(data.applicable_tiers),
          data.weight,
          data.is_critical,
          data.comment || null,
          data.motivation_learning_point || null,
          session.user.id,
        ]
      );
      template = templateResult.rows[0];
      console.log('✅ Template inserted, ID:', template.id);

      for (let i = 0; i < data.answer_options.length; i++) {
        const option = data.answer_options[i];
        await client.query(
          `INSERT INTO question_answer_options
             (question_template_id, option_text, score_value, option_order, is_example)
           VALUES ($1, $2, $3, $4, $5)`,
          [template.id, option.option_text, option.score_value, i + 1, option.is_example || false]
        );
      }

      if (data.score_examples && data.score_examples.length > 0) {
        for (const example of data.score_examples) {
          await client.query(
            `INSERT INTO question_score_examples
               (question_template_id, score_level, reason_text, report_action)
             VALUES ($1, $2, $3, $4)`,
            [template.id, example.score_level, example.reason_text, example.report_action || null]
          );
        }
      }

      await client.query("COMMIT");
      console.log('✅ Question committed');
    } catch (txError) {
      await client.query("ROLLBACK");
      throw txError;
    } finally {
      client.release();
    }

    console.log('🎉 Question created successfully!');
    console.log('🔵 POST /api/admin/questions - END\n');

    return NextResponse.json(
      {
        message: "Question created successfully",
        question: template, // RETURNING * already includes the generated question_number
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

