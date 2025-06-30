import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATABASE_URL = `postgres://postgres.${process.env.SUPABASE_PROJECT_ID}:${process.env.SUPABASE_DB_PASSWORD}@aws-0-us-east-2.pooler.supabase.com:6543/postgres`;

async function runAdminFunctions() {
  const client = new pg.Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected!\n');

    // Read and execute the migration
    const sql = await fs.readFile(
      path.join(__dirname, 'migrations', '006_admin_functions.sql'), 
      'utf8'
    );

    console.log('📄 Creating admin functions...\n');

    // Execute as transaction
    await client.query('BEGIN');
    
    try {
      await client.query(sql);
      await client.query('COMMIT');
      console.log('✅ Admin functions created successfully!\n');
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Error creating functions:', error.message);
      
      // Try individual statements
      console.log('\n📝 Attempting individual function creation...\n');
      
      const statements = sql
        .split(/\$\$\s*LANGUAGE\s+plpgsql[^;]*;/gi)
        .filter(s => s.trim())
        .map(s => s.trim() + '$$ LANGUAGE plpgsql SECURITY DEFINER;');
      
      for (const stmt of statements) {
        if (stmt.includes('CREATE OR REPLACE FUNCTION')) {
          try {
            await client.query(stmt);
            const funcName = stmt.match(/FUNCTION\s+([^\(]+)/)?.[1] || 'unknown';
            console.log(`✅ Created function: ${funcName}`);
          } catch (err) {
            console.error(`❌ Failed:`, err.message);
          }
        }
      }
    }

    // Test the functions
    console.log('\n🧪 Testing admin functions...\n');
    
    // Test authentication
    const { rows: authResult } = await client.query(
      `SELECT * FROM public.create_admin_session($1, $2, $3)`,
      ['kaiville25', '127.0.0.1', 'Test Agent']
    );
    
    console.log('✅ Authentication test:', authResult[0].success ? 'PASSED' : 'FAILED');
    
    if (authResult[0].success) {
      const token = authResult[0].token;
      console.log(`   Token: ${token.substring(0, 16)}...`);
      
      // Test session validation
      const { rows: validResult } = await client.query(
        `SELECT public.validate_admin_session($1) as valid`,
        [token]
      );
      
      console.log('✅ Session validation:', validResult[0].valid ? 'PASSED' : 'FAILED');
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await client.end();
    console.log('\n🔌 Disconnected');
  }
}

runAdminFunctions().catch(console.error);