-- ============================================================================
-- Research Center Architecture - Full Implementation
-- Generated from maintenance-room/plans/PLAN-research-center.md
-- ============================================================================
-- This migration implements the complete Research Center architecture with:
-- - User submission and moderation workflow
-- - Voting system
-- - LLM formatting cache
-- - Background job processing
-- - Analytics tracking
-- ============================================================================

-- Drop existing research_article_status enum and create new one
DROP TYPE IF EXISTS public.research_article_status CASCADE;
CREATE TYPE public.research_article_status AS ENUM (
  'pending',    -- Awaiting moderation
  'approved',   -- Published and visible
  'rejected',   -- Rejected by moderator
  'editing'     -- Being edited (will return to pending)
);

-- Research Center Categories (fixed list from Q7)
CREATE TYPE public.research_category AS ENUM (
  'anomalies',
  'experiments',
  'theory',
  'field_reports',
  'technical_analysis',
  'historical_research'
);

-- Vote types for upvote/downvote system (Q9)
CREATE TYPE public.vote_type AS ENUM ('up', 'down');

-- Formatting job status (Q3)
CREATE TYPE public.formatting_job_status AS ENUM (
  'queued',
  'processing',
  'completed',
  'failed'
);

-- ============================================================================
-- MAIN TABLES
-- ============================================================================

-- Research Articles (User Submissions)
-- This replaces/extends the existing research_articles table
DROP TABLE IF EXISTS public.research_center_articles CASCADE;
CREATE TABLE public.research_center_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Author info (Q10: Required User Accounts)
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,

  -- Content
  title TEXT NOT NULL,
  raw_content TEXT NOT NULL,              -- Original submission
  formatted_content TEXT,                 -- LLM-formatted version
  abstract TEXT,                          -- Optional short summary

  -- Q7: Fixed Categories
  category public.research_category NOT NULL,

  -- Q5: Optional Templates
  template_used TEXT,                     -- NULL for free-form, or template ID

  -- Workflow status (Q2: Manual Moderation)
  status public.research_article_status NOT NULL DEFAULT 'pending',

  -- Q11: Author Edits with Re-Moderation
  is_edited BOOLEAN DEFAULT FALSE,
  edit_count INTEGER DEFAULT 0,
  previous_version_id UUID REFERENCES public.research_center_articles(id),

  -- Moderation
  moderator_id UUID REFERENCES auth.users(id),
  moderated_at TIMESTAMPTZ,
  moderation_notes TEXT,

  -- Q9: Upvote/Downvote System
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  vote_score INTEGER GENERATED ALWAYS AS (upvotes - downvotes) STORED,

  -- Q12: Basic Metrics
  view_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
  published_at TIMESTAMPTZ,
  last_edited_at TIMESTAMPTZ,

  -- Q6: Content Hash Caching
  content_hash TEXT                       -- SHA-256 of raw_content
);

-- Indexes for performance
CREATE INDEX idx_rc_articles_status ON public.research_center_articles(status);
CREATE INDEX idx_rc_articles_category ON public.research_center_articles(category);
CREATE INDEX idx_rc_articles_author ON public.research_center_articles(author_id);
CREATE INDEX idx_rc_articles_published ON public.research_center_articles(published_at) WHERE status = 'approved';
CREATE INDEX idx_rc_articles_vote_score ON public.research_center_articles(vote_score) WHERE status = 'approved';
CREATE INDEX idx_rc_articles_content_hash ON public.research_center_articles(content_hash);

-- Q8: Full-Text Search (PostgreSQL)
CREATE INDEX idx_rc_articles_search ON public.research_center_articles
USING GIN(to_tsvector('english', title || ' ' || COALESCE(formatted_content, raw_content)));

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_rc_articles_updated_at
  BEFORE UPDATE ON public.research_center_articles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- VOTING SYSTEM (Q9)
-- ============================================================================

CREATE TABLE public.research_center_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID NOT NULL REFERENCES public.research_center_articles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_type public.vote_type NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),

  UNIQUE(article_id, user_id) -- One vote per user per article
);

CREATE INDEX idx_rc_votes_article ON public.research_center_votes(article_id);
CREATE INDEX idx_rc_votes_user ON public.research_center_votes(user_id);

-- Trigger to update article vote counts
CREATE OR REPLACE FUNCTION update_article_votes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.vote_type = 'up' THEN
      UPDATE public.research_center_articles SET upvotes = upvotes + 1 WHERE id = NEW.article_id;
    ELSE
      UPDATE public.research_center_articles SET downvotes = downvotes + 1 WHERE id = NEW.article_id;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Handle vote changes
    IF OLD.vote_type = 'up' AND NEW.vote_type = 'down' THEN
      UPDATE public.research_center_articles
      SET upvotes = upvotes - 1, downvotes = downvotes + 1
      WHERE id = NEW.article_id;
    ELSIF OLD.vote_type = 'down' AND NEW.vote_type = 'up' THEN
      UPDATE public.research_center_articles
      SET downvotes = downvotes - 1, upvotes = upvotes + 1
      WHERE id = NEW.article_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.vote_type = 'up' THEN
      UPDATE public.research_center_articles SET upvotes = upvotes - 1 WHERE id = OLD.article_id;
    ELSE
      UPDATE public.research_center_articles SET downvotes = downvotes - 1 WHERE id = OLD.article_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER vote_update_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.research_center_votes
FOR EACH ROW EXECUTE FUNCTION update_article_votes();

-- ============================================================================
-- LLM FORMATTING CACHE (Q6)
-- ============================================================================

CREATE TABLE public.llm_format_cache (
  content_hash TEXT PRIMARY KEY,
  formatted_output TEXT NOT NULL,
  model_used TEXT NOT NULL,
  token_count INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
  last_accessed TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
  access_count INTEGER DEFAULT 1
);

-- Expire old cache entries (30 days)
CREATE INDEX idx_llm_cache_expiry ON public.llm_format_cache(created_at);

-- ============================================================================
-- BACKGROUND FORMATTING JOBS (Q3)
-- ============================================================================

CREATE TABLE public.research_formatting_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID NOT NULL REFERENCES public.research_center_articles(id) ON DELETE CASCADE,
  status public.formatting_job_status NOT NULL DEFAULT 'queued',
  provider_used TEXT,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_formatting_jobs_status ON public.research_formatting_jobs(status, created_at);
CREATE INDEX idx_formatting_jobs_article ON public.research_formatting_jobs(article_id);

-- ============================================================================
-- ANALYTICS (Q12)
-- ============================================================================

CREATE TABLE public.research_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  metric_name TEXT NOT NULL,             -- e.g., 'daily_submissions', 'approval_rate'
  metric_value NUMERIC NOT NULL,
  metric_date DATE NOT NULL,
  metadata JSONB,                        -- Additional context
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),

  UNIQUE(metric_name, metric_date)
);

CREATE INDEX idx_research_analytics_metric ON public.research_analytics(metric_name, metric_date);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE public.research_center_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_center_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.llm_format_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_formatting_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_analytics ENABLE ROW LEVEL SECURITY;

-- Articles: Anyone can read approved articles
CREATE POLICY "Anyone can view approved articles"
ON public.research_center_articles FOR SELECT
USING (status = 'approved');

-- Articles: Authors can view their own articles (any status)
CREATE POLICY "Authors can view own articles"
ON public.research_center_articles FOR SELECT
USING (auth.uid() = author_id);

-- Articles: Moderators can view all articles
CREATE POLICY "Moderators can view all articles"
ON public.research_center_articles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('moderator', 'admin')
  )
);

-- Articles: Authenticated users can submit articles
CREATE POLICY "Authenticated users can submit articles"
ON public.research_center_articles FOR INSERT
WITH CHECK (auth.uid() = author_id);

-- Articles: Authors can edit their own approved articles
CREATE POLICY "Authors can edit own approved articles"
ON public.research_center_articles FOR UPDATE
USING (auth.uid() = author_id AND status = 'approved');

-- Articles: Moderators can update any article
CREATE POLICY "Moderators can update articles"
ON public.research_center_articles FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('moderator', 'admin')
  )
);

-- Votes: Anyone can view vote counts (embedded in article)
-- Votes: Authenticated users can insert/update/delete their own votes
CREATE POLICY "Users can manage own votes"
ON public.research_center_votes FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Cache: Service role only (backend access)
CREATE POLICY "Service role only for cache"
ON public.llm_format_cache FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

-- Formatting jobs: Service role only (backend access)
CREATE POLICY "Service role only for jobs"
ON public.research_formatting_jobs FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

-- Analytics: Moderators can view
CREATE POLICY "Moderators can view analytics"
ON public.research_analytics FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('moderator', 'admin')
  )
);

-- Analytics: Service role can insert
CREATE POLICY "Service role can insert analytics"
ON public.research_analytics FOR INSERT
WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to clean expired cache entries (run via cron or manually)
CREATE OR REPLACE FUNCTION clean_expired_llm_cache()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.llm_format_cache
  WHERE created_at < (NOW() - INTERVAL '30 days');

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate approval rate for analytics
CREATE OR REPLACE FUNCTION calculate_approval_rate(start_date DATE, end_date DATE)
RETURNS NUMERIC AS $$
DECLARE
  total_moderated INTEGER;
  total_approved INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_moderated
  FROM public.research_center_articles
  WHERE moderated_at::DATE BETWEEN start_date AND end_date
  AND status IN ('approved', 'rejected');

  SELECT COUNT(*) INTO total_approved
  FROM public.research_center_articles
  WHERE moderated_at::DATE BETWEEN start_date AND end_date
  AND status = 'approved';

  IF total_moderated = 0 THEN
    RETURN 0;
  END IF;

  RETURN (total_approved::NUMERIC / total_moderated::NUMERIC) * 100;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Insert initial analytics for tracking
INSERT INTO public.research_analytics (metric_name, metric_value, metric_date, metadata)
VALUES
  ('migration_completed', 1, CURRENT_DATE, '{"migration": "012_research_center_architecture"}'::jsonb)
ON CONFLICT (metric_name, metric_date) DO NOTHING;
