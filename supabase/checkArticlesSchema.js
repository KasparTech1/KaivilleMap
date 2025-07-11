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

async function checkArticlesSchema() {
  console.log('🔍 Checking articles table schema...\n');
  
  try {
    // Try to get an article with all fields
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Error querying articles:', error.message);
      return;
    }
    
    if (data && data.length > 0) {
      console.log('📋 Articles table columns:');
      const columns = Object.keys(data[0]);
      columns.forEach(col => {
        console.log(`   - ${col}: ${typeof data[0][col]}`);
      });
      
      console.log('\n🔍 Checking for new columns:');
      const newColumns = ['primary_category', 'section_title', 'card_description', 'edit_history', 'last_edited_at', 'last_edited_by'];
      
      newColumns.forEach(col => {
        if (columns.includes(col)) {
          console.log(`   ✅ ${col} exists`);
        } else {
          console.log(`   ❌ ${col} missing`);
        }
      });
    } else {
      console.log('⚠️  No articles found in table');
    }
    
  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

checkArticlesSchema().catch(console.error);