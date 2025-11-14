-- Landlord Audit System Database Schema

-- Users table (auditors)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Audits table
CREATE TABLE IF NOT EXISTS audits (
  id SERIAL PRIMARY KEY,
  auditor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'completed')),
  
  -- Pre-filled client information
  client_name VARCHAR(255) NOT NULL,
  landlord_email VARCHAR(255),
  property_address TEXT NOT NULL,
  risk_audit_tier VARCHAR(10) NOT NULL CHECK (risk_audit_tier IN ('tier_0', 'tier_1', 'tier_2', 'tier_3', 'tier_4')),
  conducted_by VARCHAR(255) NOT NULL,
  
  created_at TIMESTAMP DEFAULT NOW(),
  submitted_at TIMESTAMP
);

-- Form responses table
CREATE TABLE IF NOT EXISTS form_responses (
  id SERIAL PRIMARY KEY,
  audit_id INTEGER NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
  question_id VARCHAR(50) NOT NULL,
  answer_value INTEGER NOT NULL CHECK (answer_value IN (1, 5, 10)),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (audit_id, question_id)
);

-- Scores table
CREATE TABLE IF NOT EXISTS scores (
  id SERIAL PRIMARY KEY,
  audit_id INTEGER NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
  scores_category VARCHAR(100) NOT NULL,
  score DECIMAL(4, 2) NOT NULL CHECK (score >= 1.0 AND score <= 10.0),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (audit_id, scores_category)
);

-- Notes table (auditor comments on specific questions)
CREATE TABLE IF NOT EXISTS notes (
  id SERIAL PRIMARY KEY,
  audit_id INTEGER NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
  auditor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question_id VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_audits_created_at ON audits(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_form_responses_question_id ON form_responses(question_id);
CREATE INDEX IF NOT EXISTS idx_scores_category ON scores(scores_category);
CREATE INDEX IF NOT EXISTS idx_notes_question_id ON notes(question_id);
CREATE INDEX IF NOT EXISTS idx_notes_audit_question ON notes(audit_id, question_id);

