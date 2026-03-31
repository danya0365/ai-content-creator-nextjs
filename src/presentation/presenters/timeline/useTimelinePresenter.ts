/**
 * useTimelinePresenter
 * Custom hook for Timeline presenter
 * ✅ All logic moved from View to Hook following CREATE_PAGE_PATTERN.md
 */

'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { TimelineEntry, TimelineFilter, TimelineGroup, TimelinePresenter, TimelineStatusFilter, TimelineViewModel } from './TimelinePresenter';
import { createClientTimelinePresenter } from './TimelinePresenterClientFactory';
import { usePreferencesStore } from '../../stores/usePreferencesStore';

export type TimelineViewMode = 'vertical' | 'list';

export interface TimelinePresenterState {
  viewModel: TimelineViewModel | null;
  loading: boolean;
  error: string | null;
  filter: TimelineFilter;
  statusFilter: TimelineStatusFilter;
  // Computed values (moved from View)
  filteredGroups: TimelineGroup[];
  filteredCount: number;
  selectedEntry: TimelineEntry | null;
  // Pagination
  hasMore: boolean;
  loadingMore: boolean;
  viewMode: TimelineViewMode;
}

export interface TimelinePresenterActions {
  loadData: () => Promise<void>;
  loadMore: () => Promise<void>;
  setFilter: (filter: TimelineFilter) => void;
  setStatusFilter: (status: TimelineStatusFilter) => void;
  setError: (error: string | null) => void;
  refresh: () => Promise<void>;
  resetFilters: () => void;
  viewEntry: (entry: TimelineEntry | null) => void;
  closeEntry: () => void;
  setViewMode: (mode: TimelineViewMode) => void;
}

export function useTimelinePresenter(
  initialViewModel?: TimelineViewModel,
  presenterOverride?: TimelinePresenter
): [TimelinePresenterState, TimelinePresenterActions] {
  // ✅ Create presenter inside hook with useMemo
  // Accept override for easier testing (Dependency Injection)
  const presenter = useMemo(
    () => presenterOverride ?? createClientTimelinePresenter(),
    [presenterOverride]
  );

  const preferences = usePreferencesStore();
  const [viewModel, setViewModel] = useState<TimelineViewModel | null>(initialViewModel || null);
  const [loading, setLoading] = useState(!initialViewModel);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<TimelineFilter>('all');
  const [statusFilter, setStatusFilter] = useState<TimelineStatusFilter>('all');
  const [selectedEntry, setSelectedEntry] = useState<TimelineEntry | null>(null);
  
  const viewMode = preferences.timelineViewMode;

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
      const newViewModel = await presenter.getCursorViewModel(filter, statusFilter);
      setViewModel(newViewModel);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [filter, statusFilter, presenter]);

  const loadMore = useCallback(async () => {
    if (!viewModel || !viewModel.hasMore || loadingMore) return;

    setLoadingMore(true);
    setError(null);
    try {
      const moreViewModel = await presenter.getCursorViewModel(
        filter,
        statusFilter,
        viewModel.nextCursor || undefined
      );

      setViewModel((prev) => {
        if (!prev) return moreViewModel;

        // Merge groups
        const updatedGroups = [...prev.groups];
        
        moreViewModel.groups.forEach(newGroup => {
          const existingGroupIndex = updatedGroups.findIndex(g => g.date === newGroup.date);
          if (existingGroupIndex > -1) {
            // Add entries to existing group, check for duplicates
            const existingEntries = updatedGroups[existingGroupIndex].entries;
            const newEntries = newGroup.entries.filter(ne => !existingEntries.some(ee => ee.id === ne.id));
            updatedGroups[existingGroupIndex].entries = [...existingEntries, ...newEntries];
          } else {
            // Add as a new group
            updatedGroups.push(newGroup);
          }
        });

        // Re-sort groups just in case
        updatedGroups.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return {
          ...prev,
          groups: updatedGroups,
          nextCursor: moreViewModel.nextCursor,
          hasMore: moreViewModel.hasMore,
          totalCount: prev.totalCount + moreViewModel.totalCount
        };
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more');
    } finally {
      setLoadingMore(false);
    }
  }, [filter, statusFilter, presenter, viewModel, loadingMore]);

  const refresh = useCallback(async () => {
    await loadData();
  }, [loadData]);

  const resetFilters = useCallback(() => {
    setFilter('all');
    setStatusFilter('all');
  }, []);

  const viewEntry = useCallback((entry: TimelineEntry | null) => {
    setSelectedEntry(entry);
  }, []);

  const closeEntry = useCallback(() => {
    setSelectedEntry(null);
  }, []);

  const setViewMode = useCallback((mode: TimelineViewMode) => {
    preferences.setPreference('timelineViewMode', mode);
  }, [preferences]);

  useEffect(() => {
    if (!initialViewModel) {
      loadData();
    }
  }, [initialViewModel, loadData]);

  // Real-time updates
  useEffect(() => {
    const repository = (presenter as any).repository;
    if (!repository) return;

    const unsubscribe = repository.subscribe((event: any) => {
      if (event.type === 'INSERT') {
        const newEntry = (presenter as any).mapContentToTimelineEntry?.(event.new) || 
                          // Fallback mapping if map function not accessible
                          {
                            id: event.new.id,
                            title: event.new.title,
                            description: event.new.description,
                            imageUrl: event.new.image_url || event.new.imageUrl,
                            status: event.new.status,
                            createdAt: event.new.created_at || event.new.createdAt,
                            scheduledAt: event.new.scheduled_at || event.new.scheduledAt,
                            likes: event.new.likes || 0,
                            shares: event.new.shares || 0,
                          };

        setViewModel((prev) => {
          if (!prev) return null;
          
          const newDate = newEntry.createdAt.split('T')[0];
          const updatedGroups = [...prev.groups];
          const groupIndex = updatedGroups.findIndex(g => g.date === newDate);

          if (groupIndex > -1) {
            // Add to existing group
            if (updatedGroups[groupIndex].entries.some(e => e.id === newEntry.id)) return prev;
            updatedGroups[groupIndex].entries = [newEntry, ...updatedGroups[groupIndex].entries];
          } else {
            // Create new group (usually Today)
            const newGroup: TimelineGroup = {
              date: newDate,
              dateLabel: 'วันนี้', // Simple for insert
              isToday: true,
              isYesterday: false,
              entries: [newEntry]
            };
            updatedGroups.unshift(newGroup);
            updatedGroups.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          }

          return {
            ...prev,
            groups: updatedGroups,
            totalCount: prev.totalCount + 1
          };
        });
      } else if (event.type === 'DELETE') {
        setViewModel((prev) => {
          if (!prev) return null;
          const updatedGroups = prev.groups.map(g => ({
            ...g,
            entries: g.entries.filter(e => e.id !== event.old.id)
          })).filter(g => g.entries.length > 0);

          return {
            ...prev,
            groups: updatedGroups,
            totalCount: Math.max(0, prev.totalCount - 1)
          };
        });
      }
    });

    return () => unsubscribe();
  }, [presenter, filter, statusFilter]);

  return [
    {
      viewModel,
      loading,
      error,
      filter,
      statusFilter,
      filteredGroups,
      filteredCount,
      selectedEntry,
      hasMore: viewModel?.hasMore || false,
      loadingMore,
      viewMode,
    },
    {
      loadData,
      loadMore,
      setFilter,
      setStatusFilter,
      setError,
      refresh,
      resetFilters,
      viewEntry,
      closeEntry,
      setViewMode,
    },
  ];
}
