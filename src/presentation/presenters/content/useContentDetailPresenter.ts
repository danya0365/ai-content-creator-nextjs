/**
 * useContentDetailPresenter
 * Custom hook for ContentDetail presenter
 */

'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ContentDetailPresenter, ContentDetailViewModel } from './ContentDetailPresenter';
import { createClientContentDetailPresenter } from './ContentDetailPresenterClientFactory';

export interface ContentDetailPresenterState {
  viewModel: ContentDetailViewModel | null;
  loading: boolean;
  error: string | null;
}

export interface ContentDetailPresenterActions {
  loadData: (id: string) => Promise<void>;
  setError: (error: string | null) => void;
  refresh: (id: string) => Promise<void>;
  deleteContent: () => Promise<void>;
}

export function useContentDetailPresenter(
  contentId: string,
  initialViewModel?: ContentDetailViewModel,
  presenterOverride?: ContentDetailPresenter
): [ContentDetailPresenterState, ContentDetailPresenterActions] {
  // ✅ Create presenter inside hook with useMemo
  // Accept override for easier testing (Dependency Injection)
  const presenter = useMemo(
    () => presenterOverride ?? createClientContentDetailPresenter(),
    [presenterOverride]
  );

  const [viewModel, setViewModel] = useState<ContentDetailViewModel | null>(initialViewModel || null);
  const [loading, setLoading] = useState(!initialViewModel);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const newViewModel = await presenter.getViewModel(id);
      setViewModel(newViewModel);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [contentId, presenter]);

  const deleteContent = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await presenter.deleteContent(contentId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [contentId, presenter]);

  const refresh = useCallback(async (id: string) => {
    await loadData(id);
  }, [loadData]);

  useEffect(() => {
    if (!initialViewModel && contentId) {
      loadData(contentId);
    }
  }, [initialViewModel, contentId, loadData]);

  return [
    { viewModel, loading, error },
    { loadData, setError, refresh, deleteContent },
  ];
}
