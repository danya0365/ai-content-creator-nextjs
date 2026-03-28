// app/api/auth/[action]/route.ts
import { getAuthConfig } from '@/src/config/auth.config';
import { createClient } from '@/src/infrastructure/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ action: string }> }
) {
  try {
    const { action } = await params;
    let body: any = {};
    try {
      const text = await request.text();
      body = text ? JSON.parse(text) : {};
    } catch (e) {
      // Ignored if body is empty or invalid JSON
    }

    const supabase = await createClient();

    let data, error;

    const authConfig = getAuthConfig();

    switch (action) {
      case 'sign-up':
        if (!authConfig.email.enabled || !authConfig.email.allowRegistration) {
          return NextResponse.json({ error: 'Registration is disabled' }, { status: 403 });
        }
        ({ data, error } = await supabase.auth.signUp({
          email: body.email,
          password: body.password,
          options: {
            data: { full_name: body.fullName, phone: body.phone },
            emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
          },
        }));
        break;

      case 'sign-in':
        if (!authConfig.email.enabled) {
          return NextResponse.json({ error: 'Email login is disabled' }, { status: 403 });
        }
        ({ data, error } = await supabase.auth.signInWithPassword({
          email: body.email,
          password: body.password,
        }));
        break;

      case 'sign-in-otp':
        if (!authConfig.phone.enabled) {
          return NextResponse.json({ error: 'Phone login is disabled' }, { status: 403 });
        }
        ({ data, error } = await supabase.auth.signInWithOtp({
          phone: body.phone,
        }));
        break;

      case 'verify-otp':
        if (!authConfig.phone.enabled) {
          return NextResponse.json({ error: 'Phone login is disabled' }, { status: 403 });
        }
        ({ data, error } = await supabase.auth.verifyOtp({
          phone: body.phone,
          token: body.token,
          type: 'sms',
        }));
        break;

      case 'sign-out':
        ({ error } = await supabase.auth.signOut());
        if (!error) data = { success: true };
        break;

      case 'reset-password':
        if (!authConfig.features.forgotPassword) {
          return NextResponse.json({ error: 'Forgot password feature is disabled' }, { status: 403 });
        }
        ({ data, error } = await supabase.auth.resetPasswordForEmail(body.email, {
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/reset-password`,
        }));
        break;

      case 'update-password':
        ({ data, error } = await supabase.auth.updateUser({
          password: body.newPassword,
        }));
        break;

      case 'resend-email-verification':
        ({ data, error } = await supabase.auth.resend({
          type: 'signup',
          email: body.email,
          options: { emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback` },
        }));
        break;

      case 'refresh-session':
        ({ data, error } = await supabase.auth.refreshSession());
        break;

      default:
        return NextResponse.json({ error: 'Action not supported' }, { status: 400 });
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json({ data });
  } catch (err: any) {
    const action = await params.then(p => p.action).catch(() => 'unknown');
    console.error(`Auth API [${action}] Error:`, err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ action: string }> }
) {
  try {
    const { action } = await params;
    const supabase = await createClient();

    let data: any = null;
    let error: any = null;

    switch (action) {
      case 'session':
        {
          const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
          if (sessionError || !sessionData.session) {
            return NextResponse.json({ data: null });
          }
          data = sessionData;
        }
        break;

      case 'user':
        {
          const { data: userData, error: userError } = await supabase.auth.getUser();
          if (userError || !userData.user) {
            return NextResponse.json({ data: null });
          }
          data = userData;
        }
        break;

      case 'profile':
        {
          const { data: userData, error: userError } = await supabase.auth.getUser();
          if (userError || !userData.user) return NextResponse.json({ data: null });

          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*, profile_roles(role)')
            .eq('auth_id', userData.user.id)
            .eq('is_active', true)
            .limit(1)
            .maybeSingle();

          if (profileError) return NextResponse.json({ data: null });
          
          // Flatten role from profile_roles to ensure consistent schema for single source of truth
          if (profileData && (profileData as any).profile_roles) {
            const pr = (profileData as any).profile_roles;
            (profileData as any).role = Array.isArray(pr) ? (pr[0]?.role || 'user') : (pr.role || 'user');
          }
          
          data = profileData;
        }
        break;

      case 'profiles':
        {
          const { data: userData, error: userError } = await supabase.auth.getUser();
          if (userError || !userData.user) return NextResponse.json({ data: [] });

          const { data: rpcData, error: rpcError } = await supabase.rpc('get_user_profiles');
          if (rpcError) return NextResponse.json({ data: [] });
          data = rpcData;
        }
        break;

      default:
        return NextResponse.json({ error: 'Action not supported' }, { status: 400 });
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json({ data });
  } catch (err: any) {
    const action = await params.then(p => p.action).catch(() => 'unknown');
    console.error(`Auth API GET [${action}] Error:`, err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
