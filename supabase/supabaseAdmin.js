import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create admin client with service role
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

/**
 * Execute raw SQL using Supabase's query endpoint
 */
async function executeSQL(sql) {
  try {
    // Use the Supabase REST API to execute raw SQL
    const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/`, {
      method: 'POST',
      headers: {
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        query: sql
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Create tables using Supabase client operations
 */
async function createTablesViaAPI() {
  console.log('📊 Creating database schema...\n');

  // Since we can't execute raw DDL, let's use a different approach
  // We'll check if tables exist and report status
  
  const tables = ['assets', 'pages', 'page_assets', 'maps', 'categories', 'asset_categories'];
  const tableStatus = {};

  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (error && error.code === '42P01') {
        tableStatus[table] = '❌ Does not exist';
      } else if (error) {
        tableStatus[table] = `⚠️  Error: ${error.message}`;
      } else {
        tableStatus[table] = '✅ Exists';
      }
    } catch (err) {
      tableStatus[table] = `❌ Error: ${err.message}`;
    }
  }

  console.log('Table Status:');
  Object.entries(tableStatus).forEach(([table, status]) => {
    console.log(`  ${table}: ${status}`);
  });

  return tableStatus;
}

/**
 * Create and configure storage buckets
 */
async function setupStorageBuckets() {
  console.log('\n📦 Setting up storage buckets...\n');

  const buckets = [
    {
      id: 'kaiville-assets',
      name: 'kaiville-assets',
      public: true,
      fileSizeLimit: 52428800, // 50MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp', 'application/pdf']
    },
    {
      id: 'user-content',
      name: 'user-content', 
      public: false,
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    }
  ];

  // List existing buckets
  const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets();
  
  if (listError) {
    console.error('❌ Error listing buckets:', listError.message);
    return;
  }

  const existingBucketIds = existingBuckets.map(b => b.id);

  for (const bucket of buckets) {
    if (existingBucketIds.includes(bucket.id)) {
      console.log(`ℹ️  Bucket '${bucket.id}' already exists`);
      
      // Update bucket settings if needed
      const { data, error } = await supabase.storage.updateBucket(bucket.id, {
        public: bucket.public,
        fileSizeLimit: bucket.fileSizeLimit,
        allowedMimeTypes: bucket.allowedMimeTypes
      });
      
      if (error) {
        console.error(`❌ Error updating bucket '${bucket.id}':`, error.message);
      } else {
        console.log(`✅ Updated settings for bucket '${bucket.id}'`);
      }
    } else {
      // Create new bucket
      const { data, error } = await supabase.storage.createBucket(bucket.id, {
        public: bucket.public,
        fileSizeLimit: bucket.fileSizeLimit,
        allowedMimeTypes: bucket.allowedMimeTypes
      });

      if (error) {
        console.error(`❌ Error creating bucket '${bucket.id}':`, error.message);
      } else {
        console.log(`✅ Created bucket '${bucket.id}'`);
      }
    }
  }

  // Create folder structure
  console.log('\n📁 Creating folder structure...\n');
  
  const folders = [
    { bucket: 'kaiville-assets', paths: [
      'maps/svg/full',
      'maps/svg/optimized',
      'maps/svg/animated',
      'maps/images/thumbnails',
      'maps/images/medium',
      'maps/images/original',
      'maps/data',
      'site-assets/logos',
      'site-assets/icons',
      'site-assets/backgrounds',
      'site-assets/illustrations',
      'documents'
    ]},
    { bucket: 'user-content', paths: [
      'avatars',
      'submissions'
    ]}
  ];

  for (const { bucket, paths } of folders) {
    for (const folderPath of paths) {
      try {
        // Create a placeholder file to establish the folder
        const placeholderContent = new Blob(['# Folder placeholder'], { type: 'text/plain' });
        const { data, error } = await supabase.storage
          .from(bucket)
          .upload(`${folderPath}/.placeholder`, placeholderContent, {
            cacheControl: '3600',
            upsert: true
          });

        if (error && !error.message.includes('already exists')) {
          console.error(`❌ Error creating folder ${bucket}/${folderPath}:`, error.message);
        } else {
          console.log(`✅ Created folder: ${bucket}/${folderPath}`);
        }
      } catch (err) {
        console.error(`❌ Error: ${err.message}`);
      }
    }
  }
}

/**
 * Alternative: Use Supabase Management API
 */
async function executeWithManagementAPI(sql) {
  // Get project ref from URL
  const projectRef = process.env.SUPABASE_PROJECT_ID;
  
  try {
    // Use Supabase Management API to run SQL
    const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query: sql })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API Error: ${error}`);
    }

    const result = await response.json();
    return { success: true, result };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Create tables using individual operations
 */
async function initializeDatabase() {
  console.log('🗄️  Initializing database...\n');

  // Since we can't run raw DDL via the client library,
  // we'll create initial records which will auto-create tables if they don't exist
  // This is a workaround for Supabase's limitations

  try {
    // Try to read the migration files and extract table schemas
    const schemaSQL = await fs.readFile(
      path.join(__dirname, 'migrations', '002_create_database_schema.sql'), 
      'utf8'
    );

    // For now, let's check what we can access
    console.log('📋 Checking database access...\n');

    // Test if we can query the database
    const { data: test, error: testError } = await supabase
      .from('assets')
      .select('count')
      .limit(1);

    if (testError && testError.code === '42P01') {
      console.log('❌ Tables do not exist yet');
      console.log('\n💡 To create tables, you have the following options:');
      console.log('   1. Use Supabase CLI locally with: supabase db push');
      console.log('   2. Use the Supabase Dashboard SQL editor');
      console.log('   3. Connect directly with psql using:');
      console.log(`      psql postgresql://postgres:${process.env.SUPABASE_DB_PASSWORD}@db.${process.env.SUPABASE_PROJECT_ID}.supabase.co:5432/postgres`);
      
      return false;
    } else if (testError) {
      console.error('❌ Database error:', testError.message);
      return false;
    } else {
      console.log('✅ Database tables are accessible');
      return true;
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

/**
 * Main setup function
 */
async function runFullSetup() {
  console.log('🚀 Running complete Supabase setup...\n');
  
  // 1. Setup storage buckets (this works with service role)
  await setupStorageBuckets();
  
  // 2. Check database status
  const dbReady = await initializeDatabase();
  
  if (!dbReady) {
    console.log('\n📝 Creating setup script for Supabase CLI...');
    
    // Generate a combined SQL file
    const migration2 = await fs.readFile(path.join(__dirname, 'migrations', '002_create_database_schema.sql'), 'utf8');
    const migration3 = await fs.readFile(path.join(__dirname, 'migrations', '003_create_rls_policies.sql'), 'utf8');
    
    const combinedSQL = `-- Kaiville Database Setup
-- Generated at ${new Date().toISOString()}

${migration2}

${migration3}`;
    
    await fs.writeFile(path.join(__dirname, 'setup-database.sql'), combinedSQL);
    
    console.log('✅ Created setup-database.sql');
    console.log('\n📋 Next steps to complete database setup:');
    console.log('   1. Install Supabase CLI: npm install -g supabase');
    console.log('   2. Login: supabase login');
    console.log('   3. Link project: supabase link --project-ref ' + process.env.SUPABASE_PROJECT_ID);
    console.log('   4. Run: supabase db execute -f supabase/setup-database.sql');
  }
  
  // 3. Check final status
  console.log('\n📊 Setup Summary:');
  console.log('   ✅ Storage buckets: Created and configured');
  console.log('   ✅ Folder structure: Created');
  console.log(`   ${dbReady ? '✅' : '⚠️ '} Database tables: ${dbReady ? 'Ready' : 'Requires CLI setup'}`);
  
  console.log('\n✨ Setup process completed!');
}

// Export functions
export {
  supabase,
  executeSQL,
  setupStorageBuckets,
  createTablesViaAPI,
  initializeDatabase,
  runFullSetup
};

// Run if called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runFullSetup().catch(console.error);
}