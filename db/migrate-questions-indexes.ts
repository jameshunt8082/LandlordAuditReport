import { config } from "dotenv";
import { sql } from "@vercel/postgres";

// Load environment variables from .env.local
config({ path: ".env.local" });

/**
 * Polishing migration for the question_templates table (idempotent):
 *  1. Replace the plain GIN index on applicable_tiers with a partial index that only
 *     covers active rows — the hot read path always filters is_active = TRUE, so
 *     inactive rows should not bloat the index.
 *  2. Add a BEFORE UPDATE trigger that maintains updated_at automatically, so the
 *     timestamp stays correct even for code paths that forget to set it.
 *
 * Statements are executed individually (not split on ";") because the trigger function
 * body is dollar-quoted and contains semicolons.
 */
const statements: string[] = [
  `DROP INDEX IF EXISTS idx_question_templates_tiers`,
  `CREATE INDEX IF NOT EXISTS idx_question_templates_tiers_active
     ON question_templates USING GIN (applicable_tiers)
     WHERE is_active = TRUE`,
  `CREATE OR REPLACE FUNCTION set_updated_at()
     RETURNS TRIGGER LANGUAGE plpgsql AS $$
     BEGIN
       NEW.updated_at = NOW();
       RETURN NEW;
     END;
     $$`,
  `DROP TRIGGER IF EXISTS trg_question_templates_updated_at ON question_templates`,
  `CREATE TRIGGER trg_question_templates_updated_at
     BEFORE UPDATE ON question_templates
     FOR EACH ROW EXECUTE FUNCTION set_updated_at()`,
];

async function run() {
  try {
    console.log("Starting question_templates index/trigger migration...\n");
    for (let i = 0; i < statements.length; i++) {
      const preview = statements[i].substring(0, 60).replace(/\s+/g, " ");
      console.log(`[${i + 1}/${statements.length}] ${preview}...`);
      await sql.query(statements[i]);
      console.log("  ✓ Success\n");
    }
    console.log("✓ Index/trigger migration completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("\n✗ Migration failed:", error);
    process.exit(1);
  }
}

run();
