import { describe, it, expect } from "vitest";
import { sortByQuestionNumber } from "@/lib/question-sort";
import { groupQuestionsByCategory, type Question } from "@/lib/questions";

/**
 * Guards the order the landlord form actually renders. The for-tier endpoint sorts
 * questions with sortByQuestionNumber; the form then runs groupQuestionsByCategory and
 * renders category by category. This test feeds deliberately out-of-order questions
 * (multi-digit majors/minors that break lexicographic sorting) through that exact
 * pipeline and asserts both the within-category numeric order and the category order.
 */
function makeQuestion(id: string, category: string): Question {
  return {
    id,
    category,
    section: "S",
    text: `Q ${id}`,
    critical: false,
    tiers: ["tier_0"],
    weight: 1,
    options: [],
  };
}

describe("form question order (sort -> group pipeline)", () => {
  // Intentionally shuffled, with the values that expose lexicographic sorting:
  // "10.1" vs "2.1" (major) and "2.10" vs "2.2" (minor).
  const raw: Question[] = [
    makeQuestion("10.1", "Evidence"),
    makeQuestion("2.10", "Documentation"),
    makeQuestion("2.1", "Documentation"),
    makeQuestion("2.2", "Documentation"),
    makeQuestion("1.1", "Documentation"),
    makeQuestion("9.1", "Evidence"),
  ];

  const sorted = sortByQuestionNumber(raw, {
    category: (q) => q.category,
    number: (q) => q.id,
  });
  const grouped = groupQuestionsByCategory(sorted);

  it("renders categories in alphabetical order", () => {
    expect(Object.keys(grouped)).toEqual(["Documentation", "Evidence"]);
  });

  it("renders questions within a category in numeric order, not lexicographic", () => {
    expect(grouped["Documentation"].map((q) => q.id)).toEqual(["1.1", "2.1", "2.2", "2.10"]);
    expect(grouped["Evidence"].map((q) => q.id)).toEqual(["9.1", "10.1"]);
  });
});
