import { describe, it, expect } from "vitest";
import { questionNumberLockArg, nextMinorNumber } from "@/lib/question-number";

describe("nextMinorNumber", () => {
  it("increments the minor part of the numeric max", () => {
    expect(nextMinorNumber(["3.1", "3.2", "3.3"])).toBe("3.4");
  });

  it("picks the numeric (not lexicographic) max — the bug that produced duplicates", () => {
    // Lexicographic max of these is "2.9", which would regenerate the existing "2.10".
    expect(nextMinorNumber(["2.1", "2.9", "2.10"])).toBe("2.11");
  });

  it("handles a single existing number", () => {
    expect(nextMinorNumber(["5.1"])).toBe("5.2");
  });
});

describe("questionNumberLockArg", () => {
  it("is deterministic for the same category/sub-category", () => {
    expect(questionNumberLockArg("Documentation", "Tenancy")).toBe(
      questionNumberLockArg("Documentation", "Tenancy")
    );
  });

  it("differs across distinct category/sub-category pairs", () => {
    const a = questionNumberLockArg("Documentation", "Tenancy");
    const b = questionNumberLockArg("Documentation", "Deposits");
    const c = questionNumberLockArg("Evidence", "Tenancy");
    expect(new Set([a, b, c]).size).toBe(3);
  });

  it("does not collide when the separator appears in a field", () => {
    // "A|B" + "C" must not equal "A" + "B|C"
    expect(questionNumberLockArg("A|B", "C")).not.toBe(questionNumberLockArg("A", "B|C"));
  });
});
