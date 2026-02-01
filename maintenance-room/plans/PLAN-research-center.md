# Research Center Architecture - Implementation Plan

**Generated:** 2026-02-01
**Decision File:** maintenance-room/answers/research-center-answers.json
**Overall Complexity:** Medium-High
**Estimated Tech Debt:** Medium

---

## Executive Summary

This plan implements a quality-focused Research Center with the following characteristics:

- **Quality Control:** Manual moderation queue ensures content quality
- **User Experience:** Async background formatting, optional templates, simple upvoting
- **Reliability:** Multi-provider LLM with automatic failover
- **Scalability:** PostgreSQL full-text search, content hash caching
- **Privacy:** Basic metrics only, no extensive tracking
- **Flexibility:** Author edits with re-moderation, cross-links to Circle Y

**Key Architecture Principles:**
1. Moderation-first approach to maintain research quality
2. Existing Supabase infrastructure (auth, database, search)
3. Background job processing for LLM operations
4. Privacy-friendly analytics
5. Gradual feature enhancement strategy

---

## Phase 1: LLM Provider Infrastructure

### Decision: Multi-Provider with Automatic Failover

**Current State:**
- `server/config/llm.js` has OpenAI fully implemented
- Anthropic and Azure configured but throw errors
- Perplexity just added to PROVIDERS and MODELS

**Implementation Tasks:**

#### 1.1 Complete Perplexity Provider Implementation
**File:** `server/config/llm.js`

```javascript
// In initializeClient() method
case PROVIDERS.PERPLEXITY:
  const PerplexityOpenAI = require('openai');
  this.client = new PerplexityOpenAI({
    apiKey: this.config.apiKey,
    baseURL: 'https://api.perplexity.ai'
  });
  break;

// In getApiKey() method
case PROVIDERS.PERPLEXITY:
  return process.env.PERPLEXITY_API_KEY;
```

**Testing:**
- Verify Perplexity API calls work
- Test with existing research formatting endpoint
- Validate response format matches OpenAI structure

#### 1.2 Implement Automatic Failover Logic
**File:** `server/config/llm.js`

Add new method to UnifiedLLMClient:

```javascript
async completeWithFailover(prompt, options = {}) {
  const providers = [
    this.config.provider,           // Primary (OpenAI)
    PROVIDERS.PERPLEXITY,           // Fallback 1 (research-enhanced)
    // PROVIDERS.ANTHROPIC           // Future: Fallback 2
  ];

  for (const provider of providers) {
    try {
      // Temporarily switch provider
      const originalProvider = this.config.provider;
      this.config.provider = provider;
      this.initializeClient();

      const result = await this.complete(prompt, options);

      // Restore original provider
      this.config.provider = originalProvider;
      this.initializeClient();

      return result;
    } catch (error) {
      console.warn(`Provider ${provider} failed, trying next...`, error.message);
      continue;
    }
  }

  throw new Error('All LLM providers failed');
}
```

**Files to Update:**
- `server/routes/research.js` - Use `completeWithFailover()` instead of `complete()`

#### 1.3 Provider Health Monitoring
**File:** `server/config/llm.js`

Add health check method:

```javascript
async healthCheck(provider) {
  // Simple ping with minimal token usage
  const testPrompt = "Say 'OK'";
  try {
    await this.complete(testPrompt, { max_tokens: 5 });
    return { provider, status: 'healthy', timestamp: Date.now() };
  } catch (error) {
    return { provider, status: 'unhealthy', error: error.message, timestamp: Date.now() };
  }
}
```

**Metrics to Track:**
- Provider response times
- Error rates per provider
- Automatic failover events
- Cost per provider

---

## Phase 2: Submission & Moderation Workflow

### Decision Q2: Manual Moderation Queue
### Decision Q3: Background Async Formatting

**Database Schema Changes:**

#### 2.1 Create Research Articles Table
**Migration:** Create Supabase migration

```sql
-- research_articles table
CREATE TABLE research_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Author info (from Q10: Required User Accounts)
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,

  -- Content
  title TEXT NOT NULL,
  raw_content TEXT NOT NULL,              -- Original submission
  formatted_content TEXT,                 -- LLM-formatted version
  abstract TEXT,                          -- Optional short summary

  -- From Q7: Fixed Categories
  category TEXT NOT NULL,                 -- One of: anomalies, experiments, theory, field_reports, technical_analysis, historical_research

  -- From Q5: Optional Templates
  template_used TEXT,                     -- NULL for free-form, or template ID

  -- Workflow status (Q2: Manual Moderation)
  status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected, editing

  -- From Q11: Author Edits with Re-Moderation
  is_edited BOOLEAN DEFAULT FALSE,
  edit_count INTEGER DEFAULT 0,
  previous_version_id UUID REFERENCES research_articles(id),

  -- Moderation
  moderator_id UUID REFERENCES auth.users(id),
  moderated_at TIMESTAMP,
  moderation_notes TEXT,

  -- From Q9: Upvote/Downvote System
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  vote_score INTEGER GENERATED ALWAYS AS (upvotes - downvotes) STORED,

  -- From Q12: Basic Metrics
  view_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  published_at TIMESTAMP,
  last_edited_at TIMESTAMP,

  -- From Q6: Content Hash Caching
  content_hash TEXT,                      -- SHA-256 of raw_content

  CONSTRAINT valid_status CHECK (status IN ('pending', 'approved', 'rejected', 'editing')),
  CONSTRAINT valid_category CHECK (category IN ('anomalies', 'experiments', 'theory', 'field_reports', 'technical_analysis', 'historical_research'))
);

-- Indexes for performance
CREATE INDEX idx_articles_status ON research_articles(status);
CREATE INDEX idx_articles_category ON research_articles(category);
CREATE INDEX idx_articles_author ON research_articles(author_id);
CREATE INDEX idx_articles_published ON research_articles(published_at) WHERE status = 'approved';
CREATE INDEX idx_articles_vote_score ON research_articles(vote_score) WHERE status = 'approved';

-- From Q8: Full-Text Search (PostgreSQL)
CREATE INDEX idx_articles_search ON research_articles USING GIN(to_tsvector('english', title || ' ' || COALESCE(formatted_content, raw_content)));
```

#### 2.2 Create Votes Table (Q9)
```sql
CREATE TABLE research_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID NOT NULL REFERENCES research_articles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('up', 'down')),
  created_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(article_id, user_id) -- One vote per user per article
);

-- Trigger to update article vote counts
CREATE OR REPLACE FUNCTION update_article_votes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.vote_type = 'up' THEN
      UPDATE research_articles SET upvotes = upvotes + 1 WHERE id = NEW.article_id;
    ELSE
      UPDATE research_articles SET downvotes = downvotes + 1 WHERE id = NEW.article_id;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Handle vote changes
    IF OLD.vote_type = 'up' AND NEW.vote_type = 'down' THEN
      UPDATE research_articles SET upvotes = upvotes - 1, downvotes = downvotes + 1 WHERE id = NEW.article_id;
    ELSIF OLD.vote_type = 'down' AND NEW.vote_type = 'up' THEN
      UPDATE research_articles SET downvotes = downvotes - 1, upvotes = upvotes + 1 WHERE id = NEW.article_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.vote_type = 'up' THEN
      UPDATE research_articles SET upvotes = upvotes - 1 WHERE id = OLD.article_id;
    ELSE
      UPDATE research_articles SET downvotes = downvotes - 1 WHERE id = OLD.article_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER vote_update_trigger
AFTER INSERT OR UPDATE OR DELETE ON research_votes
FOR EACH ROW EXECUTE FUNCTION update_article_votes();
```

#### 2.3 Create LLM Formatting Cache Table (Q6)
```sql
CREATE TABLE llm_format_cache (
  content_hash TEXT PRIMARY KEY,
  formatted_output TEXT NOT NULL,
  model_used TEXT NOT NULL,
  token_count INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  last_accessed TIMESTAMP DEFAULT NOW(),
  access_count INTEGER DEFAULT 1
);

-- Expire old cache entries (30 days)
CREATE INDEX idx_cache_expiry ON llm_format_cache(created_at);
```

#### 2.4 Create Background Jobs Table (Q3)
```sql
CREATE TABLE formatting_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID NOT NULL REFERENCES research_articles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'queued', -- queued, processing, completed, failed
  provider_used TEXT,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  started_at TIMESTAMP,
  completed_at TIMESTAMP,

  CONSTRAINT valid_job_status CHECK (status IN ('queued', 'processing', 'completed', 'failed'))
);

CREATE INDEX idx_jobs_status ON formatting_jobs(status, created_at);
```

#### 2.5 Create Analytics Table (Q12)
```sql
CREATE TABLE research_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  metric_name TEXT NOT NULL,             -- e.g., 'daily_submissions', 'approval_rate', 'search_queries'
  metric_value NUMERIC NOT NULL,
  metric_date DATE NOT NULL,
  metadata JSONB,                        -- Additional context
  created_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(metric_name, metric_date)
);

CREATE INDEX idx_analytics_metric ON research_analytics(metric_name, metric_date);
```

---

### Backend Implementation

#### 2.6 Research Submission Endpoint
**File:** `server/routes/research.js`

```javascript
router.post('/api/research/submit', requireAuth, async (req, res) => {
  const { title, content, category, templateId, abstract } = req.body;
  const userId = req.user.id;

  // Validation
  const validCategories = ['anomalies', 'experiments', 'theory', 'field_reports', 'technical_analysis', 'historical_research'];
  if (!validCategories.includes(category)) {
    return res.status(400).json({ error: 'Invalid category' });
  }

  // Calculate content hash for caching (Q6)
  const crypto = require('crypto');
  const contentHash = crypto.createHash('sha256').update(content).digest('hex');

  // Create article record (status: pending)
  const { data: article, error } = await supabase
    .from('research_articles')
    .insert({
      author_id: userId,
      author_name: req.user.name || req.user.email,
      title,
      raw_content: content,
      category,
      template_used: templateId || null,
      abstract,
      content_hash: contentHash,
      status: 'pending'
    })
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: 'Failed to create article' });
  }

  // Queue background formatting job (Q3)
  await supabase
    .from('formatting_jobs')
    .insert({
      article_id: article.id,
      status: 'queued'
    });

  // Trigger background worker (implementation below)
  triggerFormattingWorker();

  // Track metric (Q12)
  trackMetric('daily_submissions', 1);

  res.json({
    success: true,
    articleId: article.id,
    message: 'Submission received. Your article will be formatted and sent to moderation.'
  });
});
```

#### 2.7 Background Formatting Worker
**File:** `server/workers/formatWorker.js` (new file)

```javascript
const { getLLMClient } = require('../config/llm');
const { createClient } = require('@supabase/supabase-js');

async function processFormattingQueue() {
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  while (true) {
    // Get next queued job
    const { data: job } = await supabase
      .from('formatting_jobs')
      .select('*, research_articles(*)')
      .eq('status', 'queued')
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    if (!job) {
      await sleep(5000); // Wait 5s before checking again
      continue;
    }

    // Mark as processing
    await supabase
      .from('formatting_jobs')
      .update({ status: 'processing', started_at: new Date() })
      .eq('id', job.id);

    try {
      const article = job.research_articles;

      // Check cache first (Q6)
      const { data: cached } = await supabase
        .from('llm_format_cache')
        .select('*')
        .eq('content_hash', article.content_hash)
        .single();

      let formattedContent;
      let providerUsed;

      if (cached) {
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

        trackMetric('cache_hits', 1);
      } else {
        // Format with LLM (with failover from Q1)
        const llm = getLLMClient();

        const prompt = `
Format this research article for the Kaiville Research Center.

PRESERVE ALL ORIGINAL TEXT. Only improve formatting and extract metadata.

Title: ${article.title}
Category: ${article.category}
Template: ${article.template_used || 'free-form'}

Content:
${article.raw_content}

Return JSON:
{
  "formattedContent": "...",
  "suggestedTitle": "...",
  "extractedKeywords": ["..."]
}
        `;

        const result = await llm.completeWithFailover(prompt);
        const parsed = JSON.parse(result.text);
        formattedContent = parsed.formattedContent;
        providerUsed = llm.config.provider;

        // Cache the result
        await supabase
          .from('llm_format_cache')
          .insert({
            content_hash: article.content_hash,
            formatted_output: formattedContent,
            model_used: result.model,
            token_count: result.usage.totalTokens
          });

        trackMetric('llm_api_calls', 1);
        trackMetric('llm_tokens_used', result.usage.totalTokens);
      }

      // Update article with formatted content
      await supabase
        .from('research_articles')
        .update({ formatted_content: formattedContent })
        .eq('id', article.id);

      // Mark job complete
      await supabase
        .from('formatting_jobs')
        .update({
          status: 'completed',
          completed_at: new Date(),
          provider_used: providerUsed
        })
        .eq('id', job.id);

    } catch (error) {
      console.error('Formatting job failed:', error);

      // Mark as failed
      await supabase
        .from('formatting_jobs')
        .update({
          status: 'failed',
          error_message: error.message,
          retry_count: job.retry_count + 1,
          completed_at: new Date()
        })
        .eq('id', job.id);

      // Retry logic: requeue if retries < 3
      if (job.retry_count < 3) {
        await supabase
          .from('formatting_jobs')
          .insert({
            article_id: job.article_id,
            status: 'queued',
            retry_count: job.retry_count + 1
          });
      }

      trackMetric('formatting_failures', 1);
    }
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Start worker
processFormattingQueue();
```

**Deployment:** Run as separate Node process or use PM2

#### 2.8 Moderation Endpoints
**File:** `server/routes/moderation.js` (new file)

```javascript
const express = require('express');
const router = express.Router();

// Middleware: Check if user is moderator
function requireModerator(req, res, next) {
  // TODO: Implement moderator role check
  // For now, check for specific user IDs or add 'role' to user metadata
  if (!req.user || !req.user.isModerator) {
    return res.status(403).json({ error: 'Moderator access required' });
  }
  next();
}

// Get moderation queue
router.get('/api/moderation/queue', requireAuth, requireModerator, async (req, res) => {
  const { data: articles } = await supabase
    .from('research_articles')
    .select('*, formatting_jobs(*)')
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  res.json({ articles });
});

// Approve article
router.post('/api/moderation/approve/:id', requireAuth, requireModerator, async (req, res) => {
  const { id } = req.params;
  const { notes } = req.body;

  const { error } = await supabase
    .from('research_articles')
    .update({
      status: 'approved',
      moderator_id: req.user.id,
      moderated_at: new Date(),
      moderation_notes: notes,
      published_at: new Date()
    })
    .eq('id', id);

  if (error) {
    return res.status(500).json({ error: 'Failed to approve article' });
  }

  trackMetric('articles_approved', 1);

  res.json({ success: true });
});

// Reject article
router.post('/api/moderation/reject/:id', requireAuth, requireModerator, async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  const { error } = await supabase
    .from('research_articles')
    .update({
      status: 'rejected',
      moderator_id: req.user.id,
      moderated_at: new Date(),
      moderation_notes: reason
    })
    .eq('id', id);

  if (error) {
    return res.status(500).json({ error: 'Failed to reject article' });
  }

  trackMetric('articles_rejected', 1);

  res.json({ success: true });
});

module.exports = router;
```

---

## Phase 3: Templates & Categories

### Decision Q5: Optional Templates
### Decision Q7: Fixed Category List

#### 3.1 Define Research Templates
**File:** `server/config/templates.js` (new file)

```javascript
const RESEARCH_TEMPLATES = {
  scientific: {
    id: 'scientific',
    name: 'Scientific Paper',
    description: 'Formal research paper structure',
    structure: {
      sections: ['Abstract', 'Introduction', 'Methodology', 'Results', 'Discussion', 'Conclusion', 'References']
    },
    placeholder: `# [Your Title]

## Abstract
Brief summary of your research...

## Introduction
Background and context...

## Methodology
How you conducted the research...

## Results
What you found...

## Discussion
Interpretation of results...

## Conclusion
Key takeaways...

## References
1. Source 1
2. Source 2
`
  },

  analysis: {
    id: 'analysis',
    name: 'Analysis & Commentary',
    description: 'Analytical piece or opinion',
    structure: {
      sections: ['Summary', 'Analysis', 'Implications']
    },
    placeholder: `# [Your Title]

## Summary
What you're analyzing...

## Analysis
Your detailed examination...

## Implications
What this means...
`
  },

  tutorial: {
    id: 'tutorial',
    name: 'Tutorial/Guide',
    description: 'Step-by-step instructional guide',
    structure: {
      sections: ['Overview', 'Prerequisites', 'Steps', 'Troubleshooting']
    },
    placeholder: `# [Your Title]

## Overview
What this guide covers...

## Prerequisites
What you need...

## Steps
1. First step...
2. Second step...

## Troubleshooting
Common issues...
`
  },

  general: {
    id: 'general',
    name: 'General Research',
    description: 'Free-form research article',
    structure: null,
    placeholder: `# [Your Title]

Write your research article here...
`
  }
};

const RESEARCH_CATEGORIES = [
  { id: 'anomalies', name: 'Anomalies', description: 'Unexplained phenomena and strange occurrences' },
  { id: 'experiments', name: 'Experiments', description: 'Scientific experiments and observations' },
  { id: 'theory', name: 'Theory', description: 'Theoretical frameworks and hypotheses' },
  { id: 'field_reports', name: 'Field Reports', description: 'On-site investigation reports' },
  { id: 'technical_analysis', name: 'Technical Analysis', description: 'Technical deep-dives and analysis' },
  { id: 'historical_research', name: 'Historical Research', description: 'Historical context and documentation' }
];

module.exports = { RESEARCH_TEMPLATES, RESEARCH_CATEGORIES };
```

#### 3.2 Template Selection Endpoint
**File:** `server/routes/research.js`

```javascript
router.get('/api/research/templates', (req, res) => {
  const { RESEARCH_TEMPLATES } = require('../config/templates');
  res.json({ templates: Object.values(RESEARCH_TEMPLATES) });
});

router.get('/api/research/categories', (req, res) => {
  const { RESEARCH_CATEGORIES } = require('../config/templates');
  res.json({ categories: RESEARCH_CATEGORIES });
});
```

---

## Phase 4: Search & Discovery

### Decision Q8: Full-Text Search (PostgreSQL)

#### 4.1 Search Endpoint
**File:** `server/routes/research.js`

```javascript
router.get('/api/research/search', async (req, res) => {
  const { q, category, sortBy = 'relevance', limit = 20, offset = 0 } = req.query;

  let query = supabase
    .from('research_articles')
    .select('*', { count: 'exact' })
    .eq('status', 'approved');

  // Full-text search (Q8)
  if (q) {
    query = query.textSearch('title,formatted_content', q);
  }

  // Category filter (Q7)
  if (category) {
    query = query.eq('category', category);
  }

  // Sorting
  switch (sortBy) {
    case 'relevance':
      // Default PostgreSQL ranking for text search
      break;
    case 'votes':
      query = query.order('vote_score', { ascending: false });
      break;
    case 'newest':
      query = query.order('published_at', { ascending: false });
      break;
    case 'views':
      query = query.order('view_count', { ascending: false });
      break;
  }

  query = query.range(offset, offset + limit - 1);

  const { data: articles, count, error } = await query;

  if (error) {
    return res.status(500).json({ error: 'Search failed' });
  }

  // Track search metric (Q12)
  trackMetric('search_queries', 1);

  res.json({
    articles,
    total: count,
    limit,
    offset
  });
});
```

#### 4.2 Article View Tracking
**File:** `server/routes/research.js`

```javascript
router.get('/api/research/article/:id', async (req, res) => {
  const { id } = req.params;

  // Increment view count (Q12)
  const { data: article, error } = await supabase
    .from('research_articles')
    .select('*')
    .eq('id', id)
    .eq('status', 'approved')
    .single();

  if (error || !article) {
    return res.status(404).json({ error: 'Article not found' });
  }

  // Async increment (don't wait)
  supabase
    .from('research_articles')
    .update({ view_count: article.view_count + 1 })
    .eq('id', id)
    .then(() => trackMetric('article_views', 1));

  res.json({ article });
});
```

---

## Phase 5: Voting System

### Decision Q9: Upvote/Downvote System
### Decision Q10: Required User Accounts

#### 5.1 Voting Endpoints
**File:** `server/routes/research.js`

```javascript
router.post('/api/research/vote/:id', requireAuth, async (req, res) => {
  const { id: articleId } = req.params;
  const { voteType } = req.body; // 'up' or 'down'
  const userId = req.user.id;

  if (!['up', 'down'].includes(voteType)) {
    return res.status(400).json({ error: 'Invalid vote type' });
  }

  // Check if user already voted
  const { data: existing } = await supabase
    .from('research_votes')
    .select('*')
    .eq('article_id', articleId)
    .eq('user_id', userId)
    .single();

  if (existing) {
    // Update vote
    if (existing.vote_type === voteType) {
      // Remove vote (toggle off)
      await supabase
        .from('research_votes')
        .delete()
        .eq('id', existing.id);

      return res.json({ success: true, action: 'removed' });
    } else {
      // Change vote
      await supabase
        .from('research_votes')
        .update({ vote_type: voteType })
        .eq('id', existing.id);

      return res.json({ success: true, action: 'changed' });
    }
  } else {
    // New vote
    await supabase
      .from('research_votes')
      .insert({
        article_id: articleId,
        user_id: userId,
        vote_type: voteType
      });

    trackMetric('votes_cast', 1);

    return res.json({ success: true, action: 'added' });
  }
});

// Get user's vote for an article
router.get('/api/research/vote/:id', requireAuth, async (req, res) => {
  const { id: articleId } = req.params;
  const userId = req.user.id;

  const { data: vote } = await supabase
    .from('research_votes')
    .select('vote_type')
    .eq('article_id', articleId)
    .eq('user_id', userId)
    .single();

  res.json({ vote: vote?.vote_type || null });
});
```

---

## Phase 6: Author Edits & Version Control

### Decision Q11: Author Edits with Re-Moderation

#### 6.1 Edit Submission Endpoint
**File:** `server/routes/research.js`

```javascript
router.post('/api/research/edit/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { title, content, category, abstract } = req.body;
  const userId = req.user.id;

  // Verify ownership
  const { data: article } = await supabase
    .from('research_articles')
    .select('*')
    .eq('id', id)
    .single();

  if (!article) {
    return res.status(404).json({ error: 'Article not found' });
  }

  if (article.author_id !== userId) {
    return res.status(403).json({ error: 'Not your article' });
  }

  if (article.status !== 'approved') {
    return res.status(400).json({ error: 'Only approved articles can be edited' });
  }

  // Calculate new content hash
  const crypto = require('crypto');
  const contentHash = crypto.createHash('sha256').update(content).digest('hex');

  // Create new version (keeps original for diff)
  const { data: editedArticle } = await supabase
    .from('research_articles')
    .update({
      title,
      raw_content: content,
      category,
      abstract,
      content_hash: contentHash,
      status: 'pending',           // Back to moderation (Q11)
      is_edited: true,
      edit_count: article.edit_count + 1,
      last_edited_at: new Date(),
      previous_version_id: id,
      formatted_content: null       // Will be reformatted
    })
    .eq('id', id)
    .select()
    .single();

  // Queue formatting job
  await supabase
    .from('formatting_jobs')
    .insert({
      article_id: id,
      status: 'queued'
    });

  triggerFormattingWorker();

  trackMetric('article_edits', 1);

  res.json({
    success: true,
    message: 'Edit submitted for re-moderation',
    articleId: id
  });
});

// Get edit history / show original vs edited
router.get('/api/research/article/:id/diff', requireAuth, requireModerator, async (req, res) => {
  const { id } = req.params;

  const { data: current } = await supabase
    .from('research_articles')
    .select('*, previous_version:previous_version_id(*)')
    .eq('id', id)
    .single();

  if (!current || !current.previous_version_id) {
    return res.status(404).json({ error: 'No edit history' });
  }

  res.json({
    current: {
      title: current.title,
      content: current.raw_content,
      category: current.category
    },
    previous: {
      title: current.previous_version.title,
      content: current.previous_version.raw_content,
      category: current.previous_version.category
    }
  });
});
```

---

## Phase 7: Circle Y Integration

### Decision Q4: Cross-Link Only

#### 7.1 Simple Navigation Links
**Implementation:** Frontend only, no backend changes needed

**File:** `client/src/components/ResearchCenter/ResearchHeader.tsx` (new)

```tsx
export function ResearchHeader() {
  return (
    <header className="research-header">
      <nav>
        <Link to="/research">Research Center</Link>
        <Link to="/circley">Circle Y</Link>
        <Link to="/knn-feed">KNN Feed</Link>
      </nav>
    </header>
  );
}
```

**File:** `client/src/pages/CircleYPage.tsx`

Add link to Research Center in Circle Y page navigation.

---

## Phase 8: Analytics & Monitoring

### Decision Q12: Basic Metrics Only

#### 8.1 Metrics Tracking Helper
**File:** `server/utils/analytics.js` (new)

```javascript
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function trackMetric(metricName, value, metadata = {}) {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

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
}

module.exports = { trackMetric };
```

#### 8.2 Analytics Dashboard Endpoint
**File:** `server/routes/analytics.js` (new)

```javascript
const express = require('express');
const router = express.Router();

router.get('/api/analytics/dashboard', requireAuth, requireModerator, async (req, res) => {
  const { startDate, endDate } = req.query;

  // Get metrics for date range
  const { data: metrics } = await supabase
    .from('research_analytics')
    .select('*')
    .gte('metric_date', startDate || '2026-01-01')
    .lte('metric_date', endDate || new Date().toISOString().split('T')[0])
    .order('metric_date', { ascending: false });

  // Also get current counts
  const { count: totalArticles } = await supabase
    .from('research_articles')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved');

  const { count: pendingArticles } = await supabase
    .from('research_articles')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  res.json({
    metrics,
    snapshot: {
      totalArticles,
      pendingArticles
    }
  });
});

module.exports = router;
```

**Metrics to Track:**
- `daily_submissions` - Articles submitted per day
- `articles_approved` - Articles approved per day
- `articles_rejected` - Articles rejected per day
- `search_queries` - Search queries per day
- `article_views` - Total article views per day
- `votes_cast` - Votes cast per day
- `llm_api_calls` - LLM API calls per day
- `llm_tokens_used` - Tokens consumed per day
- `cache_hits` - Cache hits per day
- `formatting_failures` - Formatting job failures per day
- `article_edits` - Edit submissions per day

---

## Frontend Implementation

### Components to Build

#### 9.1 Research Submission Form
**File:** `client/src/components/ResearchCenter/SubmissionForm.tsx`

**Features:**
- Category dropdown (Q7)
- Template selection (Q5) - optional
- Title, abstract, content fields
- Preview formatted content (after LLM processing)
- Submit to moderation queue

#### 9.2 Research Article List
**File:** `client/src/components/ResearchCenter/ArticleList.tsx`

**Features:**
- Display approved articles
- Show vote scores (Q9)
- Category badges
- Search bar (Q8)
- Sort by: relevance, votes, newest, views
- Pagination

#### 9.3 Article Detail Page
**File:** `client/src/pages/ResearchArticlePage.tsx`

**Features:**
- Display formatted content
- Upvote/downvote buttons (Q9, Q10)
- Author attribution (Q10)
- Edit button (for author, if logged in)
- View count display
- Category tag
- Related articles (by category)

#### 9.4 Moderation Queue UI
**File:** `client/src/components/ResearchCenter/ModerationQueue.tsx`

**Features:**
- List pending articles
- Show raw vs formatted content side-by-side
- Approve/Reject buttons
- Moderation notes field
- Show edit diffs (Q11)
- Formatting job status

#### 9.5 User Profile / Author Page
**File:** `client/src/pages/ResearchAuthorPage.tsx`

**Features:**
- List user's submitted articles
- Show approval/rejection status
- Show vote totals received
- Edit button for approved articles

#### 9.6 Analytics Dashboard (Moderator Only)
**File:** `client/src/components/ResearchCenter/AnalyticsDashboard.tsx`

**Features:**
- Display metrics from Q12
- Charts: submissions over time, approval rate, popular categories
- LLM usage stats
- Cache hit rate

---

## Testing Strategy

### Unit Tests

1. **LLM Failover Logic** (`server/config/llm.js`)
   - Test automatic failover when primary provider fails
   - Test cache hit/miss logic
   - Test content hash generation

2. **Voting System** (`server/routes/research.js`)
   - Test vote creation, update, deletion
   - Test vote count triggers
   - Test duplicate vote prevention

3. **Moderation Workflow** (`server/routes/moderation.js`)
   - Test approval/rejection updates
   - Test status transitions
   - Test edit re-moderation flow

### Integration Tests

1. **Full Submission Flow**
   - Submit article → Background formatting → Moderation → Approval → Public display
   - Test cache reuse on duplicate content
   - Test edit workflow with re-moderation

2. **Search Functionality**
   - Test full-text search accuracy
   - Test category filtering
   - Test sorting options

3. **Authentication & Authorization**
   - Test user-only submission
   - Test author-only editing
   - Test moderator-only approval

### Load Testing

1. **Background Worker Performance**
   - Test multiple formatting jobs in queue
   - Test failover under load
   - Test job retry logic

2. **Search Performance**
   - Test search with 1000+ articles
   - Verify index usage
   - Test pagination

---

## Deployment Checklist

### Database Setup

- [ ] Run Supabase migrations for all tables
- [ ] Create indexes for search performance
- [ ] Set up Row Level Security (RLS) policies
- [ ] Configure moderator roles in user metadata

### Environment Variables

```env
# LLM Providers (Q1)
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-...
PERPLEXITY_API_KEY=pplx-...
# ANTHROPIC_API_KEY=sk-ant-...  # Future

# Supabase
SUPABASE_URL=https://...
SUPABASE_SERVICE_ROLE_KEY=...

# Background Worker
ENABLE_FORMAT_WORKER=true
WORKER_POLL_INTERVAL=5000

# Moderation (optional)
AUTO_APPROVE_RESEARCH=false
```

### Backend Services

- [ ] Deploy main Express server
- [ ] Deploy background formatting worker (separate process)
- [ ] Set up process manager (PM2) for worker
- [ ] Configure error monitoring (Sentry/etc)

### Frontend Deployment

- [ ] Build React app with Vite
- [ ] Deploy to Railway/Vercel/etc
- [ ] Configure environment variables for production
- [ ] Test Supabase auth integration

### Monitoring

- [ ] Set up LLM cost alerts
- [ ] Monitor background worker health
- [ ] Track approval queue depth
- [ ] Set up daily metrics exports

---

## Risk Mitigation

### Risk 1: LLM API Costs Spiral
**Mitigation:**
- Content hash caching (Q6) reduces duplicate calls
- Set monthly budget alerts in OpenAI/Perplexity dashboards
- Monitor `llm_tokens_used` metric daily
- Implement rate limiting on submission endpoint (max 10 per user per day)

### Risk 2: Background Worker Crashes
**Mitigation:**
- Use PM2 with auto-restart
- Job status tracking allows recovery
- Retry logic for failed jobs (max 3 retries)
- Monitor `formatting_failures` metric

### Risk 3: Moderation Queue Overload
**Mitigation:**
- Start with manual moderation, assess workload
- If queue grows, add more moderators
- Future: Implement AI pre-screening (Q2 Option D)
- Daily metrics show approval rate and queue depth

### Risk 4: Vote Brigading / Gaming
**Mitigation:**
- One vote per user per article (database constraint)
- Future: Detect suspicious voting patterns
- Moderators can flag/remove articles
- Track votes per user to identify abuse

### Risk 5: Spam Submissions
**Mitigation:**
- Required user accounts (Q10) prevents anonymous spam
- Manual moderation catches spam before publication
- Rate limiting on submissions
- Moderators can ban users

### Risk 6: Cache Poisoning
**Mitigation:**
- Cache keys are content hashes (immutable)
- 30-day expiration on cache entries
- Monitor cache hit rate for anomalies
- Moderators review all formatted content before approval

---

## Future Enhancements (Beyond Initial Launch)

### Phase 2.1: Anthropic Provider Implementation
- Implement Anthropic client in `llm.js`
- Add to failover chain after Perplexity
- Test response normalization

### Phase 2.2: AI Pre-Screening (Q2 Option D)
- LLM checks submissions for spam/quality before human moderation
- Auto-reject obvious spam
- Flag low-quality for moderator review
- Reduces moderator workload

### Phase 3: Advanced Search
- Add filters: date range, author, template type
- Implement "Related Articles" using embeddings
- Save search preferences per user

### Phase 4: Notifications
- Email/in-app notifications for:
  - Submission approved/rejected
  - New comments on your articles (if comments added later)
  - Articles in your favorite categories

### Phase 5: User Reputation System
- Calculate author reputation from upvotes, approvals
- Display badges (Top Contributor, etc.)
- Unlock features at reputation thresholds

### Phase 6: Export & Sharing
- Export articles as PDF
- Share to social media
- Generate citation formats

### Phase 7: Collaborative Editing
- Multiple authors per article
- Co-author invitations
- Contribution tracking

---

## Success Metrics (3 Months Post-Launch)

**Quality Metrics:**
- Approval rate > 70% (good signal-to-noise ratio)
- Average upvotes per article > 5
- Low rejection rate due to spam (< 10%)

**Engagement Metrics:**
- 50+ approved articles published
- 100+ registered users
- 500+ search queries per month
- 20+ active voters

**Technical Metrics:**
- LLM cache hit rate > 30%
- Background worker uptime > 99%
- Search response time < 500ms
- Average formatting time < 10s

**Cost Metrics:**
- LLM API costs < $100/month
- Average cost per formatted article < $0.50

---

## Immediate Next Steps

### Week 1: Foundation
1. ✅ Complete Perplexity provider implementation
2. ✅ Implement failover logic
3. Create database migrations
4. Deploy background formatting worker
5. Test end-to-end submission flow

### Week 2: Moderation
1. Build moderation queue UI
2. Implement approval/rejection endpoints
3. Add moderator role checking
4. Test moderation workflow

### Week 3: Public Features
1. Build submission form
2. Implement article list/detail pages
3. Add search functionality
4. Deploy templates and categories

### Week 4: Voting & Polish
1. Implement voting system
2. Add user profiles
3. Test edit workflow
4. Add analytics dashboard

### Week 5: Testing & Launch
1. Full integration testing
2. Load testing
3. Security audit
4. Soft launch with beta users

---

## Maintenance Plan

### Daily Tasks
- Monitor background worker health
- Check moderation queue depth
- Review `research_analytics` for anomalies

### Weekly Tasks
- Review LLM costs and cache performance
- Analyze approval/rejection patterns
- Check for spam or abuse

### Monthly Tasks
- Clean expired cache entries
- Review and update categories if needed
- Add new templates based on user feedback
- Analyze search queries for missing features

---

## Questions for Follow-Up

1. **Moderator Assignment:** Who will be the initial moderators? Need to set up role in Supabase.

2. **Submission Limits:** Should we rate-limit submissions per user? Suggested: 10 per day.

3. **Edit Approval:** Should edits have a faster approval track since they're from trusted authors?

4. **Category Expansion:** The 6 categories are a starting point. How will we decide to add more?

5. **Perplexity Usage:** Should Perplexity be used for research-specific articles only, or general failover?

6. **Cache Expiration:** 30-day cache expiration is suggested. Adjust based on content freshness needs?

---

## Appendix: File Structure

```
KaivilleMap/
├── server/
│   ├── config/
│   │   ├── llm.js              # ✅ Already exists (update for failover)
│   │   └── templates.js        # NEW: Templates and categories
│   ├── routes/
│   │   ├── research.js         # NEW: Submission, search, voting
│   │   ├── moderation.js       # NEW: Moderation endpoints
│   │   └── analytics.js        # NEW: Analytics dashboard
│   ├── workers/
│   │   └── formatWorker.js     # NEW: Background formatting
│   └── utils/
│       └── analytics.js        # NEW: Metrics tracking helper
│
├── client/src/
│   ├── components/
│   │   └── ResearchCenter/
│   │       ├── SubmissionForm.tsx      # NEW
│   │       ├── ArticleList.tsx         # NEW
│   │       ├── ModerationQueue.tsx     # NEW
│   │       ├── AnalyticsDashboard.tsx  # NEW
│   │       └── ResearchHeader.tsx      # NEW
│   └── pages/
│       ├── ResearchArticlePage.tsx     # NEW
│       └── ResearchAuthorPage.tsx      # NEW
│
├── maintenance-room/
│   ├── answers/
│   │   └── research-center-answers.json # ✅ Generated
│   └── plans/
│       └── PLAN-research-center.md      # ✅ This file
│
└── supabase/
    └── migrations/
        └── 20260201_research_center.sql # NEW: All tables/indexes
```

---

## Document History

- **2026-02-01:** Initial plan generated from decision wizard answers
- All 12 architectural decisions captured and implemented
- Balanced approach: quality control + user experience + maintainability

---

**This plan is ready for implementation. Proceed with Week 1 tasks to begin building the Research Center.**
