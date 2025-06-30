import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function setAdminPassword() {
  console.log('Setting admin password in Supabase...');
  
  try {
    // First, check if the password setting exists
    const { data: existing, error: checkError } = await supabase
      .from('site_settings')
      .select('*')
      .eq('setting_key', 'admin_password')
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }
    
    if (!existing) {
      // Insert the password setting
      const { error: insertError } = await supabase
        .from('site_settings')
        .insert({
          setting_key: 'admin_password',
          setting_value: '"kaiville25"', // Store as JSON string
          setting_type: 'security'
        });
      
      if (insertError) throw insertError;
      console.log('✅ Admin password set to: kaiville25');
    } else {
      // Update existing password
      const { error: updateError } = await supabase
        .from('site_settings')
        .update({ 
          setting_value: '"kaiville25"',
          updated_at: new Date().toISOString()
        })
        .eq('setting_key', 'admin_password');
      
      if (updateError) throw updateError;
      console.log('✅ Admin password updated to: kaiville25');
    }
    
    // Test the authentication
    console.log('\nTesting authentication...');
    const { data: authResult, error: authError } = await supabase.rpc('create_admin_session', {
      password: 'kaiville25',
      ip: '127.0.0.1',
      agent: 'Test Script'
    });
    
    if (authError) {
      console.error('❌ Authentication test failed:', authError);
    } else if (authResult && authResult.success) {
      console.log('✅ Authentication test passed!');
      console.log('   Token:', authResult.token?.substring(0, 20) + '...');
    } else {
      console.log('❌ Authentication failed:', authResult?.message || 'Unknown error');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the script
setAdminPassword();