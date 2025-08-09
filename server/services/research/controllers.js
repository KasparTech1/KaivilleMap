const { normalizeAndValidate } = require('./normalizer');
const { createEmbeddingsForArticle } = require('./embeddings');
const { supabase } = require('./supabaseClient');
const templateService = require('./templateService');
const promptService = require('./promptService');

const { formatWithLLM, isLLMAvailable } = require('./llmFormatter');

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

    // LLM formatting step
    let processedContent = content;
    let llmMetadata = {};
    
    if (isLLMAvailable()) {
      try {
        console.log('Starting LLM formatting for research submission...');
        const llmResult = await formatWithLLM({ 
          rawText: content, 
          hints: metadata 
        });
        processedContent = llmResult.formatted;
        llmMetadata = {
          llmUsed: true,
          llmModel: llmResult.llmModel,
          confidence: llmResult.confidence
        };
        console.log('LLM formatting successful:', { 
          model: llmResult.llmModel, 
          confidence: llmResult.confidence?.overall,
          hadValidYAML: processedContent.trim().startsWith('---')
        });
      } catch (error) {
        console.error('LLM formatting failed, using fallback:', error);
        // Try heuristic formatting as fallback
        const { heuristicFormat } = require('./llmFormatter');
        processedContent = heuristicFormat(content);
      }
    } else {
      console.log('LLM not available, using direct parsing');
    }

    // Pass (possibly LLM-formatted) content to normalizer
    const norm = await normalizeAndValidate({ 
      rawText: processedContent, 
      metadata: { ...metadata, ...llmMetadata } 
    });
    if (!norm.ok) return badRequest(res, norm.message);

    // Dedup by content_hash
    const { data: dup, error: dupErr } = await supabase
      .from('research_articles')
      .select('id, slug')
      .eq('content_hash', norm.content_hash)
      .maybeSingle();
    if (dupErr) return serverError(res, dupErr.message);
    if (dup) return res.status(409).json({ error: { code: 'duplicate', message: 'Article already exists' }, article: dup });

    // Insert article (with conditional auto-approval)
    const autoApprove = process.env.AUTO_APPROVE_RESEARCH === 'true';
    const articleStatus = autoApprove ? 'published' : 'needs_review';
    const publishedAt = autoApprove ? new Date().toISOString() : null;
    console.log(`Inserting research article with status: ${articleStatus} (AUTO_APPROVE_RESEARCH=${process.env.AUTO_APPROVE_RESEARCH})`);
    
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
      status: articleStatus,
      summary: norm.summary,
      key_points: norm.key_points,
      content_md: norm.content_md,
      content_html: norm.content_html,
      created_by: null,
      content_hash: norm.content_hash,
      published_at: publishedAt
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
    console.log('Research list request:', { query: req.query, AUTO_APPROVE: process.env.AUTO_APPROVE_RESEARCH });
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
      page_size = 20,
      include_pending = false
    } = req.query;

    const pg = Math.max(parseInt(page, 10) || 1, 1);
    const ps = Math.min(Math.max(parseInt(page_size, 10) || 20, 1), 100);
    const from = (pg - 1) * ps;
    const to = from + ps - 1;

    let query = supabase
      .from('research_articles')
      .select('id, slug, title, year, publisher, source_type, domains, topics, summary, key_points, published_at, status', { count: 'exact' });
    
    // Filter by status
    if (include_pending === 'true' || include_pending === true) {
      query = query.in('status', ['published', 'needs_review']);
    } else {
      query = query.eq('status', 'published');
    }

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
    
    console.log(`Research articles found: ${data?.length || 0} of ${count} total (showing published only)`);

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

// DELETE /api/research/articles/:id
async function deleteArticleHandler(req, res) {
  try {
    const { id } = req.params;
    
    if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
      return badRequest(res, 'Invalid article ID');
    }
    
    console.log(`Deleting research article: ${id}`);
    
    // Delete the article (cascades will handle related records)
    const { error } = await supabase
      .from('research_articles')
      .delete()
      .eq('id', id);
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: { code: 'not_found', message: 'Article not found' } });
      }
      return serverError(res, error.message);
    }
    
    console.log(`Successfully deleted research article: ${id}`);
    return res.json({ success: true, message: 'Article deleted successfully' });
  } catch (e) {
    console.error('Delete article error:', e);
    return serverError(res, e.message);
  }
}

// POST /api/research/generate
async function generateResearchHandler(req, res) {
  try {
    const { model, prompt, templateId, promptSegments, savePrompt = true } = req.body || {};
    
    if (!model || !prompt) {
      return badRequest(res, 'model and prompt are required');
    }
    
    if (!['claude', 'gpt4', 'grok'].includes(model)) {
      return badRequest(res, 'model must be either "claude", "gpt4", or "grok"');
    }
    
    let promptRecord = null;
    const startTime = Date.now();
    
    // Save prompt if requested
    if (savePrompt && templateId) {
      try {
        promptRecord = await promptService.savePrompt({
          templateId,
          model,
          promptSegments,
          assembledPrompt: prompt
        });
      } catch (saveError) {
        console.error('Failed to save prompt:', saveError);
        // Continue with generation even if save fails
      }
    }
    
    let content = '';
    let tokensUsed = null;
    let errorMessage = null;
    
    if (model === 'claude') {
      // Use Anthropic API
      const Anthropic = require('@anthropic-ai/sdk');
      const anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_KEY
      });
      
      try {
        const response = await anthropic.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 4096,
          temperature: 0.7,
          messages: [{
            role: 'user',
            content: prompt
          }]
        });
        
        content = response.content[0].text;
        tokensUsed = response.usage?.output_tokens || null;
      } catch (error) {
        console.error('Anthropic API error:', error);
        errorMessage = error.message || 'Failed to generate research with Claude';
        return serverError(res, errorMessage);
      }
    } else if (model === 'gpt4') {
      // Use OpenAI GPT-4
      const OpenAI = require('openai');
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
      
      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-4-turbo-preview',
          messages: [{
            role: 'user',
            content: prompt
          }],
          temperature: 0.7,
          max_tokens: 4096
        });
        
        content = response.choices[0].message.content;
        tokensUsed = response.usage?.total_tokens || null;
      } catch (error) {
        console.error('OpenAI GPT-4 API error:', error);
        errorMessage = error.message || 'Failed to generate research with GPT-4';
        return serverError(res, errorMessage);
      }
    } else if (model === 'grok') {
      // Use xAI/Grok API via OpenAI client
      const OpenAI = require('openai');
      
      if (!process.env.XAI_KEY) {
        console.error('XAI_KEY environment variable not set');
        return serverError(res, 'Grok API key not configured');
      }
      
      const openai = new OpenAI({
        apiKey: process.env.XAI_KEY,
        baseURL: 'https://api.x.ai/v1'
      });
      
      try {
        console.log('Calling Grok API with prompt length:', prompt.length);
        const response = await openai.chat.completions.create({
          model: 'grok-beta',
          messages: [{
            role: 'user',
            content: prompt
          }],
          temperature: 0.7,
          max_tokens: 4096
        });
        
        content = response.choices[0].message.content;
        tokensUsed = response.usage?.total_tokens || null;
      } catch (error) {
        console.error('xAI/Grok API detailed error:', {
          message: error.message,
          status: error.status,
          response: error.response?.data,
          headers: error.response?.headers
        });
        errorMessage = `Grok API Error: ${error.message || 'Unknown error'}`;
        
        // Check for specific error types
        if (error.status === 401) {
          errorMessage = 'Invalid Grok API key. Please check XAI_KEY configuration.';
        } else if (error.status === 429) {
          errorMessage = 'Grok API rate limit exceeded. Please try again later.';
        } else if (error.status === 500) {
          errorMessage = 'Grok API server error. The service may be temporarily unavailable.';
        }
        
        return serverError(res, errorMessage);
      }
    }
    
    const responseTimeMs = Date.now() - startTime;
    
    // Save response if we have a prompt record
    if (promptRecord) {
      try {
        await promptService.saveResponse({
          promptId: promptRecord.id,
          model,
          content,
          tokensUsed,
          responseTimeMs,
          errorMessage
        });
      } catch (saveError) {
        console.error('Failed to save response:', saveError);
        // Continue even if save fails
      }
    }
    
    return res.json({ 
      content, 
      model,
      promptId: promptRecord?.id || null,
      timestamp: new Date().toISOString()
    });
  } catch (e) {
    console.error('Generate research error:', e);
    return serverError(res, e.message);
  }
}

// GET /api/research/templates
async function getTemplatesHandler(req, res) {
  try {
    const templates = await templateService.getTemplates();
    return res.json(templates);
  } catch (e) {
    console.error('Get templates error:', e);
    return serverError(res, e.message);
  }
}

// GET /api/research/templates/:id
async function getTemplateByIdHandler(req, res) {
  try {
    const { id } = req.params;
    const template = await templateService.getTemplateWithSegments(id);
    
    if (!template) {
      return res.status(404).json({ error: { code: 'not_found', message: 'Template not found' } });
    }
    
    // Also get quick starts for this template
    const quickStarts = await templateService.getQuickStarts(id);
    
    return res.json({
      ...template,
      quickStarts
    });
  } catch (e) {
    console.error('Get template error:', e);
    return serverError(res, e.message);
  }
}

// GET /api/research/templates/default
async function getDefaultTemplateHandler(req, res) {
  try {
    const template = await templateService.getDefaultTemplate();
    
    if (!template) {
      return res.status(404).json({ error: { code: 'not_found', message: 'No default template found' } });
    }
    
    // Get full template with segments
    const fullTemplate = await templateService.getTemplateWithSegments(template.id);
    const quickStarts = await templateService.getQuickStarts(template.id);
    
    return res.json({
      ...fullTemplate,
      quickStarts
    });
  } catch (e) {
    console.error('Get default template error:', e);
    return serverError(res, e.message);
  }
}

// POST /api/research/templates
async function createTemplateHandler(req, res) {
  try {
    const { name, description, icon } = req.body;
    
    if (!name) {
      return badRequest(res, 'name is required');
    }
    
    const template = await templateService.createTemplate({
      name,
      description,
      icon
    });
    
    return res.json(template);
  } catch (e) {
    console.error('Create template error:', e);
    return serverError(res, e.message);
  }
}

// PUT /api/research/templates/:id
async function updateTemplateHandler(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const template = await templateService.updateTemplate(id, updates);
    return res.json(template);
  } catch (e) {
    console.error('Update template error:', e);
    return serverError(res, e.message);
  }
}

// GET /api/research/prompts/history
async function getPromptHistoryHandler(req, res) {
  try {
    const { limit = 50, offset = 0, userId } = req.query;
    const history = await promptService.getPromptHistory(userId, parseInt(limit), parseInt(offset));
    return res.json(history);
  } catch (e) {
    console.error('Get prompt history error:', e);
    return serverError(res, e.message);
  }
}

// GET /api/research/prompts/:id
async function getPromptByIdHandler(req, res) {
  try {
    const { id } = req.params;
    const prompt = await promptService.getPromptWithResponse(id);
    
    if (!prompt) {
      return res.status(404).json({ error: { code: 'not_found', message: 'Prompt not found' } });
    }
    
    return res.json(prompt);
  } catch (e) {
    console.error('Get prompt error:', e);
    return serverError(res, e.message);
  }
}

// GET /api/research/prompts/stats
async function getPromptStatsHandler(req, res) {
  try {
    const { userId } = req.query;
    const stats = await promptService.getPromptStats(userId);
    return res.json(stats);
  } catch (e) {
    console.error('Get prompt stats error:', e);
    return serverError(res, e.message);
  }
}

// POST /api/research/prompts/:id/clone
async function clonePromptHandler(req, res) {
  try {
    const { id } = req.params;
    const cloned = await promptService.clonePrompt(id);
    return res.json(cloned);
  } catch (e) {
    console.error('Clone prompt error:', e);
    return serverError(res, e.message);
  }
}

// POST /api/research/segment-options
async function createSegmentOptionHandler(req, res) {
  try {
    const optionData = req.body;
    
    if (!optionData.segment_id || !optionData.option_key || !optionData.display_text || !optionData.prompt_text) {
      return badRequest(res, 'segment_id, option_key, display_text, and prompt_text are required');
    }
    
    const option = await templateService.createSegmentOption(optionData);
    return res.json(option);
  } catch (e) {
    console.error('Create segment option error:', e);
    return serverError(res, e.message);
  }
}

// PUT /api/research/segment-options/:id
async function updateSegmentOptionHandler(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const option = await templateService.updateSegmentOption(id, updates);
    return res.json(option);
  } catch (e) {
    console.error('Update segment option error:', e);
    return serverError(res, e.message);
  }
}

// GET /api/research/status - Check API configuration
async function getStatusHandler(req, res) {
  try {
    const status = {
      anthropic: !!process.env.ANTHROPIC_KEY,
      openai: !!process.env.OPENAI_API_KEY,
      xai: !!process.env.XAI_KEY,
      supabase: !!process.env.SUPABASE_URL && !!process.env.SUPABASE_SERVICE_KEY
    };
    
    return res.json({
      configured: status,
      models: {
        claude: status.anthropic ? 'configured' : 'missing ANTHROPIC_KEY',
        gpt4: status.openai ? 'configured' : 'missing OPENAI_API_KEY',
        grok: status.xai ? 'configured' : 'missing XAI_KEY'
      }
    });
  } catch (e) {
    console.error('Get status error:', e);
    return serverError(res, e.message);
  }
}

module.exports = {
  pasteHandler,
  uploadHandler,
  importUrlHandler,
  listArticlesHandler,
  getArticleBySlugHandler,
  getTagsHandler,
  relatedArticlesHandler,
  reprocessHandler,
  deleteArticleHandler,
  generateResearchHandler,
  getTemplatesHandler,
  getTemplateByIdHandler,
  getDefaultTemplateHandler,
  createTemplateHandler,
  updateTemplateHandler,
  getPromptHistoryHandler,
  getPromptByIdHandler,
  getPromptStatsHandler,
  clonePromptHandler,
  createSegmentOptionHandler,
  updateSegmentOptionHandler,
  getStatusHandler
};

