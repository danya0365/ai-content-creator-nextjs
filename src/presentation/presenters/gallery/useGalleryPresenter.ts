/**
 * useGalleryPresenter
 * Custom hook for Gallery presenter
 * ✅ All logic moved from View to Hook following CREATE_PAGE_PATTERN.md
 */

'use client';

import { Content } from '@/src/application/repositories/IContentRepository';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ContentFilter, GalleryPresenter, GalleryViewModel } from './GalleryPresenter';
import { createClientGalleryPresenter } from './GalleryPresenterClientFactory';

// Define types
export type GallerySortBy = 'newest' | 'oldest' | 'likes' | 'shares';
export type ViewMode = 'grid' | 'list';

export interface GalleryPresenterState {
  viewModel: GalleryViewModel | null;
  loading: boolean;
  error: string | null;
  // Filter/Sort state (moved from View)
  filter: ContentFilter;
  sortBy: GallerySortBy;
  // UI state (moved from View)
  selectedContent: Content | null;
  viewMode: ViewMode;
  // Computed
  filteredAndSortedContents: Content[];
  counts: {
    all: number;
    published: number;
    scheduled: number;
    draft: number;
  };
}

export interface GalleryPresenterActions {
  loadData: () => Promise<void>;
  setFilter: (filter: ContentFilter) => void;
  setSortBy: (sortBy: GallerySortBy) => void;
  setError: (error: string | null) => void;
  refresh: () => Promise<void>;
  // UI actions (moved from View)
  selectContent: (content: Content | null) => void;
  setViewMode: (mode: ViewMode) => void;
}

export function useGalleryPresenter(
  initialViewModel?: GalleryViewModel,
  presenterOverride?: GalleryPresenter
): [GalleryPresenterState, GalleryPresenterActions] {
  // ✅ Create presenter inside hook with useMemo
  // Accept override for easier testing (Dependency Injection)
  const presenter = useMemo(
    () => presenterOverride ?? createClientGalleryPresenter(),
    [presenterOverride]
  );

  const [viewModel, setViewModel] = useState<GalleryViewModel | null>(initialViewModel || null);
  const [loading, setLoading] = useState(!initialViewModel);
  const [error, setError] = useState<string | null>(null);
  
  // Filter/Sort state (moved from View)
  const [filter, setFilter] = useState<ContentFilter>('all');
  const [sortBy, setSortBy] = useState<GallerySortBy>('newest');
  
  // UI state (moved from View)
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Computed: filtered and sorted contents (moved from View)
  const filteredAndSortedContents = useMemo(() => {
    if (!viewModel) return [];
    
    let contents = filter === 'all'
      ? viewModel.contents
      : viewModel.contents.filter((c) => c.status === filter);

    // Sort
    switch (sortBy) {
      case 'newest':
        contents = [...contents].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case 'oldest':
        contents = [...contents].sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        break;
      case 'likes':
        contents = [...contents].sort((a, b) => (b.likes || 0) - (a.likes || 0));
        break;
      case 'shares':
        contents = [...contents].sort((a, b) => (b.shares || 0) - (a.shares || 0));
        break;
    }

    return contents;
  }, [viewModel, filter, sortBy]);

  // Computed: counts for filter badges
  const counts = useMemo(() => {
    if (!viewModel) return { all: 0, published: 0, scheduled: 0, draft: 0 };
    return {
      all: viewModel.contents.length,
      published: viewModel.contents.filter((c) => c.status === 'published').length,
      scheduled: viewModel.contents.filter((c) => c.status === 'scheduled').length,
      draft: viewModel.contents.filter((c) => c.status === 'draft').length,
    };
  }, [viewModel]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const newViewModel = await presenter.getViewModel(filter);
      setViewModel(newViewModel);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [filter, presenter]);

  const refresh = useCallback(async () => {
    await loadData();
  }, [loadData]);

  // Select/deselect content
  const selectContent = useCallback((content: Content | null) => {
    setSelectedContent(content);
  }, []);

  useEffect(() => {
    if (!initialViewModel) {
      loadData();
    }
  }, [initialViewModel, loadData]);

  return [
    {
      viewModel,
      loading,
      error,
      filter,
      sortBy,
      selectedContent,
      viewMode,
      filteredAndSortedContents,
      counts,
    },
    {
      loadData,
      setFilter,
      setSortBy,
      setError,
      refresh,
      selectContent,
      setViewMode,
    },
  ];
}
