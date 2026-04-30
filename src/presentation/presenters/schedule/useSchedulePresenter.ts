/**
 * useSchedulePresenter
 * Custom hook for Schedule presenter
 * ✅ All logic moved from View to Hook following CREATE_PAGE_PATTERN.md
 */

"use client";

import { Content } from "@/src/application/repositories/IContentRepository";
import { TimeSlotConfig } from "@/src/data/master/contentTypes";
import { createClient } from "@/src/infrastructure/supabase/client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ScheduleDay,
  SchedulePresenter,
  ScheduleViewModel,
} from "./SchedulePresenter";
import { createClientSchedulePresenter } from "./SchedulePresenterClientFactory";

export interface SchedulePresenterState {
  viewModel: ScheduleViewModel | null;
  loading: boolean;
  error: string | null;
  // UI state (moved from View)
  selectedDayIndex: number;
  selectedDay: ScheduleDay | null;
  selectedContent: Content | null;
}

export interface SchedulePresenterActions {
  loadData: () => Promise<void>;
  setError: (error: string | null) => void;
  refresh: () => Promise<void>;
  // UI actions (moved from View)
  selectDay: (index: number) => void;
  getContentsForSlot: (slot: TimeSlotConfig) => Content[];
  selectContent: (content: Content | null) => void;
}

export function useSchedulePresenter(
  initialViewModel?: ScheduleViewModel,
  presenterOverride?: SchedulePresenter,
): [SchedulePresenterState, SchedulePresenterActions] {
  // ✅ Create presenter inside hook with useMemo
  // Accept override for easier testing (Dependency Injection)
  const presenter = useMemo(
    () => presenterOverride ?? createClientSchedulePresenter(createClient()),
    [presenterOverride],
  );

  const [viewModel, setViewModel] = useState<ScheduleViewModel | null>(
    initialViewModel || null,
  );
  const [loading, setLoading] = useState(!initialViewModel);
  const [error, setError] = useState<string | null>(null);

  // UI state (moved from View)
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const isInitialMount = useRef(true);

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
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [presenter]);

  const refresh = useCallback(async () => {
    await loadData();
  }, [loadData]);

  // Select day by index
  const selectDay = useCallback((index: number) => {
    setSelectedDayIndex(index);
  }, []);

  // Get contents for a specific time slot
  const getContentsForSlot = useCallback(
    (slot: TimeSlotConfig): Content[] => {
      if (!selectedDay) return [];
      return selectedDay.contents.filter((c) => c.timeSlot === slot.id);
    },
    [selectedDay],
  );

  // Select content for viewing details
  const selectContent = useCallback((content: Content | null) => {
    setSelectedContent(content);
  }, []);

  useEffect(() => {
    if (!initialViewModel) {
      loadData();
    }
  }, [initialViewModel, loadData]);

  // Refetch when presenter changes (skip initial mount)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    loadData();
  }, [presenter, loadData]);

  // Real-time subscription for schedule updates
  useEffect(() => {
    const unsubscribe = presenter.subscribe((event) => {
      if (
        event.type === "INSERT" ||
        event.type === "UPDATE" ||
        event.type === "DELETE"
      ) {
        loadData();
      }
    });
    return () => {
      unsubscribe();
    };
  }, [presenter, loadData]);

  return [
    {
      viewModel,
      loading,
      error,
      selectedDayIndex,
      selectedDay,
      selectedContent,
    },
    {
      loadData,
      setError,
      refresh,
      selectDay,
      getContentsForSlot,
      selectContent,
    },
  ];
}
