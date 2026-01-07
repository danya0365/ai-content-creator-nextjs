/**
 * useGenerateStore
 * Zustand store for content generation state
 */

import { GeneratedContent } from '@/src/data/mock/mockContents';
import { create } from 'zustand';
import { GenerateFormData } from '../components/generate/GenerateContentModal';

interface GenerateState {
  isModalOpen: boolean;
  isGenerating: boolean;
  generatedContent: GeneratedContent | null;
  error: string | null;
}

interface GenerateActions {
  openModal: () => void;
  closeModal: () => void;
  generateContent: (data: GenerateFormData) => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

type GenerateStore = GenerateState & GenerateActions;

const initialState: GenerateState = {
  isModalOpen: false,
  isGenerating: false,
  generatedContent: null,
  error: null,
};

export const useGenerateStore = create<GenerateStore>((set) => ({
  ...initialState,

  openModal: () => set({ isModalOpen: true }),
  
  closeModal: () => set({ isModalOpen: false, error: null }),

  generateContent: async (data: GenerateFormData) => {
    set({ isGenerating: true, error: null });

    try {
      // Call the generate API
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to generate content');
      }

      const newContent: GeneratedContent = {
        id: result.content.id,
        contentTypeId: result.content.contentTypeId,
        title: result.content.title,
        description: result.content.description,
        imageUrl: result.content.imageUrl || '/generated/placeholder.png',
        prompt: result.content.prompt,
        timeSlot: result.content.timeSlot,
        scheduledAt: result.content.scheduledAt,
        publishedAt: null,
        status: 'scheduled',
        likes: 0,
        shares: 0,
        createdAt: result.content.createdAt,
        // New unified Content fields
        comments: 0,
        tags: result.content.tags || [],
        emoji: result.content.emoji,
      };

      set({
        isGenerating: false,
        generatedContent: newContent,
        isModalOpen: false,
      });

      console.log('Generated content via API:', newContent);

    } catch (error) {
      set({
        isGenerating: false,
        error: error instanceof Error ? error.message : 'Failed to generate content',
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),

  reset: () => set(initialState),
}));
