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

// Admin client is now imported directly from './supabase/admin'
// This prevents client-side initialization when server-side code imports admin
