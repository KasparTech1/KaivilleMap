import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPABASE_API_URL = 'https://api.supabase.com/v1';
const PROJECT_REF = process.env.SUPABASE_PROJECT_ID;
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;

/**
 * Execute SQL using Supabase Management API
 */
async function executeSQL(sql) {
  try {
    console.log('📤 Sending SQL query to Management API...');
    
    const response = await fetch(`${SUPABASE_API_URL}/projects/${PROJECT_REF}/database/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query: sql })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API Error (${response.status}): ${error}`);
    }

    const result = await response.json();
    return { success: true, result };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function runArticleFieldsMigration() {
  console.log('🚀 Adding article fields via Supabase Management API...\n');

  // Individual ALTER statements for better error handling
  const alterStatements = [
    {
      name: 'Add primary_category',
      sql: `ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS primary_category TEXT DEFAULT 'News';`
    },
    {
      name: 'Add section_title',
      sql: `ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS section_title TEXT;`
    },
    {
      name: 'Add card_description',
      sql: `ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS card_description TEXT;`
    },
    {
      name: 'Add edit_history',
      sql: `ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS edit_history JSONB DEFAULT '[]'::jsonb;`
    },
    {
      name: 'Add last_edited_at',
      sql: `ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS last_edited_at TIMESTAMP WITH TIME ZONE;`
    },
    {
      name: 'Add last_edited_by',
      sql: `ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS last_edited_by TEXT;`
    }
  ];

  let successCount = 0;
  let errorCount = 0;

  // Execute each ALTER statement
  for (const stmt of alterStatements) {
    console.log(`\n➤ ${stmt.name}...`);
    const result = await executeSQL(stmt.sql);
    
    if (result.success) {
      console.log(`  ✅ ${stmt.name} - Success`);
      successCount++;
    } else {
      console.error(`  ❌ ${stmt.name} - Failed: ${result.error}`);
      errorCount++;
    }
  }

  // Create indexes
  console.log('\n📇 Creating indexes...');
  
  const indexStatements = [
    {
      name: 'Create primary_category index',
      sql: `CREATE INDEX IF NOT EXISTS idx_articles_primary_category ON public.articles(primary_category);`
    },
    {
      name: 'Create composite index',
      sql: `CREATE INDEX IF NOT EXISTS idx_articles_category_created ON public.articles(primary_category, created_at DESC);`
    }
  ];

  for (const stmt of indexStatements) {
    console.log(`\n➤ ${stmt.name}...`);
    const result = await executeSQL(stmt.sql);
    
    if (result.success) {
      console.log(`  ✅ ${stmt.name} - Success`);
      successCount++;
    } else {
      console.error(`  ❌ ${stmt.name} - Failed: ${result.error}`);
      errorCount++;
    }
  }

  // Add constraint
  console.log('\n🔒 Adding category constraint...');
  const constraintSQL = `
    DO $$ 
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'check_valid_category'
      ) THEN
        ALTER TABLE public.articles
        ADD CONSTRAINT check_valid_category 
        CHECK (primary_category IN ('News', 'Community', 'Technology', 'Sports', 'Arts & Culture', 'Business', 'Environment'));
      END IF;
    END $$;
  `;
  
  const constraintResult = await executeSQL(constraintSQL);
  if (constraintResult.success) {
    console.log('  ✅ Category constraint added');
    successCount++;
  } else {
    console.error('  ❌ Constraint failed:', constraintResult.error);
    errorCount++;
  }

  // Update existing articles
  console.log('\n📝 Updating existing articles...');
  const updateSQL = `UPDATE public.articles SET primary_category = 'News' WHERE primary_category IS NULL;`;
  
  const updateResult = await executeSQL(updateSQL);
  if (updateResult.success) {
    console.log('  ✅ Existing articles updated');
    successCount++;
  } else {
    console.error('  ❌ Update failed:', updateResult.error);
    errorCount++;
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log(`📊 Migration Summary:`);
  console.log(`   ✅ Successful operations: ${successCount}`);
  console.log(`   ❌ Failed operations: ${errorCount}`);
  
  if (errorCount === 0) {
    console.log('\n🎉 All migrations completed successfully!');
  } else {
    console.log('\n⚠️  Some operations failed. Check the errors above.');
  }
}

// Run the migration
runArticleFieldsMigration().catch(console.error);