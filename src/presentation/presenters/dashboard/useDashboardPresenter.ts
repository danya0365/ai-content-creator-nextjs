/**
 * useDashboardPresenter
 * Custom hook for Dashboard presenter
 * Provides state management and actions for Dashboard operations
 */

'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { DashboardPresenter, DashboardViewModel } from './DashboardPresenter';
import { createClientDashboardPresenter } from './DashboardPresenterClientFactory';

export interface DashboardPresenterState {
  viewModel: DashboardViewModel | null;
  loading: boolean;
  error: string | null;
}

export interface DashboardPresenterActions {
  loadData: () => Promise<void>;
  setError: (error: string | null) => void;
  refresh: () => Promise<void>;
}

/**
 * Custom hook for Dashboard presenter
 * Provides state management and actions for Dashboard operations
 */
export function useDashboardPresenter(
  initialViewModel?: DashboardViewModel,
  presenterOverride?: DashboardPresenter
): [DashboardPresenterState, DashboardPresenterActions] {
  // ✅ Create presenter inside hook with useMemo
  // Accept override for easier testing (Dependency Injection)
  const presenter = useMemo(
    () => presenterOverride ?? createClientDashboardPresenter(),
    [presenterOverride]
  );

  const [viewModel, setViewModel] = useState<DashboardViewModel | null>(
    initialViewModel || null
  );
  const [loading, setLoading] = useState(!initialViewModel);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load data from presenter
   */
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const newViewModel = await presenter.getViewModel();
      setViewModel(newViewModel);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, [presenter]);

  /**
   * Refresh data (alias for loadData)
   */
  const refresh = useCallback(async () => {
    await loadData();
  }, [loadData]);

  // Load data on mount if no initial data
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
    },
    {
      loadData,
      setError,
      refresh,
    },
  ];
}
