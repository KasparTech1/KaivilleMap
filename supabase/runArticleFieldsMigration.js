import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Create admin client with service role key
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

async function runMigration() {
  console.log('🚀 Running article fields migration via Supabase Admin...\n');

  try {
    // According to the docs, we can use supabase.rpc() for admin functions
    // First, let's check if we have admin functions available
    console.log('📊 Checking current articles structure...');
    
    const { data: articles, error: checkError } = await supabase
      .from('articles')
      .select('*')
      .limit(1);

    if (checkError) {
      console.error('❌ Error checking articles:', checkError);
      return;
    }

    console.log('✅ Connected to database successfully');
    
    if (articles && articles.length > 0) {
      const existingColumns = Object.keys(articles[0]);
      console.log('\n📋 Current columns:', existingColumns.join(', '));
      
      // Check if new columns already exist
      const newColumns = ['primary_category', 'section_title', 'card_description', 'edit_history', 'last_edited_at', 'last_edited_by'];
      const missingColumns = newColumns.filter(col => !existingColumns.includes(col));
      
      if (missingColumns.length === 0) {
        console.log('\n✅ All columns already exist!');
        return;
      }
      
      console.log('\n❌ Missing columns:', missingColumns.join(', '));
    }

    // Try to use the admin functions from the CMS
    console.log('\n🔧 Attempting to use admin functions...');
    
    // Check if we can create an admin session
    const { data: sessionData, error: sessionError } = await supabase
      .rpc('create_admin_session', {
        password: 'kaiville25',
        ip: '127.0.0.1',
        agent: 'Migration Script'
      });

    if (!sessionError && sessionData) {
      console.log('✅ Admin session created successfully');
      console.log('🔑 Session token:', sessionData.session_token);
      
      // Now we could use update functions with this token
      // However, for schema changes, we need direct SQL execution
    }

    // Alternative approach: Use the Supabase Dashboard API
    console.log('\n💡 Alternative approach needed for schema changes.');
    console.log('\n📝 Please run the following steps:');
    console.log('\n1. Go to your Supabase Dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Run the migration file: /supabase/migrations/007_add_article_fields_MANUAL.sql');
    console.log('\n🔍 Or try using the Supabase CLI:');
    console.log('   npx supabase db push --include migrations/007_add_article_fields.sql');
    
    // Let's at least verify we can update articles once the columns exist
    console.log('\n🧪 Testing article update capability...');
    
    if (articles && articles.length > 0) {
      const testArticle = articles[0];
      const { error: updateError } = await supabase
        .from('articles')
        .update({ 
          updated_at: new Date().toISOString() 
        })
        .eq('id', testArticle.id);
      
      if (!updateError) {
        console.log('✅ Article update capability confirmed');
      } else {
        console.log('❌ Update error:', updateError.message);
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the migration
runMigration().catch(console.error);