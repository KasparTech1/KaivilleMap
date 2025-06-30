import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugAuth() {
  console.log('Debugging authentication...\n');
  
  try {
    // 1. Check what's in site_settings
    const { data: settings, error: settingsError } = await supabase
      .from('site_settings')
      .select('*')
      .eq('setting_key', 'admin_password');
    
    console.log('1. Site settings data:');
    console.log(JSON.stringify(settings, null, 2));
    
    // 2. Update the create_admin_session function to handle JSON properly
    console.log('\n2. Updating authentication function...');
    
    const { error: funcError } = await supabase.rpc('query', {
      query: `
        CREATE OR REPLACE FUNCTION public.create_admin_session(
          password TEXT,
          ip TEXT DEFAULT NULL,
          agent TEXT DEFAULT NULL
        )
        RETURNS jsonb AS $$
        DECLARE
          stored_password TEXT;
          new_token TEXT;
          session_id UUID;
        BEGIN
          -- Get stored password from settings (handle JSON)
          SELECT 
            CASE 
              WHEN jsonb_typeof(setting_value) = 'string' THEN setting_value::jsonb->>0
              ELSE setting_value::text
            END
          INTO stored_password 
          FROM public.site_settings 
          WHERE setting_key = 'admin_password';
          
          -- Debug output
          RAISE NOTICE 'Stored password: %', stored_password;
          RAISE NOTICE 'Provided password: %', password;
          
          -- Check password
          IF password IS NULL OR stored_password IS NULL OR password != stored_password THEN
            RETURN jsonb_build_object(
              'success', false,
              'message', 'Invalid password',
              'debug', jsonb_build_object(
                'stored_is_null', stored_password IS NULL,
                'provided_is_null', password IS NULL
              )
            );
          END IF;
          
          -- Generate session token
          new_token := encode(gen_random_bytes(32), 'hex');
          
          -- Create session
          INSERT INTO public.admin_sessions (session_token, ip_address, user_agent, expires_at)
          VALUES (new_token, CASE WHEN ip IS NOT NULL THEN ip::inet ELSE NULL END, agent, NOW() + INTERVAL '24 hours')
          RETURNING id INTO session_id;
          
          -- Clean old sessions
          DELETE FROM public.admin_sessions WHERE expires_at < NOW();
          
          RETURN jsonb_build_object(
            'success', true,
            'token', new_token,
            'session_id', session_id,
            'expires_at', (NOW() + INTERVAL '24 hours')::text
          );
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
      `
    });
    
    if (funcError) {
      console.error('Function update error:', funcError);
      // Try direct SQL execution
      await supabase.rpc('exec', {
        sql: `DROP FUNCTION IF EXISTS public.create_admin_session(TEXT, TEXT, TEXT);`
      });
    }
    
    // 3. Test authentication again
    console.log('\n3. Testing authentication with password: kaiville25');
    const { data: authResult, error: authError } = await supabase.rpc('create_admin_session', {
      password: 'kaiville25',
      ip: '127.0.0.1',
      agent: 'Debug Script'
    });
    
    console.log('Authentication result:', JSON.stringify(authResult, null, 2));
    if (authError) {
      console.error('Authentication error:', authError);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the debug script
debugAuth();