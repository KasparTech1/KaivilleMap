-- Research Prompt Builder Database Schema
-- Run this migration to create all necessary tables

-- 1. Research Templates (configurable template sets)
CREATE TABLE IF NOT EXISTS research_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(50), -- emoji or icon name
    is_active BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Research Segments (business_unit, research_domain, etc.)
CREATE TABLE IF NOT EXISTS research_segments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID REFERENCES research_templates(id) ON DELETE CASCADE,
    segment_key VARCHAR(100) NOT NULL, -- 'business_unit', 'research_domain', etc.
    title VARCHAR(255) NOT NULL,
    icon VARCHAR(50),
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(template_id, segment_key)
);

-- 3. Research Segment Options (the actual button choices)
CREATE TABLE IF NOT EXISTS research_segment_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    segment_id UUID REFERENCES research_segments(id) ON DELETE CASCADE,
    option_key VARCHAR(100) NOT NULL,
    display_text VARCHAR(255) NOT NULL,
    prompt_text TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(segment_id, option_key)
);

-- 4. Research Prompts History (saved interactions)
CREATE TABLE IF NOT EXISTS research_prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID, -- optional user tracking
    template_id UUID REFERENCES research_templates(id),
    model VARCHAR(50) NOT NULL CHECK (model IN ('claude', 'grok')),
    prompt_segments JSONB NOT NULL, -- selected segments
    assembled_prompt TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Research Responses (AI outputs)
CREATE TABLE IF NOT EXISTS research_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prompt_id UUID REFERENCES research_prompts(id) ON DELETE CASCADE,
    model VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    tokens_used INTEGER,
    response_time_ms INTEGER,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Quick Start Configurations
CREATE TABLE IF NOT EXISTS research_quick_starts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID REFERENCES research_templates(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    icon VARCHAR(50),
    config JSONB NOT NULL, -- pre-selected segment options
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_research_prompts_user_id ON research_prompts(user_id);
CREATE INDEX IF NOT EXISTS idx_research_prompts_created_at ON research_prompts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_research_responses_prompt_id ON research_responses(prompt_id);
CREATE INDEX IF NOT EXISTS idx_research_templates_active ON research_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_research_segment_options_segment ON research_segment_options(segment_id, is_active);
CREATE INDEX IF NOT EXISTS idx_research_quick_starts_template ON research_quick_starts(template_id, is_active);

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for updating timestamps
CREATE TRIGGER update_research_templates_updated_at 
    BEFORE UPDATE ON research_templates 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies (if needed)
ALTER TABLE research_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_segment_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_quick_starts ENABLE ROW LEVEL SECURITY;

-- Public read access for templates and options
CREATE POLICY "Public read access for active templates" 
    ON research_templates FOR SELECT 
    USING (is_active = true);

CREATE POLICY "Public read access for segments" 
    ON research_segments FOR SELECT 
    USING (true);

CREATE POLICY "Public read access for active options" 
    ON research_segment_options FOR SELECT 
    USING (is_active = true);

CREATE POLICY "Public read access for quick starts" 
    ON research_quick_starts FOR SELECT 
    USING (is_active = true);

-- Users can read their own prompts and responses
CREATE POLICY "Users can read own prompts" 
    ON research_prompts FOR SELECT 
    USING (true); -- Modify based on auth requirements

CREATE POLICY "Users can read responses" 
    ON research_responses FOR SELECT 
    USING (true); -- Modify based on auth requirements