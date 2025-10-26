import { createClient } from "@supabase/supabase-js";

// Debug: Track any direct createClient usage that might cause issues
const originalCreateClient = createClient;
const wrappedCreateClient = (url: string, key: string, options?: any) => {
  console.error("🚨 WARNING: Direct createClient usage detected!");
  console.error("  - Stack trace:", new Error().stack);
  console.error("  - URL:", url);
  console.error("  - Key:", key ? "Present" : "Missing");
  console.error("  - Options:", options);
  console.error("  - This may cause 'supabaseKey is required' errors!");
  console.error("  - Use supabaseAdmin for server-side or supabase for client-side instead");
  
  return originalCreateClient(url, key, options);
};

// Override createClient to catch direct usage
(global as any).createClient = wrappedCreateClient;

// Global error handler for Supabase-related errors
if (typeof window !== "undefined") {
  window.addEventListener("error", (event) => {
    if (event.error && event.error.message && event.error.message.includes("supabaseKey")) {
      console.error("🚨 SUPABASE KEY ERROR DETECTED!");
      console.error("  - Error:", event.error.message);
      console.error("  - Stack:", event.error.stack);
      console.error("  - This usually means a component is trying to create a Supabase client with missing environment variables");
    }
  });
  
  window.addEventListener("unhandledrejection", (event) => {
    if (event.reason && event.reason.message && event.reason.message.includes("supabaseKey")) {
      console.error("🚨 SUPABASE KEY PROMISE REJECTION!");
      console.error("  - Error:", event.reason.message);
      console.error("  - Stack:", event.reason.stack);
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Client for browser usage (with RLS)
// Only create client if both URL and key are available and not empty
export const supabase = (() => {
  // Enhanced debugging for Supabase client initialization
  console.log("🔍 Supabase Client Debug Info:");
  console.log("  - NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl ? "✅ Present" : "❌ Missing");
  console.log("  - NEXT_PUBLIC_SUPABASE_ANON_KEY:", supabaseAnonKey ? "✅ Present" : "❌ Missing");
  console.log("  - Environment:", typeof window !== "undefined" ? "🌐 Client-side" : "🖥️ Server-side");
  
  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === "" || supabaseAnonKey === "") {
    console.error("❌ Supabase environment variables are missing or empty. Client will be null.");
    console.error("  - URL:", supabaseUrl);
    console.error("  - Key:", supabaseAnonKey ? "Present but empty" : "Missing");
    return null as any;
  }

  try {
    console.log("✅ Creating Supabase client with valid environment variables");
    const client = createClient(supabaseUrl, supabaseAnonKey);
    console.log("✅ Supabase client created successfully");
    return client;
  } catch (error) {
    console.error("❌ Failed to create Supabase client:", error);
    console.error("  - Error type:", typeof error);
    console.error("  - Error message:", error instanceof Error ? error.message : "Unknown error");
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
