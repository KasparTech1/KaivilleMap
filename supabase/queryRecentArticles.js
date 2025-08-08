import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function queryRecentArticles() {
  console.log('🔍 Querying the last 3 articles from database...\n');
  
  try {
    // Query matching the exact SQL structure requested
    const { data: articles, error } = await supabase
      .from('articles')
      .select(`
        *,
        pages!inner (
          id,
          slug,
          title,
          is_published,
          status,
          published_at
        )
      `)
      .eq('pages.is_published', true)
      .eq('pages.status', 'published')
      .order('created_at', { ascending: false })
      .limit(3);
    
    if (error) {
      console.error('❌ Error querying articles:', error.message);
      return;
    }
    
    if (articles && articles.length > 0) {
      console.log(`✅ Found ${articles.length} recent articles:\n`);
      
      articles.forEach((article, index) => {
        console.log(`${index + 1}. ${article.headline || 'Untitled'}`);
        console.log(`   Author: ${article.author_name || 'Unknown'}`);
        console.log(`   Category: ${article.primary_category || 'Uncategorized'}`);
        console.log(`   Created: ${new Date(article.created_at).toLocaleDateString()}`);
        console.log(`   Page slug: ${article.pages.slug}`);
        console.log(`   Tags: ${article.tags ? article.tags.join(', ') : 'None'}`);
        console.log(`   Reading time: ${article.reading_time || '?'} minutes`);
        console.log('');
      });
      
      console.log('\n📊 Raw data for integration:');
      console.log(JSON.stringify(articles, null, 2));
    } else {
      console.log('⚠️  No published articles found');
    }
    
  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

// Run the query
queryRecentArticles().catch(console.error);