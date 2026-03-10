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
    // Fetch initial session once on mount using the Server API
    const initAuth = async () => {
      try {
        const session = await presenter.getSession();
        console.log('Init auth session:', session);
        if (session) {
          setSession(session);
        } else {
          reset();
        }
      } catch (err) {
        console.error('Failed to initialize auth:', err);
        reset();
      }
    };

    initAuth();
  }, [setSession, reset]);

  return null;
};

export default AuthInitializer;
