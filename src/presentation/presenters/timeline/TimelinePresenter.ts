/**
 * TimelinePresenter
 * Handles business logic for Timeline page
 */

import {
    getTimelineStats,
    groupTimelineByDate,
    MOCK_TIMELINE,
    TIMELINE_CATEGORIES,
    TimelineCategory,
    TimelineEntry,
    TimelineStatus,
} from '@/src/data/mock/mockTimeline';
import { Metadata } from 'next';

export type TimelineFilter = 'all' | TimelineCategory;
export type TimelineStatusFilter = 'all' | TimelineStatus;

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
 * Presenter for Timeline page
 */
export class TimelinePresenter {
  /**
   * Get view model for the page
   */
  async getViewModel(
    filter: TimelineFilter = 'all',
    statusFilter: TimelineStatusFilter = 'all'
  ): Promise<TimelineViewModel> {
    // Filter entries
    let entries = [...MOCK_TIMELINE];
    
    if (filter !== 'all') {
      entries = entries.filter((e) => e.category === filter);
    }
    
    if (statusFilter !== 'all') {
      entries = entries.filter((e) => e.status === statusFilter);
    }
    
    // Group by date
    const grouped = groupTimelineByDate(entries);
    
    // Convert to array of groups
    const groups: TimelineGroup[] = [];
    grouped.forEach((groupEntries, dateStr) => {
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
    
    // Get categories for filter UI
    const categories = Object.entries(TIMELINE_CATEGORIES).map(([id, config]) => ({
      id: id as TimelineCategory,
      ...config,
    }));
    
    return {
      groups,
      categories,
      filter,
      statusFilter,
      totalCount: entries.length,
      stats: getTimelineStats(),
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
