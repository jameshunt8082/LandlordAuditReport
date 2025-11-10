import { sql } from "@vercel/postgres";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function addConstraints() {
  console.log("\n🔒 Adding world-class database constraints...\n");

  try {
    // 1. Add UNIQUE constraint on (question_template_id, option_text)
    console.log("1️⃣  Adding unique constraint on option_text per question...");
    try {
      await sql`
        ALTER TABLE question_answer_options 
        ADD CONSTRAINT uq_question_option_text 
        UNIQUE (question_template_id, option_text)
      `;
      console.log("   ✓ Constraint uq_question_option_text added");
    } catch (error: any) {
      if (error.message.includes('already exists')) {
        console.log("   ⚠️  Constraint already exists, skipping");
      } else {
        throw error;
      }
    }

    // 2. Add UNIQUE constraint on (question_template_id, option_order)
    console.log("\n2️⃣  Adding unique constraint on option_order per question...");
    try {
      await sql`
        ALTER TABLE question_answer_options 
        ADD CONSTRAINT uq_question_option_order 
        UNIQUE (question_template_id, option_order)
      `;
      console.log("   ✓ Constraint uq_question_option_order added");
    } catch (error: any) {
      if (error.message.includes('already exists')) {
        console.log("   ⚠️  Constraint already exists, skipping");
      } else {
        throw error;
      }
    }

    // 3. Add CHECK constraint for positive option_order
    console.log("\n3️⃣  Adding check constraint for positive option_order...");
    try {
      await sql`
        ALTER TABLE question_answer_options 
        ADD CONSTRAINT chk_option_order_positive 
        CHECK (option_order > 0)
      `;
      console.log("   ✓ Constraint chk_option_order_positive added");
    } catch (error: any) {
      if (error.message.includes('already exists')) {
        console.log("   ⚠️  Constraint already exists, skipping");
      } else {
        throw error;
      }
    }

    // 4. Add composite index for performance
    console.log("\n4️⃣  Adding composite index for optimized queries...");
    await sql`
      CREATE INDEX IF NOT EXISTS idx_question_options_lookup 
      ON question_answer_options(question_template_id, option_order, is_example)
    `;
    console.log("   ✓ Index idx_question_options_lookup created");

    // 5. Add partial index for active questions
    console.log("\n5️⃣  Adding partial index for active questions...");
    await sql`
      CREATE INDEX IF NOT EXISTS idx_questions_active_category 
      ON question_templates(is_active, category) 
      WHERE is_active = TRUE
    `;
    console.log("   ✓ Index idx_questions_active_category created");

    // 6. Add index for score examples
    console.log("\n6️⃣  Adding index for score examples lookup...");
    await sql`
      CREATE INDEX IF NOT EXISTS idx_score_examples_question 
      ON question_score_examples(question_template_id, score_level)
    `;
    console.log("   ✓ Index idx_score_examples_question created");

    // Verify constraints
    console.log("\n✅ Verifying constraints...");
    const constraints = await sql`
      SELECT 
        conname as constraint_name,
        contype as constraint_type
      FROM pg_constraint
      WHERE conrelid = 'question_answer_options'::regclass
        AND conname LIKE 'uq_%' OR conname LIKE 'chk_%'
      ORDER BY conname
    `;

    console.log("\n   Constraints on question_answer_options:");
    console.table(constraints.rows);

    // Verify indexes
    const indexes = await sql`
      SELECT 
        indexname,
        indexdef
      FROM pg_indexes
      WHERE tablename IN ('question_templates', 'question_answer_options', 'question_score_examples')
        AND indexname LIKE 'idx_%'
      ORDER BY tablename, indexname
    `;

    console.log("\n   Indexes created:");
    indexes.rows.forEach(row => {
      console.log(`   ✓ ${row.indexname}`);
    });

    console.log("\n✅ All constraints and indexes added successfully!");
    console.log("\n📋 Database now follows world-class practices:");
    console.log("   • Unique constraints prevent duplicates");
    console.log("   • Check constraints enforce data validity");
    console.log("   • Composite indexes optimize query performance");
    console.log("   • Partial indexes for filtered queries");
    console.log("   • Foreign key CASCADE for referential integrity");

  } catch (error) {
    console.error("\n❌ Failed to add constraints:", error);
    throw error;
  }
}

addConstraints()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));

