import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️  Supabase credentials not found in .env file');
  console.warn('   App will work but data will not be saved to database');
  console.warn('   Add SUPABASE_URL and SUPABASE_ANON_KEY to .env file');
}

// Create Supabase client
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Helper function to check if Supabase is configured
export const isSupabaseConfigured = () => {
  return supabase !== null;
};

// Helper function to handle Supabase errors
export const handleSupabaseError = (error, context = '') => {
  console.error(`Supabase Error ${context}:`, error);
  return {
    success: false,
    error: error.message || 'Database operation failed'
  };
};

export default supabase;
