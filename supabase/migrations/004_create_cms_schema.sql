-- Enhanced CMS schema for Kaiville content management

-- Update pages table with new fields
ALTER TABLE public.pages 
ADD COLUMN IF NOT EXISTS page_type TEXT DEFAULT 'article' CHECK (page_type IN ('landing', 'article', 'gallery', 'map', 'about')),
ADD COLUMN IF NOT EXISTS subtitle TEXT,
ADD COLUMN IF NOT EXISTS meta_keywords TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS hero_image_id UUID REFERENCES public.assets(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS layout_template TEXT DEFAULT 'default',
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false;

-- Create articles table for blog-style content
CREATE TABLE IF NOT EXISTS public.articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_id UUID REFERENCES public.pages(id) ON DELETE CASCADE,
  headline TEXT NOT NULL,
  subheadline TEXT,
  author_name TEXT DEFAULT 'Kaiville Team',
  author_avatar_id UUID REFERENCES public.assets(id) ON DELETE SET NULL,
  reading_time INTEGER DEFAULT 5,
  featured_image_id UUID REFERENCES public.assets(id) ON DELETE SET NULL,
  featured_video_url TEXT,
  content_blocks JSONB DEFAULT '[]'::jsonb,
  tags TEXT[] DEFAULT '{}',
  style_config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(page_id)
);

-- Create content blocks table for modular content
CREATE TABLE IF NOT EXISTS public.content_blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_id UUID REFERENCES public.pages(id) ON DELETE CASCADE,
  block_type TEXT NOT NULL CHECK (block_type IN ('text', 'image', 'video', 'map', 'gallery', 'card_grid', 'hero', 'cta', 'spacer')),
  order_index INTEGER NOT NULL,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  style_config JSONB DEFAULT '{}'::jsonb,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(page_id, order_index)
);

-- Create article cards for grid displays
CREATE TABLE IF NOT EXISTS public.article_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE,
  card_title TEXT NOT NULL,
  card_description TEXT,
  card_image_id UUID REFERENCES public.assets(id) ON DELETE SET NULL,
  card_style TEXT DEFAULT 'default' CHECK (card_style IN ('default', 'featured', 'minimal', 'large')),
  click_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(article_id)
);

-- Create admin sessions table
CREATE TABLE IF NOT EXISTS public.admin_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_token TEXT UNIQUE NOT NULL,
  ip_address INET,
  user_agent TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create content revisions table for history
CREATE TABLE IF NOT EXISTS public.content_revisions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_id UUID REFERENCES public.pages(id) ON DELETE CASCADE,
  revision_type TEXT NOT NULL CHECK (revision_type IN ('page', 'article', 'blocks')),
  revision_data JSONB NOT NULL,
  revision_note TEXT,
  created_by TEXT DEFAULT 'system',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create site settings table
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  setting_type TEXT DEFAULT 'general',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pages_page_type ON public.pages(page_type);
CREATE INDEX IF NOT EXISTS idx_pages_is_published ON public.pages(is_published);
CREATE INDEX IF NOT EXISTS idx_articles_page_id ON public.articles(page_id);
CREATE INDEX IF NOT EXISTS idx_articles_tags ON public.articles USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_content_blocks_page_id ON public.content_blocks(page_id);
CREATE INDEX IF NOT EXISTS idx_content_blocks_order ON public.content_blocks(page_id, order_index);
CREATE INDEX IF NOT EXISTS idx_article_cards_article_id ON public.article_cards(article_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON public.admin_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON public.admin_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_content_revisions_page_id ON public.content_revisions(page_id);

-- Apply updated_at triggers to new tables
CREATE TRIGGER set_articles_updated_at
  BEFORE UPDATE ON public.articles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_content_blocks_updated_at
  BEFORE UPDATE ON public.content_blocks
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Insert default site settings
INSERT INTO public.site_settings (setting_key, setting_value, setting_type) VALUES
  ('admin_password_hash', '"$2a$10$X4kv7j5ZcG39WgogSl16au7vt6rH5ghTWEbVFXk7h.qVxYcNr5dNi"'::jsonb, 'security'), -- bcrypt hash of 'kaiville25'
  ('site_title', '"Kaiville Interactive Map"'::jsonb, 'general'),
  ('site_description', '"Explore the interactive map of Kaiville"'::jsonb, 'general'),
  ('maintenance_mode', 'false'::jsonb, 'general')
ON CONFLICT (setting_key) DO NOTHING;

-- Insert sample page and article for testing
INSERT INTO public.pages (slug, title, subtitle, description, page_type, is_published, status) VALUES
  ('welcome-to-kaiville', 'Welcome to Kaiville', 'Discover our interactive city map', 'Learn about Kaiville and explore our interactive map features.', 'article', true, 'published')
ON CONFLICT (slug) DO NOTHING;

-- Get the page ID for the article
DO $$
DECLARE
  page_uuid UUID;
BEGIN
  SELECT id INTO page_uuid FROM public.pages WHERE slug = 'welcome-to-kaiville' LIMIT 1;
  
  IF page_uuid IS NOT NULL THEN
    -- Insert article content
    INSERT INTO public.articles (page_id, headline, subheadline, content_blocks) VALUES
      (page_uuid, 
       'Welcome to Kaiville Interactive Map', 
       'Your guide to exploring our city',
       '[
         {
           "type": "text",
           "content": {
             "text": "Welcome to Kaiville! Our interactive map allows you to explore every corner of our vibrant city.",
             "format": "paragraph"
           }
         }
       ]'::jsonb)
    ON CONFLICT (page_id) DO NOTHING;
    
    -- Insert content blocks
    INSERT INTO public.content_blocks (page_id, block_type, order_index, content) VALUES
      (page_uuid, 'hero', 0, '{"title": "Explore Kaiville", "subtitle": "Interactive City Map", "backgroundImage": null}'::jsonb),
      (page_uuid, 'text', 1, '{"text": "Navigate through neighborhoods, find local businesses, and discover hidden gems.", "format": "paragraph"}'::jsonb)
    ON CONFLICT (page_id, order_index) DO NOTHING;
  END IF;
END $$;