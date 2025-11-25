-- Add comment column to question_templates table
-- This field is used by clients to make comments when answering the questionnaire

ALTER TABLE question_templates 
ADD COLUMN IF NOT EXISTS comment TEXT;

-- Add comment to existing queries for completeness
COMMENT ON COLUMN question_templates.comment IS 'Client-facing comment field shown when answering questions. Provides helpful guidance for the client.';


