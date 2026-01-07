/**
 * useSchedulePresenter
 * Custom hook for Schedule presenter
 * ✅ All logic moved from View to Hook following CREATE_PAGE_PATTERN.md
 */

'use client';

import { Content } from '@/src/application/repositories/IContentRepository';
import { TimeSlotConfig } from '@/src/data/master/contentTypes';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ScheduleDay, ScheduleViewModel } from './SchedulePresenter';
import { createClientSchedulePresenter } from './SchedulePresenterClientFactory';

const presenter = createClientSchedulePresenter();

export interface SchedulePresenterState {
  viewModel: ScheduleViewModel | null;
  loading: boolean;
  error: string | null;
  // UI state (moved from View)
  selectedDayIndex: number;
  selectedDay: ScheduleDay | null;
}

export interface SchedulePresenterActions {
  loadData: () => Promise<void>;
  setError: (error: string | null) => void;
  refresh: () => Promise<void>;
  // UI actions (moved from View)
  selectDay: (index: number) => void;
  getContentsForSlot: (slot: TimeSlotConfig) => Content[];
}

export function useSchedulePresenter(
  initialViewModel?: ScheduleViewModel
): [SchedulePresenterState, SchedulePresenterActions] {
  const [viewModel, setViewModel] = useState<ScheduleViewModel | null>(initialViewModel || null);
  const [loading, setLoading] = useState(!initialViewModel);
  const [error, setError] = useState<string | null>(null);
  
  // UI state (moved from View)
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  // Computed: selected day
  const selectedDay = useMemo(() => {
    return viewModel?.currentWeek[selectedDayIndex] || null;
  }, [viewModel, selectedDayIndex]);

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
  }, []);

  const refresh = useCallback(async () => {
    await loadData();
  }, [loadData]);

  // Select day by index
  const selectDay = useCallback((index: number) => {
    setSelectedDayIndex(index);
  }, []);

  // Get contents for a specific time slot
  const getContentsForSlot = useCallback((slot: TimeSlotConfig): Content[] => {
    if (!selectedDay) return [];
    return selectedDay.contents.filter((c) => c.timeSlot === slot.id);
  }, [selectedDay]);

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
      selectedDayIndex,
      selectedDay,
    },
    {
      loadData,
      setError,
      refresh,
      selectDay,
      getContentsForSlot,
    },
  ];
}
