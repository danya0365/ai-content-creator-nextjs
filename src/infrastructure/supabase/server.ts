import { Database } from '@/src/domain/types/supabase';
import { createServerClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

// กำหนดค่าเริ่มต้นสำหรับ Supabase URL และ API key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-for-build.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key-for-build';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

/**
 * Create Supabase client with anon key (for user-authenticated requests)
 * ⚠️ Subject to RLS policies
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

/**
 * Create Supabase admin client with service role key
 * ✅ Bypasses RLS - Use for server-side operations (API routes, cron jobs)
 * ⚠️ Never expose this on the client side!
 */
export function createAdminClient() {
  if (!supabaseServiceRoleKey) {
    console.warn('[Supabase] No service role key found, falling back to anon key');
    // Fallback: return a simple client with anon key (will still be subject to RLS)
    return createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey);
  }

  return createSupabaseClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
