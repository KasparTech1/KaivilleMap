import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function applyMigration() {
  const client = new pg.Client({
    host: `db.${process.env.SUPABASE_PROJECT_ID}.supabase.co`,
    port: 6543,
    database: 'postgres',
    user: 'postgres',
    password: process.env.SUPABASE_DB_PASSWORD,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected!\n');

    const alterStatements = [
      {
        name: 'Add primary_category',
        sql: `ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS primary_category TEXT DEFAULT 'News'`
      },
      {
        name: 'Add section_title',
        sql: `ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS section_title TEXT`
      },
      {
        name: 'Add card_description', 
        sql: `ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS card_description TEXT`
      },
      {
        name: 'Add edit_history',
        sql: `ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS edit_history JSONB DEFAULT '[]'::jsonb`
      },
      {
        name: 'Add last_edited_at',
        sql: `ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS last_edited_at TIMESTAMP WITH TIME ZONE`
      },
      {
        name: 'Add last_edited_by',
        sql: `ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS last_edited_by TEXT`
      }
    ];

    for (const stmt of alterStatements) {
      try {
        console.log(`➤ ${stmt.name}...`);
        await client.query(stmt.sql);
        console.log(`  ✅ ${stmt.name} completed`);
      } catch (err) {
        if (err.message.includes('already exists')) {
          console.log(`  ✓ ${stmt.name} - column already exists`);
        } else {
          console.error(`  ❌ ${stmt.name} failed:`, err.message);
        }
      }
    }

    // Create indexes
    console.log('\n➤ Creating indexes...');
    try {
      await client.query(`CREATE INDEX IF NOT EXISTS idx_articles_primary_category ON public.articles(primary_category)`);
      console.log('  ✅ Primary category index created');
    } catch (err) {
      console.log('  ✓ Index may already exist');
    }

    // Verify changes
    console.log('\n🔍 Verifying changes...');
    const result = await client.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'articles' 
      AND table_schema = 'public'
      AND column_name IN ('primary_category', 'section_title', 'card_description', 'edit_history', 'last_edited_at', 'last_edited_by')
      ORDER BY column_name
    `);

    if (result.rows.length > 0) {
      console.log('✅ New columns found:');
      result.rows.forEach(row => {
        console.log(`   - ${row.column_name} (${row.data_type})`);
      });
    } else {
      console.log('❌ No new columns found - migration may have failed');
    }

  } catch (err) {
    console.error('❌ Database error:', err.message);
  } finally {
    await client.end();
    console.log('\n🔌 Disconnected from database');
  }
}

applyMigration().catch(console.error);