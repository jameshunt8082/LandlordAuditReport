import { sql } from "@vercel/postgres";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

dotenv.config({ path: ".env.local" });

async function deepCleanAndReport() {
  console.log("\n🧹 Starting DEEP database cleanup and analysis...\n");

  const report: string[] = [];
  report.push("# Database State Report\n");
  report.push(`Generated: ${new Date().toISOString()}\n`);
  report.push("---\n\n");

  try {
    // 1. BEFORE STATE
    report.push("## Before Cleanup\n\n");
    
    const beforeCount = await sql`SELECT COUNT(*) as count FROM question_answer_options`;
    report.push(`**Total answer options**: ${beforeCount.rows[0].count}\n\n`);
    
    const duplicatesBefore = await sql`
      SELECT 
        question_template_id,
        option_text,
        score_value,
        COUNT(*) as count
      FROM question_answer_options
      GROUP BY question_template_id, option_text, score_value
      HAVING COUNT(*) > 1
      ORDER BY count DESC
    `;
    
    report.push(`**Duplicate entries**: ${duplicatesBefore.rows.length}\n\n`);
    console.log(`📊 Found ${duplicatesBefore.rows.length} duplicate entries`);

    // 2. AGGRESSIVE CLEANUP
    console.log("\n🗑️  Phase 1: Removing ALL duplicates...");
    report.push("## Cleanup Process\n\n");

    // Delete duplicates keeping ONLY the row with MIN(id)
    const deleteResult = await sql`
      DELETE FROM question_answer_options
      WHERE id NOT IN (
        SELECT MIN(id)
        FROM question_answer_options
        GROUP BY question_template_id, option_text, score_value, is_example
      )
    `;
    
    const deletedCount = deleteResult.rowCount || 0;
    console.log(`   ✓ Deleted ${deletedCount} duplicate rows`);
    report.push(`**Rows deleted**: ${deletedCount}\n\n`);

    // 3. FIX option_order gaps and ensure 1-indexed
    console.log("\n🔢 Phase 2: Resequencing option_order...");
    await sql`
      WITH ranked AS (
        SELECT 
          id,
          ROW_NUMBER() OVER (
            PARTITION BY question_template_id 
            ORDER BY option_order, score_value DESC, id
          ) as new_order
        FROM question_answer_options
      )
      UPDATE question_answer_options qao
      SET option_order = ranked.new_order
      FROM ranked
      WHERE qao.id = ranked.id
        AND qao.option_order != ranked.new_order
    `;
    console.log("   ✓ Option orders resequenced");

    // 4. AFTER STATE
    const afterCount = await sql`SELECT COUNT(*) as count FROM question_answer_options`;
    console.log(`\n📊 Total options after cleanup: ${afterCount.rows[0].count}`);
    report.push(`**Total after cleanup**: ${afterCount.rows[0].count}\n\n`);

    // 5. VERIFY NO DUPLICATES
    const duplicatesAfter = await sql`
      SELECT 
        qt.question_number,
        qao.option_text,
        COUNT(*) as count
      FROM question_answer_options qao
      JOIN question_templates qt ON qao.question_template_id = qt.id
      GROUP BY qt.question_number, qao.option_text
      HAVING COUNT(*) > 1
    `;

    if (duplicatesAfter.rows.length === 0) {
      console.log("✅ Zero duplicates remaining");
      report.push("**Duplicates remaining**: 0 ✅\n\n");
    } else {
      console.log(`⚠️  WARNING: ${duplicatesAfter.rows.length} duplicates still exist!`);
      report.push(`**Duplicates remaining**: ${duplicatesAfter.rows.length} ⚠️\n\n`);
      report.push("```\n");
      duplicatesAfter.rows.forEach(row => {
        report.push(`Q${row.question_number}: ${row.option_text} (${row.count}x)\n`);
      });
      report.push("```\n\n");
    }

    // 6. COMPLETE DB STATE
    report.push("## Complete Database State\n\n");

    // Question templates
    const templates = await sql`
      SELECT 
        id,
        category,
        sub_category,
        question_number,
        question_text,
        question_type,
        weight,
        is_critical,
        is_active,
        applicable_tiers
      FROM question_templates
      ORDER BY question_number
    `;

    report.push(`### Question Templates\n\n`);
    report.push(`**Total questions**: ${templates.rows.length}\n\n`);
    report.push("| ID | Q# | Category | Sub-Category | Type | Weight | Critical | Active |\n");
    report.push("|----|----|----------|--------------|------|--------|----------|--------|\n");
    
    templates.rows.forEach((q: any) => {
      const tiers = typeof q.applicable_tiers === 'string' 
        ? q.applicable_tiers.replace(/[{}]/g, '')
        : JSON.stringify(q.applicable_tiers);
      report.push(`| ${q.id} | ${q.question_number} | ${q.category.substring(0, 15)}... | ${q.sub_category.substring(0, 20)}... | ${q.question_type} | ${q.weight} | ${q.is_critical ? '✓' : ''} | ${q.is_active ? '✓' : ''} |\n`);
    });
    report.push("\n");

    // Answer options per question
    report.push("### Answer Options Distribution\n\n");
    
    const optionsPerQuestion = await sql`
      SELECT 
        qt.question_number,
        qt.question_text,
        COUNT(qao.id) as option_count,
        json_agg(
          json_build_object(
            'text', qao.option_text,
            'score', qao.score_value,
            'order', qao.option_order
          ) ORDER BY qao.option_order
        ) as options
      FROM question_templates qt
      LEFT JOIN question_answer_options qao ON qt.id = qao.question_template_id
      GROUP BY qt.id, qt.question_number, qt.question_text
      ORDER BY qt.question_number
    `;

    report.push("| Question | Options | Details |\n");
    report.push("|----------|---------|----------|\n");
    
    for (const row of optionsPerQuestion.rows) {
      const opts = row.options as any[];
      const optTexts = opts.map((o: any) => `${o.order}. ${o.text.substring(0, 30)}... (${o.score})`).join('<br>');
      report.push(`| Q${row.question_number} | ${row.option_count} | ${optTexts} |\n`);
    }
    report.push("\n");

    // Score examples
    const scoreExamples = await sql`
      SELECT COUNT(*) as count FROM question_score_examples
    `;
    report.push(`### Score Examples\n\n`);
    report.push(`**Total score examples**: ${scoreExamples.rows[0].count}\n\n`);

    // Constraints
    report.push("### Database Constraints\n\n");
    const constraints = await sql`
      SELECT 
        conname as name,
        CASE contype
          WHEN 'u' THEN 'UNIQUE'
          WHEN 'c' THEN 'CHECK'
          WHEN 'f' THEN 'FOREIGN KEY'
          WHEN 'p' THEN 'PRIMARY KEY'
        END as type
      FROM pg_constraint
      WHERE conrelid IN (
        'question_templates'::regclass,
        'question_answer_options'::regclass,
        'question_score_examples'::regclass
      )
      AND contype IN ('u', 'c', 'f', 'p')
      ORDER BY conrelid, contype, conname
    `;

    report.push("| Constraint | Type |\n");
    report.push("|------------|------|\n");
    constraints.rows.forEach((c: any) => {
      report.push(`| ${c.name} | ${c.type} |\n`);
    });
    report.push("\n");

    // Indexes
    report.push("### Database Indexes\n\n");
    const indexes = await sql`
      SELECT 
        schemaname,
        tablename,
        indexname,
        indexdef
      FROM pg_indexes
      WHERE tablename IN ('question_templates', 'question_answer_options', 'question_score_examples')
      AND indexname NOT LIKE '%pkey'
      ORDER BY tablename, indexname
    `;

    report.push("| Table | Index | Definition |\n");
    report.push("|-------|-------|------------|\n");
    indexes.rows.forEach((idx: any) => {
      report.push(`| ${idx.tablename} | ${idx.indexname} | ${idx.indexdef.substring(0, 60)}... |\n`);
    });
    report.push("\n");

    // Summary stats
    report.push("## Summary\n\n");
    
    const stats = await sql`
      SELECT 
        (SELECT COUNT(*) FROM question_templates WHERE is_active = TRUE) as active_questions,
        (SELECT COUNT(*) FROM question_templates WHERE is_critical = TRUE) as critical_questions,
        (SELECT COUNT(*) FROM question_answer_options) as total_options,
        (SELECT COUNT(*) FROM question_score_examples) as total_examples,
        (SELECT COUNT(DISTINCT category) FROM question_templates) as categories
    `;

    const s = stats.rows[0];
    report.push(`- **Active Questions**: ${s.active_questions}\n`);
    report.push(`- **Critical Questions**: ${s.critical_questions}\n`);
    report.push(`- **Total Answer Options**: ${s.total_options}\n`);
    report.push(`- **Score Examples**: ${s.total_examples}\n`);
    report.push(`- **Categories**: ${s.categories}\n\n`);

    report.push("## Data Quality Checks\n\n");
    
    // Check for orphaned options
    const orphaned = await sql`
      SELECT COUNT(*) as count
      FROM question_answer_options qao
      LEFT JOIN question_templates qt ON qao.question_template_id = qt.id
      WHERE qt.id IS NULL
    `;
    
    report.push(`- **Orphaned options**: ${orphaned.rows[0].count} ${orphaned.rows[0].count === '0' ? '✅' : '⚠️'}\n`);
    
    // Check for questions without options
    const noOptions = await sql`
      SELECT 
        qt.question_number,
        qt.question_text
      FROM question_templates qt
      LEFT JOIN question_answer_options qao ON qt.id = qao.question_template_id
      WHERE qt.is_active = TRUE
      GROUP BY qt.id, qt.question_number, qt.question_text
      HAVING COUNT(qao.id) = 0
    `;
    
    report.push(`- **Active questions without options**: ${noOptions.rows.length} ${noOptions.rows.length === 0 ? '✅' : '⚠️'}\n`);
    
    if (noOptions.rows.length > 0) {
      report.push("\n  **Questions needing options:**\n");
      noOptions.rows.forEach((q: any) => {
        report.push(`  - Q${q.question_number}: ${q.question_text}\n`);
      });
    }
    report.push("\n");

    // Save report
    const docsDir = path.join(process.cwd(), "docs");
    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir, { recursive: true });
    }
    
    const reportPath = path.join(docsDir, "database-state.md");
    fs.writeFileSync(reportPath, report.join(""), "utf-8");
    
    console.log(`\n✅ Report saved to: ${reportPath}`);
    console.log("\n✨ Database cleanup completed!");

  } catch (error) {
    console.error("\n❌ Cleanup failed:", error);
    throw error;
  }
}

deepCleanAndReport()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));

