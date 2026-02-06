import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sql } from "@vercel/postgres";
import { z } from "zod";

const updateQuestionSchema = z.object({
  category: z.string().optional(),
  sub_category: z.string().optional(),
  question_text: z.string().min(10).optional(),
  question_type: z.enum(["yes_no", "multiple_choice"]).optional(),
  applicable_tiers: z.array(z.string()).optional(),
  weight: z.number().min(0.5).max(2.0).optional(),
  is_critical: z.boolean().optional(),
  comment: z.string().optional(),
  motivation_learning_point: z.string().optional(),
  is_active: z.boolean().optional(),
  answer_options: z.array(
    z.object({
      option_text: z.string(),
      score_value: z.number().min(1).max(10),
      is_example: z.boolean().optional(),
    })
  ).optional(),
  score_examples: z.array(
    z.object({
      score_level: z.enum(["low", "medium", "high"]),
      reason_text: z.string(),
      report_action: z.string().optional(),
    })
  ).optional(),
});

// GET - Get single question with options
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // RBAC: Only admin users can access admin endpoints
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { id } = await params;

    // Fetch question template first
    const templateResult = await sql`
      SELECT * FROM question_templates WHERE id = ${id}
    `;

    if (templateResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    const template = templateResult.rows[0];

    // Fetch answer options separately to avoid cartesian product
    const optionsResult = await sql`
      SELECT 
        id,
        option_text,
        score_value,
        option_order,
        is_example
      FROM question_answer_options
      WHERE question_template_id = ${id}
      ORDER BY option_order
    `;

    // Fetch score examples separately
    const examplesResult = await sql`
      SELECT 
        id,
        score_level,
        reason_text,
        report_action
      FROM question_score_examples
      WHERE question_template_id = ${id}
      ORDER BY score_level
    `;

    const result = {
      rows: [{
        ...template,
        answer_options: optionsResult.rows,
        score_examples: examplesResult.rows,
      }]
    };

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ question: result.rows[0] });
  } catch (error) {
    console.error("Get question error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH - Update question
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // RBAC: Only admin users can access admin endpoints
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const data = updateQuestionSchema.parse(body);

    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (data.category !== undefined) {
      updates.push(`category = $${paramCount++}`);
      values.push(data.category);
    }
    if (data.sub_category !== undefined) {
      updates.push(`sub_category = $${paramCount++}`);
      values.push(data.sub_category);
    }
    if (data.question_text !== undefined) {
      updates.push(`question_text = $${paramCount++}`);
      values.push(data.question_text);
    }
    if (data.question_type !== undefined) {
      updates.push(`question_type = $${paramCount++}`);
      values.push(data.question_type);
    }
    if (data.applicable_tiers !== undefined) {
      updates.push(`applicable_tiers = $${paramCount++}::jsonb`);
      values.push(JSON.stringify(data.applicable_tiers));
    }
    if (data.weight !== undefined) {
      updates.push(`weight = $${paramCount++}`);
      values.push(data.weight);
    }
    if (data.is_critical !== undefined) {
      updates.push(`is_critical = $${paramCount++}`);
      values.push(data.is_critical);
    }
    if (data.comment !== undefined) {
      updates.push(`comment = $${paramCount++}`);
      values.push(data.comment);
    }
    if (data.motivation_learning_point !== undefined) {
      updates.push(`motivation_learning_point = $${paramCount++}`);
      values.push(data.motivation_learning_point);
    }
    if (data.is_active !== undefined) {
      updates.push(`is_active = $${paramCount++}`);
      values.push(data.is_active);
    }

    updates.push(`updated_at = NOW()`);

    if (updates.length === 1) { // Only updated_at
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    values.push(id);
    const query = `
      UPDATE question_templates
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await sql.query(query, values);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    // Update answer_options if provided
    if (body.answer_options && Array.isArray(body.answer_options)) {
      // Delete existing options
      await sql`DELETE FROM question_answer_options WHERE question_template_id = ${id}`;
      
      // Insert new options
      for (let i = 0; i < body.answer_options.length; i++) {
        const option = body.answer_options[i];
        await sql`
          INSERT INTO question_answer_options (
            question_template_id, option_text, score_value, option_order, is_example
          ) VALUES (
            ${id}, 
            ${option.option_text}, 
            ${option.score_value}, 
            ${i + 1}, 
            ${option.is_example || false}
          )
        `;
      }
    }

    // Update score_examples if provided
    if (body.score_examples && Array.isArray(body.score_examples)) {
      // Delete existing examples
      await sql`DELETE FROM question_score_examples WHERE question_template_id = ${id}`;
      
      // Insert new examples
      for (const example of body.score_examples) {
        await sql`
          INSERT INTO question_score_examples (
            question_template_id, score_level, reason_text, report_action
          ) VALUES (
            ${id}, 
            ${example.score_level}, 
            ${example.reason_text}, 
            ${example.report_action || ''}
          )
        `;
      }
    }

    // Fetch complete updated question with relations
    const updatedQuestion = await sql`
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
      WHERE qt.id = ${id}
      GROUP BY qt.id
    `;

    return NextResponse.json({
      message: "Question updated successfully",
      question: updatedQuestion.rows[0],
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error("Update question error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Soft delete question
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // RBAC: Only admin users can access admin endpoints
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { id } = await params;

    // Soft delete (set is_active = false)
    const result = await sql`
      UPDATE question_templates
      SET is_active = FALSE, updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Question deactivated successfully",
    });
  } catch (error) {
    console.error("Delete question error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

