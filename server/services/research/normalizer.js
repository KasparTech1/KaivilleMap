const crypto = require('crypto');
const { renderMarkdownToHtml } = require('./markdown');

/**
 * ARCHITECTURE PLANNING - LLM ENHANCEMENT
 * ======================================
 * 
 * CURRENT STATE:
 * - Strict YAML frontmatter parser
 * - Rejects malformed submissions
 * - No intelligence in parsing
 * 
 * FUTURE STATE:
 * - This remains as validation layer
 * - LLM formatter preprocesses content
 * - This validates LLM output
 * 
 * TODO:
 * [ ] Add metadata for LLM confidence scores
 * [ ] Track which fields were LLM-generated
 * [ ] Add fallback for partial parsing
 * [ ] Log parsing success metrics
 */

function slugify(input) {
  return input.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
    .slice(0, 120);
}

function sha256(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

// Minimal normalizer: expects Kaiville Research Markdown with YAML frontmatter
// For MVP: parse frontmatter and render HTML with remark/rehype; LLM cleanup later
async function normalizeAndValidate({ rawText, metadata }) {
  /**
   * TODO: ENHANCED VALIDATION
   * ========================
   * 
   * If metadata.llmUsed === true:
   * - Trust the formatting more
   * - Log confidence scores
   * - Track LLM performance
   * 
   * Future enhancements:
   * - Partial validation (accept incomplete but valid data)
   * - Suggest corrections instead of rejecting
   * - Return validation score instead of binary ok/fail
   */
  // naive YAML frontmatter parse
  const fmMatch = rawText.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!fmMatch) return { ok: false, message: 'Missing YAML frontmatter (--- ... ---)' };

  const yaml = fmMatch[1];
  const body = fmMatch[2];

  // quick parse key: value and simple arrays ["a","b"]
  const front = {};
  yaml.split(/\r?\n/).forEach(line => {
    const m = line.match(/^([a-zA-Z0-9_]+):\s*(.*)$/);
    if (m) {
      const k = m[1]; let v = m[2];
      if (v.startsWith('[')) {
        try { v = JSON.parse(v.replace(/'/g, '"')); } catch { v = []; }
      } else {
        v = v.replace(/^"|"$/g, '').replace(/^'|'$/g, '');
      }
      front[k] = v;
    }
  });

  const title = front.title;
  const year = front.year || (front.published_at && new Date(front.published_at).getFullYear());
  const domains = front.domains || [];
  const topics = front.topics || [];
  if (!title) return { ok: false, message: 'title is required' };
  if (!year) return { ok: false, message: 'year or published_at is required' };
  if ((domains.length + topics.length) === 0) return { ok: false, message: 'at least one domain/topic is required' };

  // Prepare fields
  const content_md = body.trim();
  const content_hash = sha256(content_md);
  const slug = slugify(title + '-' + content_hash.slice(0, 8));
  const content_html = await renderMarkdownToHtml(content_md);

  return {
    ok: true,
    slug,
    title,
    subtitle: front.subtitle || null,
    source_url: front.source_url || null,
    source_type: front.source_type || 'other',
    authors: front.authors || [],
    publisher: front.publisher || null,
    year: year || null,
    region: front.region || null,
    domains,
    topics,
    keywords: front.keywords || [],
    summary: front.summary || null,
    key_points: front.key_points || [],
    content_md,
    content_html,
    content_hash
  };
}

module.exports = { normalizeAndValidate };

