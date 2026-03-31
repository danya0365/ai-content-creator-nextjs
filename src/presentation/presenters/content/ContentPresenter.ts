/**
 * ContentPresenter
 * Centralized presenter for general content operations
 * Used by API Routes to maintain Clean Architecture and Single Source of Truth
 * ✅ Decouples API Routes from direct Repository access
 * ✅ Standardized Error Handling and Logging
 */

import { 
  Content, 
  ContentStats, 
  ContentFilter, 
  IContentRepository, 
  CreateContentDTO, 
  UpdateContentDTO,
  PaginatedResult,
  AnalyticsMetrics
} from '@/src/application/repositories/IContentRepository';

export class ContentPresenter {
  constructor(private readonly repository: IContentRepository) {}

  /**
   * Get content statistics
   */
  async getStats(): Promise<ContentStats> {
    try {
      return await this.repository.getStats();
    } catch (error) {
      console.error('[ContentPresenter] Error in getStats:', error);
      throw error;
    }
  }

  /**
   * Get analytics metrics for charts
   */
  async getAnalytics(): Promise<AnalyticsMetrics> {
    try {
      return await this.repository.getAnalyticsMetrics();
    } catch (error) {
      console.error('[ContentPresenter] Error in getAnalytics:', error);
      throw error;
    }
  }

  /**
   * Get recent published contents
   */
  async getRecentPublished(limit: number = 5): Promise<Content[]> {
    try {
      return await this.repository.getAll({ status: 'published', limit });
    } catch (error) {
      console.error('[ContentPresenter] Error in getRecentPublished:', error)
      throw error;
    }
  }

  /**
   * Get all scheduled contents
   */
  async getScheduled(): Promise<Content[]> {
    try {
      return await this.repository.getScheduled();
    } catch (error) {
       console.error('[ContentPresenter] Error in getScheduled:', error)
       throw error;
    }
  }

  /**
   * Get paginated contents with filters
   */
  async getPaginated(page: number, perPage: number, filter: ContentFilter = {}): Promise<PaginatedResult<Content>> {
    try {
      return await this.repository.getPaginated(page, perPage, filter);
    } catch (error) {
      console.error('[ContentPresenter] Error in getPaginated:', error)
      throw error;
    }
  }

  /**
   * Get all contents with optional filters
   */
  async getAll(filter: ContentFilter = {}): Promise<Content[]> {
    try {
      return await this.repository.getAll(filter);
    } catch (error) {
      console.error('[ContentPresenter] Error in getAll:', error)
      throw error;
    }
  }

  /**
   * Create new content
   */
  async create(data: CreateContentDTO): Promise<Content> {
    try {
      // Business logic/validation
      if (!data.contentTypeId || !data.title) {
        throw new Error('กรุณากรอกข้อมูลให้ครบถ้วน');
      }
      return await this.repository.create(data);
    } catch (error) {
      console.error('[ContentPresenter] Error in create:', error)
      throw error;
    }
  }

  /**
   * Update existing content
   */
  async update(id: string, data: UpdateContentDTO): Promise<Content> {
    try {
      return await this.repository.update(id, data);
    } catch (error) {
      console.error('[ContentPresenter] Error in update:', error)
      throw error;
    }
  }

  /**
   * Delete content
   */
  async delete(id: string): Promise<boolean> {
    try {
      return await this.repository.delete(id);
    } catch (error) {
      console.error('[ContentPresenter] Error in delete:', error)
      throw error;
    }
  }

  /**
   * Get content by ID
   */
  async getById(id: string): Promise<Content | null> {
    try {
      return await this.repository.getById(id);
    } catch (error) {
      console.error('[ContentPresenter] Error in getById:', error)
      throw error;
    }
  }
}
