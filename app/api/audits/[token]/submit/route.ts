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
      SELECT id, status FROM audits WHERE token = ${token}
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

