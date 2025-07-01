import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkArticles() {
  console.log('Checking articles in Supabase database...\n');

  try {
    // Check articles table
    console.log('=== ARTICLES TABLE ===');
    const { data: articles, error: articlesError } = await supabase
      .from('articles')
      .select('*')
      .limit(10);

    if (articlesError) {
      console.error('Error fetching articles:', articlesError);
    } else if (articles && articles.length > 0) {
      console.log(`Found ${articles.length} articles:`);
      articles.forEach((article, index) => {
        console.log(`\n${index + 1}. Article ID: ${article.id}`);
        console.log(`   Headline: ${article.headline || 'No headline'}`);
        console.log(`   Author: ${article.author_name || 'No author'}`);
        console.log(`   Reading Time: ${article.reading_time || 'N/A'} minutes`);
        console.log(`   Tags: ${article.tags ? article.tags.join(', ') : 'No tags'}`);
      });
    } else {
      console.log('No articles found in the articles table.');
    }

    // Check pages table for article type
    console.log('\n\n=== PAGES TABLE (article type) ===');
    const { data: pages, error: pagesError } = await supabase
      .from('pages')
      .select('*')
      .eq('page_type', 'article')
      .limit(10);

    if (pagesError) {
      console.error('Error fetching pages:', pagesError);
    } else if (pages && pages.length > 0) {
      console.log(`Found ${pages.length} article pages:`);
      pages.forEach((page, index) => {
        console.log(`\n${index + 1}. Page ID: ${page.id}`);
        console.log(`   Title: ${page.title}`);
        console.log(`   Slug: ${page.slug}`);
        console.log(`   Status: ${page.status}`);
        console.log(`   Published: ${page.is_published ? 'Yes' : 'No'}`);
        console.log(`   Published At: ${page.published_at || 'Not set'}`);
      });
    } else {
      console.log('No article pages found in the pages table.');
    }

    // Check article_cards table
    console.log('\n\n=== ARTICLE_CARDS TABLE ===');
    const { data: cards, error: cardsError } = await supabase
      .from('article_cards')
      .select('*')
      .limit(10);

    if (cardsError) {
      console.error('Error fetching article cards:', cardsError);
    } else if (cards && cards.length > 0) {
      console.log(`Found ${cards.length} article cards:`);
      cards.forEach((card, index) => {
        console.log(`\n${index + 1}. Card ID: ${card.id}`);
        console.log(`   Article ID: ${card.article_id}`);
        console.log(`   Card Title: ${card.card_title}`);
        console.log(`   Card Description: ${card.card_description?.substring(0, 100)}...`);
        console.log(`   Card Style: ${card.card_style}`);
      });
    } else {
      console.log('No article cards found in the article_cards table.');
    }

    // Check content_blocks for any article content
    console.log('\n\n=== CONTENT_BLOCKS TABLE (sample) ===');
    const { data: blocks, error: blocksError } = await supabase
      .from('content_blocks')
      .select('*')
      .limit(5);

    if (blocksError) {
      console.error('Error fetching content blocks:', blocksError);
    } else if (blocks && blocks.length > 0) {
      console.log(`Found ${blocks.length} content blocks (showing first 5):`);
      blocks.forEach((block, index) => {
        console.log(`\n${index + 1}. Block ID: ${block.id}`);
        console.log(`   Page ID: ${block.page_id}`);
        console.log(`   Block Type: ${block.block_type}`);
        console.log(`   Order Index: ${block.order_index}`);
      });
    } else {
      console.log('No content blocks found.');
    }

  } catch (error) {
    console.error('Error checking articles:', error);
  }
}

checkArticles();