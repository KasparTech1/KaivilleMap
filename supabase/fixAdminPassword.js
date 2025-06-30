import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const DATABASE_URL = `postgres://postgres.${process.env.SUPABASE_PROJECT_ID}:${process.env.SUPABASE_DB_PASSWORD}@aws-0-us-east-2.pooler.supabase.com:6543/postgres`;

async function fixPassword() {
  const client = new pg.Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    // Update the password setting to store plain text
    await client.query(`
      UPDATE public.site_settings 
      SET setting_value = '"kaiville25"'::jsonb 
      WHERE setting_key = 'admin_password'
    `);
    
    // Fix the function to properly extract JSON value
    await client.query(`
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
        -- Get stored password from settings (extract from JSON)
        SELECT setting_value::jsonb->>0 INTO stored_password 
        FROM public.site_settings 
        WHERE setting_key = 'admin_password';
        
        -- Check password
        IF password != stored_password THEN
          RETURN jsonb_build_object(
            'success', false,
            'message', 'Invalid password'
          );
        END IF;
        
        -- Generate session token
        new_token := encode(gen_random_bytes(32), 'hex');
        
        -- Create session
        INSERT INTO public.admin_sessions (session_token, ip_address, user_agent, expires_at)
        VALUES (new_token, ip::inet, agent, NOW() + INTERVAL '24 hours')
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
    `);
    
    console.log('✅ Fixed password storage and function');
    
    // Test again
    const { rows } = await client.query(
      `SELECT * FROM public.create_admin_session($1, $2, $3)`,
      ['kaiville25', '127.0.0.1', 'Test Agent']
    );
    
    console.log('🧪 Authentication test:', rows[0].success ? 'PASSED' : 'FAILED');
    if (rows[0].success) {
      console.log('   Token:', rows[0].token.substring(0, 20) + '...');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

fixPassword().catch(console.error);