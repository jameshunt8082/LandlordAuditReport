import { config } from "dotenv";
import { sql } from "@vercel/postgres";
import { questions, CATEGORIES } from "../lib/questions";

// Load environment variables
config({ path: ".env.local" });

async function seedQuestions() {
  try {
    console.log("Starting questions seed...\n");
    console.log(`Seeding ${questions.length} questions from lib/questions.ts\n`);

    let seededCount = 0;
    let skippedCount = 0;

    for (const question of questions) {
      try {
        // Insert question template
        const templateResult = await sql`
          INSERT INTO question_templates (
            category,
            sub_category,
            question_number,
            question_text,
            question_type,
            applicable_tiers,
            weight,
            is_critical,
            motivation_learning_point,
            created_by_auditor_id,
            is_active
          ) VALUES (
            ${question.category},
            ${question.section},
            ${question.id},
            ${question.text},
            'multiple_choice',
            ${JSON.stringify(question.tiers)},
            ${question.weight},
            ${question.critical},
            'System question - original audit template',
            NULL,
            TRUE
          )
          ON CONFLICT (category, question_number) 
          DO UPDATE SET updated_at = NOW()
          RETURNING id
        `;

        const templateId = templateResult.rows[0].id;

        // Insert answer options (idempotent with unique constraint)
        for (let i = 0; i < question.options.length; i++) {
          const option = question.options[i];
          await sql`
            INSERT INTO question_answer_options (
              question_template_id,
              option_text,
              score_value,
              option_order,
              is_example
            ) VALUES (
              ${templateId},
              ${option.label},
              ${option.value},
              ${i + 1},
              FALSE
            )
            ON CONFLICT (question_template_id, option_text) 
            DO UPDATE SET 
              score_value = EXCLUDED.score_value,
              option_order = EXCLUDED.option_order,
              updated_at = NOW()
          `;
        }

        // Insert score examples (generate based on options)
        const lowOption = question.options.find(o => o.value === 1);
        const mediumOption = question.options.find(o => o.value === 5);
        const highOption = question.options.find(o => o.value === 10);

        if (lowOption) {
          await sql`
            INSERT INTO question_score_examples (
              question_template_id,
              score_level,
              reason_text,
              report_action
            ) VALUES (
              ${templateId},
              'low',
              ${lowOption.label},
              ${question.critical ? 'URGENT: Address this critical compliance issue immediately' : 'Improvement recommended'}
            )
            ON CONFLICT (question_template_id, score_level) 
            DO NOTHING
          `;
        }

        if (mediumOption) {
          await sql`
            INSERT INTO question_score_examples (
              question_template_id,
              score_level,
              reason_text,
              report_action
            ) VALUES (
              ${templateId},
              'medium',
              ${mediumOption.label},
              'Consider improvements to enhance compliance'
            )
            ON CONFLICT (question_template_id, score_level) 
            DO NOTHING
          `;
        }

        if (highOption) {
          await sql`
            INSERT INTO question_score_examples (
              question_template_id,
              score_level,
              reason_text,
              report_action
            ) VALUES (
              ${templateId},
              'high',
              ${highOption.label},
              'Excellent - maintain current practices'
            )
            ON CONFLICT (question_template_id, score_level) 
            DO NOTHING
          `;
        }

        console.log(`✓ Seeded Q${question.id}: ${question.text.substring(0, 50)}...`);
        seededCount++;
      } catch (error: any) {
        console.log(`✗ Failed Q${question.id}:`, error.message);
        skippedCount++;
      }
    }

    console.log(`\n✓ Seed completed!`);
    console.log(`  Seeded: ${seededCount}`);
    console.log(`  Skipped: ${skippedCount}`);
    process.exit(0);
  } catch (error) {
    console.error("\n✗ Seed failed:", error);
    process.exit(1);
  }
}

seedQuestions();

