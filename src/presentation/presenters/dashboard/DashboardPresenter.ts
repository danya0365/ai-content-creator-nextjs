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

export interface DashboardActivity {
  id: string;
  type: 'created' | 'published' | 'scheduled' | 'edited' | 'deleted';
  title: string;
  timestamp: Date;
  contentType?: string;
}

export interface DashboardViewModel {
  stats: ContentStats;
  recentContents: Content[];
  activities: DashboardActivity[];
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

    // Map content to activity feed items
    const activities: DashboardActivity[] = allContents
      .map((c) => {
        let type: DashboardActivity['type'] = 'created';
        let timestamp = new Date(c.createdAt);
        
        if (c.status === 'published' && c.publishedAt) {
          type = 'published';
          timestamp = new Date(c.publishedAt);
        } else if (c.status === 'scheduled' && c.scheduledAt) {
          type = 'scheduled';
          timestamp = new Date(c.scheduledAt);
        }
        
        return {
          id: c.id,
          type,
          title: c.title,
          timestamp,
          contentType: c.contentTypeId,
        };
      })
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10);

    return {
      stats,
      recentContents,
      activities,
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
