import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create admin client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    db: {
      schema: 'public'
    }
  }
);

async function executeSQLFile(filePath) {
  console.log(`\n📄 Executing: ${path.basename(filePath)}`);
  
  try {
    const sql = await fs.readFile(filePath, 'utf8');
    
    // Split SQL statements more carefully
    const statements = sql
      .split(/;\s*$/gm)
      .filter(stmt => stmt.trim().length > 0)
      .map(stmt => stmt.trim() + ';');
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip empty statements or comments
      if (!statement.trim() || statement.trim().startsWith('--')) {
        continue;
      }
      
      try {
        // For storage bucket operations, use the storage API
        if (statement.includes('storage.buckets')) {
          console.log('🗄️  Handling storage bucket creation via API...');
          continue; // Skip as we'll handle this separately
        }
        
        // Execute regular SQL
        const { error } = await supabase.rpc('exec_sql', {
          sql: statement
        });
        
        if (error) {
          // Try direct execution as fallback
          const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/rpc`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
              'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
              query: statement
            })
          });
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${await response.text()}`);
          }
        }
        
        successCount++;
        process.stdout.write('.');
      } catch (error) {
        errorCount++;
        console.error(`\n❌ Error in statement ${i + 1}: ${error.message}`);
        console.error('Statement:', statement.substring(0, 100) + '...');
      }
    }
    
    console.log(`\n✅ Completed: ${successCount} successful, ${errorCount} errors`);
    return { success: successCount, errors: errorCount };
    
  } catch (error) {
    console.error(`❌ Failed to read file: ${error.message}`);
    return { success: 0, errors: 1 };
  }
}

async function runAllMigrations() {
  console.log('🚀 Starting Supabase migrations...\n');
  
  const results = {
    total: 0,
    successful: 0,
    failed: 0
  };
  
  // First ensure buckets exist
  console.log('📦 Ensuring storage buckets exist...');
  try {
    // Check and create kaiville-assets bucket
    const { data: buckets } = await supabase.storage.listBuckets();
    const existingBuckets = buckets?.map(b => b.id) || [];
    
    if (!existingBuckets.includes('kaiville-assets')) {
      await supabase.storage.createBucket('kaiville-assets', {
        public: true,
        fileSizeLimit: 52428800,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp', 'application/pdf']
      });
      console.log('✅ Created kaiville-assets bucket');
    } else {
      console.log('ℹ️  kaiville-assets bucket already exists');
    }
    
    if (!existingBuckets.includes('user-content')) {
      await supabase.storage.createBucket('user-content', {
        public: false,
        fileSizeLimit: 10485760,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      });
      console.log('✅ Created user-content bucket');
    } else {
      console.log('ℹ️  user-content bucket already exists');
    }
  } catch (error) {
    console.error('❌ Error creating buckets:', error.message);
  }
  
  // Run database migrations
  const migrationFiles = [
    '002_create_database_schema.sql',
    '003_create_rls_policies.sql'
  ];
  
  for (const file of migrationFiles) {
    const filePath = path.join(__dirname, 'migrations', file);
    results.total++;
    
    try {
      const { success, errors } = await executeSQLFile(filePath);
      if (errors === 0) {
        results.successful++;
      } else {
        results.failed++;
      }
    } catch (error) {
      results.failed++;
      console.error(`❌ Failed to execute ${file}: ${error.message}`);
    }
  }
  
  console.log('\n📊 Migration Summary:');
  console.log(`   Total migrations: ${results.total}`);
  console.log(`   ✅ Successful: ${results.successful}`);
  console.log(`   ❌ Failed: ${results.failed}`);
  
  // Test database connection
  console.log('\n🔍 Testing database setup...');
  try {
    const { data, error } = await supabase
      .from('assets')
      .select('count')
      .limit(1);
    
    if (!error) {
      console.log('✅ Database tables are accessible');
    } else {
      console.log('⚠️  Database tables may need manual setup');
      console.log('   Please run the migrations manually in the Supabase SQL editor');
    }
  } catch (error) {
    console.log('⚠️  Could not verify database setup');
  }
  
  console.log('\n✨ Migration process completed!');
}

// Alternative approach using direct SQL execution
async function executeDirectSQL() {
  console.log('\n🔧 Attempting direct SQL execution...\n');
  
  const migrations = await fs.readdir(path.join(__dirname, 'migrations'));
  
  for (const file of migrations.sort()) {
    if (!file.endsWith('.sql')) continue;
    
    console.log(`📝 Processing ${file}...`);
    const sql = await fs.readFile(path.join(__dirname, 'migrations', file), 'utf8');
    
    try {
      // Use Supabase REST API directly
      const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/rpc`, {
        method: 'POST',
        headers: {
          'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          query_type: 'execute',
          sql: sql
        })
      });
      
      if (response.ok) {
        console.log(`✅ ${file} executed successfully`);
      } else {
        const error = await response.text();
        console.log(`⚠️  ${file} may require manual execution: ${error}`);
      }
    } catch (error) {
      console.error(`❌ Error executing ${file}: ${error.message}`);
    }
  }
}

// Run migrations
runAllMigrations().catch(console.error);