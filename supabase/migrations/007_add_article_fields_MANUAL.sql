-- MANUAL MIGRATION: Run this in Supabase SQL Editor
-- This adds new fields to the articles table for enhanced editing capabilities

-- Step 1: Add new columns to articles table
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS primary_category TEXT DEFAULT 'News';
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS section_title TEXT;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS card_description TEXT;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS edit_history JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS last_edited_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS last_edited_by TEXT;

-- Step 2: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_articles_primary_category ON public.articles(primary_category);
CREATE INDEX IF NOT EXISTS idx_articles_category_created ON public.articles(primary_category, created_at DESC);

-- Step 3: Add check constraint for valid categories
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'check_valid_category'
    ) THEN
        ALTER TABLE public.articles
        ADD CONSTRAINT check_valid_category 
        CHECK (primary_category IN ('News', 'Community', 'Technology', 'Sports', 'Arts & Culture', 'Business', 'Environment'));
    END IF;
END $$;

-- Step 4: Update existing articles with default category
UPDATE public.articles 
SET primary_category = 'News' 
WHERE primary_category IS NULL;

-- Step 5: Create RLS policy for updating articles
CREATE POLICY IF NOT EXISTS "Articles can be updated with valid admin session" 
ON public.articles 
FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM public.admin_sessions
        WHERE session_token = current_setting('request.headers', true)::json->>'authorization'
        AND expires_at > TIMEZONE('utc', NOW())
    )
);

-- Step 6: Create enhanced view for article cards
CREATE OR REPLACE VIEW public.article_cards_enhanced AS
SELECT 
    ac.id,
    ac.article_id,
    ac.card_title,
    COALESCE(a.card_description, ac.card_description) as card_description,
    ac.card_image_id,
    ac.card_style,
    ac.click_count,
    a.primary_category,
    a.section_title,
    a.tags,
    a.author_name,
    a.reading_time,
    a.last_edited_at,
    p.slug,
    p.published_at,
    p.is_published
FROM public.article_cards ac
JOIN public.articles a ON ac.article_id = a.id
JOIN public.pages p ON a.page_id = p.id
WHERE p.is_published = true
ORDER BY p.published_at DESC;

-- Step 7: Grant permissions
GRANT SELECT ON public.article_cards_enhanced TO anon;
GRANT SELECT ON public.article_cards_enhanced TO authenticated;

-- Verify the migration
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'articles' 
AND column_name IN ('primary_category', 'section_title', 'card_description', 'edit_history', 'last_edited_at', 'last_edited_by')
ORDER BY column_name;