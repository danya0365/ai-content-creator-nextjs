/**
 * HomePresenter
 * Handles business logic for Home page
 * ✅ Uses dependency injection for repository
 */

import { Content, ContentStats, IContentRepository } from '@/src/application/repositories/IContentRepository';
import { CONTENT_TYPES, ContentType, TIME_SLOTS, TimeSlotConfig } from '@/src/data/master/contentTypes';
import { Metadata } from 'next';

export interface HomeViewModel {
  stats: ContentStats;
  contentTypes: ContentType[];
  timeSlots: TimeSlotConfig[];
  recentContents: Content[];
}

/**
 * Presenter for Home page
 * ✅ Receives repository via constructor injection
 */
export class HomePresenter {
  constructor(
    private readonly repository: IContentRepository
  ) {}

  /**
   * Get view model for the page
   */
  async getViewModel(): Promise<HomeViewModel> {
    const [stats, recentContents] = await Promise.all([
      this.repository.getStats(),
      this.repository.getAll({ status: 'published', limit: 5 }),
    ]);

    return {
      stats,
      contentTypes: CONTENT_TYPES,
      timeSlots: TIME_SLOTS,
      recentContents,
    };
  }

  /**
   * Generate metadata for the page
   */
  generateMetadata(): Metadata {
    return {
      title: 'AI Content Creator | สร้างคอนเทนต์ Pixel Art อัตโนมัติ',
      description: 'Generate รูปภาพ pixel art และโพสต์คอนเทนต์อัตโนมัติตาม schedule ด้วย AI Gemini',
      keywords: ['AI', 'Content Creator', 'Pixel Art', 'Automation', 'Gemini'],
      openGraph: {
        title: 'AI Content Creator',
        description: 'สร้างคอนเทนต์ Pixel Art อัตโนมัติด้วย AI',
        type: 'website',
      },
    };
  }

  /**
   * Subscribe to content changes
   */
  subscribeToChanges(callback: () => void): () => void {
    return this.repository.subscribe(() => {
      callback();
    });
  }
}
