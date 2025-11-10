import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sql } from "@vercel/postgres";
import { calculateAuditScores } from "@/lib/scoring";

// Get audit details with responses and scores
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const auditId = parseInt(id);

    // Get audit details
    const auditResult = await sql`
      SELECT * FROM audits
      WHERE id = ${auditId} AND auditor_id = ${session.user.id}
    `;

    if (auditResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Audit not found" },
        { status: 404 }
      );
    }

    const audit = auditResult.rows[0];

    // Get form responses
    const responsesResult = await sql`
      SELECT * FROM form_responses
      WHERE audit_id = ${auditId}
      ORDER BY question_id
    `;

    const responses = responsesResult.rows as any[];

    // Calculate scores if responses exist
    let scores = null;
    if (responses.length > 0) {
      scores = calculateAuditScores(responses as any);

      // Save scores to database
      for (const categoryScore of scores.categoryScores) {
        await sql`
          INSERT INTO scores (audit_id, category, score, created_at)
          VALUES (${auditId}, ${categoryScore.category}, ${categoryScore.score}, NOW())
          ON CONFLICT (audit_id, category)
          DO UPDATE SET score = ${categoryScore.score}
        `;
      }

      // Also save overall score
      await sql`
        INSERT INTO scores (audit_id, category, score, created_at)
        VALUES (${auditId}, 'Overall', ${scores.overallScore.score}, NOW())
        ON CONFLICT (audit_id, category)
        DO UPDATE SET score = ${scores.overallScore.score}
      `;
    }

    // Get notes
    const notesResult = await sql`
      SELECT * FROM notes
      WHERE audit_id = ${auditId}
      ORDER BY created_at DESC
    `;

    return NextResponse.json({
      audit,
      responses,
      scores,
      notes: notesResult.rows,
    });
  } catch (error) {
    console.error("Get audit review error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

