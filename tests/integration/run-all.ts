/**
 * Runs the tsx/Neon integration tests (DB-level behavior that vitest unit tests can't cover).
 * These connect to the real database but only use advisory locks / rolled-back transactions,
 * so they do not mutate data. Run with: npm run test:integration
 */
import { loadEnv } from "./_db";
import { run as advisoryLock } from "./advisory-lock.integration";

const tests: ReadonlyArray<readonly [string, () => Promise<void>]> = [
  ["advisory-lock", advisoryLock],
];

async function main(): Promise<void> {
  loadEnv();
  let failed = 0;
  for (const [name, fn] of tests) {
    try {
      console.log(`\n▶ ${name}`);
      await fn();
    } catch (error) {
      failed++;
      console.error(`✗ ${name} FAILED:`, (error as Error).message);
    }
  }
  console.log(`\n${failed === 0 ? "✅ all integration tests passed" : `❌ ${failed} failed`}`);
  process.exit(failed === 0 ? 0 : 1);
}

main();
