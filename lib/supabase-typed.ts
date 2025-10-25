import { createClient as createSupabaseClient } from '@supabase/supabase-js';

import type { Database } from './database.types';

/**
 * Create a typed Supabase client
 * Use this instead of the generic createClient for full type safety
 */
export function createClient(url: string, key: string) {
  return createSupabaseClient<Database>(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export type TypedSupabaseClient = ReturnType<typeof createClient>;

