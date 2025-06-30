-- Create storage buckets for Kaiville assets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('kaiville-assets', 'kaiville-assets', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp', 'application/pdf']),
  ('user-content', 'user-content', false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']);

-- Create folder structure (folders are created automatically when files are uploaded to paths)
-- Example paths that will be used:
-- kaiville-assets/maps/svg/full/
-- kaiville-assets/maps/svg/optimized/
-- kaiville-assets/maps/svg/animated/
-- kaiville-assets/maps/images/thumbnails/
-- kaiville-assets/maps/images/medium/
-- kaiville-assets/maps/images/original/
-- kaiville-assets/maps/data/
-- kaiville-assets/site-assets/logos/
-- kaiville-assets/site-assets/icons/
-- kaiville-assets/site-assets/backgrounds/
-- kaiville-assets/site-assets/illustrations/
-- kaiville-assets/documents/
-- user-content/avatars/
-- user-content/submissions/