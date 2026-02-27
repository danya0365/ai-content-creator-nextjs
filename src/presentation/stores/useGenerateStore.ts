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
  initialData: Partial<GenerateFormData> | null;
}

interface GenerateActions {
  openModal: (data?: Partial<GenerateFormData>) => void;
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
  initialData: null,
};

export const useGenerateStore = create<GenerateStore>((set) => ({
  ...initialState,

  openModal: (data) => set({ isModalOpen: true, initialData: data || null }),
  
  closeModal: () => set({ isModalOpen: false, error: null, initialData: null }),

  generateContent: async (data: GenerateFormData) => {
    set({ isGenerating: true, error: null });

    try {
      // Step 1: Call the new AI Generation API (No DB touch)
      const aiResponse = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentTypeId: data.contentTypeId,
          topic: data.topic,
          timeSlot: data.timeSlot,
        }),
      });

      const aiResult = await aiResponse.json();

      if (!aiResponse.ok || !aiResult.success) {
        throw new Error(aiResult.error || 'Failed to generate AI content');
      }

      // Step 2: Prepare payload for Database insertion
      const scheduledAt = `${data.scheduledDate}T${data.scheduledTime}:00.000Z`;
      
      const createPayload = {
        ...aiResult.content,
        scheduledAt,
        status: 'scheduled',
      };

      // Step 3: Call the DB Contents API to save
      const dbResponse = await fetch('/api/contents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createPayload),
      });

      const dbResult = await dbResponse.json();

      if (!dbResponse.ok) {
        throw new Error(dbResult.error || 'Failed to save content to database');
      }

      // Format response to match store
      const newContent: GeneratedContent = {
        id: dbResult.id,
        contentTypeId: dbResult.contentTypeId,
        title: dbResult.title,
        description: dbResult.description,
        imageUrl: dbResult.imageUrl || '/generated/placeholder.png',
        prompt: dbResult.prompt,
        timeSlot: dbResult.timeSlot,
        scheduledAt: dbResult.scheduledAt,
        publishedAt: dbResult.publishedAt,
        status: dbResult.status,
        likes: dbResult.likes || 0,
        shares: dbResult.shares || 0,
        createdAt: dbResult.createdAt,
        comments: dbResult.comments || 0,
        tags: dbResult.tags || [],
        emoji: dbResult.emoji,
      };

      set({
        isGenerating: false,
        generatedContent: newContent,
        isModalOpen: false,
      });

      console.log('Successfully generated and saved content:', newContent);

    } catch (error) {
      set({
        isGenerating: false,
        error: error instanceof Error ? error.message : 'Failed to process request',
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),

  reset: () => set(initialState),
}));
