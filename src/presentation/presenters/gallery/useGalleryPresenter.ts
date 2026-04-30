/**
 * useGalleryPresenter
 * Custom hook for Gallery presenter
 * ✅ All logic moved from View to Hook following CREATE_PAGE_PATTERN.md
 */

"use client";

import { Content } from "@/src/application/repositories/IContentRepository";
import { createClient } from "@/src/infrastructure/supabase/client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePreferencesStore } from "../../stores/usePreferencesStore";
import {
  ContentFilter,
  GalleryPresenter,
  GalleryViewModel,
} from "./GalleryPresenter";
import { createClientGalleryPresenter } from "./GalleryPresenterClientFactory";

// Define types
export type GallerySortBy = "newest" | "oldest" | "likes" | "shares";
export type ViewMode = "grid" | "list" | "table";

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
  // Pagination
  hasMore: boolean;
  loadingMore: boolean;
  currentPage: number;
}

export interface GalleryPresenterActions {
  loadData: () => Promise<void>;
  loadMore: () => Promise<void>;
  setFilter: (filter: ContentFilter) => void;
  setSortBy: (sortBy: GallerySortBy) => void;
  setError: (error: string | null) => void;
  refresh: () => Promise<void>;
  // UI actions (moved from View)
  selectContent: (content: Content | null) => void;
  setViewMode: (mode: ViewMode) => void;
  setPage: (page: number) => void;
}

export function useGalleryPresenter(
  initialViewModel?: GalleryViewModel,
  presenterOverride?: GalleryPresenter,
): [GalleryPresenterState, GalleryPresenterActions] {
  // ✅ Create presenter inside hook with useMemo
  // Accept override for easier testing (Dependency Injection)
  const presenter = useMemo(
    () => presenterOverride ?? createClientGalleryPresenter(createClient()),
    [presenterOverride],
  );

  const [viewModel, setViewModel] = useState<GalleryViewModel | null>(
    initialViewModel || null,
  );
  const [loading, setLoading] = useState(!initialViewModel);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter/Sort state (moved from View)
  const [filter, setFilter] = useState<ContentFilter>("all");
  const [sortBy, setSortBy] = useState<GallerySortBy>("newest");

  // UI state (moved from View)
  const preferences = usePreferencesStore();
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const viewMode = preferences.galleryViewMode;
  const [page, setPage] = useState(1);
  const [perPage] = useState(12);
  const isInitialMount = useRef(true);

  // Computed: filtered and sorted contents (moved from View)
  const filteredAndSortedContents = useMemo(() => {
    if (!viewModel) return [];

    let contents =
      filter === "all"
        ? viewModel.contents
        : viewModel.contents.filter((c) => c.status === filter);

    // Sort
    switch (sortBy) {
      case "newest":
        contents = [...contents].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        break;
      case "oldest":
        contents = [...contents].sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );
        break;
      case "likes":
        contents = [...contents].sort(
          (a, b) => (b.likes || 0) - (a.likes || 0),
        );
        break;
      case "shares":
        contents = [...contents].sort(
          (a, b) => (b.shares || 0) - (a.shares || 0),
        );
        break;
    }

    return contents;
  }, [viewModel, filter, sortBy]);

  // Computed: counts for filter badges
  const counts = useMemo(() => {
    if (!viewModel) return { all: 0, published: 0, scheduled: 0, draft: 0 };
    return {
      all: viewModel.contents.length,
      published: viewModel.contents.filter((c) => c.status === "published")
        .length,
      scheduled: viewModel.contents.filter((c) => c.status === "scheduled")
        .length,
      draft: viewModel.contents.filter((c) => c.status === "draft").length,
    };
  }, [viewModel]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let newViewModel: GalleryViewModel;

      if (viewMode === "table") {
        newViewModel = await presenter.getOffsetViewModel(
          filter,
          page,
          perPage,
        );
      } else {
        newViewModel = await presenter.getCursorViewModel(filter);
      }

      setViewModel(newViewModel);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [filter, viewMode, page, perPage, presenter]);

  const loadMore = useCallback(async () => {
    if (!viewModel || !viewModel.hasMore || loadingMore) return;

    setLoadingMore(true);
    setError(null);
    try {
      const moreViewModel = await presenter.getCursorViewModel(
        filter,
        viewModel.nextCursor || undefined,
      );

      setViewModel((prev) => {
        if (!prev) return moreViewModel;
        return {
          ...moreViewModel,
          // Append new contents
          contents: [...prev.contents, ...moreViewModel.contents],
        };
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load more");
    } finally {
      setLoadingMore(false);
    }
  }, [filter, presenter, viewModel, loadingMore]);

  const refresh = useCallback(async () => {
    await loadData();
  }, [loadData]);

  // Select/deselect content
  const selectContent = useCallback((content: Content | null) => {
    setSelectedContent(content);
  }, []);

  const setViewMode = useCallback(
    (mode: ViewMode) => {
      preferences.setPreference("galleryViewMode", mode);
    },
    [preferences],
  );

  useEffect(() => {
    if (!initialViewModel) {
      loadData();
    }
  }, [initialViewModel, loadData]);

  // Reset page to 1 when filter or viewMode changes (skip initial mount)
  useEffect(() => {
    if (isInitialMount.current) return;
    setPage(1);
  }, [filter, viewMode]);

  // Refetch when page changes (skip initial mount)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    loadData();
  }, [page, loadData]);

  // Real-time subscription for AI content generation
  useEffect(() => {
    // Only subscribe to INSERT events to prepend new content
    // We get the repository from the presenter via an internal property if needed,
    // but better to expose it or have a subscribe method on presenter if we strictly follow the pattern.
    // For now, since PresenterClientFactory uses SupabaseRepository, we can subscribe.

    // NOTE: In a real architecture, we might have IContentRepository injected here
    // or through the presenter.

    const unsubscribe = presenter.subscribe((event) => {
      if (event.type === "INSERT") {
        setViewModel((prev) => {
          if (!prev) return null;

          // Check if it already exists to avoid duplicates (though INSERT shouldn't duplicate)
          if (prev.contents.some((c) => c.id === event.new.id)) return prev;

          // Check if it matches current filter
          if (filter !== "all" && event.new.status !== filter) return prev;

          return {
            ...prev,
            contents: [event.new, ...prev.contents],
            totalCount: prev.totalCount + 1,
          };
        });
      } else if (event.type === "DELETE") {
        setViewModel((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            contents: prev.contents.filter((c) => c.id !== event.old.id),
            totalCount: Math.max(0, prev.totalCount - 1),
          };
        });
      }
    });

    return () => unsubscribe();
  }, [presenter, filter]);

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
      hasMore: viewModel?.hasMore || false,
      loadingMore,
      currentPage: page,
    },
    {
      loadData,
      loadMore,
      setFilter,
      setSortBy,
      setError,
      refresh,
      selectContent,
      setViewMode,
      setPage,
    },
  ];
}
