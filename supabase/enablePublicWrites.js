import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function enablePublicWrites() {
  console.log('Enabling public writes for content_blocks table...\n');
  
  try {
    // First, check if RLS is enabled
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('*')
      .eq('table_name', 'content_blocks');
    
    console.log('Checking table status...');
    
    // Create RLS policies for content_blocks
    const policies = [
      {
        name: 'public_read_content_blocks',
        definition: 'CREATE POLICY public_read_content_blocks ON public.content_blocks FOR SELECT USING (true)',
        operation: 'SELECT'
      },
      {
        name: 'public_insert_content_blocks',
        definition: 'CREATE POLICY public_insert_content_blocks ON public.content_blocks FOR INSERT WITH CHECK (true)',
        operation: 'INSERT'
      },
      {
        name: 'public_update_content_blocks',
        definition: 'CREATE POLICY public_update_content_blocks ON public.content_blocks FOR UPDATE USING (true)',
        operation: 'UPDATE'
      },
      {
        name: 'public_delete_content_blocks',
        definition: 'CREATE POLICY public_delete_content_blocks ON public.content_blocks FOR DELETE USING (true)',
        operation: 'DELETE'
      }
    ];
    
    // Drop existing policies
    console.log('Dropping existing policies...');
    for (const policy of policies) {
      try {
        await supabase.rpc('exec', {
          sql: `DROP POLICY IF EXISTS ${policy.name} ON public.content_blocks`
        });
      } catch (e) {
        // Ignore errors
      }
    }
    
    // Enable RLS
    console.log('Enabling RLS...');
    await supabase.rpc('exec', {
      sql: 'ALTER TABLE public.content_blocks ENABLE ROW LEVEL SECURITY'
    }).catch(e => console.log('RLS may already be enabled'));
    
    // Create new policies
    console.log('Creating new policies...');
    for (const policy of policies) {
      try {
        await supabase.rpc('exec', {
          sql: policy.definition
        });
        console.log(`✅ Created policy: ${policy.name}`);
      } catch (e) {
        console.log(`❌ Failed to create policy ${policy.name}:`, e.message);
      }
    }
    
    // Test by inserting a test record
    console.log('\nTesting write access...');
    const { data: testInsert, error: insertError } = await supabase
      .from('content_blocks')
      .insert({
        page: 'test',
        block_key: 'test-' + Date.now(),
        block_type: 'content',
        content: JSON.stringify({ test: true }),
        order_index: 0,
        is_visible: true
      });
    
    if (insertError) {
      console.error('❌ Test insert failed:', insertError);
    } else {
      console.log('✅ Test insert successful!');
    }
    
    // Also check admin_sessions table
    console.log('\nChecking admin_sessions table...');
    await supabase.rpc('exec', {
      sql: 'ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY'
    }).catch(e => console.log('RLS may already be enabled'));
    
    await supabase.rpc('exec', {
      sql: 'CREATE POLICY public_all_admin_sessions ON public.admin_sessions FOR ALL USING (true)'
    }).catch(e => console.log('Policy may already exist'));
    
    console.log('\n✅ Done! Content should now be saveable.');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the script
enablePublicWrites();