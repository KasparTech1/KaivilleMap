import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with production values
const supabaseUrl = 'https://yvbtqcmiuymyvtvaqgcf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2YnRxY21pdXlteXZ0dmFxZ2NmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyOTA3ODcsImV4cCI6MjA2Njg2Njc4N30.Rv05YRSTAOcv1rDpaB13uyno8RgHDU_XIldZP1-d7cc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkArticles() {
  try {
    console.log('Checking articles in the database...\n');

    // Check pages table for articles
    const { data: pages, error: pagesError } = await supabase
      .from('pages')
      .select('*')
      .eq('page_type', 'article');
    
    console.log(`Pages with type 'article': ${pages?.length || 0}`);
    if (pages && pages.length > 0) {
      pages.forEach(page => {
        console.log(`- ${page.slug}: ${page.title} (${page.status}, published: ${page.is_published})`);
      });
    }

    // Check articles table
    const { data: articles, error: articlesError } = await supabase
      .from('articles')
      .select('*');
    
    console.log(`\nArticles table entries: ${articles?.length || 0}`);
    if (articles && articles.length > 0) {
      articles.forEach(article => {
        console.log(`- ${article.headline} by ${article.author_name}`);
      });
    }

    // Check article_cards table
    const { data: cards, error: cardsError } = await supabase
      .from('article_cards')
      .select('*');
    
    console.log(`\nArticle cards: ${cards?.length || 0}`);
    if (cards && cards.length > 0) {
      cards.forEach(card => {
        console.log(`- ${card.card_title}`);
      });
    }

    // Check the full joined query that KNNFeedPage uses
    const { data: fullQuery, error: fullError } = await supabase
      .from('article_cards')
      .select(`
        *,
        articles!inner (
          *,
          pages!inner (
            *
          )
        )
      `)
      .eq('articles.pages.is_published', true)
      .eq('articles.pages.status', 'published');

    console.log(`\nPublished articles with cards (as seen by KNN Feed): ${fullQuery?.length || 0}`);
    if (fullQuery && fullQuery.length > 0) {
      fullQuery.forEach(item => {
        console.log(`- ${item.card_title} (${item.articles.pages.slug})`);
      });
    }

  } catch (error) {
    console.error('Error checking articles:', error);
  }
}

checkArticles();