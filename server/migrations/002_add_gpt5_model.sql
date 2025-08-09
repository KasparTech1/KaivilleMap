-- Add GPT-5 to allowed models in research_prompts and research_responses tables
-- Migration: 002_add_gpt5_model.sql

-- Update research_prompts table constraint
ALTER TABLE research_prompts 
DROP CONSTRAINT IF EXISTS research_prompts_model_check;

ALTER TABLE research_prompts 
ADD CONSTRAINT research_prompts_model_check 
CHECK (model IN ('claude', 'grok', 'gpt5'));

-- Update research_responses table (if it has similar constraint)
-- Note: This table doesn't seem to have a model constraint in the original schema,
-- but we should ensure it can handle gpt5 model names as well

-- Add index for better query performance on model column
CREATE INDEX IF NOT EXISTS idx_research_prompts_model ON research_prompts(model);
CREATE INDEX IF NOT EXISTS idx_research_responses_model ON research_responses(model);