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
  ContentEvent,
  ContentFilter,
  ContentStats,
  CreateContentDTO,
  IContentRepository,
  PaginatedResult,
  UpdateContentDTO,
} from '@/src/application/repositories/IContentRepository';
import { Database } from '@/src/domain/types/supabase';
import { SupabaseClient } from '@supabase/supabase-js';

// Supabase row types
type SupabaseContentRow = Database['public']['Tables']['ai_contents']['Row'];

// Map database row to domain model
function mapRowToContent(row: SupabaseContentRow): Content {
  return {
    id: row.id,
    contentTypeId: row.content_type_id,
    title: row.title,
    description: row.description || '',
    imageUrl: row.image_url || '',
    prompt: row.prompt || '',
    timeSlot: row.time_slot as Content['timeSlot'],
    scheduledAt: row.scheduled_at || '',
    publishedAt: row.published_at,
    status: (row.status || 'draft') as Content['status'],
    likes: row.likes || 0,
    shares: row.shares || 0,
    createdAt: row.created_at || '',
    updatedAt: row.updated_at || '',
    comments: row.comments || 0,
    tags: row.tags || [],
    emoji: row.emoji || undefined,
  };
}

export class ApiContentRepository implements IContentRepository {
  private baseUrl = '/api/contents';

  /**
   * Optional Supabase client strictly used for real-time subscriptions.
   * Do not use for CRUD operations; use fetch to API routes instead.
   */
  constructor(private readonly supabase?: SupabaseClient<Database>) {}

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

  /**
   * Subscribe to content changes
   * Requires a valid SupabaseClient instance passed via the constructor
   */
  subscribe(callback: (event: ContentEvent) => void): () => void {
    if (!this.supabase) {
      console.warn('Real-time subscription requires passing a SupabaseClient to ApiContentRepository');
      return () => {};
    }

    const channel = this.supabase
      .channel('ai_contents_changes_api')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ai_contents',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            callback({
              type: 'INSERT',
              new: mapRowToContent(payload.new as SupabaseContentRow),
            });
          } else if (payload.eventType === 'UPDATE') {
            callback({
              type: 'UPDATE',
              old: payload.old as Partial<Content>,
              new: mapRowToContent(payload.new as SupabaseContentRow),
            });
          } else if (payload.eventType === 'DELETE') {
            callback({
              type: 'DELETE',
              old: { id: payload.old.id },
            });
          }
        }
      )
      .subscribe();

    return () => {
      this.supabase?.removeChannel(channel);
    };
  }
}
