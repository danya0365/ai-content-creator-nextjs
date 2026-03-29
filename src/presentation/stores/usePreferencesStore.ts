import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PreferencesState {
  defaultTone: string;
  defaultPlatforms: string[];
  defaultImageStyle: string;
  
  // Action to silently persist changes whenever a user interacts with the UI
  setPreference: (key: keyof Omit<PreferencesState, 'setPreference'>, value: any) => void;
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      defaultTone: 'casual',
      defaultPlatforms: ['facebook'], // Default to Facebook if completely fresh
      defaultImageStyle: 'anime',     // Default to Anime
      
      setPreference: (key, value) => set({ [key]: value }),
    }),
    {
      name: 'ai-creator-preferences', // Safe localStorage key
    }
  )
);
