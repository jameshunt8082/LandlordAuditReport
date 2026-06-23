-- Dynamic Questions System - Database Schema Extension

-- Question templates table
CREATE TABLE IF NOT EXISTS question_templates (
  id SERIAL PRIMARY KEY,
  category VARCHAR(100) NOT NULL,
  sub_category VARCHAR(100) NOT NULL,
  question_number VARCHAR(50) NOT NULL,
  question_text TEXT NOT NULL,
  question_type VARCHAR(20) NOT NULL CHECK (question_type IN ('yes_no', 'multiple_choice')),
  applicable_tiers JSONB NOT NULL DEFAULT '[]',
  weight DECIMAL(3, 1) NOT NULL CHECK (weight >= 0.5 AND weight <= 2.0),
  is_critical BOOLEAN DEFAULT FALSE,
  comment TEXT,
  motivation_learning_point TEXT,
  -- CSV fallback columns removed: red_score_example, orange_score_example, report_action
  -- Now using question_score_examples table with reason_text and report_action per score level
  created_by_auditor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE (category, question_number)
);

-- Question answer options table
CREATE TABLE IF NOT EXISTS question_answer_options (
  id SERIAL PRIMARY KEY,
  question_template_id INTEGER NOT NULL REFERENCES question_templates(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  score_value INTEGER NOT NULL CHECK (score_value >= 1 AND score_value <= 10),
  option_order INTEGER NOT NULL DEFAULT 0,
  is_example BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Question score examples table (for guidance/recommendations)
CREATE TABLE IF NOT EXISTS question_score_examples (
  id SERIAL PRIMARY KEY,
  question_template_id INTEGER NOT NULL REFERENCES question_templates(id) ON DELETE CASCADE,
  score_level VARCHAR(20) NOT NULL CHECK (score_level IN ('low', 'medium', 'high')),
  reason_text TEXT NOT NULL,
  report_action TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (question_template_id, score_level)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_question_templates_category ON question_templates(category);
CREATE INDEX IF NOT EXISTS idx_question_templates_active ON question_templates(is_active);
-- Partial GIN index: the hot read path always filters is_active = TRUE, so inactive
-- rows are excluded to keep the index small. Applied by db/migrate-questions-indexes.ts.
CREATE INDEX IF NOT EXISTS idx_question_templates_tiers_active ON question_templates USING GIN (applicable_tiers) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_question_answer_options_template ON question_answer_options(question_template_id);
CREATE INDEX IF NOT EXISTS idx_question_score_examples_template ON question_score_examples(question_template_id);

