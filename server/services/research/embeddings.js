const { supabase } = require('./supabaseClient');
const crypto = require('crypto');

// Placeholder embedding using SHA256 as fake vector (for wiring only). Replace with real provider.
function fakeVector1536(text) {
  // produce deterministic 1536-dim pseudo-vector
  const bytes = Buffer.from(crypto.createHash('sha256').update(text).digest('hex'));
  const arr = new Array(1536).fill(0).map((_, i) => (bytes[i % bytes.length] / 255));
  return arr;
}

async function createEmbeddingsForArticle(article) {
  try {
    if (!article || !article.id) return;
    const chunks = [article.content_md || ''];

    const rows = chunks.map((chunk, idx) => ({
      article_id: article.id,
      chunk_id: idx,
      order: idx,
      chunk_text: chunk.slice(0, 8000),
      embedding: fakeVector1536(chunk)
    }));

    // Upsert rows
    for (const row of rows) {
      await supabase.from('research_article_embeddings').upsert(row, { onConflict: 'article_id,chunk_id' });
    }
  } catch (e) {
    console.error('Embedding generation failed:', e.message);
  }
}

module.exports = { createEmbeddingsForArticle };

