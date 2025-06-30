import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// PostgreSQL connection string
const connectionString = `postgresql://postgres.${process.env.SUPABASE_PROJECT_ID}:${process.env.SUPABASE_DB_PASSWORD}@aws-0-us-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true`;

async function createTables() {
  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔌 Connecting to Supabase database...');
    await client.connect();
    console.log('✅ Connected successfully!\n');

    // Read migration files
    const migrations = [
      '002_create_database_schema.sql',
      '003_create_rls_policies.sql'
    ];

    for (const migrationFile of migrations) {
      console.log(`📄 Running ${migrationFile}...`);
      
      const filePath = path.join(__dirname, 'migrations', migrationFile);
      const sql = await fs.readFile(filePath, 'utf8');
      
      // Split into individual statements
      const statements = sql
        .split(/;\s*$/gm)
        .filter(stmt => stmt.trim().length > 0 && !stmt.trim().startsWith('--'))
        .map(stmt => stmt.trim() + ';');

      let successCount = 0;
      let skipCount = 0;
      let errorCount = 0;

      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        
        try {
          // Skip storage-related statements for RLS policies
          if (statement.includes('storage.objects') || statement.includes('storage.buckets')) {
            skipCount++;
            continue;
          }

          await client.query(statement);
          successCount++;
          process.stdout.write('.');
        } catch (error) {
          if (error.message.includes('already exists')) {
            skipCount++;
            process.stdout.write('~');
          } else {
            errorCount++;
            console.error(`\n❌ Error in statement ${i + 1}: ${error.message}`);
            console.error(`   Statement: ${statement.substring(0, 80)}...`);
          }
        }
      }

      console.log(`\n✅ ${migrationFile} completed:`);
      console.log(`   - ${successCount} statements executed`);
      console.log(`   - ${skipCount} statements skipped (already exist)`);
      console.log(`   - ${errorCount} errors\n`);
    }

    // Verify tables
    console.log('🔍 Verifying database tables...\n');
    
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('assets', 'pages', 'page_assets', 'maps', 'categories', 'asset_categories')
      ORDER BY table_name;
    `);

    if (result.rows.length > 0) {
      console.log('✅ Successfully created tables:');
      result.rows.forEach(row => {
        console.log(`   - ${row.table_name}`);
      });
    } else {
      console.log('⚠️  No tables found');
    }

    // Test inserting a sample record
    console.log('\n🧪 Testing database access...');
    
    const { rows } = await client.query(`
      INSERT INTO categories (name, slug, description) 
      VALUES ('Test Category', 'test-category', 'Initial test category')
      ON CONFLICT (slug) DO NOTHING
      RETURNING id, name;
    `);

    if (rows.length > 0) {
      console.log('✅ Successfully inserted test record');
      console.log(`   Category: ${rows[0].name} (ID: ${rows[0].id})`);
    }

  } catch (error) {
    console.error('❌ Connection error:', error.message);
    console.error('\nTrying alternative connection...');
    
    // Try alternative connection
    const altClient = new pg.Client({
      host: `aws-0-us-west-1.pooler.supabase.com`,
      port: 6543,
      database: 'postgres',
      user: `postgres.${process.env.SUPABASE_PROJECT_ID}`,
      password: process.env.SUPABASE_DB_PASSWORD,
      ssl: { rejectUnauthorized: false }
    });

    try {
      await altClient.connect();
      console.log('✅ Alternative connection successful!');
      await altClient.end();
    } catch (altError) {
      console.error('❌ Alternative connection also failed:', altError.message);
    }
  } finally {
    await client.end();
    console.log('\n🔌 Disconnected from database');
  }
}

// Run the script
createTables().catch(console.error);