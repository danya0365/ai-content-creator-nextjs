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
}

export interface ContentStats {
  totalContents: number;
  publishedCount: number;
  scheduledCount: number;
  draftCount: number;
  totalLikes: number;
  totalShares: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
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
}
