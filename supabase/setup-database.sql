-- Kaiville Database Setup
-- Generated at 2025-06-30T15:14:44.076Z

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create assets table
CREATE TABLE public.assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bucket_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT,
  file_size BIGINT,
  mime_type TEXT,
  width INTEGER,
  height INTEGER,
  metadata JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(bucket_name, file_path)
);

-- Create pages table
CREATE TABLE public.pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content JSONB DEFAULT '{}',
  meta_data JSONB DEFAULT '{}',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create page_assets junction table
CREATE TABLE public.page_assets (
  page_id UUID REFERENCES public.pages(id) ON DELETE CASCADE,
  asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE,
  usage_type TEXT DEFAULT 'inline',
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  PRIMARY KEY (page_id, asset_id)
);

-- Create maps table
CREATE TABLE public.maps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  asset_id UUID REFERENCES public.assets(id) ON DELETE SET NULL,
  bounds JSONB,
  zoom_levels JSONB,
  interactive_regions JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  parent_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create asset_categories junction table
CREATE TABLE public.asset_categories (
  asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  PRIMARY KEY (asset_id, category_id)
);

-- Create indexes for better performance
CREATE INDEX idx_assets_bucket_name ON public.assets(bucket_name);
CREATE INDEX idx_assets_tags ON public.assets USING GIN(tags);
CREATE INDEX idx_assets_metadata ON public.assets USING GIN(metadata);
CREATE INDEX idx_pages_slug ON public.pages(slug);
CREATE INDEX idx_pages_status ON public.pages(status);
CREATE INDEX idx_categories_slug ON public.categories(slug);
CREATE INDEX idx_categories_parent_id ON public.categories(parent_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER set_assets_updated_at
  BEFORE UPDATE ON public.assets
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_pages_updated_at
  BEFORE UPDATE ON public.pages
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_maps_updated_at
  BEFORE UPDATE ON public.maps
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

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