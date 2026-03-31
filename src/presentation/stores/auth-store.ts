import { AuthProfile, AuthSession, AuthUser } from '@/src/application/repositories/IAuthRepository';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: AuthUser | null;
  profile: AuthProfile | null;
  session: AuthSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  profiles: AuthProfile[];
  
  // Actions
  setSession: (session: AuthSession | null) => void;
  setProfile: (profile: AuthProfile | null) => void;
  setProfiles: (profiles: AuthProfile[]) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
  user: null,
  profile: null,
  session: null,
  isAuthenticated: false,
  isLoading: true, // Initial loading state
  profiles: [],

  setSession: (session) => set(() => ({ 
    session,
    user: session?.user || null,
    profile: session?.profile || null,
    isAuthenticated: !!session,
    isLoading: false,
  })),

  setProfile: (profile) => set((state) => {
    // Update profile in session as well if it exists
    const currentSession = state.session;
    let newSession = currentSession;
    
    if (currentSession) {
      newSession = {
        ...currentSession,
        profile: profile
      };
    }

    return { 
      profile,
      session: newSession
    };
  }),

  setProfiles: (profiles) => set({ profiles }),

  setLoading: (isLoading) => set({ isLoading }),

  reset: () => set({
    user: null,
    profile: null,
    session: null,
    isAuthenticated: false,
    isLoading: false,
    profiles: [],
  }),
    }),
    {
      name: 'ai-creator-auth', // unique name for localStorage key
    }
  )
);
