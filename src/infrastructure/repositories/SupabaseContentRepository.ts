/**
 * Supabase Content Repository
 * Real database implementation using Supabase
 */

import {
    Content,
    ContentEvent,
    ContentFilter,
    ContentStats,
    CreateContentDTO,
    IContentRepository,
    PaginatedResult,
    UpdateContentDTO,
    AnalyticsMetrics,
    AnalyticsDailyStats,
    AnalyticsTypeStats,
    AnalyticsWeeklyTrend,
    PublishResult,
    ContentReportData,
} from '@/src/application/repositories/IContentRepository';
import { Database } from '@/src/domain/types/supabase';
import { SupabaseClient } from '@supabase/supabase-js';

// Supabase row types
type SupabaseContentRow = Database['public']['Tables']['ai_contents']['Row'];
type SupabaseContentInsert = Database['public']['Tables']['ai_contents']['Insert'];
type SupabaseContentUpdate = Database['public']['Tables']['ai_contents']['Update'];

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
    // New fields
    comments: row.comments || 0,
    tags: row.tags || [],
    emoji: row.emoji || undefined,
    profileId: row.profile_id || undefined,
  };
}

// Map Create DTO to Insert row
function mapCreateToRow(data: CreateContentDTO): SupabaseContentInsert {
  return {
    content_type_id: data.contentTypeId,
    title: data.title,
    description: data.description,
    image_url: data.imageUrl,
    prompt: data.prompt,
    time_slot: data.timeSlot,
    scheduled_at: data.scheduledAt,
    status: data.status,
    tags: data.tags,
    emoji: data.emoji,
    profile_id: data.profileId,
  };
}

// Map Update DTO to Update row
function mapUpdateToRow(data: UpdateContentDTO): SupabaseContentUpdate {
  const row: SupabaseContentUpdate = {};

  if (data.title !== undefined) row.title = data.title;
  if (data.description !== undefined) row.description = data.description;
  if (data.imageUrl !== undefined) row.image_url = data.imageUrl;
  if (data.prompt !== undefined) row.prompt = data.prompt;
  if (data.timeSlot !== undefined) row.time_slot = data.timeSlot;
  if (data.scheduledAt !== undefined) row.scheduled_at = data.scheduledAt;
  if (data.status !== undefined) row.status = data.status;
  if (data.likes !== undefined) row.likes = data.likes;
  if (data.shares !== undefined) row.shares = data.shares;
  if (data.comments !== undefined) row.comments = data.comments;
  if (data.tags !== undefined) row.tags = data.tags;
  if (data.emoji !== undefined) row.emoji = data.emoji;

  return row;
}

/**
 * SupabaseContentRepository - Supabase implementation
 */
export class SupabaseContentRepository implements IContentRepository {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

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
    if (filter?.contentTypeIds && filter.contentTypeIds.length > 0) {
      query = query.in('content_type_id', filter.contentTypeIds);
    }
    if (filter?.startDate) {
      query = query.gte('created_at', filter.startDate);
    }
    if (filter?.endDate) {
      query = query.lte('created_at', filter.endDate);
    }
    if (filter?.scheduledBefore) {
      query = query.lte('scheduled_at', filter.scheduledBefore);
    }
    if (filter?.limit) {
      query = query.limit(filter.limit);
    }
    if (filter?.offset) {
      query = query.range(filter.offset, (filter.offset + (filter.limit || 10)) - 1);
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
    // Optimization: Use parallel count queries instead of fetching all rows
    const [
      totalRes,
      publishedRes,
      scheduledRes,
      draftRes,
      engagementRes
    ] = await Promise.all([
      this.supabase.from('ai_contents').select('*', { count: 'exact', head: true }),
      this.supabase.from('ai_contents').select('*', { count: 'exact', head: true }).eq('status', 'published'),
      this.supabase.from('ai_contents').select('*', { count: 'exact', head: true }).eq('status', 'scheduled'),
      this.supabase.from('ai_contents').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
      this.supabase.from('ai_contents').select('likes, shares, comments').eq('status', 'published')
    ]);

    const totalLikes = engagementRes.data?.reduce((sum, c) => sum + (c.likes || 0), 0) || 0;
    const totalShares = engagementRes.data?.reduce((sum, c) => sum + (c.shares || 0), 0) || 0;
    const totalComments = engagementRes.data?.reduce((sum, c) => sum + (c.comments || 0), 0) || 0;

    return {
      totalContents: totalRes.count || 0,
      publishedCount: publishedRes.count || 0,
      scheduledCount: scheduledRes.count || 0,
      draftCount: draftRes.count || 0,
      totalLikes,
      totalShares,
      totalComments,
    };
  }

  async getPaginated(page: number, perPage: number, filter?: ContentFilter): Promise<PaginatedResult<Content>> {
    // Basic implementation for pagination if needed
    const start = (page - 1) * perPage;
    const end = start + perPage - 1;

    let query = this.supabase
      .from('ai_contents')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(start, end);

    if (filter?.status) {
      query = query.eq('status', filter.status);
    }
    if (filter?.timeSlot) {
      query = query.eq('time_slot', filter.timeSlot);
    }
    if (filter?.contentTypeId) {
      query = query.eq('content_type_id', filter.contentTypeId);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching paginated contents:', error);
      return {
        data: [],
        total: 0,
        page,
        perPage,
      };
    }

    return {
      data: (data || []).map(mapRowToContent),
      total: count || 0,
      page,
      perPage,
    };
  }

  async create(data: CreateContentDTO): Promise<Content> {
    const row = mapCreateToRow(data);

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
    const row = mapUpdateToRow(data);

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

  async delete(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('ai_contents')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting content:', error);
      return false;
    }
    return true;
  }

  /**
   * Subscribe to real-time content changes
   */
  subscribe(callback: (event: ContentEvent) => void): () => void {
    const channel = this.supabase
      .channel('ai_contents_changes')
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
      this.supabase.removeChannel(channel);
    };
  }

  async getAnalyticsMetrics(): Promise<AnalyticsMetrics> {
    const now = new Date();
    const last60Days = new Date();
    last60Days.setDate(now.getDate() - 60);
    const last60DaysIso = last60Days.toISOString();

    // Optimization: Only fetch data needed for current metrics (last 60 days)
    const { data: recentContents, error } = await this.supabase
      .from('ai_contents')
      .select('content_type_id, status, likes, shares, comments, created_at')
      .gte('created_at', last60DaysIso);

    if (error || !recentContents) {
      console.error('Error fetching analytics:', error);
      return { growth: { currentPeriod: 0, previousPeriod: 0, rate: 0 }, dailyEngagement: [], contentTypes: [], weeklyTrends: [] };
    }

    // Growth Rate (Current Month vs Last Month)
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    
    let currentPeriod = 0;
    let previousPeriod = 0;

    recentContents.forEach(c => {
      const d = new Date(c.created_at || new Date().toISOString());
      if (d >= currentMonthStart) {
        currentPeriod++;
      } else if (d >= lastMonthStart && d < currentMonthStart) {
        previousPeriod++;
      }
    });

    let rate = 0;
    if (previousPeriod > 0) {
      rate = Number(((currentPeriod - previousPeriod) / previousPeriod * 100).toFixed(1));
    } else if (currentPeriod > 0) {
      rate = 100;
    }

    // Daily Engagement (Last 7 Days)
    const dailyEngagement: AnalyticsDailyStats[] = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(now.getDate() - (6 - i));
      const dateStr = d.toISOString().split('T')[0];
      const dayContents = recentContents.filter(c => (c.created_at || '').startsWith(dateStr));
      const total = dayContents.length > 0
        ? dayContents.reduce((sum, c) => sum + (c.likes || 0) + (c.shares || 0) + (c.comments || 0), 0)
        : 0; // Don't use random mock data anymore for real analytics!
      return { date: dateStr, total };
    });

    // Content Types (from recent data for trend, or all time?)
    // Actually, type distribution usually covers recent trends.
    const typeCount: Record<string, number> = {};
    recentContents.forEach(c => {
      typeCount[c.content_type_id] = (typeCount[c.content_type_id] || 0) + 1;
    });
    const contentTypes: AnalyticsTypeStats[] = Object.entries(typeCount).map(([id, count]) => ({ id, count }));

    // Weekly Trends (Last 4 Weeks)
    const weeklyTrends: AnalyticsWeeklyTrend[] = Array.from({ length: 4 }).map((_, i) => {
      const weekStart = new Date();
      weekStart.setDate(now.getDate() - (28 - i * 7));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);
      
      const weekContents = recentContents.filter(c => {
        const d = new Date(c.created_at || new Date().toISOString());
        return d >= weekStart && d < weekEnd;
      });
      const total = weekContents.reduce((sum, c) => sum + (c.likes || 0) + (c.shares || 0) + (c.comments || 0), 0);
      return { weekLabel: `W${i + 1}`, total };
    });

    return {
      growth: { currentPeriod, previousPeriod, rate },
      dailyEngagement,
      contentTypes,
      weeklyTrends,
    };
  }

  async publishDueContent(now: Date): Promise<PublishResult> {
    const nowIso = now.toISOString();
    
    // 1. Get only due scheduled contents (status=scheduled AND scheduledAt <= now)
    const contentsToPublish = await this.getAll({ 
      status: 'scheduled', 
      scheduledBefore: nowIso 
    });

    if (contentsToPublish.length === 0) {
      return { success: 0, failed: 0, details: [] };
    }

    // 3. Publish each content
    const publishResults = await Promise.allSettled(
      contentsToPublish.map(async (content) => {
        try {
          // Update status to published
          await this.update(content.id, {
            status: 'published',
            publishedAt: nowIso,
          });

          return {
            contentId: content.id,
            title: content.title,
            status: 'published' as const,
          };
        } catch (error) {
          console.error(`[Repository] Failed to publish ${content.id}:`, error);
          
          // Mark as failed in DB
          try {
            await this.update(content.id, { status: 'failed' });
          } catch (e) {
            console.error(`[Repository] Critical: Failed to mark as failed ${content.id}:`, e);
          }

          throw error;
        }
      })
    );

    // 4. Format results
    const results: PublishResult['details'] = publishResults.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          contentId: contentsToPublish[index].id,
          title: contentsToPublish[index].title,
          status: 'failed' as const,
          error: (result.reason as Error).message || 'Unknown error',
        };
      }
    });

    return {
      success: results.filter(r => r.status === 'published').length,
      failed: results.filter(r => r.status === 'failed').length,
      details: results,
    };
  }

  async getTopPerforming(limit = 5): Promise<Content[]> {
    const { data, error } = await this.supabase
      .from('ai_contents')
      .select('*')
      .eq('status', 'published')
      .order('likes', { ascending: false })
      .order('shares', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching top performing:', error);
      return [];
    }

    return (data || []).map(mapRowToContent);
  }

  async getCursorPaginated(filter: import('@/src/application/repositories/IContentRepository').ContentCursorFilter): Promise<import('@/src/application/repositories/IContentRepository').CursorPaginatedResult<Content>> {
    const { cursor, limit = 12, status, contentTypeId, direction = 'next' } = filter;
    
    let query = this.supabase
      .from('ai_contents')
      .select('*', { count: 'exact' });

    // Apply filters
    if (status) query = query.eq('status', status);
    if (contentTypeId) query = query.eq('content_type_id', contentTypeId);

    // Apply cursor
    if (cursor) {
      if (direction === 'next') {
        // Fetch older items
        query = query.lt('created_at', cursor);
      } else {
        // Fetch newer items
        query = query.gt('created_at', cursor);
      }
    }

    // Order: Always newest first for traditional feed direction
    // If direction is 'previous', we might need to reverse the order to get the "next" set of newer items correctly
    query = query.order('created_at', { ascending: false });

    // Limit + 1 to check if there's more
    query = query.limit(limit + 1);

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching cursor paginated contents:', error);
      return { data: [], nextCursor: null, hasMore: false };
    }

    const hasMore = (data?.length || 0) > limit;
    const items = hasMore ? data.slice(0, limit) : (data || []);
    const lastItem = items[items.length - 1];
    const nextCursor = hasMore && lastItem ? lastItem.created_at : null;

    return {
      data: items.map(mapRowToContent),
      nextCursor,
      hasMore,
    };
  }

  async getReportData(startDate: string, endDate: string): Promise<ContentReportData> {
    // 1. Fetch all contents for the period (Still fetch once to avoid 10 separate count queries, 
    // but now it's filtered by DATE in the DB first!)
    const weeklyContents = await this.getAll({ startDate, endDate });

    // 2. Calculate statistics in memory (from a MUCH smaller filtered set)
    const publishedContents = weeklyContents.filter(c => c.status === 'published');
    const totalLikes = publishedContents.reduce((sum, c) => sum + (c.likes || 0), 0);
    const totalShares = publishedContents.reduce((sum, c) => sum + (c.shares || 0), 0);

    const topPerformingContent = [...publishedContents]
      .sort((a, b) => ((b.likes || 0) + (b.shares || 0)) - ((a.likes || 0) + (a.shares || 0)))
      .slice(0, 5)
      .map(c => ({
        id: c.id,
        title: c.title,
        likes: c.likes || 0,
        shares: c.shares || 0,
      }));

    const contentByTimeSlot: Record<string, number> = {
      morning: weeklyContents.filter(c => c.timeSlot === 'morning').length,
      lunch: weeklyContents.filter(c => c.timeSlot === 'lunch').length,
      afternoon: weeklyContents.filter(c => c.timeSlot === 'afternoon').length,
      evening: weeklyContents.filter(c => c.timeSlot === 'evening').length,
    };

    const contentByType: Record<string, number> = {};
    weeklyContents.forEach(c => {
      contentByType[c.contentTypeId] = (contentByType[c.contentTypeId] || 0) + 1;
    });

    return {
      totalGenerated: weeklyContents.length,
      totalPublished: publishedContents.length,
      totalFailed: weeklyContents.filter(c => c.status === 'failed').length,
      totalDrafts: weeklyContents.filter(c => c.status === 'draft').length,
      totalLikes,
      totalShares,
      topPerformingContent,
      contentByTimeSlot,
      contentByType,
    };
  }
}
