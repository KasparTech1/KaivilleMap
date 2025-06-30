import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Direct database connection
const DATABASE_URL = `postgres://postgres.${process.env.SUPABASE_PROJECT_ID}:${process.env.SUPABASE_DB_PASSWORD}@aws-0-us-east-2.pooler.supabase.com:6543/postgres`;

async function setupDatabase() {
  const client = new pg.Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔌 Connecting to Supabase PostgreSQL...');
    await client.connect();
    console.log('✅ Connected successfully!\n');

    // First, let's check what we have
    const checkTables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log(`📋 Current tables in database: ${checkTables.rows.length}`);
    if (checkTables.rows.length > 0) {
      checkTables.rows.forEach(row => console.log(`   - ${row.table_name}`));
    }
    console.log('');

    // Read and execute migrations
    console.log('🚀 Running migrations...\n');

    // Migration 1: Create tables
    console.log('📄 Creating database schema...');
    const schema = await fs.readFile(path.join(__dirname, 'migrations', '002_create_database_schema.sql'), 'utf8');
    
    // Execute statements one by one
    const statements = schema
      .split(/;\s*$/gm)
      .filter(stmt => stmt.trim().length > 0 && !stmt.trim().startsWith('--'));

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i].trim();
      if (!stmt) continue;

      try {
        await client.query(stmt);
        process.stdout.write('.');
      } catch (error) {
        if (error.message.includes('already exists')) {
          process.stdout.write('~');
        } else {
          console.error(`\n❌ Error in statement ${i + 1}: ${error.message}`);
          console.error(`   Statement: ${stmt.substring(0, 60)}...`);
        }
      }
    }
    console.log('\n✅ Schema creation completed\n');

    // Migration 2: RLS policies
    console.log('📄 Setting up RLS policies...');
    const policies = await fs.readFile(path.join(__dirname, 'migrations', '003_create_rls_policies.sql'), 'utf8');
    
    const policyStatements = policies
      .split(/;\s*$/gm)
      .filter(stmt => stmt.trim().length > 0 && !stmt.trim().startsWith('--') && !stmt.includes('storage.'));

    for (let i = 0; i < policyStatements.length; i++) {
      const stmt = policyStatements[i].trim();
      if (!stmt) continue;

      try {
        await client.query(stmt);
        process.stdout.write('.');
      } catch (error) {
        if (error.message.includes('already exists')) {
          process.stdout.write('~');
        } else {
          console.error(`\n❌ Error in policy ${i + 1}: ${error.message}`);
        }
      }
    }
    console.log('\n✅ RLS policies completed\n');

    // Verify final state
    console.log('🔍 Verifying database setup...\n');
    
    const finalTables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('assets', 'pages', 'page_assets', 'maps', 'categories', 'asset_categories')
      ORDER BY table_name;
    `);

    if (finalTables.rows.length > 0) {
      console.log('✅ Successfully created tables:');
      finalTables.rows.forEach(row => console.log(`   - ${row.table_name}`));
      
      // Insert test data
      console.log('\n🧪 Inserting test data...');
      
      await client.query(`
        INSERT INTO categories (name, slug, description) 
        VALUES ('Maps', 'maps', 'All map assets')
        ON CONFLICT (slug) DO NOTHING;
      `);
      
      const testResult = await client.query('SELECT COUNT(*) FROM categories');
      console.log(`✅ Categories table has ${testResult.rows[0].count} records`);
      
    } else {
      console.log('❌ Tables were not created successfully');
    }

  } catch (error) {
    console.error('❌ Database error:', error.message);
    
    // Try diagnosing the connection
    console.log('\n🔍 Connection diagnostics:');
    console.log(`   Database URL format: postgres://postgres.PROJECT_ID:PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres`);
    console.log(`   Project ID: ${process.env.SUPABASE_PROJECT_ID}`);
    console.log(`   Region detected: us-east-2`);
    
  } finally {
    await client.end();
    console.log('\n🔌 Disconnected from database');
  }
}

// Run setup
setupDatabase().catch(console.error);