import { sql } from "@vercel/postgres";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function cleanupDuplicates() {
  console.log("\n🧹 Starting cleanup of duplicate answer options...\n");

  try {
    // Count before cleanup
    const beforeCount = await sql`SELECT COUNT(*) as count FROM question_answer_options`;
    console.log(`📊 Total answer options before cleanup: ${beforeCount.rows[0].count}`);

    // Remove duplicates - keep only the first occurrence (lowest ID)
    console.log("\n🗑️  Removing duplicate answer options...");
    const deleteResult = await sql`
      DELETE FROM question_answer_options
      WHERE id NOT IN (
        SELECT MIN(id)
        FROM question_answer_options
        GROUP BY question_template_id, option_text, score_value
      )
    `;

    console.log(`✓ Deleted ${deleteResult.rowCount} duplicate rows`);

    // Reorder option_order to be sequential (1, 2, 3...)
    console.log("\n🔢 Reordering option_order to be sequential...");
    await sql`
      UPDATE question_answer_options
      SET option_order = subquery.new_order
      FROM (
        SELECT 
          id, 
          ROW_NUMBER() OVER (
            PARTITION BY question_template_id 
            ORDER BY option_order, id
          ) as new_order
        FROM question_answer_options
      ) as subquery
      WHERE question_answer_options.id = subquery.id
    `;

    console.log("✓ Option order resequenced");

    // Count after cleanup
    const afterCount = await sql`SELECT COUNT(*) as count FROM question_answer_options`;
    console.log(`\n📊 Total answer options after cleanup: ${afterCount.rows[0].count}`);

    // Verify no duplicates remain
    const remainingDuplicates = await sql`
      SELECT 
        question_template_id,
        option_text,
        COUNT(*) as count
      FROM question_answer_options
      GROUP BY question_template_id, option_text
      HAVING COUNT(*) > 1
    `;

    if (remainingDuplicates.rows.length === 0) {
      console.log("✓ No duplicates remaining");
    } else {
      console.log("⚠️  Warning: Some duplicates still exist:");
      console.table(remainingDuplicates.rows);
    }

    // Show stats per question
    const stats = await sql`
      SELECT 
        qt.question_number,
        COUNT(qao.*) as option_count
      FROM question_templates qt
      LEFT JOIN question_answer_options qao ON qt.id = qao.question_template_id
      GROUP BY qt.id, qt.question_number
      ORDER BY qt.question_number
    `;

    console.log("\n📊 Options per question after cleanup:");
    console.table(stats.rows);

    console.log("\n✅ Cleanup completed successfully!");
  } catch (error) {
    console.error("\n❌ Cleanup failed:", error);
    throw error;
  }
}

cleanupDuplicates()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));

