/**
 * Ordering helpers for question numbers.
 *
 * Question numbers are stored as VARCHAR (e.g. "2.1", "10.1"), so ordering them
 * with a plain string/SQL `ORDER BY question_number` is lexicographic — "10.1"
 * sorts before "2.1", and "2.10" before "2.2". These helpers compare the major
 * and minor parts numerically so the form and the report present questions in
 * the intended order regardless of how many questions a category accumulates.
 */

function parts(questionNumber: string): [number, number] {
  const [major, minor] = questionNumber.split(".");
  return [parseInt(major, 10) || 0, parseInt(minor ?? "0", 10) || 0];
}

/**
 * Compare two question numbers numerically (major, then minor).
 * Returns a negative number if `a` comes first, positive if `b` comes first, 0 if equal.
 */
export function compareQuestionNumber(a: string, b: string): number {
  const [aMajor, aMinor] = parts(a);
  const [bMajor, bMinor] = parts(b);
  return aMajor - bMajor || aMinor - bMinor;
}

interface SortAccessors<T> {
  category: (item: T) => string;
  number: (item: T) => string;
}

/**
 * Return a new array sorted by category (alphabetical), then question number
 * (numeric major/minor). Does not mutate the input.
 */
export function sortByQuestionNumber<T>(items: readonly T[], accessors: SortAccessors<T>): T[] {
  return [...items].sort((a, b) => {
    const byCategory = accessors.category(a).localeCompare(accessors.category(b));
    if (byCategory !== 0) return byCategory;
    return compareQuestionNumber(accessors.number(a), accessors.number(b));
  });
}
