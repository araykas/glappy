import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Supabase client — null jika belum dikonfigurasi
export const supabase =
  supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('your_supabase')
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export const isSupabaseConfigured = () => supabase !== null;

export default supabase;
