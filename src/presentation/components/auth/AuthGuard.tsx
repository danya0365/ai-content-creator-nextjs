/**
 * AuthGuard — Protects pages that require authentication
 * Redirects to login page if not authenticated
 * Waits for auth store loading (session restore) before deciding
 */

'use client';

import { useAuthStore } from '../../stores/auth-store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { animated, config, useSpring } from '@react-spring/web';

interface AuthGuardProps {
  children: React.ReactNode;
  /** Optional list of roles allowed to access this page */
  allowedRoles?: string[];
  /** Optional fallback while loading or redirecting */
  fallback?: React.ReactNode;
  /** Optional fallback specifically for when the user is logged in but lacks the required role */
  unauthorizedFallback?: React.ReactNode;
}

export function AuthGuard({ children, allowedRoles, fallback, unauthorizedFallback }: AuthGuardProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, profile } = useAuthStore();

  useEffect(() => {
    // Don't redirect until the store has finished restoring the session
    if (isLoading) return;

    if (!isAuthenticated) {
      // Get current path to redirect back after login
      const currentPath = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '';
      const redirectParam = currentPath ? `?redirectTo=${encodeURIComponent(currentPath)}` : '';
      router.replace(`/auth/login${redirectParam}`);
      return;
    }

    if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
      // Only redirect if there is no custom unauthorized UI provided
      if (!unauthorizedFallback) {
        router.replace('/');
      }
    }
  }, [isLoading, isAuthenticated, profile, allowedRoles, router, unauthorizedFallback]);

  // Auth store still loading (restoring session) — show skeleton
  if (isLoading) {
    return fallback || <AuthGuardSkeleton />;
  }

  // Not authenticated — will redirect, show loading fallback
  if (!isAuthenticated) {
    return fallback || <AuthGuardSkeleton />;
  }

  // Role mismatch - Show unauthorized fallback if provided, otherwise generic fallback
  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    return unauthorizedFallback || fallback || <AuthGuardSkeleton />;
  }

  return <>{children}</>;
}

function AuthGuardSkeleton() {
  const spring = useSpring({
    from: { opacity: 0, scale: 0.9 },
    to: { opacity: 1, scale: 1 },
    config: config.gentle,
  });

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <animated.div style={spring} className="text-center w-full max-w-sm">
        <div className="relative inline-block mb-10">
          <div className="text-6xl filter drop-shadow-[0_0_20px_rgba(139,92,246,0.3)] animate-bounce-slow">🔐</div>
          <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-full blur-sm opacity-50 animate-pulse" />
        </div>
        
        <div className="space-y-4">
          <p className="text-lg font-bold gradient-text-purple">
            กำลังตรวจสอบสิทธิ์...
          </p>
          
          <div className="relative w-full h-1.5 bg-surface rounded-full overflow-hidden border border-white/5">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-violet-600 w-full animate-shimmer shadow-[0_0_10px_rgba(139,92,246,0.5)]" />
          </div>
          
          <p className="text-xs text-muted tracking-wider uppercase font-medium">
            Securing your connection
          </p>
        </div>
      </animated.div>
    </div>
  );
}
