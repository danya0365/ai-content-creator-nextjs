/**
 * Content Repository Interface
 * Defines the contract for content data access
 */

import { TimeSlot } from '@/src/data/master/contentTypes';

export interface Content {
  id: string;
  contentTypeId: string;
  title: string;
  description: string;
  imageUrl: string;
  prompt: string;
  timeSlot: TimeSlot;
  scheduledAt: string;
  publishedAt: string | null;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  likes: number;
  shares: number;
  createdAt: string;
  updatedAt?: string;
  // ✅ New fields for Timeline/Full content support
  comments: number;
  tags: string[];
  emoji?: string;
}

export interface CreateContentDTO {
  contentTypeId: string;
  title: string;
  description: string;
  imageUrl?: string;
  prompt: string;
  timeSlot: TimeSlot;
  scheduledAt?: string;
  status?: Content['status'];
  // New fields
  tags?: string[];
  emoji?: string;
}

export interface UpdateContentDTO {
  title?: string;
  description?: string;
  imageUrl?: string;
  prompt?: string;
  timeSlot?: TimeSlot;
  scheduledAt?: string;
  publishedAt?: string; // For publishing content
  status?: Content['status'];
  likes?: number;
  shares?: number;
  // New fields
  comments?: number;
  tags?: string[];
  emoji?: string;
}

export interface ContentFilter {
  status?: Content['status'];
  timeSlot?: TimeSlot;
  contentTypeId?: string;
  contentTypeIds?: string[];
  startDate?: string;
  endDate?: string;
  scheduledBefore?: string;
  limit?: number;
  offset?: number;
}

export interface ContentStats {
  totalContents: number;
  publishedCount: number;
  scheduledCount: number;
  draftCount: number;
  totalLikes: number;
  totalShares: number;
  totalComments: number;
}

export type ContentEvent = 
  | { type: 'INSERT'; new: Content }
  | { type: 'UPDATE'; old: Partial<Content>; new: Content }
  | { type: 'DELETE'; old: { id: string } };

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
}

export interface AnalyticsDailyStats {
  date: string;
  total: number;
}

export interface AnalyticsTypeStats {
  id: string;
  count: number;
}

export interface AnalyticsWeeklyTrend {
  weekLabel: string;
  total: number;
}

export interface AnalyticsMetrics {
  growth: {
    currentPeriod: number;
    previousPeriod: number;
    rate: number;
  };
  dailyEngagement: AnalyticsDailyStats[];
  contentTypes: AnalyticsTypeStats[];
  weeklyTrends: AnalyticsWeeklyTrend[];
}

export interface PublishResult {
  success: number;
  failed: number;
  details: {
    contentId: string;
    title: string;
    status: 'published' | 'failed';
    error?: string;
  }[];
}

export interface ContentReportData {
  totalGenerated: number;
  totalPublished: number;
  totalFailed: number;
  totalDrafts: number;
  totalLikes: number;
  totalShares: number;
  topPerformingContent: {
    id: string;
    title: string;
    likes: number;
    shares: number;
  }[];
  contentByTimeSlot: Record<string, number>;
  contentByType: Record<string, number>;
}

/**
 * IContentRepository - Content data access interface
 */
export interface IContentRepository {
  /**
   * Get all contents with optional filter
   */
  getAll(filter?: ContentFilter): Promise<Content[]>;

  /**
   * Get paginated contents
   */
  getPaginated(page: number, perPage: number, filter?: ContentFilter): Promise<PaginatedResult<Content>>;

  /**
   * Get content by ID
   */
  getById(id: string): Promise<Content | null>;

  /**
   * Get recent published contents
   */
  getRecentPublished(limit?: number): Promise<Content[]>;

  /**
   * Get scheduled contents
   */
  getScheduled(): Promise<Content[]>;

  /**
   * Get content statistics
   */
  getStats(): Promise<ContentStats>;

  /**
   * Create new content
   */
  create(data: CreateContentDTO): Promise<Content>;

  /**
   * Update existing content
   */
  update(id: string, data: UpdateContentDTO): Promise<Content>;

  /**
   * Delete content
   */
  delete(id: string): Promise<boolean>;

  /**
   * Subscribe to real-time content changes
   * Returns an unsubscribe function
   */
  subscribe(callback: (event: ContentEvent) => void): () => void;

  /**
   * Get analytics aggregations
   */
  getAnalyticsMetrics(): Promise<AnalyticsMetrics>;

  /**
   * Publish content that has reached its scheduled time
   */
  publishDueContent(now: Date): Promise<PublishResult>;

  /**
   * Get report data for a specific period
   */
  getReportData(startDate: string, endDate: string): Promise<ContentReportData>;

  /**
   * Get top performing content across all records (by engagement)
   */
  getTopPerforming(limit?: number): Promise<Content[]>;
}
