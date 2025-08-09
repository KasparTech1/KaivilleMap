-- Migration: Align research_articles schema with Research Generator tool
-- This adds fields that match exactly with the Research Prompt Builder parameters
-- Migration: 010_align_research_generator_fields.sql

BEGIN;

-- Add new Research Generator aligned fields
ALTER TABLE research_articles 
ADD COLUMN IF NOT EXISTS business_unit TEXT,
ADD COLUMN IF NOT EXISTS research_domain TEXT, 
ADD COLUMN IF NOT EXISTS analysis_method TEXT,
ADD COLUMN IF NOT EXISTS report_type TEXT,
ADD COLUMN IF NOT EXISTS ai_model TEXT,
ADD COLUMN IF NOT EXISTS generation_template TEXT,
ADD COLUMN IF NOT EXISTS prompt_segments JSONB,
ADD COLUMN IF NOT EXISTS tokens_used INTEGER,
ADD COLUMN IF NOT EXISTS generation_time_ms INTEGER;

-- Create check constraints for the new enum-like fields
ALTER TABLE research_articles 
ADD CONSTRAINT research_articles_business_unit_check 
CHECK (business_unit IS NULL OR business_unit IN ('bedrock', 'circle_y', 'horizon', 'wire_works', 'precious_metals'));

ALTER TABLE research_articles 
ADD CONSTRAINT research_articles_research_domain_check 
CHECK (research_domain IS NULL OR research_domain IN ('manufacturing', 'quality', 'supply_chain', 'market', 'innovation'));

ALTER TABLE research_articles 
ADD CONSTRAINT research_articles_analysis_method_check 
CHECK (analysis_method IS NULL OR analysis_method IN ('predictive', 'process_mining', 'ai_automation', 'benchmarking', 'roi_analysis'));

ALTER TABLE research_articles 
ADD CONSTRAINT research_articles_report_type_check 
CHECK (report_type IS NULL OR report_type IN ('executive', 'technical', 'implementation', 'case_study'));

ALTER TABLE research_articles 
ADD CONSTRAINT research_articles_ai_model_check 
CHECK (ai_model IS NULL OR ai_model IN ('gpt5', 'claude', 'grok'));

-- Create indexes for efficient filtering and searching
CREATE INDEX IF NOT EXISTS idx_research_articles_business_unit ON research_articles(business_unit);
CREATE INDEX IF NOT EXISTS idx_research_articles_research_domain ON research_articles(research_domain);  
CREATE INDEX IF NOT EXISTS idx_research_articles_analysis_method ON research_articles(analysis_method);
CREATE INDEX IF NOT EXISTS idx_research_articles_report_type ON research_articles(report_type);
CREATE INDEX IF NOT EXISTS idx_research_articles_ai_model ON research_articles(ai_model);
CREATE INDEX IF NOT EXISTS idx_research_articles_generation_template ON research_articles(generation_template);

-- Create compound indexes for common filtering combinations
CREATE INDEX IF NOT EXISTS idx_research_articles_business_domain ON research_articles(business_unit, research_domain);
CREATE INDEX IF NOT EXISTS idx_research_articles_domain_method ON research_articles(research_domain, analysis_method);
CREATE INDEX IF NOT EXISTS idx_research_articles_ai_tokens ON research_articles(ai_model, tokens_used);

-- Add comments for documentation
COMMENT ON COLUMN research_articles.business_unit IS 'Business unit/subsidiary: bedrock, circle_y, horizon, wire_works, precious_metals';
COMMENT ON COLUMN research_articles.research_domain IS 'Research domain: manufacturing, quality, supply_chain, market, innovation';
COMMENT ON COLUMN research_articles.analysis_method IS 'Analysis approach: predictive, process_mining, ai_automation, benchmarking, roi_analysis';
COMMENT ON COLUMN research_articles.report_type IS 'Report format: executive, technical, implementation, case_study';
COMMENT ON COLUMN research_articles.ai_model IS 'AI model used: gpt5, claude, grok';
COMMENT ON COLUMN research_articles.generation_template IS 'Template name used for generation';
COMMENT ON COLUMN research_articles.prompt_segments IS 'Complete prompt configuration as JSON';
COMMENT ON COLUMN research_articles.tokens_used IS 'Total tokens consumed during generation';
COMMENT ON COLUMN research_articles.generation_time_ms IS 'Time taken for generation in milliseconds';

COMMIT;