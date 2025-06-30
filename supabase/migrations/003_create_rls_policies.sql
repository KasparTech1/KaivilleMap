-- Enable RLS on all tables
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_categories ENABLE ROW LEVEL SECURITY;

-- Assets table policies
-- Public read access for all assets
CREATE POLICY "Assets are viewable by everyone" ON public.assets
  FOR SELECT USING (true);

-- Only authenticated users can insert assets
CREATE POLICY "Authenticated users can upload assets" ON public.assets
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Only authenticated users can update their own assets (future feature)
CREATE POLICY "Users can update their own assets" ON public.assets
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Only authenticated users can delete their own assets (future feature)
CREATE POLICY "Users can delete their own assets" ON public.assets
  FOR DELETE USING (auth.role() = 'authenticated');

-- Pages table policies
-- Public read access for published pages
CREATE POLICY "Published pages are viewable by everyone" ON public.pages
  FOR SELECT USING (status = 'published' OR auth.role() = 'authenticated');

-- Only authenticated users can create pages
CREATE POLICY "Authenticated users can create pages" ON public.pages
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Only authenticated users can update pages
CREATE POLICY "Authenticated users can update pages" ON public.pages
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Only authenticated users can delete pages
CREATE POLICY "Authenticated users can delete pages" ON public.pages
  FOR DELETE USING (auth.role() = 'authenticated');

-- Page assets policies
-- Public read access
CREATE POLICY "Page assets are viewable by everyone" ON public.page_assets
  FOR SELECT USING (true);

-- Only authenticated users can manage page assets
CREATE POLICY "Authenticated users can manage page assets" ON public.page_assets
  FOR ALL USING (auth.role() = 'authenticated');

-- Maps table policies
-- Public read access
CREATE POLICY "Maps are viewable by everyone" ON public.maps
  FOR SELECT USING (true);

-- Only authenticated users can manage maps
CREATE POLICY "Authenticated users can manage maps" ON public.maps
  FOR ALL USING (auth.role() = 'authenticated');

-- Categories table policies
-- Public read access
CREATE POLICY "Categories are viewable by everyone" ON public.categories
  FOR SELECT USING (true);

-- Only authenticated users can manage categories
CREATE POLICY "Authenticated users can manage categories" ON public.categories
  FOR ALL USING (auth.role() = 'authenticated');

-- Asset categories policies
-- Public read access
CREATE POLICY "Asset categories are viewable by everyone" ON public.asset_categories
  FOR SELECT USING (true);

-- Only authenticated users can manage asset categories
CREATE POLICY "Authenticated users can manage asset categories" ON public.asset_categories
  FOR ALL USING (auth.role() = 'authenticated');

-- Storage policies for kaiville-assets bucket (public bucket)
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'kaiville-assets');

CREATE POLICY "Authenticated users can upload to kaiville-assets" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'kaiville-assets' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update in kaiville-assets" ON storage.objects
  FOR UPDATE USING (bucket_id = 'kaiville-assets' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete from kaiville-assets" ON storage.objects
  FOR DELETE USING (bucket_id = 'kaiville-assets' AND auth.role() = 'authenticated');

-- Storage policies for user-content bucket (private bucket)
CREATE POLICY "Users can view their own content" ON storage.objects
  FOR SELECT USING (bucket_id = 'user-content' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own content" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'user-content' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own content" ON storage.objects
  FOR UPDATE USING (bucket_id = 'user-content' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own content" ON storage.objects
  FOR DELETE USING (bucket_id = 'user-content' AND auth.uid()::text = (storage.foldername(name))[1]);