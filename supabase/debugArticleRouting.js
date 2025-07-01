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

async function debugArticleRouting() {
  console.log('Debugging article routing...\n');

  try {
    // Check what the news feed is actually sending
    console.log('=== CHECKING ARTICLE CARDS WITH PAGES ===');
    const { data: cards, error: cardsError } = await supabase
      .from('article_cards')
      .select(`
        *,
        articles (
          *,
          pages (
            *
          )
        )
      `);

    if (cardsError) {
      console.error('Error fetching cards:', cardsError);
      return;
    }

    console.log(`Found ${cards.length} article cards with page data:\n`);
    cards.forEach((card, index) => {
      console.log(`${index + 1}. Card: ${card.card_title}`);
      console.log(`   Article ID: ${card.article_id}`);
      if (card.articles) {
        console.log(`   Article exists: Yes`);
        if (card.articles.pages) {
          console.log(`   Page slug: ${card.articles.pages.slug}`);
          console.log(`   Page type: ${card.articles.pages.page_type}`);
          console.log(`   Is published: ${card.articles.pages.is_published}`);
          console.log(`   Status: ${card.articles.pages.status}`);
        } else {
          console.log(`   ❌ No pages data linked to article`);
        }
      } else {
        console.log(`   ❌ No article linked to card`);
      }
      console.log('');
    });

    // Check if we can query by slug
    console.log('\n=== TESTING SLUG QUERIES ===');
    const testSlugs = [
      'welcome-to-kaiville',
      'knn/wizardlm-70b-review-new-llm-king-1751320948471',
      'knn/ai-wars-gpt4-5-flops-grok-rises-1751324130520'
    ];

    for (const slug of testSlugs) {
      console.log(`\nTesting slug: ${slug}`);
      const { data, error } = await supabase
        .from('pages')
        .select(`
          *,
          articles (*)
        `)
        .eq('slug', slug)
        .eq('page_type', 'article')
        .single();

      if (error) {
        console.log(`   ❌ Error: ${error.message}`);
      } else if (data) {
        console.log(`   ✅ Found page: ${data.title}`);
        console.log(`   Has article data: ${data.articles ? 'Yes' : 'No'}`);
      }
    }

  } catch (error) {
    console.error('Error debugging:', error);
  }
}

debugArticleRouting();