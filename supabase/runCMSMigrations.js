import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATABASE_URL = `postgres://postgres.${process.env.SUPABASE_PROJECT_ID}:${process.env.SUPABASE_DB_PASSWORD}@aws-0-us-east-2.pooler.supabase.com:6543/postgres`;

async function runCMSMigrations() {
  const client = new pg.Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected!\n');

    const migrations = [
      '004_create_cms_schema.sql',
      '005_create_cms_rls_policies.sql'
    ];

    for (const migrationFile of migrations) {
      console.log(`📄 Running ${migrationFile}...`);
      
      const filePath = path.join(__dirname, 'migrations', migrationFile);
      const sql = await fs.readFile(filePath, 'utf8');
      
      // Split into statements
      const statements = sql
        .split(/;\s*$/gm)
        .filter(stmt => stmt.trim().length > 0 && !stmt.trim().startsWith('--'))
        .map(stmt => stmt.trim());

      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < statements.length; i++) {
        try {
          await client.query(statements[i]);
          successCount++;
          process.stdout.write('.');
        } catch (error) {
          if (error.message.includes('already exists') || 
              error.message.includes('duplicate key')) {
            process.stdout.write('~');
          } else {
            errorCount++;
            console.error(`\n❌ Error: ${error.message}`);
            console.error(`   Statement: ${statements[i].substring(0, 60)}...`);
          }
        }
      }

      console.log(`\n✅ Completed: ${successCount} successful, ${errorCount} errors\n`);
    }

    // Verify new tables
    console.log('🔍 Verifying CMS tables...\n');
    
    const tables = ['articles', 'content_blocks', 'article_cards', 'admin_sessions', 'content_revisions', 'site_settings'];
    
    for (const table of tables) {
      const result = await client.query(
        `SELECT COUNT(*) as count FROM public.${table}`
      );
      console.log(`✅ ${table}: ${result.rows[0].count} records`);
    }

    // Test admin session creation
    console.log('\n🧪 Testing admin authentication...');
    const { rows } = await client.query(
      `SELECT * FROM public.create_admin_session($1, $2, $3)`,
      ['kaiville25', '127.0.0.1', 'Test Agent']
    );
    
    if (rows[0].success) {
      console.log('✅ Admin session created successfully');
      console.log(`   Token: ${rows[0].token.substring(0, 16)}...`);
    } else {
      console.log('❌ Admin session creation failed:', rows[0].message);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
    console.log('\n🔌 Disconnected');
  }
}

runCMSMigrations().catch(console.error);