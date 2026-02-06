import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sql } from "@vercel/postgres";
import { calculateAuditScores } from "@/lib/scoring";
import { getQuestionsByTier } from "@/lib/questions";

// Get audit details with responses and scores
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let auditId: number | null = null;
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    auditId = parseInt(id);

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

    // Get form responses (including comments)
    const responsesResult = await sql`
      SELECT id, audit_id, question_id, answer_value, comment, created_at
      FROM form_responses
      WHERE audit_id = ${auditId}
      ORDER BY question_id
    `;

    const responses = responsesResult.rows as any[];

    // Fetch questions for this tier (direct import to avoid SSRF risk)
    let questionsForScoring: any[];
    try {
      // SECURITY FIX: Use direct function import instead of HTTP fetch
      const { getQuestionsForTier } = await import('@/lib/questions-db');
      questionsForScoring = await getQuestionsForTier(audit.risk_audit_tier);
    } catch (error: any) {
      console.warn("Error fetching questions from DB, using fallback:", error?.message);
      // Fallback to static questions
      questionsForScoring = getQuestionsByTier(audit.risk_audit_tier);
    }

    // Calculate scores if responses exist
    let scores = null;
    if (responses.length > 0) {
      try {
        scores = calculateAuditScores(responses as any, questionsForScoring);

        // Save scores to database
        for (const categoryScore of scores.categoryScores) {
          try {
            await sql`
              INSERT INTO scores (audit_id, scores_category, score, created_at)
              VALUES (${auditId}, ${categoryScore.category}, ${categoryScore.score}, NOW())
              ON CONFLICT (audit_id, scores_category)
              DO UPDATE SET score = ${categoryScore.score}
            `;
          } catch (scoreError: any) {
            console.error(`Error saving score for category ${categoryScore.category}:`, scoreError?.message);
            // Continue with other scores even if one fails
          }
        }

        // Also save overall score
        try {
          await sql`
            INSERT INTO scores (audit_id, scores_category, score, created_at)
            VALUES (${auditId}, 'Overall', ${scores.overallScore.score}, NOW())
            ON CONFLICT (audit_id, scores_category)
            DO UPDATE SET score = ${scores.overallScore.score}
          `;
        } catch (overallScoreError: any) {
          console.error("Error saving overall score:", overallScoreError?.message);
          // Continue even if overall score save fails
        }
      } catch (scoringError: any) {
        console.error("Error calculating scores:", scoringError?.message);
        // Don't fail the entire request if scoring fails
      }
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
      questions: questionsForScoring, // Include questions for PDF generation
      scores,
      notes: notesResult.rows,
    });
  } catch (error: any) {
    console.error("Get audit review error:", error);
    console.error("Error details:", {
      message: error?.message,
      stack: error?.stack,
      auditId: auditId,
    });
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: process.env.NODE_ENV === "development" ? error?.message : undefined
      },
      { status: 500 }
    );
  }
}

