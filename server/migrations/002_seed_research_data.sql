-- Seed Data for Research Prompt Builder
-- This creates the default Kaspar Companies template and additional industry templates

-- Insert default Kaspar Companies template
INSERT INTO research_templates (name, description, icon, is_active, is_default, display_order)
VALUES 
    ('Kaspar Companies', 'Research prompts for Kaspar subsidiaries and operations', '🏭', true, true, 1),
    ('Manufacturing Excellence', 'Focused on lean manufacturing and production optimization', '⚙️', true, false, 2),
    ('Market Intelligence', 'Market analysis and competitive positioning research', '📊', true, false, 3),
    ('Innovation & R&D', 'Product development and innovation strategies', '💡', true, false, 4);

-- Get the Kaspar Companies template ID
WITH kaspar_template AS (
    SELECT id FROM research_templates WHERE name = 'Kaspar Companies' LIMIT 1
)

-- Insert segments for Kaspar Companies template
INSERT INTO research_segments (template_id, segment_key, title, icon, display_order)
SELECT 
    kt.id,
    segment.key,
    segment.title,
    segment.icon,
    segment.order
FROM kaspar_template kt,
(VALUES 
    ('business_unit', 'Select Business Unit', 'Building2', 1),
    ('research_domain', 'Research Domain', 'Microscope', 2),
    ('analysis_method', 'Analysis Approach', 'LineChart', 3),
    ('output_format', 'Report Type', 'FileText', 4)
) AS segment(key, title, icon, order);

-- Insert segment options for business_unit
WITH business_segment AS (
    SELECT s.id 
    FROM research_segments s 
    JOIN research_templates t ON s.template_id = t.id 
    WHERE t.name = 'Kaspar Companies' AND s.segment_key = 'business_unit'
)
INSERT INTO research_segment_options (segment_id, option_key, display_text, prompt_text, is_active, display_order)
SELECT 
    bs.id,
    opt.key,
    opt.display,
    opt.prompt,
    true,
    opt.order
FROM business_segment bs,
(VALUES 
    ('bedrock', 'Bedrock Truck Beds', 'truck bed manufacturing and accessories', 1),
    ('circle_y', 'Circle Y Saddles', 'western saddle and leather goods manufacturing', 2),
    ('horizon', 'Horizon Firearms', 'custom firearms and precision rifle manufacturing', 3),
    ('wire_works', 'Wire Works', 'wire products and metal fabrication', 4),
    ('precious_metals', 'TX Precious Metals', 'precious metals trading and investment', 5),
    ('shiner', 'Shiner Manufacturing', 'industrial manufacturing and fabrication', 6),
    ('corporate', 'Kaspar Corporate', 'corporate strategy and multi-subsidiary operations', 7)
) AS opt(key, display, prompt, order);

-- Insert segment options for research_domain
WITH domain_segment AS (
    SELECT s.id 
    FROM research_segments s 
    JOIN research_templates t ON s.template_id = t.id 
    WHERE t.name = 'Kaspar Companies' AND s.segment_key = 'research_domain'
)
INSERT INTO research_segment_options (segment_id, option_key, display_text, prompt_text, is_active, display_order)
SELECT 
    ds.id,
    opt.key,
    opt.display,
    opt.prompt,
    true,
    opt.order
FROM domain_segment ds,
(VALUES 
    ('manufacturing', 'Manufacturing Optimization', 'lean manufacturing processes and production efficiency', 1),
    ('quality', 'Quality & Automation', 'quality control systems and automated inspection', 2),
    ('supply_chain', 'Supply Chain', 'supply chain optimization and inventory management', 3),
    ('market', 'Market Analysis', 'market trends and competitive positioning', 4),
    ('innovation', 'Product Innovation', 'new product development and R&D strategies', 5),
    ('workforce', 'Workforce Development', 'employee training and skill development', 6),
    ('sustainability', 'Sustainability', 'environmental impact and sustainable practices', 7),
    ('technology', 'Technology Integration', 'AI, IoT, and digital transformation', 8)
) AS opt(key, display, prompt, order);

-- Insert segment options for analysis_method
WITH method_segment AS (
    SELECT s.id 
    FROM research_segments s 
    JOIN research_templates t ON s.template_id = t.id 
    WHERE t.name = 'Kaspar Companies' AND s.segment_key = 'analysis_method'
)
INSERT INTO research_segment_options (segment_id, option_key, display_text, prompt_text, is_active, display_order)
SELECT 
    ms.id,
    opt.key,
    opt.display,
    opt.prompt,
    true,
    opt.order
FROM method_segment ms,
(VALUES 
    ('predictive', 'Predictive Analytics', 'using predictive models to forecast', 1),
    ('process_mining', 'Process Mining', 'analyzing workflow data to identify improvements in', 2),
    ('ai_automation', 'AI Automation', 'implementing AI-driven automation for', 3),
    ('benchmarking', 'Industry Benchmarking', 'comparing performance metrics against industry standards for', 4),
    ('roi_analysis', 'ROI Analysis', 'calculating return on investment and cost-benefit analysis for', 5),
    ('swot', 'SWOT Analysis', 'conducting strategic SWOT analysis for', 6),
    ('risk_assessment', 'Risk Assessment', 'identifying and mitigating risks in', 7),
    ('competitive', 'Competitive Analysis', 'analyzing competitive landscape and positioning for', 8)
) AS opt(key, display, prompt, order);

-- Insert segment options for output_format
WITH format_segment AS (
    SELECT s.id 
    FROM research_segments s 
    JOIN research_templates t ON s.template_id = t.id 
    WHERE t.name = 'Kaspar Companies' AND s.segment_key = 'output_format'
)
INSERT INTO research_segment_options (segment_id, option_key, display_text, prompt_text, is_active, display_order)
SELECT 
    fs.id,
    opt.key,
    opt.display,
    opt.prompt,
    true,
    opt.order
FROM format_segment fs,
(VALUES 
    ('executive', 'Executive Brief', 'Create a concise executive summary with key insights and recommendations', 1),
    ('technical', 'Technical Report', 'Develop a detailed technical analysis with data visualizations', 2),
    ('implementation', 'Implementation Plan', 'Design a step-by-step implementation roadmap with timelines', 3),
    ('case_study', 'Case Study', 'Present findings as a comprehensive case study with real-world applications', 4),
    ('presentation', 'Board Presentation', 'Prepare a board-ready presentation with strategic recommendations', 5),
    ('whitepaper', 'White Paper', 'Author a detailed white paper with research citations', 6),
    ('action_plan', 'Action Plan', 'Create an actionable plan with specific tasks and deadlines', 7)
) AS opt(key, display, prompt, order);

-- Insert Quick Start configurations for Kaspar template
WITH kaspar_template AS (
    SELECT id FROM research_templates WHERE name = 'Kaspar Companies' LIMIT 1
)
INSERT INTO research_quick_starts (template_id, name, icon, config, display_order, is_active)
SELECT 
    kt.id,
    qs.name,
    qs.icon,
    qs.config::jsonb,
    qs.order,
    true
FROM kaspar_template kt,
(VALUES 
    ('Manufacturing Excellence', '🏭', '{
        "business_unit": "bedrock",
        "research_domain": "manufacturing",
        "analysis_method": "process_mining",
        "output_format": "implementation"
    }', 1),
    ('Quality Automation', '🤖', '{
        "business_unit": "horizon",
        "research_domain": "quality",
        "analysis_method": "ai_automation",
        "output_format": "technical"
    }', 2),
    ('Market Intelligence', '📊', '{
        "business_unit": "precious_metals",
        "research_domain": "market",
        "analysis_method": "predictive",
        "output_format": "executive"
    }', 3),
    ('Supply Chain ROI', '📦', '{
        "business_unit": "circle_y",
        "research_domain": "supply_chain",
        "analysis_method": "roi_analysis",
        "output_format": "case_study"
    }', 4),
    ('Innovation Strategy', '💡', '{
        "business_unit": "corporate",
        "research_domain": "innovation",
        "analysis_method": "benchmarking",
        "output_format": "presentation"
    }', 5),
    ('Workforce Development', '👥', '{
        "business_unit": "wire_works",
        "research_domain": "workforce",
        "analysis_method": "swot",
        "output_format": "action_plan"
    }', 6)
) AS qs(name, icon, config, order);

-- Create Manufacturing Excellence template with different options
WITH mfg_template AS (
    SELECT id FROM research_templates WHERE name = 'Manufacturing Excellence' LIMIT 1
)
INSERT INTO research_segments (template_id, segment_key, title, icon, display_order)
SELECT 
    mt.id,
    segment.key,
    segment.title,
    segment.icon,
    segment.order
FROM mfg_template mt,
(VALUES 
    ('facility_type', 'Facility Type', 'Factory', 1),
    ('process_area', 'Process Area', 'Cog', 2),
    ('improvement_goal', 'Improvement Goal', 'Target', 3),
    ('deliverable', 'Deliverable Type', 'Package', 4)
) AS segment(key, title, icon, order);

-- Add some options for the Manufacturing Excellence template
WITH facility_segment AS (
    SELECT s.id 
    FROM research_segments s 
    JOIN research_templates t ON s.template_id = t.id 
    WHERE t.name = 'Manufacturing Excellence' AND s.segment_key = 'facility_type'
)
INSERT INTO research_segment_options (segment_id, option_key, display_text, prompt_text, is_active, display_order)
SELECT 
    fs.id,
    opt.key,
    opt.display,
    opt.prompt,
    true,
    opt.order
FROM facility_segment fs,
(VALUES 
    ('discrete', 'Discrete Manufacturing', 'discrete manufacturing facility producing individual units', 1),
    ('process', 'Process Manufacturing', 'continuous process manufacturing operation', 2),
    ('hybrid', 'Hybrid Manufacturing', 'mixed discrete and process manufacturing', 3),
    ('job_shop', 'Job Shop', 'custom job shop manufacturing', 4)
) AS opt(key, display, prompt, order);