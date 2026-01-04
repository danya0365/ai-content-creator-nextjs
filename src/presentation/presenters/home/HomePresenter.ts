/**
 * HomePresenter
 * Handles business logic for Home page
 * Following Clean Architecture pattern
 */

import { CONTENT_TYPES, ContentType, TIME_SLOTS, TimeSlotConfig } from '@/src/data/master/contentTypes';
import { GeneratedContent, getContentStats, getRecentPublishedContents } from '@/src/data/mock/mockContents';
import { Metadata } from 'next';

export interface HomeViewModel {
  stats: {
    totalContents: number;
    publishedCount: number;
    scheduledCount: number;
    draftCount: number;
    totalLikes: number;
    totalShares: number;
  };
  contentTypes: ContentType[];
  timeSlots: TimeSlotConfig[];
  recentContents: GeneratedContent[];
}

/**
 * Presenter for Home page
 */
export class HomePresenter {
  /**
   * Get view model for the page
   */
  async getViewModel(): Promise<HomeViewModel> {
    const stats = getContentStats();
    const recentContents = getRecentPublishedContents(5);

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
}
