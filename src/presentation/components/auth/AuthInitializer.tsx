'use client';

import { useEffect, useMemo } from 'react';
import { createClientAuthPresenter } from '../../presenters/auth/AuthPresenterClientFactory';
import { useAuthStore } from '../../stores/auth-store';

/**
 * Global Auth Initializer
 * Single Source of Truth for Auth State
 * Manages Supabase subscription and broadcasts to Zustand store
 */
export const AuthInitializer: React.FC = () => {
  const { setSession, reset } = useAuthStore();
  const presenter = useMemo(() => {
    return createClientAuthPresenter();
  }, [])

  useEffect(() => {
    // 1. Subscribe to auth state changes for a true single source of truth across tabs/refreshes
    const unsubscribe = presenter.onAuthStateChange((session) => {
      console.log('Auth state changed via listener:', session ? 'Logged In' : 'Logged Out');
      if (session) {
        setSession(session);
      } else {
        reset();
      }
    });

    // 2. Fetch initial session explicitly just in case onAuthStateChange doesn't fire immediately
    const initAuth = async () => {
      try {
        const session = await presenter.getSession();
        console.log('Init auth session:', session ? 'Found' : 'Null');
        if (session) {
          setSession(session);
        } else {
          // Only reset if we truly have no session
          reset();
        }
      } catch (err) {
        console.error('Failed to initialize auth:', err);
        reset();
      }
    };

    initAuth();

    return () => {
      unsubscribe();
    };
  }, [presenter, setSession, reset]);

  return null;
};

export default AuthInitializer;
