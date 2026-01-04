/**
 * DashboardPresenter
 * Handles business logic for Dashboard page
 * Following Clean Architecture pattern
 */

import {
    CONTENT_TYPES,
    ContentType,
    TIME_SLOTS,
    TimeSlotConfig,
    getContentTypesByTimeSlot,
    getCurrentTimeSlot,
} from '@/src/data/master/contentTypes';
import {
    GeneratedContent,
    getContentStats,
    getContentsByStatus,
    getRecentPublishedContents,
} from '@/src/data/mock/mockContents';
import { Metadata } from 'next';

export interface DashboardStats {
  totalContents: number;
  publishedCount: number;
  scheduledCount: number;
  draftCount: number;
  totalLikes: number;
  totalShares: number;
}

export interface DashboardViewModel {
  stats: DashboardStats;
  recentContents: GeneratedContent[];
  scheduledContents: GeneratedContent[];
  draftContents: GeneratedContent[];
  contentTypes: ContentType[];
  timeSlots: TimeSlotConfig[];
  currentTimeSlot: TimeSlotConfig | null;
  suggestedContentTypes: ContentType[];
}

/**
 * Presenter for Dashboard page
 */
export class DashboardPresenter {
  /**
   * Get view model for the page
   */
  async getViewModel(): Promise<DashboardViewModel> {
    const stats = getContentStats();
    const recentContents = getRecentPublishedContents(6);
    const scheduledContents = getContentsByStatus('scheduled');
    const draftContents = getContentsByStatus('draft');
    const currentTimeSlot = getCurrentTimeSlot();
    
    // Get suggested content types based on current time
    const suggestedContentTypes = currentTimeSlot
      ? getContentTypesByTimeSlot(currentTimeSlot.id)
      : CONTENT_TYPES.slice(0, 3);

    return {
      stats,
      recentContents,
      scheduledContents,
      draftContents,
      contentTypes: CONTENT_TYPES,
      timeSlots: TIME_SLOTS,
      currentTimeSlot,
      suggestedContentTypes,
    };
  }

  /**
   * Generate metadata for the page
   */
  generateMetadata(): Metadata {
    return {
      title: 'Dashboard | AI Content Creator',
      description: 'จัดการและติดตามคอนเทนต์ Pixel Art ที่สร้างโดย AI',
    };
  }
}
