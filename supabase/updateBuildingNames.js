import pg from 'pg';
import dotenv from 'dotenv';
const { Client } = pg;

// Load environment variables
dotenv.config({ path: '../.env' });

async function updateBuildingNames() {
  // Construct the Supabase database URL
  const DATABASE_URL = `postgres://postgres.${process.env.SUPABASE_PROJECT_ID}:${process.env.SUPABASE_DB_PASSWORD}@aws-0-us-east-2.pooler.supabase.com:6543/postgres`;
  
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Update Heritage Center to Stewardship Hall
    const result1 = await client.query(`
      UPDATE public.simple_content 
      SET content = jsonb_set(
        content,
        '{title}',
        '"Stewardship Hall"'
      )
      WHERE content_type = 'building' 
      AND content_id = 'heritage_center'
      AND content->>'title' = 'Heritage Center'
    `);
    console.log(`Updated Heritage Center: ${result1.rowCount} rows`);

    // Update Learning Lodge to Skills University
    const result2 = await client.query(`
      UPDATE public.simple_content 
      SET content = jsonb_set(
        content,
        '{title}',
        '"Skills University"'
      )
      WHERE content_type = 'building' 
      AND content_id = 'learning_lodge'
      AND content->>'title' = 'Learning Lodge'
    `);
    console.log(`Updated Learning Lodge: ${result2.rowCount} rows`);

    // Update Community Center to Join Junction
    const result3 = await client.query(`
      UPDATE public.simple_content 
      SET content = jsonb_set(
        content,
        '{title}',
        '"Join Junction"'
      )
      WHERE content_type = 'building' 
      AND content_id = 'community-center'
      AND content->>'title' = 'Community Center'
    `);
    console.log(`Updated Community Center: ${result3.rowCount} rows`);

    // Update Celebration Station to Innovation Plaza
    const result4 = await client.query(`
      UPDATE public.simple_content 
      SET content = jsonb_set(
        content,
        '{title}',
        '"Innovation Plaza"'
      )
      WHERE content_type = 'building' 
      AND content_id = 'celebration_station'
      AND content->>'title' = 'Celebration Station'
    `);
    console.log(`Updated Celebration Station: ${result4.rowCount} rows`);

    // Update KASP Tower to Kaizen Tower
    const result5 = await client.query(`
      UPDATE public.simple_content 
      SET content = jsonb_set(
        content,
        '{title}',
        '"Kaizen Tower"'
      )
      WHERE content_type = 'building' 
      AND content_id = 'kasp_tower'
      AND content->>'title' = 'KASP Tower'
    `);
    console.log(`Updated KASP Tower: ${result5.rowCount} rows`);

    // Verify updates
    const { rows } = await client.query(`
      SELECT content_id, content->>'title' as title 
      FROM public.simple_content 
      WHERE content_type = 'building'
      ORDER BY content_id
    `);
    
    console.log('\nCurrent building titles in CMS:');
    rows.forEach(row => {
      console.log(`- ${row.content_id}: ${row.title}`);
    });

    console.log('\n✅ Building names updated successfully!');
  } catch (error) {
    console.error('Error updating building names:', error);
  } finally {
    await client.end();
  }
}

updateBuildingNames();