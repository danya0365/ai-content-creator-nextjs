import { createBrowserClient } from '@supabase/ssr';

/**
 * Supabase Browser Client
 * Use this in client components
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/**
 * Check if using Supabase or Mock data
 */
export function isUsingSupabase(): boolean {
  return process.env.NEXT_PUBLIC_DATA_SOURCE === 'supabase';
}
