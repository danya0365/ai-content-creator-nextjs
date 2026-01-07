/**
 * GalleryPresenter
 * Handles business logic for Gallery page
 * ✅ Uses dependency injection for repository
 */

import {
  CONTENT_TYPES,
  ContentType,
} from '@/src/data/master/contentTypes';
import { Content, IContentRepository, ContentFilter as RepoContentFilter } from '@/src/application/repositories/IContentRepository';
import { Metadata } from 'next';

export type ContentFilter = 'all' | 'published' | 'scheduled' | 'draft';

export interface GalleryViewModel {
  contents: Content[];
  contentTypes: ContentType[];
  filter: ContentFilter;
  totalCount: number;
}

/**
 * Presenter for Gallery page
 * ✅ Receives repository via constructor injection
 */
export class GalleryPresenter {
  constructor(
    private readonly repository: IContentRepository
  ) {}

  /**
   * Get view model for the page
   */
  async getViewModel(filter: ContentFilter = 'all'): Promise<GalleryViewModel> {
    // Build filter for repository
    const repoFilter: RepoContentFilter = {};
    if (filter !== 'all') {
      repoFilter.status = filter;
    }

    const contents = await this.repository.getAll(repoFilter);

    // Sort by created date (newest first)
    contents.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return {
      contents,
      contentTypes: CONTENT_TYPES,
      filter,
      totalCount: contents.length,
    };
  }

  /**
   * Generate metadata for the page
   */
  generateMetadata(): Metadata {
    return {
      title: 'Gallery | AI Content Creator',
      description: 'แกลเลอรี่รวมคอนเทนต์ Pixel Art ทั้งหมดที่สร้างโดย AI',
    };
  }
}
