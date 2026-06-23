/**
 * Public-facing question shape served by the unauthenticated /api/questions/for-tier
 * endpoint. It deliberately omits internal scoring fields (`weight`, `score_examples`,
 * `report_action`) so the scoring rubric is not exposed to anonymous callers. Only the
 * fields the landlord form actually renders are included.
 */
export interface PublicQuestion {
  id: string;
  category: string;
  section: string;
  text: string;
  critical: boolean;
  tiers: string[];
  options: { value: number; label: string }[];
  motivation_learning_point: string | null;
  comment: string | null;
}

/**
 * Map a question_templates row (as returned by the for-tier SQL) to the public shape.
 * `weight` and `score_examples`/`report_action` are intentionally not copied.
 */
export function toPublicQuestion(row: any, tier: string): PublicQuestion {
  return {
    id: row.question_number,
    category: row.category,
    section: row.sub_category,
    text: row.question_text,
    critical: row.is_critical,
    tiers: [tier],
    options: row.options ? [...row.options] : [],
    motivation_learning_point: row.motivation_learning_point,
    comment: row.comment,
  };
}
