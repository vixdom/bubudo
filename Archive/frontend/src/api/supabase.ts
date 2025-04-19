import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
export const supabaseClient = createClient(
  process.env.REACT_APP_SUPABASE_URL || '',
  process.env.REACT_APP_SUPABASE_ANON_KEY || ''
);

// Helper function for handling Supabase errors
export const handleSupabaseError = (error: any): string => {
  console.error('Supabase error:', error);
  
  if (error.message) {
    return error.message;
  }
  
  if (error.error_description) {
    return error.error_description;
  }
  
  return 'An unknown error occurred';
};
