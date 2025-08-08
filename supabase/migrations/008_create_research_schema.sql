-- Research schema (v0) for Kaiville
-- Separate from CMS/blog. Focused on ingestion, moderation, filtering, and search.

-- Enums
CREATE TYPE public.research_source_type AS ENUM (
  'peer-reviewed', 'whitepaper', 'standard', 'blog', 'news', 'report', 'other'
);

CREATE TYPE public.research_article_status AS ENUM (
  'draft', 'needs_review', 'published'
);

CREATE TYPE public.research_tag_type AS ENUM (
  'domain', 'topic', 'subsidiary', 'business_unit', 'region', 'technology', 'process', 'compliance', 'keyword'
);

CREATE TYPE public.research_processing_status AS ENUM (
  'queued', 'processing', 'failed', 'complete'
);

-- Profiles table (minimal), if not already present elsewhere
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('viewer','contributor','moderator','admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- Articles
CREATE TABLE public.research_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  source_url TEXT,
  source_type public.research_source_type NOT NULL DEFAULT 'other',
  authors TEXT[] DEFAULT '{}',
  publisher TEXT,
  year INTEGER,
  region TEXT,
  domains TEXT[] DEFAULT '{}',
  topics TEXT[] DEFAULT '{}',
  keywords TEXT[] DEFAULT '{}',
  status public.research_article_status NOT NULL DEFAULT 'needs_review',
  summary TEXT,
  key_points JSONB DEFAULT '[]'::jsonb,
  content_md TEXT,
  content_html TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
  published_at TIMESTAMPTZ,
  content_hash TEXT UNIQUE,
  search_fts tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(summary, '')), 'B') ||
    setweight(to_tsvector('english', array_to_string(coalesce(keywords, '{}'), ' ')), 'C') ||
    setweight(to_tsvector('english', coalesce(content_md, '')), 'D')
  ) STORED
);

-- Tags
CREATE TABLE public.research_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type public.research_tag_type NOT NULL,
  slug TEXT NOT NULL UNIQUE
);

-- Article <-> Tag link
CREATE TABLE public.research_article_tags (
  article_id UUID NOT NULL REFERENCES public.research_articles(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.research_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
);

-- Uploads
CREATE TABLE public.research_uploads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  original_filename TEXT,
  mime_type TEXT,
  size BIGINT,
  raw_blob_path TEXT,
  extracted_text_path TEXT,
  processing_status public.research_processing_status NOT NULL DEFAULT 'queued',
  failure_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
  article_id UUID REFERENCES public.research_articles(id) ON DELETE SET NULL
);

-- Indexes
CREATE INDEX idx_research_articles_status ON public.research_articles(status);
CREATE INDEX idx_research_articles_year ON public.research_articles(year);
CREATE INDEX idx_research_articles_region ON public.research_articles(region);
CREATE INDEX idx_research_articles_created_at ON public.research_articles(created_at);
CREATE INDEX idx_research_articles_domains ON public.research_articles USING GIN (domains);
CREATE INDEX idx_research_articles_topics ON public.research_articles USING GIN (topics);
CREATE INDEX idx_research_articles_keywords ON public.research_articles USING GIN (keywords);
CREATE INDEX idx_research_articles_search_fts ON public.research_articles USING GIN (search_fts);

CREATE INDEX idx_research_article_tags_article ON public.research_article_tags(article_id);
CREATE INDEX idx_research_article_tags_tag ON public.research_article_tags(tag_id);

-- updated_at trigger
CREATE TRIGGER set_research_articles_updated_at
  BEFORE UPDATE ON public.research_articles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

