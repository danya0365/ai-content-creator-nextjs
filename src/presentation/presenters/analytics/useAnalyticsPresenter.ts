/**
 * useAnalyticsPresenter
 * Custom hook for Analytics presenter
 * ✅ All logic moved from View to Hook following CREATE_PAGE_PATTERN.md
 */

'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnalyticsPresenter, AnalyticsViewModel } from './AnalyticsPresenter';
import { createClientAnalyticsPresenter } from './AnalyticsPresenterClientFactory';

// Date range type (moved from View)
export type DateRange = 'today' | 'week' | 'month' | 'year';

export interface AnalyticsPresenterState {
  viewModel: AnalyticsViewModel | null;
  loading: boolean;
  error: string | null;
  // UI state (moved from View)
  dateRange: DateRange;
}

export interface AnalyticsPresenterActions {
  loadData: () => Promise<void>;
  setError: (error: string | null) => void;
  refresh: () => Promise<void>;
  // UI actions (moved from View)
  setDateRange: (range: DateRange) => void;
}

export function useAnalyticsPresenter(
  initialViewModel?: AnalyticsViewModel,
  presenterOverride?: AnalyticsPresenter
): [AnalyticsPresenterState, AnalyticsPresenterActions] {
  // ✅ Create presenter inside hook with useMemo
  // Accept override for easier testing (Dependency Injection)
  const presenter = useMemo(
    () => presenterOverride ?? createClientAnalyticsPresenter(),
    [presenterOverride]
  );

  const [viewModel, setViewModel] = useState<AnalyticsViewModel | null>(
    initialViewModel || null
  );
  const [loading, setLoading] = useState(!initialViewModel);
  const [error, setError] = useState<string | null>(null);
  
  // UI state (moved from View)
  const [dateRange, setDateRange] = useState<DateRange>('week');

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
    {
      viewModel,
      loading,
      error,
      dateRange,
    },
    {
      loadData,
      setError,
      refresh,
      setDateRange,
    },
  ];
}
