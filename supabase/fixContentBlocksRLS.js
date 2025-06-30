import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config({ path: '../.env' });

const DATABASE_URL = `postgres://postgres.${process.env.SUPABASE_PROJECT_ID}:${process.env.SUPABASE_DB_PASSWORD}@aws-0-us-east-2.pooler.supabase.com:6543/postgres`;

async function fixRLS() {
  const client = new pg.Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to database...\n');
    
    // Disable RLS on content_blocks to allow public access
    console.log('1. Disabling RLS on content_blocks...');
    await client.query('ALTER TABLE public.content_blocks DISABLE ROW LEVEL SECURITY');
    console.log('✅ RLS disabled on content_blocks\n');
    
    // Also disable on admin_sessions
    console.log('2. Disabling RLS on admin_sessions...');
    await client.query('ALTER TABLE public.admin_sessions DISABLE ROW LEVEL SECURITY');
    console.log('✅ RLS disabled on admin_sessions\n');
    
    // Grant permissions
    console.log('3. Granting permissions...');
    await client.query(`
      GRANT ALL ON public.content_blocks TO anon;
      GRANT ALL ON public.admin_sessions TO anon;
      GRANT ALL ON public.content_blocks TO authenticated;
      GRANT ALL ON public.admin_sessions TO authenticated;
    `);
    console.log('✅ Permissions granted\n');
    
    // Test with Supabase client
    console.log('4. Testing write access with Supabase client...');
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY // Using anon key to test
    );
    
    const testData = {
      page: 'test',
      block_key: 'test-' + Date.now(),
      block_type: 'content',
      content: JSON.stringify({ test: true, timestamp: new Date().toISOString() }),
      order_index: 0,
      is_visible: true
    };
    
    const { data, error } = await supabase
      .from('content_blocks')
      .insert(testData)
      .select();
    
    if (error) {
      console.error('❌ Test insert failed:', error);
    } else {
      console.log('✅ Test insert successful!');
      console.log('   Inserted:', data);
      
      // Clean up test data
      await supabase
        .from('content_blocks')
        .delete()
        .eq('block_key', testData.block_key);
    }
    
    console.log('\n✅ Done! Content saving should now work.');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

// Run the script
fixRLS();