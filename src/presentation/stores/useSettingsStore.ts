import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  // Appearance
  enable3DGraphics: boolean;
  
  // Actions
  toggle3DGraphics: () => void;
  set3DGraphics: (enable: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      // Default to true, but AiAssistantWidget will still check hardware before falling back
      enable3DGraphics: true,

      toggle3DGraphics: () => set((state) => ({ enable3DGraphics: !state.enable3DGraphics })),
      set3DGraphics: (enable) => set({ enable3DGraphics: enable }),
    }),
    {
      name: 'ai-creator-settings', // unique name for localStorage key
    }
  )
);
