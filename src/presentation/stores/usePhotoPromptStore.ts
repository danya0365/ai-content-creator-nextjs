/**
 * usePhotoPromptStore
 * Zustand store for Photo Prompt Generator Modal state
 */

import { create } from 'zustand';

export interface PhotoPromptFormData {
  // Step 1: Theme + Content
  theme: string;
  arabicText: string;
  translationText: string;
  sourceReference: string;

  // Step 2: Visual Style
  frameStyle: string;
  backgroundScene: string;
  foreground: string;
  lighting: string;
  globalStyle: string;
  colorPalette: string;

  // Step 3: Output
  aspectRatio: string;
  quality: string;
  platformTargets: string[];
}

interface PhotoPromptState {
  isModalOpen: boolean;
  isGenerating: boolean;
  generatedPrompt: string | null;
  generatedImageUrl: string | null;
  error: string | null;
}

interface PhotoPromptActions {
  openModal: () => void;
  closeModal: () => void;
  setGeneratedPrompt: (prompt: string) => void;
  setGeneratedImage: (url: string) => void;
  setIsGenerating: (val: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

type PhotoPromptStore = PhotoPromptState & PhotoPromptActions;

const initialState: PhotoPromptState = {
  isModalOpen: false,
  isGenerating: false,
  generatedPrompt: null,
  generatedImageUrl: null,
  error: null,
};

export const usePhotoPromptStore = create<PhotoPromptStore>()((set) => ({
  ...initialState,

  openModal: () => set({ isModalOpen: true }),
  closeModal: () => set({ isModalOpen: false, error: null }),
  setGeneratedPrompt: (prompt) => set({ generatedPrompt: prompt }),
  setGeneratedImage: (url) => set({ generatedImageUrl: url }),
  setIsGenerating: (val) => set({ isGenerating: val }),
  setError: (error) => set({ error }),
  reset: () => set(initialState),
}));
