import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppSettings } from '../presenters/settings/SettingsPresenter';

interface SettingsState extends AppSettings {
  // Appearance
  enable3DGraphics: boolean;
  
  // Actions
  updateSettings: (updates: Partial<AppSettings>) => void;
  toggle3DGraphics: () => void;
  set3DGraphics: (enable: boolean) => void;
}

const defaultAppSettings: AppSettings = {
  geminiApiKey: '',
  autoSchedule: true,
  defaultTimeSlot: 'morning',
  contentQuality: 'high',
  language: 'th',
  brandContext: '',
  notifications: {
    onGenerate: true,
    onPublish: true,
    onSchedule: true,
  },
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaultAppSettings,
      
      // Default to true, but AiAssistantWidget will still check hardware before falling back
      enable3DGraphics: true,

      updateSettings: (updates) => set((state) => ({ ...state, ...updates })),
      toggle3DGraphics: () => set((state) => ({ enable3DGraphics: !state.enable3DGraphics })),
      set3DGraphics: (enable) => set({ enable3DGraphics: enable }),
    }),
    {
      name: 'ai-creator-settings', // unique name for localStorage key
    }
  )
);
