-- Add new fields to articles table for enhanced categorization and editing

-- Add primary_category field to articles
ALTER TABLE public.articles 
ADD COLUMN IF NOT EXISTS primary_category TEXT DEFAULT 'News';

-- Add section_title field to articles (for customizing section headers)
ALTER TABLE public.articles 
ADD COLUMN IF NOT EXISTS section_title TEXT;

-- Add card_description field to articles (for custom card descriptions)
ALTER TABLE public.articles 
ADD COLUMN IF NOT EXISTS card_description TEXT;

-- Add edit_history JSONB field to track changes
ALTER TABLE public.articles 
ADD COLUMN IF NOT EXISTS edit_history JSONB DEFAULT '[]'::jsonb;

-- Add last_edited_at timestamp
ALTER TABLE public.articles 
ADD COLUMN IF NOT EXISTS last_edited_at TIMESTAMP WITH TIME ZONE;

-- Add last_edited_by field
ALTER TABLE public.articles 
ADD COLUMN IF NOT EXISTS last_edited_by TEXT;

-- Create index on primary_category for better query performance
CREATE INDEX IF NOT EXISTS idx_articles_primary_category 
ON public.articles(primary_category);

-- Create composite index on primary_category and created_at for sorted queries
CREATE INDEX IF NOT EXISTS idx_articles_category_created 
ON public.articles(primary_category, created_at DESC);

-- Add check constraint for valid primary categories
ALTER TABLE public.articles
ADD CONSTRAINT IF NOT EXISTS check_valid_category 
CHECK (primary_category IN ('News', 'Community', 'Technology', 'Sports', 'Arts & Culture', 'Business', 'Environment'));

-- Create a function to update edit_history when article is modified
CREATE OR REPLACE FUNCTION public.track_article_edits()
RETURNS TRIGGER AS $$
DECLARE
    edit_entry JSONB;
BEGIN
    -- Only track if actual changes occurred
    IF OLD IS DISTINCT FROM NEW THEN
        edit_entry := jsonb_build_object(
            'timestamp', TIMEZONE('utc', NOW()),
            'edited_by', COALESCE(NEW.last_edited_by, 'system'),
            'changes', jsonb_build_object(
                'tags_changed', OLD.tags IS DISTINCT FROM NEW.tags,
                'category_changed', OLD.primary_category IS DISTINCT FROM NEW.primary_category,
                'content_changed', OLD.headline IS DISTINCT FROM NEW.headline OR 
                                 OLD.subheadline IS DISTINCT FROM NEW.subheadline OR
                                 OLD.card_description IS DISTINCT FROM NEW.card_description
            )
        );
        
        -- Append to edit history (keep last 50 entries)
        NEW.edit_history := (
            SELECT jsonb_agg(elem)
            FROM (
                SELECT elem
                FROM jsonb_array_elements(
                    COALESCE(NEW.edit_history, '[]'::jsonb) || edit_entry
                ) AS elem
                ORDER BY (elem->>'timestamp')::timestamptz DESC
                LIMIT 50
            ) AS recent_edits
        );
        
        -- Update last_edited_at
        NEW.last_edited_at := TIMEZONE('utc', NOW());
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for edit tracking
DROP TRIGGER IF EXISTS track_article_edits_trigger ON public.articles;
CREATE TRIGGER track_article_edits_trigger
    BEFORE UPDATE ON public.articles
    FOR EACH ROW
    EXECUTE FUNCTION public.track_article_edits();

-- Update existing articles with default values
UPDATE public.articles 
SET primary_category = 'News' 
WHERE primary_category IS NULL;

-- Add RLS policy for updating articles (requires admin session)
CREATE POLICY "Articles can be updated with valid admin session" 
ON public.articles 
FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM public.admin_sessions
        WHERE session_token = current_setting('request.headers.authorization', true)
        AND expires_at > TIMEZONE('utc', NOW())
    )
);

-- Create a view for article cards with all necessary fields
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

-- Grant select on the view to anon role
GRANT SELECT ON public.article_cards_enhanced TO anon;

-- Add comment documentation
COMMENT ON COLUMN public.articles.primary_category IS 'Main category for the article (News, Community, Technology, etc.)';
COMMENT ON COLUMN public.articles.section_title IS 'Custom section title to display on article cards';
COMMENT ON COLUMN public.articles.card_description IS 'Custom description for article cards, overrides auto-generated descriptions';
COMMENT ON COLUMN public.articles.edit_history IS 'JSON array of edit history entries tracking changes';
COMMENT ON COLUMN public.articles.last_edited_at IS 'Timestamp of the last edit';
COMMENT ON COLUMN public.articles.last_edited_by IS 'Identifier of the last editor';