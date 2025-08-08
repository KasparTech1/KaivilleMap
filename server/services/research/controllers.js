const { normalizeAndValidate } = require('./normalizer');
const { createEmbeddingsForArticle } = require('./embeddings');
const { supabase } = require('./supabaseClient');

// Helpers
function badRequest(res, message, code = 'bad_request') {
  return res.status(400).json({ error: { code, message } });
}
function serverError(res, message) {
  return res.status(500).json({ error: { code: 'server_error', message } });
}

// POST /api/research/paste
async function pasteHandler(req, res) {
  try {
    const { content, metadata } = req.body || {};
    if (!content || typeof content !== 'string') return badRequest(res, 'content is required');

    // Create upload record (queued)
    const { data: upload, error: upErr } = await supabase
      .from('research_uploads')
      .insert({ user_id: null, processing_status: 'queued' })
      .select('*')
      .single();
    if (upErr) return serverError(res, upErr.message);

    // Normalize & validate
    const norm = await normalizeAndValidate({ rawText: content, metadata });
    if (!norm.ok) return badRequest(res, norm.message);

    // Dedup by content_hash
    const { data: dup, error: dupErr } = await supabase
      .from('research_articles')
      .select('id, slug')
      .eq('content_hash', norm.content_hash)
      .maybeSingle();
    if (dupErr) return serverError(res, dupErr.message);
    if (dup) return res.status(409).json({ error: { code: 'duplicate', message: 'Article already exists' }, article: dup });

    // Insert article (needs_review)
    const insertPayload = {
      slug: norm.slug,
      title: norm.title,
      subtitle: norm.subtitle,
      source_url: norm.source_url,
      source_type: norm.source_type,
      authors: norm.authors,
      publisher: norm.publisher,
      year: norm.year,
      region: norm.region,
      domains: norm.domains,
      topics: norm.topics,
      keywords: norm.keywords,
      status: 'needs_review',
      summary: norm.summary,
      key_points: norm.key_points,
      content_md: norm.content_md,
      content_html: norm.content_html,
      created_by: null,
      content_hash: norm.content_hash
    };

    const { data: article, error: artErr } = await supabase
      .from('research_articles')
      .insert(insertPayload)
      .select('*')
      .single();
    if (artErr) return serverError(res, artErr.message);

    // Link upload
    await supabase.from('research_uploads')
      .update({ processing_status: 'complete', article_id: article.id })
      .eq('id', upload.id);

    // Kick off embeddings (fire and forget)
    createEmbeddingsForArticle(article).catch(err => console.error('Embedding error:', err));

    return res.json({ article: { id: article.id, slug: article.slug, title: article.title, year: article.year, summary: article.summary }, upload_id: upload.id });
  } catch (e) {
    console.error(e);
    return serverError(res, e.message);
  }
}

// POST /api/research/upload (multipart) - TODO
async function uploadHandler(req, res) { return badRequest(res, 'Not implemented yet', 'not_implemented'); }

// POST /api/research/import-url - TODO
async function importUrlHandler(req, res) { return badRequest(res, 'Not implemented yet', 'not_implemented'); }

// GET /api/research/articles
async function listArticlesHandler(req, res) {
  try {
    const {
      q,
      domains,
      topics,
      source_type,
      region,
      year_start,
      year_end,
      sort = 'newest',
      page = 1,
      page_size = 20
    } = req.query;

    const pg = Math.max(parseInt(page, 10) || 1, 1);
    const ps = Math.min(Math.max(parseInt(page_size, 10) || 20, 1), 100);
    const from = (pg - 1) * ps;
    const to = from + ps - 1;

    let query = supabase
      .from('research_articles')
      .select('id, slug, title, year, publisher, source_type, domains, topics, summary, key_points, published_at', { count: 'exact' })
      .eq('status', 'published');

    if (domains) {
      const arr = Array.isArray(domains) ? domains : String(domains).split(',').map(s=>s.trim()).filter(Boolean);
      if (arr.length) query = query.contains('domains', arr);
    }
    if (topics) {
      const arr = Array.isArray(topics) ? topics : String(topics).split(',').map(s=>s.trim()).filter(Boolean);
      if (arr.length) query = query.contains('topics', arr);
    }
    if (source_type) {
      const arr = Array.isArray(source_type) ? source_type : String(source_type).split(',').map(s=>s.trim()).filter(Boolean);
      if (arr.length) query = query.in('source_type', arr);
    }
    if (region) {
      const arr = Array.isArray(region) ? region : String(region).split(',').map(s=>s.trim()).filter(Boolean);
      if (arr.length) query = query.in('region', arr);
    }
    if (year_start) query = query.gte('year', Number(year_start));
    if (year_end) query = query.lte('year', Number(year_end));

    if (q && typeof q === 'string' && q.trim().length > 0) {
      // Simple search: ilike title/summary. Later: .textSearch('search_fts', q)
      const term = `%${q.trim()}%`;
      query = query.or(`title.ilike.${term},summary.ilike.${term}`);
    }

    // Sorting
    if (sort === 'oldest') query = query.order('published_at', { ascending: true, nullsFirst: false });
    else query = query.order('published_at', { ascending: false, nullsFirst: false });

    // Pagination
    query = query.range(from, to);

    const { data, error, count } = await query;
    if (error) return serverError(res, error.message);

    // Facets (basic counts for now)
    const facets = { domains: [], topics: [], regions: [], years: [], source_types: [] };
    // Optional: compute via separate queries if needed in future

    return res.json({ items: data || [], page: pg, page_size: ps, total: count || 0, facets });
  } catch (e) {
    console.error(e);
    return serverError(res, e.message);
  }
}

// GET /api/research/articles/:slug
async function getArticleBySlugHandler(req, res) {
  try {
    const { slug } = req.params;
    const { data, error } = await supabase
      .from('research_articles')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .single();
    if (error) return serverError(res, error.message);
    if (!data) return res.status(404).json({ error: { code: 'not_found', message: 'Article not found' } });
    return res.json(data);
  } catch (e) {
    console.error(e);
    return serverError(res, e.message);
  }
}

// GET /api/research/tags
async function getTagsHandler(req, res) {
  try {
    const grouped = String(req.query.grouped || '').toLowerCase() === 'true';
    const { data, error } = await supabase
      .from('research_tags')
      .select('id, name, type, slug')
      .order('type', { ascending: true })
      .order('name', { ascending: true });
    if (error) return serverError(res, error.message);

    if (!grouped) return res.json(data || []);

    const out = {};
    for (const t of (data || [])) {
      if (!out[t.type]) out[t.type] = [];
      out[t.type].push(t);
    }
    return res.json(out);
  } catch (e) {
    console.error(e);
    return serverError(res, e.message);
  }
}

// GET /api/research/articles/:id/related - TODO (use embeddings + tag overlap)
async function relatedArticlesHandler(req, res) { return badRequest(res, 'Not implemented yet', 'not_implemented'); }

// POST /api/research/articles/:id/reprocess - TODO
async function reprocessHandler(req, res) { return badRequest(res, 'Not implemented yet', 'not_implemented'); }

module.exports = {
  pasteHandler,
  uploadHandler,
  importUrlHandler,
  listArticlesHandler,
  getArticleBySlugHandler,
  getTagsHandler,
  relatedArticlesHandler,
  reprocessHandler
};

