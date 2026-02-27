/**
 * TimelinePresenter
 * Handles business logic for Timeline page
 * ✅ Uses dependency injection for repository
 */

import { Content, IContentRepository } from '@/src/application/repositories/IContentRepository';
import { Metadata } from 'next';
// ✅ Import from master data (Single Source of Truth)
import type { TimelineCategory } from '@/src/data/master/timelineCategories';
import { TIMELINE_CATEGORIES } from '@/src/data/master/timelineCategories';

// Re-export for backward compatibility
export { TIMELINE_CATEGORIES };
export type { TimelineCategory };

export type TimelineStatus = 'published' | 'scheduled' | 'draft';
export type TimelineFilter = 'all' | TimelineCategory;
export type TimelineStatusFilter = 'all' | TimelineStatus;

export interface TimelineEntry {
  id: string;
  title: string;
  description: string;
  contentTypeId: string;
  imageUrl: string;
  status: TimelineStatus;
  category: TimelineCategory;
  createdAt: string;
  scheduledAt: string;
  publishedAt?: string;
  likes: number;
  shares: number;
}

export interface TimelineGroup {
  date: string;
  dateLabel: string;
  isToday: boolean;
  isYesterday: boolean;
  entries: TimelineEntry[];
}

export interface TimelineViewModel {
  groups: TimelineGroup[];
  categories: { id: TimelineCategory; label: string; labelTh: string; emoji: string; color: string }[];
  filter: TimelineFilter;
  statusFilter: TimelineStatusFilter;
  totalCount: number;
  stats: {
    total: number;
    published: number;
    scheduled: number;
    draft: number;
    totalLikes: number;
    totalShares: number;
    totalComments: number;
  };
}

/**
 * Format date to Thai label
 */
function formatDateLabel(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const todayStr = today.toISOString().split('T')[0];
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  
  if (dateString === todayStr) {
    return 'วันนี้';
  }
  if (dateString === yesterdayStr) {
    return 'เมื่อวาน';
  }
  
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  };
  
  return date.toLocaleDateString('th-TH', options);
}

/**
 * Check if date is today
 */
function isToday(dateString: string): boolean {
  const today = new Date().toISOString().split('T')[0];
  return dateString === today;
}

/**
 * Check if date is yesterday
 */
function isYesterday(dateString: string): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return dateString === yesterday.toISOString().split('T')[0];
}

/**
 * Map content to timeline entry
 */
function mapContentToTimelineEntry(content: Content): TimelineEntry {
  // Category mapping based on contentTypeId (maps to TimelineCategory)
  const categoryMap: Record<string, TimelineCategory> = {
    'morning-news': 'news',
    'food': 'food',
    'food-review': 'food',
    'tech-tips': 'tech',
    'entertainment': 'entertainment',
    'meme': 'entertainment',
    'daily-motivation': 'motivation',
    'gaming': 'gaming',
    'lifestyle': 'lifestyle',
    'education': 'education',
  };

  return {
    id: content.id,
    title: content.title,
    description: content.description,
    contentTypeId: content.contentTypeId,
    imageUrl: content.imageUrl,
    status: content.status as TimelineStatus,
    category: categoryMap[content.contentTypeId] || 'news',
    createdAt: content.createdAt,
    scheduledAt: content.scheduledAt,
    publishedAt: content.publishedAt ?? undefined,
    likes: content.likes || 0,
    shares: content.shares || 0,
  };
}

/**
 * Presenter for Timeline page
 * ✅ Receives repository via constructor injection
 */
export class TimelinePresenter {
  constructor(
    private readonly repository: IContentRepository
  ) {}

  /**
   * Get view model for the page
   */
  async getViewModel(
    filter: TimelineFilter = 'all',
    statusFilter: TimelineStatusFilter = 'all'
  ): Promise<TimelineViewModel> {
    // Get all contents from repository
    const [allContents, stats] = await Promise.all([
      this.repository.getAll(),
      this.repository.getStats(),
    ]);

    // Map contents to timeline entries
    let entries = allContents.map(mapContentToTimelineEntry);
    
    // Apply filters
    if (filter !== 'all') {
      entries = entries.filter((e) => e.category === filter);
    }
    
    if (statusFilter !== 'all') {
      entries = entries.filter((e) => e.status === statusFilter);
    }
    
    // Group by date
    const groupedMap = new Map<string, TimelineEntry[]>();
    entries.forEach((entry) => {
      const date = entry.createdAt.split('T')[0];
      if (!groupedMap.has(date)) {
        groupedMap.set(date, []);
      }
      groupedMap.get(date)!.push(entry);
    });
    
    // Convert to array of groups
    const groups: TimelineGroup[] = [];
    groupedMap.forEach((groupEntries, dateStr) => {
      groups.push({
        date: dateStr,
        dateLabel: formatDateLabel(dateStr),
        isToday: isToday(dateStr),
        isYesterday: isYesterday(dateStr),
        entries: groupEntries,
      });
    });
    
    // Sort groups by date descending
    groups.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // Get categories for filter UI (config already includes id field)
    const categories = Object.values(TIMELINE_CATEGORIES);
    
    return {
      groups,
      categories,
      filter,
      statusFilter,
      totalCount: entries.length,
      stats: {
        total: stats.totalContents,
        published: stats.publishedCount,
        scheduled: stats.scheduledCount,
        draft: stats.draftCount,
        totalLikes: stats.totalLikes,
        totalShares: stats.totalShares,
        totalComments: 0,
      },
    };
  }

  /**
   * Generate metadata for the page
   */
  generateMetadata(): Metadata {
    return {
      title: 'Timeline | AI Content Creator',
      description: 'ดูประวัติและ timeline ของคอนเทนต์ทั้งหมด',
    };
  }
}
