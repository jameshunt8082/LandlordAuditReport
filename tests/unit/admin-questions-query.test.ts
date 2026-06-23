import { describe, it, expect } from "vitest";
import { buildAdminQuestionsListQuery } from "@/lib/admin-questions-query";

describe("buildAdminQuestionsListQuery", () => {
  it("defaults to active-only with no extra params", () => {
    const { text, params } = buildAdminQuestionsListQuery({});
    expect(text).toContain("qt.is_active = TRUE");
    expect(text).not.toContain("qt.category =");
    expect(text).not.toContain("applicable_tiers");
    expect(params).toEqual([]);
  });

  it("includes inactive rows when activeOnly is false", () => {
    const { text } = buildAdminQuestionsListQuery({ activeOnly: false });
    expect(text).not.toContain("qt.is_active = TRUE");
  });

  it("applies the category filter as a parameter", () => {
    const { text, params } = buildAdminQuestionsListQuery({ category: "Documentation" });
    expect(text).toContain("qt.category = $1");
    expect(params).toContain("Documentation");
  });

  it("ignores the sentinel category 'all'", () => {
    const { text } = buildAdminQuestionsListQuery({ category: "all" });
    expect(text).not.toContain("qt.category =");
  });

  it("applies the tier filter as a jsonb containment parameter", () => {
    const { text, params } = buildAdminQuestionsListQuery({ tier: "tier_2" });
    expect(text).toContain("applicable_tiers @>");
    expect(params).toContain(JSON.stringify(["tier_2"]));
  });

  it("composes active + category + tier with sequential placeholders", () => {
    const { text, params } = buildAdminQuestionsListQuery({
      category: "Documentation",
      tier: "tier_1",
      activeOnly: true,
    });
    expect(text).toContain("qt.is_active = TRUE");
    expect(text).toContain("qt.category = $1");
    expect(text).toContain("applicable_tiers @> $2::jsonb");
    expect(params).toEqual(["Documentation", JSON.stringify(["tier_1"])]);
  });
});
