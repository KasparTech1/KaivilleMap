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

async function debugAIWarsContent() {
  console.log('Debugging AI Wars article content...\n');

  const slug = 'knn/ai-wars-gpt4-5-flops-grok-rises-1751324130520';

  try {
    // Get the page data
    const { data: pageData, error: pageError } = await supabase
      .from('pages')
      .select('*')
      .eq('slug', slug)
      .single();

    if (pageError) {
      console.error('Page Error:', pageError);
      return;
    }

    console.log('PAGE DATA:');
    console.log('ID:', pageData.id);
    console.log('Title:', pageData.title);
    console.log('Description:', pageData.description);
    console.log('\nCONTENT field (full):');
    console.log(JSON.stringify(pageData.content, null, 2));
    
    // Get article data
    const { data: articleData, error: articleError } = await supabase
      .from('articles')
      .select('*')
      .eq('page_id', pageData.id)
      .single();

    if (articleData) {
      console.log('\n\nARTICLE DATA:');
      console.log('ID:', articleData.id);
      console.log('Headline:', articleData.headline);
      console.log('Content field:', articleData.content);
      console.log('\nContent Blocks field (full):');
      console.log(JSON.stringify(articleData.content_blocks, null, 2));
    }

    // Check for any content blocks
    const { data: blocks } = await supabase
      .from('content_blocks')
      .select('*')
      .eq('page_id', pageData.id);

    console.log('\n\nCONTENT BLOCKS TABLE:');
    console.log('Found blocks:', blocks?.length || 0);
    if (blocks && blocks.length > 0) {
      blocks.forEach((block, i) => {
        console.log(`\nBlock ${i}:`, JSON.stringify(block, null, 2));
      });
    }

    // Let's also check what the article page would receive
    console.log('\n\nWHAT THE ARTICLE PAGE SEES:');
    console.log('pageData.content type:', typeof pageData.content);
    console.log('pageData.content is array:', Array.isArray(pageData.content));
    console.log('articleData.content_blocks type:', typeof articleData.content_blocks);
    console.log('articleData.content_blocks is array:', Array.isArray(articleData.content_blocks));

  } catch (error) {
    console.error('Error:', error);
  }
}

debugAIWarsContent();