import { createClient } from '@/src/infrastructure/supabase/server';
import { NextRequest } from 'next/server';

/**
 * Authorize a cron/debug request
 * 
 * ✅ Allows VPS-style access via x-cron-secret (static header)
 * ✅ Allows User-style access via Supabase Session (with Admin role check)
 * ✅ Allows Localhost automatically (for dev productivity)
 */
export async function authorizeCronRequest(request: NextRequest): Promise<boolean> {
  // 1. Check for localhost (skip auth in local dev for convenience)
  // ⚠️ Ensure host header is checked carefully
  const host = request.headers.get('host');
  const isLocalhost = host?.includes('localhost') || host?.includes('127.0.0.1');

  // 2. Check for VPS Secret (Static Key)
  const cronSecret = request.headers.get('x-cron-secret') || 
                     request.headers.get('authorization')?.replace('Bearer ', '');
  const expectedSecret = process.env.CRON_SECRET;
  
  if (expectedSecret && cronSecret === expectedSecret) {
    return true;
  }

  // If localhost, allow even if secret is missing (for local dev devtools)
  if (isLocalhost) return true;

  // 3. Fallback: Check for Admin User Session (The secure "Run Manually" way)
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    // If no user session, they aren't authorized via session
    if (userError || !user) {
      return false;
    }

    // Verify admin role in profile_roles table for the active profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*, profile_roles(role)')
      .eq('auth_id', user.id)
      .eq('is_active', true)
      .limit(1)
      .maybeSingle();

    if (profileError || !profileData) {
      return false;
    }

    // Extract role from joined table (Handle both single object and array responses)
    const pr = (profileData as any).profile_roles;
    const role = Array.isArray(pr) ? (pr[0]?.role || 'user') : (pr?.role || 'user');
    
    return role === 'admin';
  } catch (err) {
    console.error('[cron-auth] Auth unexpected error:', err);
    return false;
  }
}
