/**
 * useHomePresenter
 * Custom hook for Home presenter
 */

'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { HomePresenter, HomeViewModel } from './HomePresenter';
import { createClientHomePresenter } from './HomePresenterClientFactory';

export interface HomePresenterState {
  viewModel: HomeViewModel | null;
  loading: boolean;
  error: string | null;
}

export interface HomePresenterActions {
  loadData: () => Promise<void>;
  setError: (error: string | null) => void;
  refresh: () => Promise<void>;
}

export function useHomePresenter(
  initialViewModel?: HomeViewModel,
  presenterOverride?: HomePresenter
): [HomePresenterState, HomePresenterActions] {
  // ✅ Create presenter inside hook with useMemo
  // Accept override for easier testing (Dependency Injection)
  const presenter = useMemo(
    () => presenterOverride ?? createClientHomePresenter(),
    [presenterOverride]
  );

  const [viewModel, setViewModel] = useState<HomeViewModel | null>(initialViewModel || null);
  const [loading, setLoading] = useState(!initialViewModel);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const newViewModel = await presenter.getViewModel();
      setViewModel(newViewModel);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [presenter]);

  const refresh = useCallback(async () => {
    await loadData();
  }, [loadData]);

  useEffect(() => {
    if (!initialViewModel) {
      loadData();
    }
  }, [initialViewModel, loadData]);

  return [
    { viewModel, loading, error },
    { loadData, setError, refresh },
  ];
}
