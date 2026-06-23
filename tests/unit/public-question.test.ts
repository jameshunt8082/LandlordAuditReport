import { describe, it, expect } from "vitest";
import { toPublicQuestion } from "@/lib/public-question";

// A row as returned by the for-tier SQL query.
const row = {
  id: 42,
  question_number: "2.1",
  category: "Documentation",
  sub_category: "Tenancy Agreements",
  question_text: "Do you keep signed tenancy agreements?",
  question_type: "yes_no",
  weight: "1.5",
  is_critical: true,
  motivation_learning_point: "Agreements protect both parties.",
  comment: "Upload a copy if available.",
  options: [{ value: 10, label: "Yes" }],
  score_examples: [
    { score_level: "low", reason_text: "internal guidance", report_action: "internal action" },
  ],
};

describe("toPublicQuestion", () => {
  const pub = toPublicQuestion(row, "tier_2");

  it("keeps the fields the landlord form needs", () => {
    expect(pub.id).toBe("2.1");
    expect(pub.category).toBe("Documentation");
    expect(pub.section).toBe("Tenancy Agreements");
    expect(pub.text).toBe("Do you keep signed tenancy agreements?");
    expect(pub.critical).toBe(true);
    expect(pub.comment).toBe("Upload a copy if available.");
    expect(pub.motivation_learning_point).toBe("Agreements protect both parties.");
    expect(pub.options).toEqual([{ value: 10, label: "Yes" }]);
    expect(pub.tiers).toEqual(["tier_2"]);
  });

  it("does NOT leak internal scoring fields to the public", () => {
    expect("weight" in pub).toBe(false);
    expect("score_examples" in pub).toBe(false);
    expect(JSON.stringify(pub)).not.toContain("internal guidance");
    expect(JSON.stringify(pub)).not.toContain("internal action");
  });
});
