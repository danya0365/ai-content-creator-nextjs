/**
 * GalleryPresenter
 * Handles business logic for Gallery page
 */

import {
    CONTENT_TYPES,
    ContentType,
} from '@/src/data/master/contentTypes';
import {
    GeneratedContent,
    MOCK_CONTENTS,
} from '@/src/data/mock/mockContents';
import { Metadata } from 'next';

export type ContentFilter = 'all' | 'published' | 'scheduled' | 'draft';

export interface GalleryViewModel {
  contents: GeneratedContent[];
  contentTypes: ContentType[];
  filter: ContentFilter;
  totalCount: number;
}

/**
 * Presenter for Gallery page
 */
export class GalleryPresenter {
  /**
   * Get view model for the page
   */
  async getViewModel(filter: ContentFilter = 'all'): Promise<GalleryViewModel> {
    let contents = [...MOCK_CONTENTS];
    
    if (filter !== 'all') {
      contents = contents.filter((c) => c.status === filter);
    }

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
