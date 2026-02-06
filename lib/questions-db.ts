import { sql } from "@vercel/postgres";

/**
 * Question interface matching the format used by the scoring system
 */
export interface QuestionFromDB {
  id: string;
  category: string;
  section: string;
  text: string;
  critical: boolean;
  tiers: string[];
  weight: number;
  options: { value: number; label: string }[];
  motivation_learning_point: string | null;
  comment: string | null;
  score_examples: { score_level: string; reason_text: string; report_action: string }[];
}

/**
 * Fetch questions from the database for a specific tier.
 * This function is used directly instead of making HTTP requests,
 * eliminating SSRF risk and reducing latency.
 * 
 * @param tier - The audit tier (tier_0, tier_1, tier_2, tier_3, tier_4)
 * @returns Array of questions formatted for the scoring system
 */
export async function getQuestionsForTier(tier: string): Promise<QuestionFromDB[]> {
  const validTiers = ["tier_0", "tier_1", "tier_2", "tier_3", "tier_4"];
  if (!validTiers.includes(tier)) {
    throw new Error(`Invalid tier: ${tier}`);
  }

  console.log(`[getQuestionsForTier] Fetching questions for ${tier}...`);

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
      ) as options,
      (
        SELECT json_agg(
          jsonb_build_object(
            'score_level', qse2.score_level,
            'reason_text', qse2.reason_text,
            'report_action', qse2.report_action
          ) ORDER BY qse2.score_level
        )
        FROM question_score_examples qse2
        WHERE qse2.question_template_id = qt.id
      ) as score_examples
    FROM question_templates qt
    WHERE qt.is_active = TRUE
      AND qt.applicable_tiers @> ${JSON.stringify([tier])}::jsonb
    ORDER BY qt.category, qt.question_number
  `;

  console.log(`[getQuestionsForTier] Found ${result.rows.length} questions`);

  // Transform to match the Question interface from lib/questions.ts
  const questions: QuestionFromDB[] = result.rows.map((row) => ({
    id: row.question_number,
    category: row.category,
    section: row.sub_category,
    text: row.question_text,
    critical: row.is_critical,
    tiers: [tier],
    weight: parseFloat(row.weight),
    options: row.options || [],
    motivation_learning_point: row.motivation_learning_point,
    comment: row.comment,
    score_examples: row.score_examples || [],
  }));

  return questions;
}
