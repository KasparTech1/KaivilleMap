import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse the connection details from the Supabase URL
const supabaseUrl = new URL(process.env.SUPABASE_URL);
const dbHost = `db.${process.env.SUPABASE_PROJECT_ID}.supabase.co`;
const dbPort = 5432;
const dbName = 'postgres';
const dbUser = 'postgres';
const dbPassword = process.env.SUPABASE_DB_PASSWORD;

// Create a PostgreSQL client
const client = new pg.Client({
  host: dbHost,
  port: dbPort,
  database: dbName,
  user: dbUser,
  password: dbPassword,
  ssl: {
    rejectUnauthorized: false
  }
});

async function executeMigrations() {
  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected to database\n');

    // Read and execute migration files
    const migrations = [
      '002_create_database_schema.sql',
      '003_create_rls_policies.sql'
    ];

    for (const migrationFile of migrations) {
      console.log(`📄 Executing ${migrationFile}...`);
      
      const filePath = path.join(__dirname, 'migrations', migrationFile);
      const sql = await fs.readFile(filePath, 'utf8');
      
      try {
        await client.query(sql);
        console.log(`✅ Successfully executed ${migrationFile}\n`);
      } catch (error) {
        console.error(`❌ Error executing ${migrationFile}:`, error.message);
        console.log('   Attempting to run statements individually...\n');
        
        // Try running statements one by one
        const statements = sql
          .split(/;\s*$/gm)
          .filter(stmt => stmt.trim().length > 0)
          .map(stmt => stmt.trim());
        
        let successCount = 0;
        let errorCount = 0;
        
        for (const statement of statements) {
          if (!statement || statement.startsWith('--')) continue;
          
          try {
            await client.query(statement);
            successCount++;
            process.stdout.write('.');
          } catch (err) {
            errorCount++;
            if (!err.message.includes('already exists')) {
              console.error(`\n   ❌ Failed: ${statement.substring(0, 50)}...`);
              console.error(`      Error: ${err.message}`);
            }
          }
        }
        
        console.log(`\n   Completed: ${successCount} successful, ${errorCount} errors\n`);
      }
    }

    // Verify tables were created
    console.log('🔍 Verifying database setup...');
    
    const tableCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('assets', 'pages', 'maps', 'categories')
      ORDER BY table_name;
    `);
    
    if (tableCheck.rows.length > 0) {
      console.log('✅ Found tables:');
      tableCheck.rows.forEach(row => {
        console.log(`   - ${row.table_name}`);
      });
    } else {
      console.log('⚠️  No tables found - manual setup may be required');
    }

  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    console.log('\n💡 Please ensure:');
    console.log('   1. Your database password is correct');
    console.log('   2. Your Supabase project is accessible');
    console.log('   3. You may need to run migrations manually in the Supabase SQL editor');
  } finally {
    await client.end();
    console.log('\n🔌 Disconnected from database');
  }
}

// Execute migrations
executeMigrations();