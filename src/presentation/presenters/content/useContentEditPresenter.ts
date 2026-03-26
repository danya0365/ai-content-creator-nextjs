/**
 * useContentEditPresenter
 * Custom hook for ContentEdit presenter
 * ✅ All logic moved from View to Hook following CREATE_PAGE_PATTERN.md
 */

'use client';

import { Content } from '@/src/application/repositories/IContentRepository';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ContentEditPresenter, ContentEditViewModel } from './ContentEditPresenter';
import { createClientContentEditPresenter } from './ContentEditPresenterClientFactory';

// Form data interface
export interface ContentFormData {
  title: string;
  description: string;
  prompt: string;
  timeSlot: string;
  hashtags: string[];
  imageUrl: string;
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
  imageUrl: '',
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
  regenerateImage: () => Promise<void>;
  regenerateDescription: () => Promise<void>;
}

export function useContentEditPresenter(
  contentId: string,
  initialViewModel?: ContentEditViewModel,
  presenterOverride?: ContentEditPresenter
): [ContentEditPresenterState, ContentEditPresenterActions] {
  // ✅ Create presenter inside hook with useMemo
  // Accept override for easier testing (Dependency Injection)
  const presenter = useMemo(
    () => presenterOverride ?? createClientContentEditPresenter(),
    [presenterOverride]
  );

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
      hashtags: content.tags || ['#PixelArt', '#AI', '#Content'],
      imageUrl: content.imageUrl || '',
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
          hashtags: newViewModel.content.tags || ['#PixelArt', '#AI', '#Content'],
          imageUrl: newViewModel.content.imageUrl || '',
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [presenter]);

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
    if (!content) return;
    setIsSaving(true);
    try {
      const response = await fetch(`/api/contents/${content.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          prompt: formData.prompt,
          timeSlot: formData.timeSlot,
          hashtags: formData.hashtags,
          imageUrl: formData.imageUrl,
        }),
      });
      if (!response.ok) throw new Error('Failed to save content');
      await refresh(content.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  }, [formData, content, refresh]);

  // Regenerate content (Text + Image)
  const regenerateContent = useCallback(async () => {
    if (!content) return;
    setIsRegenerating(true);
    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentTypeId: content.contentTypeId,
          topic: formData.title || 'คอนเทนต์น่าสนใจ',
          timeSlot: formData.timeSlot,
          imageStyle: 'pixel-art', // Default fallback
          generateImage: true,
        }),
      });
      if (!response.ok) throw new Error('API error');
      const data = await response.json();
      if (data.success && data.content) {
        setFormData(prev => ({
          ...prev,
          title: data.content.title,
          description: data.content.description,
          prompt: data.content.prompt,
          hashtags: data.content.tags || prev.hashtags,
          imageUrl: data.content.imageUrl || prev.imageUrl,
        }));
      } else {
        throw new Error(data.error || 'Failed to regenerate');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to regenerate');
    } finally {
      setIsRegenerating(false);
    }
  }, [formData, content]);

  // Regenerate Image only
  const regenerateImage = useCallback(async () => {
    if (!formData.prompt) return;
    setIsRegenerating(true);
    try {
      const response = await fetch('/api/ai/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imagePrompt: formData.prompt,
          imageStyle: 'pixel-art', // Default fallback
        }),
      });
      if (!response.ok) throw new Error('API error');
      const data = await response.json();
      if (data.success && data.imageUrl) {
        setFormData(prev => ({ ...prev, imageUrl: data.imageUrl }));
      } else {
        throw new Error(data.error || 'Failed to generate image');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to regenerate image');
    } finally {
      setIsRegenerating(false);
    }
  }, [formData.prompt]);

  // Regenerate Description only
  const regenerateDescription = useCallback(async () => {
    if (!content) return;
    setIsRegenerating(true);
    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentTypeId: content.contentTypeId,
          topic: formData.title || 'คอนเทนต์น่าสนใจ',
          timeSlot: formData.timeSlot,
          imageStyle: 'pixel-art', // Required field by interface, ignored since generateImage=false
          generateImage: false,    // Skip image generation
        }),
      });
      if (!response.ok) throw new Error('API error');
      const data = await response.json();
      if (data.success && data.content) {
        setFormData(prev => ({
          ...prev,
          description: data.content.description,
        }));
      } else {
        throw new Error(data.error || 'Failed to regenerate description');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to regenerate description');
    } finally {
      setIsRegenerating(false);
    }
  }, [formData.title, formData.timeSlot, content]);

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
      regenerateImage,
      regenerateDescription,
    },
  ];
}
