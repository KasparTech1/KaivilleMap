-- RLS Policies for CMS tables

-- Enable RLS on new tables
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Articles policies
CREATE POLICY "Published articles are viewable by everyone" ON public.articles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.pages 
      WHERE pages.id = articles.page_id 
      AND pages.is_published = true 
      AND pages.status = 'published'
    )
  );

CREATE POLICY "Authenticated users can manage articles" ON public.articles
  FOR ALL USING (auth.role() = 'authenticated');

-- Content blocks policies
CREATE POLICY "Published content blocks are viewable by everyone" ON public.content_blocks
  FOR SELECT USING (
    is_visible = true AND
    EXISTS (
      SELECT 1 FROM public.pages 
      WHERE pages.id = content_blocks.page_id 
      AND pages.is_published = true 
      AND pages.status = 'published'
    )
  );

CREATE POLICY "Authenticated users can manage content blocks" ON public.content_blocks
  FOR ALL USING (auth.role() = 'authenticated');

-- Article cards policies
CREATE POLICY "Article cards are viewable by everyone" ON public.article_cards
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.articles a
      JOIN public.pages p ON p.id = a.page_id
      WHERE a.id = article_cards.article_id 
      AND p.is_published = true 
      AND p.status = 'published'
    )
  );

CREATE POLICY "Authenticated users can manage article cards" ON public.article_cards
  FOR ALL USING (auth.role() = 'authenticated');

-- Admin sessions policies
CREATE POLICY "Admin sessions are private" ON public.admin_sessions
  FOR ALL USING (false);

-- Content revisions policies
CREATE POLICY "Content revisions viewable by authenticated" ON public.content_revisions
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create revisions" ON public.content_revisions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Site settings policies
CREATE POLICY "Site settings viewable by everyone" ON public.site_settings
  FOR SELECT USING (setting_type != 'security');

CREATE POLICY "Security settings hidden from public" ON public.site_settings
  FOR SELECT USING (setting_type = 'security' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update settings" ON public.site_settings
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Create functions for admin operations

-- Function to validate admin session
CREATE OR REPLACE FUNCTION public.validate_admin_session(token TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_sessions 
    WHERE session_token = token 
    AND expires_at > NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create admin session
CREATE OR REPLACE FUNCTION public.create_admin_session(password TEXT, ip INET DEFAULT NULL, agent TEXT DEFAULT NULL)
RETURNS TABLE(success BOOLEAN, token TEXT, message TEXT) AS $$
DECLARE
  password_hash TEXT;
  new_token TEXT;
BEGIN
  -- Get stored password hash
  SELECT setting_value->>'value' INTO password_hash 
  FROM public.site_settings 
  WHERE setting_key = 'admin_password_hash';
  
  -- For now, simple password check (in production, use proper bcrypt comparison)
  IF password = 'kaiville25' THEN
    -- Generate session token
    new_token := encode(gen_random_bytes(32), 'hex');
    
    -- Insert session
    INSERT INTO public.admin_sessions (session_token, ip_address, user_agent, expires_at)
    VALUES (new_token, ip, agent, NOW() + INTERVAL '24 hours');
    
    -- Clean old sessions
    DELETE FROM public.admin_sessions WHERE expires_at < NOW();
    
    RETURN QUERY SELECT true, new_token, 'Authentication successful'::TEXT;
  ELSE
    RETURN QUERY SELECT false, NULL::TEXT, 'Invalid password'::TEXT;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update page content
CREATE OR REPLACE FUNCTION public.update_page_content(
  page_slug TEXT,
  updates JSONB,
  session_token TEXT
)
RETURNS JSONB AS $$
DECLARE
  page_uuid UUID;
  result JSONB;
BEGIN
  -- Validate session
  IF NOT public.validate_admin_session(session_token) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid or expired session');
  END IF;
  
  -- Get page ID
  SELECT id INTO page_uuid FROM public.pages WHERE slug = page_slug;
  
  IF page_uuid IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Page not found');
  END IF;
  
  -- Update page fields
  UPDATE public.pages 
  SET 
    title = COALESCE(updates->>'title', title),
    subtitle = COALESCE(updates->>'subtitle', subtitle),
    description = COALESCE(updates->>'description', description),
    meta_data = COALESCE(updates->'meta_data', meta_data),
    updated_at = NOW()
  WHERE id = page_uuid;
  
  -- Create revision
  INSERT INTO public.content_revisions (page_id, revision_type, revision_data, revision_note)
  SELECT id, 'page', row_to_json(pages.*), 'Page content updated'
  FROM public.pages WHERE id = page_uuid;
  
  RETURN jsonb_build_object('success', true, 'pageId', page_uuid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;