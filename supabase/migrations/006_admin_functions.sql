-- Admin authentication functions

-- Function to create admin session (simplified for demo)
CREATE OR REPLACE FUNCTION public.create_admin_session(
  password TEXT,
  ip TEXT DEFAULT NULL,
  agent TEXT DEFAULT NULL
)
RETURNS jsonb AS $$
DECLARE
  stored_password TEXT;
  new_token TEXT;
  session_id UUID;
BEGIN
  -- Get stored password from settings
  SELECT setting_value::text INTO stored_password 
  FROM public.site_settings 
  WHERE setting_key = 'admin_password';
  
  -- Check password (in production, use proper hashing)
  IF password != stored_password THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Invalid password'
    );
  END IF;
  
  -- Generate session token
  new_token := encode(gen_random_bytes(32), 'hex');
  
  -- Create session
  INSERT INTO public.admin_sessions (session_token, ip_address, user_agent, expires_at)
  VALUES (new_token, ip::inet, agent, NOW() + INTERVAL '24 hours')
  RETURNING id INTO session_id;
  
  -- Clean old sessions
  DELETE FROM public.admin_sessions WHERE expires_at < NOW();
  
  RETURN jsonb_build_object(
    'success', true,
    'token', new_token,
    'session_id', session_id,
    'expires_at', (NOW() + INTERVAL '24 hours')::text
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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

-- Function to update page content with session validation
CREATE OR REPLACE FUNCTION public.update_page_content(
  page_slug TEXT,
  updates JSONB,
  session_token TEXT
)
RETURNS JSONB AS $$
DECLARE
  page_uuid UUID;
  current_data JSONB;
BEGIN
  -- Validate session
  IF NOT public.validate_admin_session(session_token) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid or expired session');
  END IF;
  
  -- Get page ID and current data
  SELECT id, row_to_json(pages.*) INTO page_uuid, current_data
  FROM public.pages WHERE slug = page_slug;
  
  IF page_uuid IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Page not found');
  END IF;
  
  -- Create revision before update
  INSERT INTO public.content_revisions (page_id, revision_type, revision_data, revision_note)
  VALUES (page_uuid, 'page', current_data, 'Page content updated via CMS');
  
  -- Update page fields dynamically
  UPDATE public.pages 
  SET 
    title = COALESCE(updates->>'title', title),
    subtitle = COALESCE(updates->>'subtitle', subtitle),
    description = COALESCE(updates->>'description', description),
    meta_description = COALESCE(updates->>'meta_description', meta_description),
    meta_data = COALESCE(updates->'meta_data', meta_data),
    is_published = COALESCE((updates->>'is_published')::boolean, is_published),
    updated_at = NOW()
  WHERE id = page_uuid;
  
  RETURN jsonb_build_object('success', true, 'page_id', page_uuid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update content blocks
CREATE OR REPLACE FUNCTION public.update_content_blocks(
  page_id UUID,
  blocks JSONB,
  session_token TEXT
)
RETURNS JSONB AS $$
DECLARE
  current_blocks JSONB;
  block JSONB;
  i INTEGER;
BEGIN
  -- Validate session
  IF NOT public.validate_admin_session(session_token) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid or expired session');
  END IF;
  
  -- Get current blocks for revision
  SELECT jsonb_agg(row_to_json(cb.*) ORDER BY order_index) INTO current_blocks
  FROM public.content_blocks cb
  WHERE cb.page_id = update_content_blocks.page_id;
  
  -- Create revision
  INSERT INTO public.content_revisions (page_id, revision_type, revision_data, revision_note)
  VALUES (page_id, 'blocks', COALESCE(current_blocks, '[]'::jsonb), 'Content blocks updated');
  
  -- Delete existing blocks
  DELETE FROM public.content_blocks WHERE content_blocks.page_id = update_content_blocks.page_id;
  
  -- Insert new blocks
  FOR i IN 0..jsonb_array_length(blocks) - 1 LOOP
    block := blocks->i;
    INSERT INTO public.content_blocks (
      page_id, 
      block_type, 
      order_index, 
      content, 
      style_config, 
      is_visible
    ) VALUES (
      page_id,
      block->>'type',
      i,
      COALESCE(block->'content', '{}'::jsonb),
      COALESCE(block->'style_config', '{}'::jsonb),
      COALESCE((block->>'is_visible')::boolean, true)
    );
  END LOOP;
  
  RETURN jsonb_build_object('success', true, 'count', jsonb_array_length(blocks));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions for anonymous users (for RPC calls)
GRANT EXECUTE ON FUNCTION public.create_admin_session TO anon;
GRANT EXECUTE ON FUNCTION public.validate_admin_session TO anon;
GRANT EXECUTE ON FUNCTION public.update_page_content TO anon;
GRANT EXECUTE ON FUNCTION public.update_content_blocks TO anon;