-- RLS policies for research_* tables (always moderation)

-- Enable RLS
ALTER TABLE public.research_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_article_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_article_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Helper: ensure profiles row exists for auth.uid() via trigger elsewhere if you maintain profiles

-- Policies: profiles (self readable)
CREATE POLICY profiles_self_select ON public.profiles
  FOR SELECT
  USING (id = auth.uid());

-- Public can read published articles only
CREATE POLICY research_articles_select_published ON public.research_articles
  FOR SELECT
  USING (status = 'published');

-- Contributors can insert drafts they create; status constrained in app logic
CREATE POLICY research_articles_insert_own ON public.research_articles
  FOR INSERT
  WITH CHECK (created_by = auth.uid());

-- Owners can update their own drafts (not published)
CREATE POLICY research_articles_update_own_drafts ON public.research_articles
  FOR UPDATE
  USING (created_by = auth.uid() AND status IN ('draft','needs_review'))
  WITH CHECK (created_by = auth.uid());

-- Moderators/Admins can select/insert/update any via role in profiles
CREATE POLICY research_articles_mod_all ON public.research_articles
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role IN ('moderator','admin')
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role IN ('moderator','admin')
  ));

-- Tags: public read
CREATE POLICY research_tags_public_read ON public.research_tags
  FOR SELECT
  USING (true);

-- Tags write: moderators/admins
CREATE POLICY research_tags_mod_write ON public.research_tags
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('moderator','admin')
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('moderator','admin')
  ));

-- Article_Tags read follows published article visibility
CREATE POLICY research_article_tags_read ON public.research_article_tags
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.research_articles a
    WHERE a.id = research_article_tags.article_id AND a.status = 'published'
  ));

-- Article_Tags write: moderators/admins or owners of draft
CREATE POLICY research_article_tags_write ON public.research_article_tags
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.research_articles a
      JOIN public.profiles p ON p.id = auth.uid()
      WHERE a.id = research_article_tags.article_id
        AND (p.role IN ('moderator','admin') OR a.created_by = auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.research_articles a
      JOIN public.profiles p ON p.id = auth.uid()
      WHERE a.id = research_article_tags.article_id
        AND (p.role IN ('moderator','admin') OR a.created_by = auth.uid())
    )
  );

-- Uploads: owner read/write, admins/mods all
CREATE POLICY research_uploads_owner_rw ON public.research_uploads
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY research_uploads_mod_all ON public.research_uploads
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('moderator','admin')
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('moderator','admin')
  ));

-- Embeddings: readable if article published; writable by mods/admins or owners of draft
CREATE POLICY research_embeddings_read ON public.research_article_embeddings
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.research_articles a
    WHERE a.id = research_article_embeddings.article_id AND a.status = 'published'
  ));

CREATE POLICY research_embeddings_write ON public.research_article_embeddings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.research_articles a
      JOIN public.profiles p ON p.id = auth.uid()
      WHERE a.id = research_article_embeddings.article_id
        AND (p.role IN ('moderator','admin') OR a.created_by = auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.research_articles a
      JOIN public.profiles p ON p.id = auth.uid()
      WHERE a.id = research_article_embeddings.article_id
        AND (p.role IN ('moderator','admin') OR a.created_by = auth.uid())
    )
  );

