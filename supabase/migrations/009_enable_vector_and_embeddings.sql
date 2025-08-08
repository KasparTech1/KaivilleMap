-- Enable pgvector and create embeddings table (1536D)

CREATE EXTENSION IF NOT EXISTS vector;

-- Embeddings table
CREATE TABLE public.research_article_embeddings (
  article_id UUID NOT NULL REFERENCES public.research_articles(id) ON DELETE CASCADE,
  chunk_id INTEGER NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  chunk_text TEXT,
  embedding VECTOR(1536) NOT NULL,
  token_count INTEGER DEFAULT 0,
  PRIMARY KEY (article_id, chunk_id)
);

-- Choose HNSW (good default). If not supported in your pgvector version, switch to IVFFLAT.
-- For IVFFLAT, you must ANALYZE and set lists; for HNSW, specify m/ef_construction if desired.

-- Index for vector similarity
CREATE INDEX research_embeddings_hnsw_idx
ON public.research_article_embeddings
USING hnsw (embedding vector_cosine_ops);

-- Fast lookup by article
CREATE INDEX idx_research_embeddings_article
ON public.research_article_embeddings(article_id);

