/**
 * Query builder for the admin "list questions" endpoint.
 *
 * Extracted from the route handler so the filter logic (active-only, category, tier)
 * is unit-testable and actually applied — previously the `active` and `tier` query
 * params were parsed but never used, so admins could not list deactivated questions
 * or filter by tier.
 */

export interface AdminQuestionsListOptions {
  category?: string | null;
  tier?: string | null;
  /** Defaults to true. When false, deactivated questions are included. */
  activeOnly?: boolean;
}

const SELECT_BODY = `
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
`;

export function buildAdminQuestionsListQuery(
  opts: AdminQuestionsListOptions
): { text: string; params: any[] } {
  const conditions: string[] = [];
  const params: any[] = [];

  if (opts.activeOnly !== false) {
    conditions.push("qt.is_active = TRUE");
  }

  if (opts.category && opts.category !== "all") {
    params.push(opts.category);
    conditions.push(`qt.category = $${params.length}`);
  }

  if (opts.tier && opts.tier !== "all") {
    params.push(JSON.stringify([opts.tier]));
    conditions.push(`qt.applicable_tiers @> $${params.length}::jsonb`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const text = `${SELECT_BODY} ${where} ORDER BY qt.category, qt.question_number`;

  return { text, params };
}
