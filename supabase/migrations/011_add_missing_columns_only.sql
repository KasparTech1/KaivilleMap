-- Migration: Add only the missing columns for Research Generator fields
-- This handles the case where constraints exist but columns are missing
-- Migration: 011_add_missing_columns_only.sql

BEGIN;

-- Add new Research Generator aligned fields (only if they don't exist)
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

-- Create indexes for efficient filtering and searching (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_research_articles_business_unit ON research_articles(business_unit);
CREATE INDEX IF NOT EXISTS idx_research_articles_research_domain ON research_articles(research_domain);  
CREATE INDEX IF NOT EXISTS idx_research_articles_analysis_method ON research_articles(analysis_method);
CREATE INDEX IF NOT EXISTS idx_research_articles_report_type ON research_articles(report_type);
CREATE INDEX IF NOT EXISTS idx_research_articles_ai_model ON research_articles(ai_model);
CREATE INDEX IF NOT EXISTS idx_research_articles_generation_template ON research_articles(generation_template);

-- Create compound indexes for common filtering combinations (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_research_articles_business_domain ON research_articles(business_unit, research_domain);
CREATE INDEX IF NOT EXISTS idx_research_articles_domain_method ON research_articles(research_domain, analysis_method);
CREATE INDEX IF NOT EXISTS idx_research_articles_ai_tokens ON research_articles(ai_model, tokens_used);

COMMIT;