import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with production values
const supabaseUrl = 'https://yvbtqcmiuymyvtvaqgcf.supabase.co';
// Use service role key for DDL operations
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2YnRxY21pdXlteXZ0dmFxZ2NmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTI5MDc4NywiZXhwIjoyMDY2ODY2Nzg3fQ.FuJpZMHnOB7qyiQgz-0jyGgFflxBJdPGKaIEcTqfRnk';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addDisplayOrderColumn() {
  console.log('Adding display_order column to articles table...\n');

  try {
    // First, check if the column already exists
    const { data: columns, error: columnError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'articles')
      .eq('column_name', 'display_order');

    if (columnError) {
      console.error('Error checking for existing column:', columnError);
      return;
    }

    if (columns && columns.length > 0) {
      console.log('✅ display_order column already exists');
      return;
    }

    // Add the column using raw SQL via the REST API
    const alterTableSQL = `
      ALTER TABLE articles ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT NULL;
      CREATE INDEX IF NOT EXISTS idx_articles_display_order ON articles(display_order);
    `;

    // Execute the SQL using the RPC function
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: alterTableSQL
    });

    if (error) {
      console.error('Error adding display_order column:', error);
      console.log('\n💡 Alternative approach:');
      console.log('1. Connect to your database using psql or Supabase SQL Editor');
      console.log('2. Run this SQL:');
      console.log('   ALTER TABLE articles ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT NULL;');
      console.log('   CREATE INDEX IF NOT EXISTS idx_articles_display_order ON articles(display_order);');
      return;
    }

    console.log('✅ Successfully added display_order column to articles table');
    console.log('✅ Created index for better performance');

    // Initialize display_order for existing articles
    console.log('\nInitializing display_order for existing articles...');
    
    const { data: existingArticles, error: fetchError } = await supabase
      .from('articles')
      .select('id, created_at')
      .is('display_order', null)
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('Error fetching existing articles:', fetchError);
      return;
    }

    if (existingArticles && existingArticles.length > 0) {
      console.log(`Found ${existingArticles.length} articles without display_order`);
      
      // Update each article with an order based on creation date
      for (let i = 0; i < existingArticles.length; i++) {
        const article = existingArticles[i];
        const { error: updateError } = await supabase
          .from('articles')
          .update({ display_order: i + 1 })
          .eq('id', article.id);

        if (updateError) {
          console.error(`Error updating article ${article.id}:`, updateError);
        } else {
          console.log(`✅ Set display_order=${i + 1} for article ${article.id}`);
        }
      }
    } else {
      console.log('No articles found that need display_order initialization');
    }

    console.log('\n🎉 Migration completed successfully!');
    console.log('Articles can now be reordered using drag and drop in the KNN News feed.');

  } catch (error) {
    console.error('Error during migration:', error);
  }
}

addDisplayOrderColumn();