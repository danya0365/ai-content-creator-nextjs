/**
 * GalleryPresenter
 * Handles business logic for Gallery page
 * ✅ Uses dependency injection for repository
 */

import {
  Content,
  ContentEvent,
  IContentRepository,
  ContentFilter as RepoContentFilter,
} from "@/src/application/repositories/IContentRepository";
import { CONTENT_TYPES, ContentType } from "@/src/data/master/contentTypes";
import { Metadata } from "next";

export type ContentFilter = "all" | "published" | "scheduled" | "draft";

export interface GalleryViewModel {
  contents: Content[];
  contentTypes: ContentType[];
  filter: ContentFilter;
  totalCount: number;
  // Pagination
  nextCursor: string | null;
  hasMore: boolean;
}

/**
 * Presenter for Gallery page
 * ✅ Receives repository via constructor injection
 */
export class GalleryPresenter {
  constructor(private readonly repository: IContentRepository) {}

  /**
   * Get view model for the page using cursor-based pagination
   */
  async getCursorViewModel(
    filter: ContentFilter = "all",
    cursor?: string,
    limit = 12,
  ): Promise<GalleryViewModel> {
    try {
      const result = await this.repository.getCursorPaginated({
        status: filter === "all" ? undefined : filter,
        cursor,
        limit,
      });

      // Simple stats for the badges (might want to optimize this later if it's too heavy)
      const stats = await this.repository.getStats();

      return {
        contents: result.data,
        contentTypes: CONTENT_TYPES,
        filter,
        totalCount: stats.totalContents,
        nextCursor: result.nextCursor,
        hasMore: result.hasMore,
      };
    } catch (error) {
      console.error("[GalleryPresenter] Error in getCursorViewModel:", error);
      throw error;
    }
  }

  /**
   * Get view model for the page using traditional offset-based pagination
   */
  async getOffsetViewModel(
    filter: ContentFilter = "all",
    page = 1,
    perPage = 20,
  ): Promise<GalleryViewModel> {
    try {
      const result = await this.repository.getPaginated(page, perPage, {
        status: filter === "all" ? undefined : filter,
      });

      return {
        contents: result.data,
        contentTypes: CONTENT_TYPES,
        filter,
        totalCount: result.total,
        nextCursor: null, // Not used in offset mode
        hasMore: result.total > page * perPage,
      };
    } catch (error) {
      console.error("[GalleryPresenter] Error in getOffsetViewModel:", error);
      throw error;
    }
  }

  /**
   * Get view model for the page (legacy method, currently fetching all)
   */
  async getViewModel(filter: ContentFilter = "all"): Promise<GalleryViewModel> {
    try {
      // Build filter for repository
      const repoFilter: RepoContentFilter = {};
      if (filter !== "all") {
        repoFilter.status = filter;
      }

      const contents = await this.repository.getAll(repoFilter);

      return {
        contents,
        contentTypes: CONTENT_TYPES,
        filter,
        totalCount: contents.length,
        nextCursor: null,
        hasMore: false,
      };
    } catch (error) {
      console.error("[GalleryPresenter] Error in getViewModel:", error);
      throw error;
    }
  }

  /**
   * Subscribe to real-time content changes
   */
  subscribe(callback: (event: ContentEvent) => void): () => void {
    return this.repository.subscribe(callback);
  }

  /**
   * Generate metadata for the page
   */
  generateMetadata(): Metadata {
    return {
      title: "Gallery | AI Content Creator",
      description: "แกลเลอรี่รวมคอนเทนต์ Pixel Art ทั้งหมดที่สร้างโดย AI",
    };
  }
}
