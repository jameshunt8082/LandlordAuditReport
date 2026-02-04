-- Migration: Add failed_payments table for webhook failure recovery
-- This allows tracking and manual recovery of payments that failed to create audits

CREATE TABLE IF NOT EXISTS failed_payments (
  id SERIAL PRIMARY KEY,
  payment_intent_id VARCHAR(255) UNIQUE NOT NULL,
  customer_name VARCHAR(255),
  customer_email VARCHAR(255),
  property_address TEXT,
  service_type VARCHAR(50),
  payment_amount INTEGER,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  recovered BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  last_retry_at TIMESTAMP
);

-- Index for quick lookup of unrecovered payments
CREATE INDEX IF NOT EXISTS idx_failed_payments_unrecovered 
  ON failed_payments(recovered) WHERE recovered = FALSE;
