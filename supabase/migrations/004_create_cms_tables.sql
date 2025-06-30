-- CMS Tables for Kaiville

-- First, ensure we have the function for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update pages table structure
ALTER TABLE public.pages 
ADD COLUMN IF NOT EXISTS page_type TEXT DEFAULT 'article',
ADD COLUMN IF NOT EXISTS subtitle TEXT,
ADD COLUMN IF NOT EXISTS meta_keywords TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS hero_image_id UUID,
ADD COLUMN IF NOT EXISTS layout_template TEXT DEFAULT 'default',
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false;

-- Add foreign key for hero_image_id
ALTER TABLE public.pages
ADD CONSTRAINT fk_pages_hero_image 
FOREIGN KEY (hero_image_id) 
REFERENCES public.assets(id) 
ON DELETE SET NULL;

-- Create articles table
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

-- Create content blocks table
CREATE TABLE IF NOT EXISTS public.content_blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_id UUID REFERENCES public.pages(id) ON DELETE CASCADE,
  block_type TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  style_config JSONB DEFAULT '{}'::jsonb,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(page_id, order_index)
);

-- Create article cards table
CREATE TABLE IF NOT EXISTS public.article_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE,
  card_title TEXT NOT NULL,
  card_description TEXT,
  card_image_id UUID REFERENCES public.assets(id) ON DELETE SET NULL,
  card_style TEXT DEFAULT 'default',
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

-- Create content revisions table
CREATE TABLE IF NOT EXISTS public.content_revisions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_id UUID REFERENCES public.pages(id) ON DELETE CASCADE,
  revision_type TEXT NOT NULL,
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

-- Create indexes
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

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS set_articles_updated_at ON public.articles;
CREATE TRIGGER set_articles_updated_at
  BEFORE UPDATE ON public.articles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_content_blocks_updated_at ON public.content_blocks;
CREATE TRIGGER set_content_blocks_updated_at
  BEFORE UPDATE ON public.content_blocks
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Insert default settings
INSERT INTO public.site_settings (setting_key, setting_value, setting_type) VALUES
  ('admin_password', '"kaiville25"'::jsonb, 'security'),
  ('site_title', '"Kaiville Interactive Map"'::jsonb, 'general'),
  ('site_description', '"Explore the interactive map of Kaiville"'::jsonb, 'general'),
  ('maintenance_mode', 'false'::jsonb, 'general')
ON CONFLICT (setting_key) DO NOTHING;