import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client for browser usage (with RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type definitions for our database
export interface Profile {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

// Re-export admin client for backward compatibility
export { supabaseAdmin } from './supabase/admin';
