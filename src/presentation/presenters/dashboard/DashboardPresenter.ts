/**
 * DashboardPresenter
 * Handles business logic for Dashboard page
 * ✅ Uses dependency injection for repository
 */

import { Content, ContentStats, IContentRepository } from '@/src/application/repositories/IContentRepository';
import {
  CONTENT_TYPES,
  ContentType,
  TIME_SLOTS,
  TimeSlotConfig,
  getContentTypesByTimeSlot,
  getCurrentTimeSlot,
} from '@/src/data/master/contentTypes';
import { Metadata } from 'next';

export interface DashboardViewModel {
  stats: ContentStats;
  recentContents: Content[];
  scheduledContents: Content[];
  draftContents: Content[];
  contentTypes: ContentType[];
  timeSlots: TimeSlotConfig[];
  currentTimeSlot: TimeSlotConfig | null;
  suggestedContentTypes: ContentType[];
}

/**
 * Presenter for Dashboard page
 * ✅ Receives repository via constructor injection
 */
export class DashboardPresenter {
  constructor(
    private readonly repository: IContentRepository
  ) {}

  /**
   * Get view model for the page
   */
  async getViewModel(): Promise<DashboardViewModel> {
    // Get data in parallel for better performance
    const [stats, allContents] = await Promise.all([
      this.repository.getStats(),
      this.repository.getAll(),
    ]);

    // Recent contents = latest 6, regardless of status (sorted by createdAt)
    const recentContents = [...allContents]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 6);

    const scheduledContents = allContents.filter((c) => c.status === 'scheduled');
    const draftContents = allContents.filter((c) => c.status === 'draft');
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
