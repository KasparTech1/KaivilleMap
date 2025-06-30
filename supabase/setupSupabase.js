import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Supabase client with service role key for admin access
const supabaseAdmin = createClient(
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
 * Run SQL migrations
 */
async function runMigrations() {
  console.log('🚀 Running database migrations...');
  
  const migrationsDir = path.join(__dirname, 'migrations');
  const migrationFiles = await fs.readdir(migrationsDir);
  
  for (const file of migrationFiles.sort()) {
    if (file.endsWith('.sql')) {
      console.log(`📝 Running migration: ${file}`);
      const sql = await fs.readFile(path.join(migrationsDir, file), 'utf8');
      
      try {
        // Split by semicolons but be careful with storage bucket inserts
        const statements = sql
          .split(/;\s*(?=(?:[^']*'[^']*')*[^']*$)/)
          .filter(stmt => stmt.trim().length > 0);
        
        for (const statement of statements) {
          const { error } = await supabaseAdmin.rpc('exec_sql', {
            sql: statement.trim()
          });
          
          if (error) {
            // Try alternative approach for storage operations
            if (statement.includes('storage.buckets')) {
              console.log('📦 Creating storage buckets via API...');
              await createStorageBuckets();
            } else {
              throw error;
            }
          }
        }
        console.log(`✅ Completed: ${file}`);
      } catch (error) {
        console.error(`❌ Error in ${file}:`, error.message);
        throw error;
      }
    }
  }
}

/**
 * Create storage buckets using the Storage API
 */
async function createStorageBuckets() {
  console.log('📦 Creating storage buckets...');
  
  const buckets = [
    {
      id: 'kaiville-assets',
      name: 'kaiville-assets',
      public: true,
      fileSizeLimit: 52428800, // 50MB
      allowedMimeTypes: [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/svg+xml',
        'image/webp',
        'application/pdf'
      ]
    },
    {
      id: 'user-content',
      name: 'user-content',
      public: false,
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp'
      ]
    }
  ];

  for (const bucket of buckets) {
    try {
      const { data, error } = await supabaseAdmin.storage.createBucket(bucket.id, {
        public: bucket.public,
        fileSizeLimit: bucket.fileSizeLimit,
        allowedMimeTypes: bucket.allowedMimeTypes
      });

      if (error) {
        if (error.message.includes('already exists')) {
          console.log(`ℹ️  Bucket ${bucket.id} already exists`);
        } else {
          throw error;
        }
      } else {
        console.log(`✅ Created bucket: ${bucket.id}`);
      }
    } catch (error) {
      console.error(`❌ Error creating bucket ${bucket.id}:`, error.message);
    }
  }
}

/**
 * Create folder structure by uploading placeholder files
 */
async function createFolderStructure() {
  console.log('📁 Creating folder structure...');
  
  const folders = [
    'kaiville-assets/maps/svg/full/.placeholder',
    'kaiville-assets/maps/svg/optimized/.placeholder',
    'kaiville-assets/maps/svg/animated/.placeholder',
    'kaiville-assets/maps/images/thumbnails/.placeholder',
    'kaiville-assets/maps/images/medium/.placeholder',
    'kaiville-assets/maps/images/original/.placeholder',
    'kaiville-assets/maps/data/.placeholder',
    'kaiville-assets/site-assets/logos/.placeholder',
    'kaiville-assets/site-assets/icons/.placeholder',
    'kaiville-assets/site-assets/backgrounds/.placeholder',
    'kaiville-assets/site-assets/illustrations/.placeholder',
    'kaiville-assets/documents/.placeholder',
    'user-content/avatars/.placeholder',
    'user-content/submissions/.placeholder'
  ];

  const placeholderContent = new Blob([''], { type: 'text/plain' });

  for (const folderPath of folders) {
    const [bucket, ...pathParts] = folderPath.split('/');
    const filePath = pathParts.join('/');
    
    try {
      const { error } = await supabaseAdmin.storage
        .from(bucket)
        .upload(filePath, placeholderContent, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.log(`ℹ️  Folder ${folderPath} may already exist`);
      } else {
        console.log(`✅ Created folder: ${folderPath}`);
      }
    } catch (error) {
      console.error(`❌ Error creating folder ${folderPath}:`, error.message);
    }
  }
}

/**
 * Run database migrations using direct SQL execution
 */
async function runDatabaseSetup() {
  console.log('🗄️  Setting up database...');
  
  // Read migration files
  const migration2 = await fs.readFile(path.join(__dirname, 'migrations/002_create_database_schema.sql'), 'utf8');
  const migration3 = await fs.readFile(path.join(__dirname, 'migrations/003_create_rls_policies.sql'), 'utf8');
  
  // Execute migrations
  try {
    const { error: error2 } = await supabaseAdmin.from('_migrations').select('*').limit(1);
    
    if (!error2) {
      // Database is accessible, run migrations
      console.log('📝 Creating database schema...');
      
      // For complex migrations, we'll use the REST API directly
      const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
        },
        body: JSON.stringify({ sql: migration2 })
      });
      
      if (!response.ok) {
        // Try alternative: Direct database connection might be needed
        console.log('ℹ️  Note: Some migrations may need to be run manually in the Supabase dashboard');
      } else {
        console.log('✅ Database schema created');
      }
    }
  } catch (error) {
    console.log('ℹ️  Note: Run the SQL migrations manually in the Supabase SQL editor');
  }
}

/**
 * Main setup function
 */
async function setupSupabase() {
  console.log('🎯 Starting Supabase setup for Kaiville...\n');
  
  try {
    // Create storage buckets
    await createStorageBuckets();
    
    // Create folder structure
    await createFolderStructure();
    
    // Run database setup
    await runDatabaseSetup();
    
    console.log('\n✨ Supabase setup completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Run the SQL migrations in the Supabase SQL editor (if not auto-applied)');
    console.log('2. Verify buckets in the Storage section of your dashboard');
    console.log('3. Test uploading files using the assetHelpers.js functions');
    
  } catch (error) {
    console.error('\n❌ Setup failed:', error);
    process.exit(1);
  }
}

// Run setup if this file is executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  setupSupabase();
}

export { setupSupabase, createStorageBuckets, createFolderStructure };