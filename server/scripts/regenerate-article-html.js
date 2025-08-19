#!/usr/bin/env node

/**
 * Script to regenerate HTML content for all existing research articles
 * Uses the enhanced markdown renderer to apply new formatting
 */

const { createClient } = require('@supabase/supabase-js');
const { renderMarkdownToHtml } = require('../services/research/markdown');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function regenerateArticleHTML() {
  try {
    console.log('🔄 Starting HTML regeneration for research articles...');
    
    // Fetch all articles that have content_md
    const { data: articles, error: fetchError } = await supabase
      .from('research_articles')
      .select('id, slug, title, content_md')
      .not('content_md', 'is', null);
    
    if (fetchError) {
      throw new Error(`Failed to fetch articles: ${fetchError.message}`);
    }
    
    console.log(`📄 Found ${articles.length} articles to process`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const article of articles) {
      try {
        console.log(`Processing: ${article.title} (${article.slug})`);
        
        // Generate new HTML using enhanced markdown renderer
        const newHTML = await renderMarkdownToHtml(article.content_md);
        
        // Update the article with new HTML
        const { error: updateError } = await supabase
          .from('research_articles')
          .update({ content_html: newHTML })
          .eq('id', article.id);
        
        if (updateError) {
          throw new Error(`Update failed: ${updateError.message}`);
        }
        
        successCount++;
        console.log(`✅ Updated: ${article.title}`);
        
      } catch (error) {
        errorCount++;
        console.error(`❌ Failed to update ${article.title}: ${error.message}`);
      }
    }
    
    console.log('\n🎉 HTML regeneration complete!');
    console.log(`✅ Successfully updated: ${successCount} articles`);
    console.log(`❌ Failed to update: ${errorCount} articles`);
    
    if (errorCount > 0) {
      process.exit(1);
    }
    
  } catch (error) {
    console.error('💥 Script failed:', error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  regenerateArticleHTML();
}

module.exports = { regenerateArticleHTML };