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

async function createArticleCards() {
  console.log('Creating article cards for existing articles...\n');

  try {
    // Define the article cards to create
    const articleCards = [
      {
        article_id: 'c1b6e7d8-46f8-41d6-ba1b-4680d16f2a8e',
        card_title: 'Welcome to Kaiville Interactive Map',
        card_description: 'Discover the heart of our community through this interactive map. Learn about our buildings, history, and what makes Kaiville special.',
        card_style: 'featured',
        card_image_id: null
      },
      {
        article_id: '6d8ec523-ed25-4264-90f0-ab9a819304c2',
        card_title: 'WizardLM 70B Review: New LLM King?',
        card_description: 'An in-depth analysis of the new WizardLM 70B model and its performance compared to other large language models in the market.',
        card_style: 'default',
        card_image_id: null
      },
      {
        article_id: 'b918c9bc-6440-4846-add2-6851e2606137',
        card_title: 'AI Wars: GPT4.5 Flops, Grok Rises?',
        card_description: 'The latest developments in the AI industry as GPT-4.5 faces criticism while Elon Musk\'s Grok gains traction among developers.',
        card_style: 'default',
        card_image_id: null
      }
    ];

    // Insert article cards
    console.log('Inserting article cards...');
    const { data, error } = await supabase
      .from('article_cards')
      .insert(articleCards)
      .select();

    if (error) {
      console.error('Error creating article cards:', error);
      return;
    }

    console.log(`\nSuccessfully created ${data.length} article cards:`);
    data.forEach((card, index) => {
      console.log(`\n${index + 1}. ${card.card_title}`);
      console.log(`   ID: ${card.id}`);
      console.log(`   Article ID: ${card.article_id}`);
      console.log(`   Style: ${card.card_style}`);
    });

    // Update the published_at field for the Welcome article if needed
    console.log('\n\nUpdating published_at for Welcome article...');
    const { error: updateError } = await supabase
      .from('pages')
      .update({ published_at: new Date().toISOString() })
      .eq('id', '64ec916b-4906-4569-9686-647404da9894')
      .is('published_at', null);

    if (updateError) {
      console.error('Error updating published_at:', updateError);
    } else {
      console.log('Updated published_at timestamp for Welcome article.');
    }

    console.log('\n✅ Article cards created successfully! The articles should now appear in the KNN news feed.');

  } catch (error) {
    console.error('Error creating article cards:', error);
  }
}

createArticleCards();