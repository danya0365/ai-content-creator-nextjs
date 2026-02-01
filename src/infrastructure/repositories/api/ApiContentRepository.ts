/**
 * ApiContentRepository
 * Implements IContentRepository using API calls instead of direct Supabase connection
 * 
 * ✅ For use in CLIENT-SIDE components only
 * ✅ No connection pool issues - calls go through Next.js API routes
 * ✅ Single source of truth via API routes
 */

'use client';

import {
    Content,
    ContentFilter,
    ContentStats,
    CreateContentDTO,
    IContentRepository,
    PaginatedResult,
    UpdateContentDTO,
} from '@/src/application/repositories/IContentRepository';

export class ApiContentRepository implements IContentRepository {
  private baseUrl = '/api/contents';

  /**
   * Get all contents with optional filter
   */
  async getAll(filter?: ContentFilter): Promise<Content[]> {
    const params = new URLSearchParams();
    if (filter?.status) params.append('status', filter.status);
    if (filter?.timeSlot) params.append('timeSlot', filter.timeSlot);
    if (filter?.contentTypeId) params.append('contentTypeId', filter.contentTypeId);

    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;

    const res = await fetch(url);
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'ไม่สามารถโหลดข้อมูลคอนเทนต์ได้');
    }
    return res.json();
  }

  /**
   * Get paginated contents
   */
  async getPaginated(page: number, perPage: number, filter?: ContentFilter): Promise<PaginatedResult<Content>> {
    const params = new URLSearchParams({
      page: page.toString(),
      perPage: perPage.toString(),
    });
    if (filter?.status) params.append('status', filter.status);
    if (filter?.timeSlot) params.append('timeSlot', filter.timeSlot);
    if (filter?.contentTypeId) params.append('contentTypeId', filter.contentTypeId);

    const res = await fetch(`${this.baseUrl}?${params}`);
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'ไม่สามารถโหลดข้อมูลคอนเทนต์ได้');
    }
    return res.json();
  }

  /**
   * Get content by ID
   */
  async getById(id: string): Promise<Content | null> {
    const res = await fetch(`${this.baseUrl}/${id}`);
    if (res.status === 404) return null;
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'ไม่สามารถโหลดข้อมูลคอนเทนต์ได้');
    }
    return res.json();
  }

  /**
   * Get recent published contents
   */
  async getRecentPublished(limit = 5): Promise<Content[]> {
    const res = await fetch(`${this.baseUrl}?action=recentPublished&limit=${limit}`);
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'ไม่สามารถโหลดข้อมูลคอนเทนต์ได้');
    }
    return res.json();
  }

  /**
   * Get scheduled contents
   */
  async getScheduled(): Promise<Content[]> {
    const res = await fetch(`${this.baseUrl}?action=scheduled`);
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'ไม่สามารถโหลดข้อมูลคอนเทนต์ได้');
    }
    return res.json();
  }

  /**
   * Get content statistics
   */
  async getStats(): Promise<ContentStats> {
    const res = await fetch(`${this.baseUrl}?action=stats`);
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'ไม่สามารถโหลดสถิติได้');
    }
    return res.json();
  }

  /**
   * Create new content
   */
  async create(data: CreateContentDTO): Promise<Content> {
    const res = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'ไม่สามารถสร้างคอนเทนต์ได้');
    }
    return res.json();
  }

  /**
   * Update existing content
   */
  async update(id: string, data: UpdateContentDTO): Promise<Content> {
    const res = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'ไม่สามารถอัปเดตคอนเทนต์ได้');
    }
    return res.json();
  }

  /**
   * Delete content
   */
  async delete(id: string): Promise<boolean> {
    const res = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'ไม่สามารถลบคอนเทนต์ได้');
    }
    const result = await res.json();
    return result.success;
  }
}
