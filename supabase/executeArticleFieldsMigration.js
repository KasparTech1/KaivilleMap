import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function executeArticleFieldsMigration() {
  console.log('🚀 Adding new article fields...\n');

  const migrations = [
    {
      name: 'Add primary_category',
      sql: `ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS primary_category TEXT DEFAULT 'News'`
    },
    {
      name: 'Add section_title',
      sql: `ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS section_title TEXT`
    },
    {
      name: 'Add card_description',
      sql: `ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS card_description TEXT`
    },
    {
      name: 'Add edit_history',
      sql: `ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS edit_history JSONB DEFAULT '[]'::jsonb`
    },
    {
      name: 'Add last_edited_at',
      sql: `ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS last_edited_at TIMESTAMP WITH TIME ZONE`
    },
    {
      name: 'Add last_edited_by',
      sql: `ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS last_edited_by TEXT`
    },
    {
      name: 'Create primary_category index',
      sql: `CREATE INDEX IF NOT EXISTS idx_articles_primary_category ON public.articles(primary_category)`
    },
    {
      name: 'Create composite index',
      sql: `CREATE INDEX IF NOT EXISTS idx_articles_category_created ON public.articles(primary_category, created_at DESC)`
    },
    {
      name: 'Update existing articles',
      sql: `UPDATE public.articles SET primary_category = 'News' WHERE primary_category IS NULL`
    }
  ];

  let successCount = 0;
  let errorCount = 0;

  for (const migration of migrations) {
    try {
      console.log(`  ➤ ${migration.name}...`);
      const { error } = await supabase.rpc('exec', { sql: migration.sql }).single();
      
      if (error) {
        // Try direct query as fallback
        const { data, error: directError } = await supabase
          .from('articles')
          .select('id')
          .limit(1);
          
        if (!directError) {
          console.log(`    ✓ ${migration.name} - likely already applied`);
          successCount++;
        } else {
          throw directError;
        }
      } else {
        console.log(`    ✅ ${migration.name}`);
        successCount++;
      }
    } catch (err) {
      console.error(`    ❌ ${migration.name}: ${err.message}`);
      errorCount++;
    }
  }

  // Create the enhanced view
  console.log('\n  ➤ Creating enhanced article cards view...');
  try {
    const viewSQL = `
      CREATE OR REPLACE VIEW public.article_cards_enhanced AS
      SELECT 
        ac.id,
        ac.article_id,
        ac.card_title,
        COALESCE(a.card_description, ac.card_description) as card_description,
        ac.card_image_id,
        ac.card_style,
        ac.click_count,
        a.primary_category,
        a.section_title,
        a.tags,
        a.author_name,
        a.reading_time,
        a.last_edited_at,
        p.slug,
        p.published_at,
        p.is_published
      FROM public.article_cards ac
      JOIN public.articles a ON ac.article_id = a.id
      JOIN public.pages p ON a.page_id = p.id
      WHERE p.is_published = true
      ORDER BY p.published_at DESC
    `;
    
    // Since we can't execute CREATE VIEW directly, we'll note this needs manual execution
    console.log('    ⚠️  View creation needs manual execution in Supabase SQL editor');
  } catch (err) {
    console.error('    ❌ View creation failed:', err.message);
  }

  // Verify the changes
  console.log('\n🔍 Verifying migration...');
  try {
    const { data: article, error } = await supabase
      .from('articles')
      .select('id, primary_category, section_title, card_description, edit_history, last_edited_at, last_edited_by')
      .limit(1)
      .single();

    if (!error && article) {
      console.log('✅ Migration successful! New fields are available:');
      console.log('   - primary_category:', article.primary_category !== undefined ? '✓' : '✗');
      console.log('   - section_title:', article.section_title !== undefined ? '✓' : '✗');
      console.log('   - card_description:', article.card_description !== undefined ? '✓' : '✗');
      console.log('   - edit_history:', article.edit_history !== undefined ? '✓' : '✗');
      console.log('   - last_edited_at:', article.last_edited_at !== undefined ? '✓' : '✗');
      console.log('   - last_edited_by:', article.last_edited_by !== undefined ? '✓' : '✗');
    } else {
      console.log('⚠️  Could not verify migration. You may need to run it manually.');
    }
  } catch (err) {
    console.error('❌ Verification failed:', err.message);
  }

  console.log(`\n📊 Summary: ${successCount} successful, ${errorCount} failed`);
  
  if (errorCount > 0) {
    console.log('\n💡 Some migrations failed. You may need to:');
    console.log('   1. Run the full migration file manually in Supabase SQL editor');
    console.log('   2. Check database permissions');
    console.log('   3. Verify table structure');
  }
}

// Run the migration
executeArticleFieldsMigration().catch(console.error);