/**
 * @file formatWorker.js
 * @description Background worker for LLM-based research article formatting
 * @author Kaiville Development Team
 * @created 2026-02-01
 *
 * BACKGROUND FORMATTING WORKER (Q3: Async Background Formatting)
 * ============================================================
 *
 * PURPOSE:
 * - Processes research article submissions in the background
 * - Formats content using LLM with automatic failover
 * - Implements content-hash caching to reduce API costs
 * - Handles retries and error recovery
 *
 * DEPLOYMENT:
 * Run as a separate Node process:
 *   node server/workers/formatWorker.js
 *
 * Or use PM2 for auto-restart:
 *   pm2 start server/workers/formatWorker.js --name research-formatter
 *
 * ENVIRONMENT VARIABLES:
 * - WORKER_POLL_INTERVAL: How often to check for jobs (default: 5000ms)
 * - WORKER_MAX_RETRIES: Max retry attempts (default: 3)
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { getLLMClient } = require('../config/llm');
const crypto = require('crypto');

// Configuration
const POLL_INTERVAL = parseInt(process.env.WORKER_POLL_INTERVAL || '5000');
const MAX_RETRIES = parseInt(process.env.WORKER_MAX_RETRIES || '3');

// Initialize Supabase with service role key (full access)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Metrics tracking
let metrics = {
  jobsProcessed: 0,
  cacheHits: 0,
  cacheMisses: 0,
  llmCalls: 0,
  failures: 0,
  totalTokens: 0
};

/**
 * Track a metric in the database
 */
async function trackMetric(metricName, value, metadata = {}) {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  try {
    // Upsert: increment if exists, insert if not
    const { data: existing } = await supabase
      .from('research_analytics')
      .select('*')
      .eq('metric_name', metricName)
      .eq('metric_date', today)
      .single();

    if (existing) {
      await supabase
        .from('research_analytics')
        .update({
          metric_value: existing.metric_value + value,
          metadata: { ...existing.metadata, ...metadata }
        })
        .eq('id', existing.id);
    } else {
      await supabase
        .from('research_analytics')
        .insert({
          metric_name: metricName,
          metric_value: value,
          metric_date: today,
          metadata
        });
    }
  } catch (error) {
    console.error('Failed to track metric:', error.message);
  }
}

/**
 * Sleep utility
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Process a single formatting job
 */
async function processJob(job) {
  const { id: jobId, article_id, retry_count } = job;

  console.log(`[Job ${jobId}] Processing article ${article_id}...`);

  // Mark job as processing
  await supabase
    .from('research_formatting_jobs')
    .update({ status: 'processing', started_at: new Date() })
    .eq('id', jobId);

  try {
    // Get article
    const { data: article, error: articleError } = await supabase
      .from('research_center_articles')
      .select('*')
      .eq('id', article_id)
      .single();

    if (articleError || !article) {
      throw new Error(`Article not found: ${article_id}`);
    }

    console.log(`[Job ${jobId}] Article: "${article.title}" by ${article.author_name}`);

    let formattedContent;
    let providerUsed;
    let tokensUsed = 0;

    // Check cache first (Q6: Content Hash Caching)
    const { data: cached } = await supabase
      .from('llm_format_cache')
      .select('*')
      .eq('content_hash', article.content_hash)
      .single();

    if (cached) {
      console.log(`[Job ${jobId}] ✓ Cache hit! Using cached formatting.`);
      formattedContent = cached.formatted_output;
      providerUsed = 'cache';

      // Update cache stats
      await supabase
        .from('llm_format_cache')
        .update({
          last_accessed: new Date(),
          access_count: cached.access_count + 1
        })
        .eq('content_hash', article.content_hash);

      metrics.cacheHits++;
      await trackMetric('cache_hits', 1);

    } else {
      console.log(`[Job ${jobId}] Cache miss. Calling LLM...`);
      metrics.cacheMisses++;

      // Format with LLM (with automatic failover from Q1)
      const llm = getLLMClient();

      const prompt = buildFormattingPrompt(article);

      const result = await llm.completeWithFailover(prompt);

      // Parse LLM response
      try {
        const parsed = JSON.parse(result.text);
        formattedContent = parsed.formattedContent || result.text;
      } catch (parseError) {
        // If JSON parsing fails, use raw text
        console.warn(`[Job ${jobId}] Failed to parse JSON, using raw text`);
        formattedContent = result.text;
      }

      providerUsed = result.provider;
      tokensUsed = result.usage.totalTokens;

      console.log(`[Job ${jobId}] ✓ Formatted with ${providerUsed} (${tokensUsed} tokens)`);

      // Cache the result
      await supabase
        .from('llm_format_cache')
        .insert({
          content_hash: article.content_hash,
          formatted_output: formattedContent,
          model_used: result.model,
          token_count: tokensUsed
        });

      metrics.llmCalls++;
      metrics.totalTokens += tokensUsed;
      await trackMetric('llm_api_calls', 1);
      await trackMetric('llm_tokens_used', tokensUsed);
    }

    // Update article with formatted content
    await supabase
      .from('research_center_articles')
      .update({ formatted_content: formattedContent })
      .eq('id', article_id);

    // Mark job complete
    await supabase
      .from('research_formatting_jobs')
      .update({
        status: 'completed',
        completed_at: new Date(),
        provider_used: providerUsed
      })
      .eq('id', jobId);

    console.log(`[Job ${jobId}] ✓ Complete!`);
    metrics.jobsProcessed++;

  } catch (error) {
    console.error(`[Job ${jobId}] ✗ Failed:`, error.message);
    metrics.failures++;

    // Mark as failed
    await supabase
      .from('research_formatting_jobs')
      .update({
        status: 'failed',
        error_message: error.message,
        retry_count: retry_count + 1,
        completed_at: new Date()
      })
      .eq('id', jobId);

    // Retry logic: requeue if retries < MAX_RETRIES
    if (retry_count < MAX_RETRIES) {
      console.log(`[Job ${jobId}] Requeueing for retry (attempt ${retry_count + 2}/${MAX_RETRIES})`);

      await supabase
        .from('research_formatting_jobs')
        .insert({
          article_id: job.article_id,
          status: 'queued',
          retry_count: retry_count + 1
        });
    } else {
      console.error(`[Job ${jobId}] Max retries exceeded. Giving up.`);
    }

    await trackMetric('formatting_failures', 1);
  }
}

/**
 * Build the LLM prompt for formatting
 */
function buildFormattingPrompt(article) {
  return `
You are a formatting assistant for the Kaiville Research Center.

**PRIMARY DIRECTIVE:** PRESERVE ALL ORIGINAL TEXT. Never summarize or remove content.
Your job is to:
1. Improve formatting and structure
2. Extract metadata (keywords, key points)
3. Ensure readability

**Article Details:**
- Title: ${article.title}
- Category: ${article.category}
- Template: ${article.template_used || 'free-form'}
${article.abstract ? `- Abstract: ${article.abstract}` : ''}

**Original Content:**
${article.raw_content}

**Instructions:**
- Fix formatting issues (headings, lists, code blocks, etc.)
- Preserve ALL original text verbatim
- Add section breaks where appropriate
- Ensure consistent markdown formatting

**Return JSON:**
{
  "formattedContent": "...the formatted markdown...",
  "suggestedTitle": "...improved title if needed...",
  "extractedKeywords": ["keyword1", "keyword2", "..."]
}
  `.trim();
}

/**
 * Main worker loop
 */
async function run() {
  console.log('===============================================');
  console.log('Research Center Formatting Worker Started');
  console.log('===============================================');
  console.log(`Poll interval: ${POLL_INTERVAL}ms`);
  console.log(`Max retries: ${MAX_RETRIES}`);
  console.log('');

  // Log metrics every 5 minutes
  setInterval(() => {
    console.log('--- Worker Metrics ---');
    console.log(`Jobs processed: ${metrics.jobsProcessed}`);
    console.log(`Cache hits: ${metrics.cacheHits} | misses: ${metrics.cacheMisses}`);
    console.log(`LLM calls: ${metrics.llmCalls} | tokens: ${metrics.totalTokens}`);
    console.log(`Failures: ${metrics.failures}`);
    console.log('');
  }, 5 * 60 * 1000); // 5 minutes

  while (true) {
    try {
      // Get next queued job
      const { data: job, error } = await supabase
        .from('research_formatting_jobs')
        .select('*')
        .eq('status', 'queued')
        .order('created_at', { ascending: true })
        .limit(1)
        .single();

      if (error || !job) {
        // No jobs in queue, wait and try again
        await sleep(POLL_INTERVAL);
        continue;
      }

      // Process the job
      await processJob(job);

    } catch (error) {
      console.error('Worker error:', error);
      await sleep(POLL_INTERVAL);
    }
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\nShutting down worker...');
  console.log('Final metrics:');
  console.log(metrics);
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\nShutting down worker...');
  console.log('Final metrics:');
  console.log(metrics);
  process.exit(0);
});

// Start the worker
run().catch(error => {
  console.error('Fatal worker error:', error);
  process.exit(1);
});
