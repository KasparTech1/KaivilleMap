-- Add display_order column to articles table for drag-and-drop reordering
ALTER TABLE articles ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT NULL;

-- Create index for better performance when ordering articles
CREATE INDEX IF NOT EXISTS idx_articles_display_order ON articles(display_order);

-- Add comment to explain the column
COMMENT ON COLUMN articles.display_order IS 'Order for displaying articles in the news feed. Lower numbers appear first.';