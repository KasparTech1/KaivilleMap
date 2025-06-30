import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const DATABASE_URL = `postgres://postgres.${process.env.SUPABASE_PROJECT_ID}:${process.env.SUPABASE_DB_PASSWORD}@aws-0-us-east-2.pooler.supabase.com:6543/postgres`;

async function checkSchema() {
  const client = new pg.Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    // Check if content_blocks table exists
    const { rows: tables } = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'content_blocks'
    `);
    
    console.log('Table exists:', tables.length > 0);
    
    if (tables.length > 0) {
      // Get column information
      const { rows: columns } = await client.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'content_blocks'
        ORDER BY ordinal_position
      `);
      
      console.log('\nColumns in content_blocks:');
      columns.forEach(col => {
        console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? 'NOT NULL' : ''}`);
      });
      
      // Check some data
      const { rows: data } = await client.query(`
        SELECT * FROM public.content_blocks LIMIT 5
      `);
      
      console.log('\nSample data:', data.length, 'rows');
      if (data.length > 0) {
        console.log('First row:', data[0]);
      }
    } else {
      console.log('\n❌ Table content_blocks does not exist!');
      console.log('Creating table...');
      
      // Create the table
      await client.query(`
        CREATE TABLE IF NOT EXISTS public.content_blocks (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          page TEXT NOT NULL,
          block_key TEXT NOT NULL,
          block_type TEXT NOT NULL DEFAULT 'content',
          order_index INTEGER DEFAULT 0,
          content JSONB DEFAULT '{}',
          style_config JSONB DEFAULT '{}',
          is_visible BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
          UNIQUE(page, block_key)
        );
        
        -- Create index
        CREATE INDEX IF NOT EXISTS idx_content_blocks_page_key 
        ON public.content_blocks(page, block_key);
        
        -- Grant permissions
        GRANT ALL ON public.content_blocks TO anon;
        GRANT ALL ON public.content_blocks TO authenticated;
      `);
      
      console.log('✅ Table created successfully!');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

checkSchema();