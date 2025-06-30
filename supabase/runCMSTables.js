import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATABASE_URL = `postgres://postgres.${process.env.SUPABASE_PROJECT_ID}:${process.env.SUPABASE_DB_PASSWORD}@aws-0-us-east-2.pooler.supabase.com:6543/postgres`;

async function runMigration() {
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
      path.join(__dirname, 'migrations', '004_create_cms_tables.sql'), 
      'utf8'
    );

    console.log('📄 Creating CMS tables...\n');

    // Execute the entire migration as one transaction
    await client.query('BEGIN');
    
    try {
      await client.query(sql);
      await client.query('COMMIT');
      console.log('✅ CMS tables created successfully!\n');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }

    // Verify tables
    console.log('🔍 Verifying tables...\n');
    
    const tables = [
      'articles', 
      'content_blocks', 
      'article_cards', 
      'admin_sessions', 
      'content_revisions', 
      'site_settings'
    ];
    
    for (const table of tables) {
      try {
        const result = await client.query(
          `SELECT COUNT(*) as count FROM public.${table}`
        );
        console.log(`✅ ${table}: ${result.rows[0].count} records`);
      } catch (error) {
        console.log(`❌ ${table}: Not found`);
      }
    }

    // Insert a sample page with article
    console.log('\n📝 Creating sample content...\n');
    
    const pageResult = await client.query(`
      INSERT INTO public.pages (slug, title, subtitle, description, page_type, is_published, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (slug) DO UPDATE SET
        title = EXCLUDED.title,
        subtitle = EXCLUDED.subtitle,
        is_published = EXCLUDED.is_published
      RETURNING id
    `, [
      'welcome-to-kaiville',
      'Welcome to Kaiville',
      'Discover our interactive city map',
      'Learn about Kaiville and explore our interactive map features.',
      'article',
      true,
      'published'
    ]);

    const pageId = pageResult.rows[0].id;
    console.log(`✅ Created page: ${pageId}`);

    // Create article
    await client.query(`
      INSERT INTO public.articles (page_id, headline, subheadline, content_blocks)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (page_id) DO UPDATE SET
        headline = EXCLUDED.headline,
        subheadline = EXCLUDED.subheadline
    `, [
      pageId,
      'Welcome to Kaiville Interactive Map',
      'Your guide to exploring our city',
      JSON.stringify([
        {
          type: 'text',
          content: {
            text: 'Welcome to Kaiville! Our interactive map allows you to explore every corner of our vibrant city.',
            format: 'paragraph'
          }
        }
      ])
    ]);

    console.log('✅ Created sample article');

    // Create content blocks
    await client.query(`
      INSERT INTO public.content_blocks (page_id, block_type, order_index, content)
      VALUES 
        ($1, 'hero', 0, $2),
        ($1, 'text', 1, $3)
      ON CONFLICT (page_id, order_index) DO UPDATE SET
        content = EXCLUDED.content
    `, [
      pageId,
      JSON.stringify({
        title: 'Explore Kaiville',
        subtitle: 'Interactive City Map',
        backgroundImage: null
      }),
      JSON.stringify({
        text: 'Navigate through neighborhoods, find local businesses, and discover hidden gems.',
        format: 'paragraph'
      })
    ]);

    console.log('✅ Created content blocks');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await client.end();
    console.log('\n🔌 Disconnected');
  }
}

runMigration().catch(console.error);