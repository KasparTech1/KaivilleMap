import { createClient } from '@supabase/supabase-js';

// Use Vite environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables not set. CMS features will be disabled.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);