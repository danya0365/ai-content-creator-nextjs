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
  engagementWeeklyData: { label: string; value: number }[];
  engagementByType: { label: string; value: number; color: string }[];
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
    const [stats, allContents, metrics] = await Promise.all([
      this.repository.getStats(),
      this.repository.getAll(),
      this.repository.getAnalyticsMetrics()
    ]);

    // Split contents into categories
    const recentContents = allContents.slice(0, 5);
    const scheduledContents = allContents.filter((c) => c.status === 'scheduled');
    const draftContents = allContents.filter((c) => c.status === 'draft');

    // Determine current time period and suggested content types
    const currentHour = new Date().getHours();
    const currentTimeSlot = TIME_SLOTS.find(
      (slot) => currentHour >= slot.startHour && currentHour < slot.endHour
    ) || null;
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

    // Map UI engagement charts from Repository Analytics
    const days = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];
    const engagementWeeklyData = metrics.dailyEngagement.map(d => {
      const dateObj = new Date(d.date);
      return { label: days[dateObj.getDay()], value: d.total };
    });

    const engagementByType = [
      { label: 'Likes', value: stats.totalLikes || 0, color: '#EC4899' },
      { label: 'Shares', value: stats.totalShares || 0, color: '#8B5CF6' },
      { label: 'Comments', value: allContents.reduce((sum, c) => sum + (c.comments || 0), 0), color: '#06B6D4' },
    ];

    return {
      stats,
      recentContents,
      activities,
      engagementWeeklyData,
      engagementByType,
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
