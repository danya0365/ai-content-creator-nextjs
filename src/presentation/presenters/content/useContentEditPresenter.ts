/**
 * useContentEditPresenter
 * Custom hook for ContentEdit presenter
 * ✅ All logic moved from View to Hook following CREATE_PAGE_PATTERN.md
 */

'use client';

import { Content } from '@/src/application/repositories/IContentRepository';
import { useCallback, useEffect, useState } from 'react';
import { ContentEditViewModel } from './ContentEditPresenter';
import { createClientContentEditPresenter } from './ContentEditPresenterClientFactory';

const presenter = createClientContentEditPresenter();

// Form data interface
export interface ContentFormData {
  title: string;
  description: string;
  prompt: string;
  timeSlot: string;
  hashtags: string[];
}

// Time slot option
export interface TimeSlotOption {
  id: string;
  label: string;
  time: string;
}

// Default time slots (OK - these are static config)
const defaultTimeSlots: TimeSlotOption[] = [
  { id: 'morning', label: '🌅 ตอนเช้า', time: '6:00 - 9:00' },
  { id: 'lunch', label: '🍱 ตอนเที่ยง', time: '11:00 - 14:00' },
  { id: 'afternoon', label: '☀️ ตอนบ่าย', time: '14:00 - 18:00' },
  { id: 'evening', label: '🌙 ตอนเย็น', time: '18:00 - 22:00' },
];

// Empty form data for initial state
const emptyFormData: ContentFormData = {
  title: '',
  description: '',
  prompt: '',
  timeSlot: 'morning',
  hashtags: [],
};

export interface ContentEditPresenterState {
  viewModel: ContentEditViewModel | null;
  loading: boolean;
  error: string | null;
  // Form data (moved from View)
  formData: ContentFormData;
  isSaving: boolean;
  isRegenerating: boolean;
  timeSlots: TimeSlotOption[];
  content: Content | null; // ✅ Null when not loaded - no fallback
}

export interface ContentEditPresenterActions {
  loadData: (id: string) => Promise<void>;
  setError: (error: string | null) => void;
  refresh: (id: string) => Promise<void>;
  // Form actions (moved from View)
  updateFormData: (updates: Partial<ContentFormData>) => void;
  addHashtag: (tag: string) => void;
  removeHashtag: (tag: string) => void;
  saveContent: () => Promise<void>;
  regenerateContent: () => Promise<void>;
}

export function useContentEditPresenter(
  contentId: string,
  initialViewModel?: ContentEditViewModel
): [ContentEditPresenterState, ContentEditPresenterActions] {
  // ✅ No fallbackContent - use null when not loaded
  const content = initialViewModel?.content || null;
  
  const [viewModel, setViewModel] = useState<ContentEditViewModel | null>(initialViewModel || null);
  const [loading, setLoading] = useState(!initialViewModel);
  const [error, setError] = useState<string | null>(null);
  
  // Form state - populated from content or empty
  const [formData, setFormData] = useState<ContentFormData>(
    content ? {
      title: content.title,
      description: content.description,
      prompt: content.prompt,
      timeSlot: content.timeSlot,
      hashtags: ['#PixelArt', '#AI', '#Content', '#Creative', '#Tech'],
    } : emptyFormData
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const loadData = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const newViewModel = await presenter.getViewModel(id);
      setViewModel(newViewModel);
      if (newViewModel.content) {
        setFormData({
          title: newViewModel.content.title,
          description: newViewModel.content.description,
          prompt: newViewModel.content.prompt,
          timeSlot: newViewModel.content.timeSlot,
          hashtags: ['#PixelArt', '#AI', '#Content', '#Creative', '#Tech'],
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async (id: string) => {
    await loadData(id);
  }, [loadData]);

  // Update form data
  const updateFormData = useCallback((updates: Partial<ContentFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  }, []);

  // Add hashtag
  const addHashtag = useCallback((tag: string) => {
    setFormData((prev) => ({
      ...prev,
      hashtags: [...prev.hashtags, tag],
    }));
  }, []);

  // Remove hashtag
  const removeHashtag = useCallback((tag: string) => {
    setFormData((prev) => ({
      ...prev,
      hashtags: prev.hashtags.filter((h) => h !== tag),
    }));
  }, []);

  // Save content
  const saveContent = useCallback(async () => {
    setIsSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log('Saved:', formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  }, [formData]);

  // Regenerate content
  const regenerateContent = useCallback(async () => {
    setIsRegenerating(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log('Regenerated');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to regenerate');
    } finally {
      setIsRegenerating(false);
    }
  }, []);

  useEffect(() => {
    if (!initialViewModel && contentId) {
      loadData(contentId);
    }
  }, [initialViewModel, contentId, loadData]);

  return [
    {
      viewModel,
      loading,
      error,
      formData,
      isSaving,
      isRegenerating,
      timeSlots: defaultTimeSlots,
      content,
    },
    {
      loadData,
      setError,
      refresh,
      updateFormData,
      addHashtag,
      removeHashtag,
      saveContent,
      regenerateContent,
    },
  ];
}
