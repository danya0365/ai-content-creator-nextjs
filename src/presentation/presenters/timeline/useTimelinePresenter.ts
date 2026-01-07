/**
 * useTimelinePresenter
 * Custom hook for Timeline presenter
 * ✅ All logic moved from View to Hook following CREATE_PAGE_PATTERN.md
 */

'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { TimelineFilter, TimelineGroup, TimelineStatusFilter, TimelineViewModel } from './TimelinePresenter';
import { createClientTimelinePresenter } from './TimelinePresenterClientFactory';

const presenter = createClientTimelinePresenter();

export interface TimelinePresenterState {
  viewModel: TimelineViewModel | null;
  loading: boolean;
  error: string | null;
  filter: TimelineFilter;
  statusFilter: TimelineStatusFilter;
  // Computed values (moved from View)
  filteredGroups: TimelineGroup[];
  filteredCount: number;
}

export interface TimelinePresenterActions {
  loadData: () => Promise<void>;
  setFilter: (filter: TimelineFilter) => void;
  setStatusFilter: (status: TimelineStatusFilter) => void;
  setError: (error: string | null) => void;
  refresh: () => Promise<void>;
  resetFilters: () => void;
}

export function useTimelinePresenter(
  initialViewModel?: TimelineViewModel
): [TimelinePresenterState, TimelinePresenterActions] {
  const [viewModel, setViewModel] = useState<TimelineViewModel | null>(initialViewModel || null);
  const [loading, setLoading] = useState(!initialViewModel);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<TimelineFilter>('all');
  const [statusFilter, setStatusFilter] = useState<TimelineStatusFilter>('all');

  // Computed: filtered groups (moved from View)
  const filteredGroups = useMemo(() => {
    if (!viewModel) return [];
    return viewModel.groups
      .map((group) => ({
        ...group,
        entries: group.entries.filter((entry) => {
          const matchesCategory = filter === 'all' || entry.category === filter;
          const matchesStatus = statusFilter === 'all' || entry.status === statusFilter;
          return matchesCategory && matchesStatus;
        }),
      }))
      .filter((group) => group.entries.length > 0);
  }, [viewModel, filter, statusFilter]);

  // Computed: filtered count
  const filteredCount = useMemo(() => {
    return filteredGroups.reduce((sum, g) => sum + g.entries.length, 0);
  }, [filteredGroups]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const newViewModel = await presenter.getViewModel(filter, statusFilter);
      setViewModel(newViewModel);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [filter, statusFilter]);

  const refresh = useCallback(async () => {
    await loadData();
  }, [loadData]);

  const resetFilters = useCallback(() => {
    setFilter('all');
    setStatusFilter('all');
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
      statusFilter,
      filteredGroups,
      filteredCount,
    },
    {
      loadData,
      setFilter,
      setStatusFilter,
      setError,
      refresh,
      resetFilters,
    },
  ];
}
