/**
 * @file analytics.js
 * @description Analytics tracking utilities for Research Center
 * @author Kaiville Development Team
 * @created 2026-02-01
 *
 * ANALYTICS TRACKING (Q12: Basic Metrics Only)
 * ============================================
 *
 * PURPOSE:
 * - Track simple, privacy-friendly metrics
 * - No PII (Personally Identifiable Information)
 * - Database-backed counters and aggregates
 * - Monitor system health and usage patterns
 *
 * METRICS TRACKED:
 * - daily_submissions: Articles submitted per day
 * - articles_approved: Articles approved by moderators
 * - articles_rejected: Articles rejected by moderators
 * - search_queries: Search queries performed
 * - article_views: Total article views
 * - votes_cast: Votes cast (up/down)
 * - llm_api_calls: LLM API calls made
 * - llm_tokens_used: Total tokens consumed
 * - cache_hits: Cache hits for LLM formatting
 * - formatting_failures: Formatting job failures
 * - article_edits: Edit submissions
 */

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
let supabase;

/**
 * Initialize analytics with Supabase client
 * Call this once at app startup
 */
function initAnalytics() {
  if (!supabase) {
    supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  }
}

/**
 * Track a metric value
 * @param {string} metricName - Name of the metric
 * @param {number} value - Value to add (incremental)
 * @param {Object} metadata - Optional metadata (JSONB)
 * @returns {Promise<boolean>} Success status
 */
async function trackMetric(metricName, value, metadata = {}) {
  if (!supabase) {
    initAnalytics();
  }

  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  try {
    // Check if metric exists for today
    const { data: existing, error: selectError } = await supabase
      .from('research_analytics')
      .select('*')
      .eq('metric_name', metricName)
      .eq('metric_date', today)
      .single();

    if (selectError && selectError.code !== 'PGRST116') {
      // PGRST116 = not found, which is fine
      console.error('Analytics select error:', selectError);
      return false;
    }

    if (existing) {
      // Update existing metric (increment value)
      const { error: updateError } = await supabase
        .from('research_analytics')
        .update({
          metric_value: existing.metric_value + value,
          metadata: { ...existing.metadata, ...metadata }
        })
        .eq('id', existing.id);

      if (updateError) {
        console.error('Analytics update error:', updateError);
        return false;
      }
    } else {
      // Insert new metric
      const { error: insertError } = await supabase
        .from('research_analytics')
        .insert({
          metric_name: metricName,
          metric_value: value,
          metric_date: today,
          metadata
        });

      if (insertError) {
        console.error('Analytics insert error:', insertError);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Analytics tracking error:', error);
    return false;
  }
}

/**
 * Get metric value for a specific date
 * @param {string} metricName - Metric to retrieve
 * @param {string} date - Date in YYYY-MM-DD format (default: today)
 * @returns {Promise<number|null>} Metric value or null
 */
async function getMetric(metricName, date = null) {
  if (!supabase) {
    initAnalytics();
  }

  const targetDate = date || new Date().toISOString().split('T')[0];

  try {
    const { data, error } = await supabase
      .from('research_analytics')
      .select('metric_value')
      .eq('metric_name', metricName)
      .eq('metric_date', targetDate)
      .single();

    if (error) {
      return null;
    }

    return data?.metric_value || null;
  } catch (error) {
    console.error('Get metric error:', error);
    return null;
  }
}

/**
 * Get metrics for a date range
 * @param {string} metricName - Metric to retrieve
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @returns {Promise<Array>} Array of {metric_date, metric_value} objects
 */
async function getMetricRange(metricName, startDate, endDate) {
  if (!supabase) {
    initAnalytics();
  }

  try {
    const { data, error } = await supabase
      .from('research_analytics')
      .select('metric_date, metric_value, metadata')
      .eq('metric_name', metricName)
      .gte('metric_date', startDate)
      .lte('metric_date', endDate)
      .order('metric_date', { ascending: true });

    if (error) {
      console.error('Get metric range error:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Get metric range error:', error);
    return [];
  }
}

/**
 * Get dashboard summary (all key metrics for today)
 * @returns {Promise<Object>} Summary object with key metrics
 */
async function getDashboardSummary() {
  if (!supabase) {
    initAnalytics();
  }

  const today = new Date().toISOString().split('T')[0];

  try {
    // Get today's metrics
    const { data: todayMetrics, error } = await supabase
      .from('research_analytics')
      .select('metric_name, metric_value')
      .eq('metric_date', today);

    if (error) {
      console.error('Dashboard summary error:', error);
      return null;
    }

    // Convert to object
    const summary = {};
    todayMetrics.forEach(metric => {
      summary[metric.metric_name] = metric.metric_value;
    });

    // Get total counts from tables
    const { count: totalArticles } = await supabase
      .from('research_center_articles')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved');

    const { count: pendingArticles } = await supabase
      .from('research_center_articles')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    return {
      today: summary,
      totals: {
        articles: totalArticles || 0,
        pendingModeration: pendingArticles || 0,
        users: totalUsers || 0
      }
    };
  } catch (error) {
    console.error('Dashboard summary error:', error);
    return null;
  }
}

/**
 * Calculate approval rate for a date range
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @returns {Promise<number>} Approval rate percentage (0-100)
 */
async function getApprovalRate(startDate, endDate) {
  if (!supabase) {
    initAnalytics();
  }

  try {
    const { data: approved } = await supabase
      .from('research_center_articles')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'approved')
      .gte('moderated_at', startDate)
      .lte('moderated_at', endDate);

    const { data: rejected } = await supabase
      .from('research_center_articles')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'rejected')
      .gte('moderated_at', startDate)
      .lte('moderated_at', endDate);

    const totalModerated = (approved?.length || 0) + (rejected?.length || 0);

    if (totalModerated === 0) {
      return 0;
    }

    return ((approved?.length || 0) / totalModerated) * 100;
  } catch (error) {
    console.error('Approval rate error:', error);
    return 0;
  }
}

/**
 * Batch track multiple metrics at once
 * @param {Array} metrics - Array of {metricName, value, metadata} objects
 * @returns {Promise<boolean>} Success status
 */
async function trackMetrics(metrics) {
  const results = await Promise.all(
    metrics.map(({ metricName, value, metadata }) =>
      trackMetric(metricName, value, metadata)
    )
  );

  return results.every(result => result === true);
}

module.exports = {
  initAnalytics,
  trackMetric,
  getMetric,
  getMetricRange,
  getDashboardSummary,
  getApprovalRate,
  trackMetrics
};
