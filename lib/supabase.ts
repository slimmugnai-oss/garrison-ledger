import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Client for browser usage (with RLS)
// Only create client if both URL and key are available and not empty
export const supabase = (() => {
  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === "" || supabaseAnonKey === "") {
    console.warn("Supabase environment variables are missing or empty. Client will be null.");
    return null as any;
  }

  try {
    return createClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.error("Failed to create Supabase client:", error);
    return null as any;
  }
})();

// Helper function to get a safe Supabase client
export function getSupabaseClient() {
  if (!supabase) {
    throw new Error("Supabase client is not available. Check environment variables.");
  }
  return supabase;
}

// Type definitions for our database
export interface Profile {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

// Admin client is now imported directly from './supabase/admin'
// This prevents client-side initialization when server-side code imports admin
