/**
 * Supabase Content Repository
 * Real database implementation using Supabase
 */

import {
  Content,
  ContentFilter,
  ContentStats,
  CreateContentDTO,
  IContentRepository,
  UpdateContentDTO,
} from '@/src/application/repositories/IContentRepository';
import { createClient } from '@/src/lib/supabase';

// Supabase row type (snake_case from database)
interface SupabaseContentRow {
  id: string;
  profile_id: string | null;
  content_type_id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  prompt: string | null;
  time_slot: string | null;
  scheduled_at: string | null;
  published_at: string | null;
  status: string;
  likes: number;
  shares: number;
  views: number;
  created_at: string;
  updated_at: string;
  // New fields
  comments: number;
  tags: string[];
  emoji: string | null;
}

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
    status: row.status as Content['status'],
    likes: row.likes,
    shares: row.shares,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    // New fields
    comments: row.comments || 0,
    tags: row.tags || [],
    emoji: row.emoji || undefined,
  };
}

// Map domain model to database row (for insert/update)
function mapContentToRow(data: CreateContentDTO | UpdateContentDTO): Record<string, unknown> {
  const row: Record<string, unknown> = {};

  if ('contentTypeId' in data && data.contentTypeId) row.content_type_id = data.contentTypeId;
  if ('title' in data && data.title) row.title = data.title;
  if ('description' in data && data.description !== undefined) row.description = data.description;
  if ('imageUrl' in data && data.imageUrl !== undefined) row.image_url = data.imageUrl;
  if ('prompt' in data && data.prompt !== undefined) row.prompt = data.prompt;
  if ('timeSlot' in data && data.timeSlot) row.time_slot = data.timeSlot;
  if ('scheduledAt' in data && data.scheduledAt !== undefined) row.scheduled_at = data.scheduledAt;
  if ('status' in data && data.status) row.status = data.status;
  if ('likes' in data && data.likes !== undefined) row.likes = data.likes;
  if ('shares' in data && data.shares !== undefined) row.shares = data.shares;
  // New fields
  if ('comments' in data && data.comments !== undefined) row.comments = data.comments;
  if ('tags' in data && data.tags !== undefined) row.tags = data.tags;
  if ('emoji' in data && data.emoji !== undefined) row.emoji = data.emoji;

  return row;
}

/**
 * SupabaseContentRepository - Supabase implementation
 */
export class SupabaseContentRepository implements IContentRepository {
  private supabase = createClient();

  async getAll(filter?: ContentFilter): Promise<Content[]> {
    let query = this.supabase
      .from('ai_contents')
      .select('*')
      .order('created_at', { ascending: false });

    if (filter?.status) {
      query = query.eq('status', filter.status);
    }
    if (filter?.timeSlot) {
      query = query.eq('time_slot', filter.timeSlot);
    }
    if (filter?.contentTypeId) {
      query = query.eq('content_type_id', filter.contentTypeId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching contents:', error);
      return [];
    }

    return (data || []).map(mapRowToContent);
  }

  async getById(id: string): Promise<Content | null> {
    const { data, error } = await this.supabase
      .from('ai_contents')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      console.error('Error fetching content by id:', error);
      return null;
    }

    return mapRowToContent(data);
  }

  async getRecentPublished(limit = 5): Promise<Content[]> {
    const { data, error } = await this.supabase
      .from('ai_contents')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching recent published:', error);
      return [];
    }

    return (data || []).map(mapRowToContent);
  }

  async getScheduled(): Promise<Content[]> {
    const { data, error } = await this.supabase
      .from('ai_contents')
      .select('*')
      .eq('status', 'scheduled')
      .order('scheduled_at', { ascending: true });

    if (error) {
      console.error('Error fetching scheduled:', error);
      return [];
    }

    return (data || []).map(mapRowToContent);
  }

  async getStats(): Promise<ContentStats> {
    const { data: allContents, error } = await this.supabase
      .from('ai_contents')
      .select('status, likes, shares');

    if (error || !allContents) {
      console.error('Error fetching stats:', error);
      return {
        totalContents: 0,
        publishedCount: 0,
        scheduledCount: 0,
        draftCount: 0,
        totalLikes: 0,
        totalShares: 0,
      };
    }

    const published = allContents.filter((c) => c.status === 'published');
    const scheduled = allContents.filter((c) => c.status === 'scheduled');
    const draft = allContents.filter((c) => c.status === 'draft');

    return {
      totalContents: allContents.length,
      publishedCount: published.length,
      scheduledCount: scheduled.length,
      draftCount: draft.length,
      totalLikes: published.reduce((sum, c) => sum + (c.likes || 0), 0),
      totalShares: published.reduce((sum, c) => sum + (c.shares || 0), 0),
    };
  }

  async create(data: CreateContentDTO): Promise<Content> {
    const row = mapContentToRow(data);

    const { data: created, error } = await this.supabase
      .from('ai_contents')
      .insert(row)
      .select()
      .single();

    if (error || !created) {
      console.error('Error creating content:', error);
      throw new Error('Failed to create content');
    }

    return mapRowToContent(created);
  }

  async update(id: string, data: UpdateContentDTO): Promise<Content> {
    const row = mapContentToRow(data);

    const { data: updated, error } = await this.supabase
      .from('ai_contents')
      .update(row)
      .eq('id', id)
      .select()
      .single();

    if (error || !updated) {
      console.error('Error updating content:', error);
      throw new Error('Failed to update content');
    }

    return mapRowToContent(updated);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('ai_contents')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting content:', error);
      throw new Error('Failed to delete content');
    }
  }
}
