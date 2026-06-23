import { describe, it, expect } from "vitest";
import { compareQuestionNumber, sortByQuestionNumber } from "@/lib/question-sort";

describe("compareQuestionNumber", () => {
  it("orders by major number numerically, not lexicographically", () => {
    // The bug: VARCHAR sort puts "10.1" before "2.1". Numeric order must not.
    expect(compareQuestionNumber("2.1", "10.1")).toBeLessThan(0);
    expect(compareQuestionNumber("10.1", "2.1")).toBeGreaterThan(0);
  });

  it("orders by minor number numerically", () => {
    expect(compareQuestionNumber("2.2", "2.10")).toBeLessThan(0);
    expect(compareQuestionNumber("2.10", "2.2")).toBeGreaterThan(0);
  });

  it("treats equal numbers as equal", () => {
    expect(compareQuestionNumber("3.1", "3.1")).toBe(0);
  });

  it("handles a missing minor as zero", () => {
    expect(compareQuestionNumber("5", "5.1")).toBeLessThan(0);
  });
});

describe("sortByQuestionNumber", () => {
  const rows = [
    { category: "B", question_number: "2.1" },
    { category: "A", question_number: "10.1" },
    { category: "A", question_number: "2.1" },
    { category: "A", question_number: "2.10" },
    { category: "A", question_number: "2.2" },
  ];

  it("sorts by category, then numeric major, then numeric minor (immutably)", () => {
    const sorted = sortByQuestionNumber(rows, {
      category: (r) => r.category,
      number: (r) => r.question_number,
    });
    expect(sorted.map((r) => `${r.category}:${r.question_number}`)).toEqual([
      "A:2.1",
      "A:2.2",
      "A:2.10",
      "A:10.1",
      "B:2.1",
    ]);
    // original array is not mutated
    expect(rows[0].question_number).toBe("2.1");
  });
});
