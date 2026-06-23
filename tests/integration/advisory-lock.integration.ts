/**
 * Integration proof for the question_number race fix (defect #4).
 *
 * The POST handler serializes concurrent inserts for the same (category, sub_category)
 * with `pg_advisory_xact_lock(hashtext(questionNumberLockArg(...)))`. This test proves the
 * serialization guarantee against the real database, using only advisory locks inside
 * transactions that are rolled back — no rows are written, so production data is untouched.
 */
import { newClient, assert } from "./_db";
import { questionNumberLockArg } from "../../lib/question-number";

export async function run(): Promise<void> {
  const arg = questionNumberLockArg("__test_cat__", "__test_sub__");
  const otherArg = questionNumberLockArg("__test_cat__", "__other_sub__");

  const a = await newClient();
  const b = await newClient();
  try {
    await a.query("BEGIN");
    await a.query("SELECT pg_advisory_xact_lock(hashtext($1))", [arg]);

    await b.query("BEGIN");
    const blocked = await b.query(
      "SELECT pg_try_advisory_xact_lock(hashtext($1)) AS got",
      [arg]
    );
    assert(
      blocked.rows[0].got === false,
      "a second session cannot acquire the same sub-category lock while it is held"
    );

    const otherFree = await b.query(
      "SELECT pg_try_advisory_xact_lock(hashtext($1)) AS got",
      [otherArg]
    );
    assert(
      otherFree.rows[0].got === true,
      "a second session CAN lock a different sub-category (lock is keyed, not global)"
    );

    await a.query("ROLLBACK"); // releases A's transaction-scoped lock

    const afterRelease = await b.query(
      "SELECT pg_try_advisory_xact_lock(hashtext($1)) AS got",
      [arg]
    );
    assert(
      afterRelease.rows[0].got === true,
      "the lock becomes available once the holder's transaction ends"
    );

    await b.query("ROLLBACK");
  } finally {
    await a.end();
    await b.end();
  }
  console.log("advisory-lock integration: PASS");
}
