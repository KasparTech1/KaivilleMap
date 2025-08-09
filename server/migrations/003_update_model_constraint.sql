-- Update model constraint to include gpt4
ALTER TABLE research_prompts 
DROP CONSTRAINT IF EXISTS research_prompts_model_check;

ALTER TABLE research_prompts 
ADD CONSTRAINT research_prompts_model_check 
CHECK (model IN ('claude', 'gpt4', 'grok'));