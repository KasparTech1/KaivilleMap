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

async function checkArticleContent() {
  console.log('Checking content for all three articles...\n');

  const articleInfo = [
    { slug: 'welcome-to-kaiville', title: 'Welcome to Kaiville' },
    { slug: 'knn/wizardlm-70b-review-new-llm-king-1751320948471', title: 'WizardLM 70B Review' },
    { slug: 'knn/ai-wars-gpt4-5-flops-grok-rises-1751324130520', title: 'AI Wars' }
  ];

  for (const info of articleInfo) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`ARTICLE: ${info.title}`);
    console.log(`Slug: ${info.slug}`);
    console.log('='.repeat(60));

    try {
      // 1. Check page data
      const { data: pageData, error: pageError } = await supabase
        .from('pages')
        .select('*')
        .eq('slug', info.slug)
        .single();

      if (pageError) {
        console.log(`❌ Page Error: ${pageError.message}`);
        continue;
      }

      console.log('\n📄 PAGE DATA:');
      console.log(`   ID: ${pageData.id}`);
      console.log(`   Title: ${pageData.title}`);
      console.log(`   Status: ${pageData.status}`);
      console.log(`   Published: ${pageData.is_published}`);
      console.log(`   Description: ${pageData.description || 'None'}`);
      console.log(`   Content: ${pageData.content ? JSON.stringify(pageData.content).substring(0, 100) + '...' : 'None'}`);

      // 2. Check article data
      const { data: articleData, error: articleError } = await supabase
        .from('articles')
        .select('*')
        .eq('page_id', pageData.id)
        .single();

      if (articleError && articleError.code !== 'PGRST116') {
        console.log(`\n❌ Article Error: ${articleError.message}`);
      } else if (articleData) {
        console.log('\n📰 ARTICLE DATA:');
        console.log(`   ID: ${articleData.id}`);
        console.log(`   Headline: ${articleData.headline}`);
        console.log(`   Subheadline: ${articleData.subheadline || 'None'}`);
        console.log(`   Author: ${articleData.author_name}`);
        console.log(`   Reading Time: ${articleData.reading_time} min`);
        console.log(`   Content: ${articleData.content ? articleData.content.substring(0, 100) + '...' : 'None'}`);
        console.log(`   Content Blocks: ${articleData.content_blocks ? JSON.stringify(articleData.content_blocks).substring(0, 100) + '...' : 'None'}`);
      } else {
        console.log('\n⚠️  No article data found for this page');
      }

      // 3. Check content blocks
      const { data: contentBlocks, error: blocksError } = await supabase
        .from('content_blocks')
        .select('*')
        .eq('page_id', pageData.id)
        .order('order_index');

      if (blocksError) {
        console.log(`\n❌ Content Blocks Error: ${blocksError.message}`);
      } else if (contentBlocks && contentBlocks.length > 0) {
        console.log(`\n📦 CONTENT BLOCKS: ${contentBlocks.length} blocks found`);
        contentBlocks.forEach((block, index) => {
          console.log(`\n   Block ${index + 1}:`);
          console.log(`   - Type: ${block.block_type}`);
          console.log(`   - Order: ${block.order_index}`);
          console.log(`   - Visible: ${block.is_visible}`);
          if (block.content) {
            console.log(`   - Content: ${JSON.stringify(block.content).substring(0, 150)}...`);
          }
        });
      } else {
        console.log('\n⚠️  No content blocks found for this page');
      }

    } catch (error) {
      console.error(`\nError checking ${info.title}:`, error);
    }
  }
}

checkArticleContent();