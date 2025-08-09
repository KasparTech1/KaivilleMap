const { normalizeAndValidate } = require('./normalizer');
const { createEmbeddingsForArticle } = require('./embeddings');
const { supabase } = require('./supabaseClient');
const templateService = require('./templateService');
const promptService = require('./promptService');
const webSearchService = require('./webSearchService');
const costCalculator = require('./costCalculator');

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
    // Set a longer timeout for this endpoint (5 minutes)
    req.setTimeout(5 * 60 * 1000); // 5 minutes
    res.setTimeout(5 * 60 * 1000); // 5 minutes
    
    const { model, prompt, templateId, promptSegments, savePrompt = true } = req.body || {};
    
    console.log(`Research generation started: Model=${model}, Prompt length=${prompt?.length || 0}`);
    
    if (!model || !prompt) {
      return badRequest(res, 'model and prompt are required');
    }
    
    if (!['claude', 'gpt5', 'grok'].includes(model)) {
      return badRequest(res, 'model must be either "claude", "gpt5", or "grok"');
    }
    
    // Add source citation and disclaimer instructions to every prompt
    const currentDate = new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    const enhancedPrompt = `Today's date is ${currentDate}. You have access to current web information and should use it for this research.

${prompt}

CRITICAL RESEARCH REQUIREMENTS:
1. Use web search to find the MOST CURRENT information available (as of ${currentDate})
2. Prioritize recent sources from 2024-2025 when available
3. Include specific dates for all time-sensitive information
4. Cite at least 5-10 credible sources throughout your response
5. Use a mix of industry reports, academic papers, news articles, and expert analyses
6. Verify facts across multiple sources before including them
7. When discussing trends or forecasts, explicitly state the timeframe
8. Include URLs for all web sources cited

FORMAT YOUR RESPONSE AS FOLLOWS:
- Executive Summary (with key findings and date of research)
- Detailed Analysis (with inline citations [1], [2], etc.)
- Current Market/Industry Status (as of ${currentDate})
- Future Outlook and Recommendations
- Sources and References (numbered list with full citations and URLs)

At the end, include:
---
SOURCES AND REFERENCES:
[List all sources with publication dates and URLs]

DISCLAIMER: This research report was generated by ${model.toUpperCase()} AI on ${new Date().toLocaleString()} and includes web-sourced information current as of this date. While AI systems strive to provide reliable information, please verify critical data points and consult with domain experts for business-critical decisions.
---`;
    
    // Try to get web search context if available
    let webContext = '';
    if (process.env.SERPER_API_KEY || process.env.BING_SEARCH_KEY) {
      try {
        console.log('Fetching web search context for enhanced research...');
        webContext = await webSearchService.generateSearchContext(prompt);
        if (webContext) {
          console.log('Successfully retrieved web search context');
        }
      } catch (searchError) {
        console.error('Web search error (continuing without):', searchError.message);
      }
    }
    
    // Add web context to the prompt if available
    const finalPrompt = webContext ? enhancedPrompt + webContext : enhancedPrompt;
    
    let promptRecord = null;
    const startTime = Date.now();
    
    // Always save prompt to ensure we track API usage
    try {
      promptRecord = await promptService.savePrompt({
        templateId: templateId || null, // Use null instead of 'direct'
        model,
        promptSegments: promptSegments || {},
        assembledPrompt: prompt,
        metadata: {
          timestamp: new Date().toISOString(),
          ip: req.ip,
          userAgent: req.headers['user-agent']
        }
      });
      console.log(`Prompt saved with ID: ${promptRecord?.id}`);
    } catch (saveError) {
      console.error('Failed to save prompt:', saveError);
      // Continue with generation even if save fails
    }
    
    let content = '';
    let tokensUsed = null;
    let errorMessage = null;
    let thinkingProcess = [];
    let modelVersion = '';
    let inputTokens = 0;
    let outputTokens = 0;
    let cost = null;
    
    if (model === 'claude') {
      // Use Anthropic API
      const Anthropic = require('@anthropic-ai/sdk');
      const anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_KEY
      });
      
      try {
        modelVersion = 'claude-opus-4-1-20250805';
        thinkingProcess.push('Initializing Claude Opus 4.1 with extended thinking capabilities...');
        thinkingProcess.push('Preparing deep research with 200K context window...');
        thinkingProcess.push('Engaging superior reasoning capabilities for comprehensive analysis...');
        
        // Use Claude Opus 4.1 - the most capable model with extended thinking
        const response = await anthropic.messages.create({
          model: modelVersion,
          max_tokens: 8192, // Increased for comprehensive research
          temperature: 0.7,
          system: `You are a professional research analyst for Kaspar Companies with access to current web information. Today is ${currentDate}. 

Your capabilities include:
- Accessing real-time web information and current data
- Analyzing recent market trends and industry reports
- Providing citations with dates and URLs
- Cross-referencing multiple sources for accuracy

IMPORTANT: Start your response with a "THINKING PROCESS" section that shows your research approach, then proceed with the main analysis.

Always prioritize the most recent information available and clearly indicate the date of any statistics or trends you cite. Format your response with clear sections, bullet points, and numbered citations.`,
          messages: [{
            role: 'user',
            content: finalPrompt
          }]
        });
        
        content = response.content[0].text;
        inputTokens = response.usage?.input_tokens || 0;
        outputTokens = response.usage?.output_tokens || 0;
        tokensUsed = inputTokens + outputTokens;
        
        // Calculate cost
        cost = costCalculator.calculateCost('claude', modelVersion, inputTokens, outputTokens);
        thinkingProcess.push(`Tokens used: ${tokensUsed} (Input: ${inputTokens}, Output: ${outputTokens})`);
        thinkingProcess.push(`Estimated cost: ${costCalculator.formatCost(cost.totalCost)}`);
        
        // Save response immediately to prevent loss
        if (promptRecord && content) {
          try {
            await promptService.saveResponse({
              promptId: promptRecord.id,
              model,
              content,
              tokensUsed,
              responseTimeMs: Date.now() - startTime,
              metadata: { modelVersion, cost }
            });
            console.log(`Claude response saved immediately, tokens: ${tokensUsed}`);
          } catch (saveError) {
            console.error('Failed to save Claude response:', saveError);
          }
        }
      } catch (error) {
        console.error('Anthropic API error:', error);
        errorMessage = error.message || 'Failed to generate research with Claude';
        return serverError(res, errorMessage);
      }
    } else if (model === 'gpt5') {
      // Use OpenAI GPT-5
      const OpenAI = require('openai');
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
      
      try {
        modelVersion = 'gpt-5';
        thinkingProcess.push('Initializing GPT-5 unified intelligence system...');
        thinkingProcess.push('Activating deep reasoning for complex problems...');
        thinkingProcess.push('Leveraging 45% reduced hallucination rate for accuracy...');
        thinkingProcess.push('Engaging expert-level response generation...');
        
        // Check if we should use Responses API for GPT-5 (default to false for stability)
        const useResponsesAPI = process.env.USE_GPT5_RESPONSES_API === 'true';
        
        console.log(`GPT-5 API call starting... useResponsesAPI=${useResponsesAPI}`);
        const apiStartTime = Date.now();
        
        if (useResponsesAPI) {
          // Use the new Responses API for GPT-5 with web browsing
          const response = await openai.responses.create({
            model: modelVersion,
            input: finalPrompt,
            reasoning: {
              effort: "medium" // Increased for comprehensive research with web access
            },
            text: {
              verbosity: "high" // Increased for detailed research reports
            },
            tools: [
              {
                type: "web_browser"
              }
            ]
          });
          
          // Debug the response structure
          console.log('GPT-5 Responses API response structure:', {
            hasChoices: !!response.choices,
            hasText: !!response.text,
            hasContent: !!response.content,
            responseKeys: Object.keys(response),
            choicesLength: response.choices?.length
          });
          
          content = response.output_text || response.choices?.[0]?.text || response.text || response.content || response.choices?.[0]?.message?.content;
          
          if (!content) {
            console.error('No content found in GPT-5 Responses API response:', response);
            content = 'Error: GPT-5 response received but no content could be extracted';
          }
          
          // Extract usage from responses API format
          inputTokens = response.usage?.prompt_tokens || response.usage?.input_tokens || 0;
          outputTokens = response.usage?.completion_tokens || response.usage?.output_tokens || 0;
        } else {
          // Fallback to Chat Completions API with tools
          const response = await openai.chat.completions.create({
            model: modelVersion,
            messages: [
              {
                role: 'system',
                content: `You are a professional research analyst for Kaspar Companies with web browsing capabilities. Today is ${currentDate}.

Your capabilities include:
- REAL-TIME WEB BROWSING: Use the web browser tool to search for current information
- Accessing live data from industry reports, news, and research papers  
- Cross-referencing multiple current sources for accuracy
- Analyzing the most recent market trends and developments
- Deep analytical thinking and comprehensive research

CRITICAL INSTRUCTIONS:
1. ALWAYS use web browsing to find current 2024-2025 information
2. Search for multiple sources on each topic to ensure accuracy
3. Include specific URLs, publication dates, and source names
4. Start with a detailed "THINKING PROCESS" showing your research approach
5. Provide comprehensive analysis with current data and statistics

Search Strategy:
- Begin with broad searches, then narrow to specific topics
- Look for industry reports, technical papers, and recent news
- Verify facts across multiple authoritative sources
- Include both established sources and emerging research`
              },
              {
                role: 'user',
                content: finalPrompt
              }
            ],
            tools: [
              {
                type: "function",
                function: {
                  name: "web_browser",
                  description: "Browse the web to find current information"
                }
              }
            ],
            tool_choice: "auto",
            temperature: 0.7,
            max_tokens: 6144 // Increased for comprehensive research with web data
          });
          
          content = response.choices[0].message.content;
          inputTokens = response.usage?.prompt_tokens || 0;
          outputTokens = response.usage?.completion_tokens || 0;
        }
        
        tokensUsed = inputTokens + outputTokens;
        
        const apiDuration = Date.now() - apiStartTime;
        console.log(`GPT-5 API call completed in ${apiDuration}ms, tokens: ${tokensUsed}`);
        
        // Calculate cost for GPT-5
        cost = costCalculator.calculateCost('gpt5', modelVersion, inputTokens, outputTokens);
        thinkingProcess.push(`Tokens used: ${tokensUsed} (Input: ${inputTokens}, Output: ${outputTokens})`);
        thinkingProcess.push(`Estimated cost: ${costCalculator.formatCost(cost.totalCost)}`);
        
        // Save response immediately to prevent loss on timeout
        if (promptRecord && content) {
          try {
            await promptService.saveResponse({
              promptId: promptRecord.id,
              model,
              content,
              tokensUsed,
              responseTimeMs: Date.now() - startTime,
              metadata: { modelVersion, cost, apiDuration }
            });
            console.log(`GPT-5 response saved immediately, tokens: ${tokensUsed}, duration: ${apiDuration}ms`);
          } catch (saveError) {
            console.error('Failed to save GPT-5 response:', saveError);
          }
        }
      } catch (error) {
        console.error('OpenAI GPT-5 API detailed error:', {
          message: error.message,
          status: error.status,
          type: error.type,
          code: error.code,
          response: error.response?.data,
          headers: error.response?.headers,
          model: modelVersion
        });
        
        // Check for specific error types
        if (error.status === 404) {
          errorMessage = 'GPT-5 model not found. Your OpenAI account may not have access yet. Please check your account status.';
        } else if (error.status === 401) {
          errorMessage = 'Invalid OpenAI API key. Please check OPENAI_API_KEY configuration.';
        } else if (error.status === 429) {
          errorMessage = 'OpenAI API rate limit exceeded. Please try again later.';
        } else {
          errorMessage = `GPT-5 API Error: ${error.message || 'Unknown error'}`;
        }
        
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
        modelVersion = 'grok-4-0709';
        thinkingProcess.push('Initializing Grok 4 with frontier intelligence...');
        thinkingProcess.push('Activating native tool use and real-time search...');
        thinkingProcess.push('Engaging 256K context window for comprehensive analysis...');
        thinkingProcess.push('Multi-agent reasoning system preparing analysis...');
        
        console.log('Calling Grok API:', {
          baseURL: 'https://api.x.ai/v1',
          model: modelVersion,
          keyLength: process.env.XAI_KEY?.length,
          keyPrefix: process.env.XAI_KEY?.substring(0, 10) + '...'
        });
        
        const response = await openai.chat.completions.create({
          model: modelVersion, // Grok 4
          messages: [
            {
              role: 'system',
              content: `You are a professional research analyst for Kaspar Companies using Grok's real-time web access. Today is ${currentDate}.

Your UNIQUE capabilities include:
- Real-time access to current web information and breaking news
- Ability to search and analyze the latest data from across the internet
- Access to social media trends and real-time market sentiment
- Up-to-the-minute industry updates and reports

LEVERAGE YOUR REAL-TIME ACCESS: Unlike other AI models, you have direct access to current information. Use this to provide the most up-to-date research possible. Include timestamps for all real-time data and clearly indicate when information was last updated.

IMPORTANT: Show your "THINKING PROCESS" including how you're using tools and real-time search.`
            },
            {
              role: 'user',
              content: finalPrompt
            }
          ],
          temperature: 0.7,
          max_tokens: 256000 // Grok 4 supports 256K context
        });
        
        content = response.choices[0].message.content;
        inputTokens = response.usage?.prompt_tokens || 0;
        outputTokens = response.usage?.completion_tokens || 0;
        tokensUsed = response.usage?.total_tokens || 0;
        
        // Calculate cost for Grok 4
        cost = costCalculator.calculateCost('grok', modelVersion, inputTokens, outputTokens);
        thinkingProcess.push(`Tokens used: ${tokensUsed} (Input: ${inputTokens}, Output: ${outputTokens})`);
        thinkingProcess.push(`Estimated cost: ${costCalculator.formatCost(cost.totalCost)}`);
        
        // Save response immediately to prevent loss
        if (promptRecord && content) {
          try {
            await promptService.saveResponse({
              promptId: promptRecord.id,
              model,
              content,
              tokensUsed,
              responseTimeMs: Date.now() - startTime,
              metadata: { modelVersion, cost }
            });
            console.log(`Grok response saved immediately, tokens: ${tokensUsed}`);
          } catch (saveError) {
            console.error('Failed to save Grok response:', saveError);
          }
        }
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
    
    // Final save attempt if not already saved (e.g., for error cases)
    if (promptRecord && !content && errorMessage) {
      try {
        await promptService.saveResponse({
          promptId: promptRecord.id,
          model,
          content: errorMessage,
          tokensUsed: 0,
          responseTimeMs,
          errorMessage,
          metadata: { status: 'error' }
        });
        console.log('Error response saved for tracking');
      } catch (saveError) {
        console.error('Failed to save error response:', saveError);
      }
    }
    
    // Generate user ID for guest tracking
    const guestUserId = req.headers['x-guest-id'] || `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const responsePayload = { 
      content, 
      model,
      modelVersion,
      promptId: promptRecord?.id || null,
      timestamp: new Date().toISOString(),
      thinking: thinkingProcess,
      usage: {
        inputTokens,
        outputTokens,
        totalTokens: tokensUsed,
        cost: cost || null
      },
      metadata: {
        responseTimeMs,
        userId: guestUserId,
        webSearchUsed: !!webContext,
        promptLength: prompt.length,
        responseLength: content.length
      }
    };
    
    console.log('Sending response to client:', {
      hasContent: !!responsePayload.content,
      contentLength: responsePayload.content?.length || 0,
      contentPreview: (responsePayload.content && typeof responsePayload.content === 'string') 
        ? responsePayload.content.substring(0, 100) + '...' 
        : 'No content preview available',
      model: responsePayload.model,
      tokensUsed: responsePayload.usage.totalTokens
    });
    
    return res.json(responsePayload);
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
      },
      debug: {
        xaiKeyLength: process.env.XAI_KEY?.length || 0,
        xaiKeyPrefix: process.env.XAI_KEY ? process.env.XAI_KEY.substring(0, 8) + '...' : 'not set'
      }
    });
  } catch (e) {
    console.error('Get status error:', e);
    return serverError(res, e.message);
  }
}

// GET /api/research/test-gpt5 - Test GPT-5 API connection
async function testGPT5Handler(req, res) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.json({ 
        success: false, 
        error: 'OPENAI_API_KEY not found in environment variables',
        envKeys: Object.keys(process.env).filter(k => k.includes('OPENAI') || k.includes('KEY')).sort()
      });
    }

    const OpenAI = require('openai');
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    console.log('Testing GPT-5 API connection...');
    
    try {
      // Try a simple completion with GPT-5
      const response = await openai.chat.completions.create({
        model: 'gpt-5',
        messages: [{ role: 'user', content: 'Say "Hello from GPT-5!"' }],
        max_tokens: 10
      });

      return res.json({ 
        success: true, 
        response: response.choices[0].message.content,
        model: response.model,
        usage: response.usage
      });
    } catch (apiError) {
      console.error('GPT-5 API test error:', {
        message: apiError.message,
        status: apiError.status,
        type: apiError.type,
        code: apiError.code,
        response: apiError.response?.data
      });
      
      return res.json({ 
        success: false, 
        error: apiError.message,
        status: apiError.status,
        type: apiError.type,
        details: apiError.response?.data,
        suggestion: apiError.status === 404 ? 
          'GPT-5 may not be available for your account yet. Check OpenAI dashboard for access.' : 
          'Check your API key and account status'
      });
    }
  } catch (e) {
    console.error('Test GPT-5 handler error:', e);
    return res.json({ success: false, error: e.message });
  }
}

// GET /api/research/prompts/recent - Get recent prompts with responses
async function getRecentPromptsHandler(req, res) {
  try {
    const { limit = 10, userId } = req.query;
    const guestUserId = userId || req.headers['x-guest-id'];
    
    const recentPrompts = await promptService.getPromptHistory(guestUserId, parseInt(limit));
    
    return res.json({
      prompts: recentPrompts,
      message: 'Recent prompts with responses retrieved successfully'
    });
  } catch (e) {
    console.error('Get recent prompts error:', e);
    return serverError(res, e.message);
  }
}

// GET /api/research/test-grok - Test Grok API connection
async function testGrokHandler(req, res) {
  try {
    if (!process.env.XAI_KEY) {
      return res.json({ 
        success: false, 
        error: 'XAI_KEY not found in environment variables',
        envKeys: Object.keys(process.env).filter(k => k.includes('AI') || k.includes('KEY')).sort()
      });
    }

    const OpenAI = require('openai');
    const openai = new OpenAI({
      apiKey: process.env.XAI_KEY,
      baseURL: 'https://api.x.ai/v1'
    });

    console.log('Testing Grok API connection...');
    
    try {
      // Try a simple completion first
      const response = await openai.chat.completions.create({
        model: 'grok-beta',
        messages: [{ role: 'user', content: 'Say "Hello from Grok!"' }],
        max_tokens: 10
      });

      return res.json({ 
        success: true, 
        response: response.choices[0].message.content,
        model: response.model,
        usage: response.usage
      });
    } catch (apiError) {
      console.error('Grok API test error:', {
        message: apiError.message,
        status: apiError.status,
        type: apiError.type,
        code: apiError.code,
        response: apiError.response?.data
      });
      
      return res.json({ 
        success: false, 
        error: apiError.message,
        status: apiError.status,
        type: apiError.type,
        details: apiError.response?.data
      });
    }
  } catch (e) {
    console.error('Test Grok handler error:', e);
    return res.json({ success: false, error: e.message });
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
  getStatusHandler,
  testGrokHandler,
  testGPT5Handler,
  getRecentPromptsHandler
};

