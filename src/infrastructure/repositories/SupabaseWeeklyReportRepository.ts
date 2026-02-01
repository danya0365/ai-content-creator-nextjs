/**
 * SupabaseWeeklyReportRepository
 * Implements IWeeklyReportRepository using Supabase
 * 
 * ✅ For use in SERVER-SIDE only (API routes)
 */

import {
    CreateWeeklyReportDTO,
    IWeeklyReportRepository,
    WeeklyReport,
} from '@/src/application/repositories/IWeeklyReportRepository';
import { SupabaseClient } from '@supabase/supabase-js';

// Database row type (snake_case)
interface WeeklyReportRow {
  id: string;
  period_start: string;
  period_end: string;
  total_generated: number;
  total_published: number;
  total_failed: number;
  total_drafts: number;
  total_likes: number;
  total_shares: number;
  avg_likes_per_content: number;
  avg_shares_per_content: number;
  top_performing_content: {
    id: string;
    title: string;
    likes: number;
    shares: number;
  }[];
  content_morning: number;
  content_lunch: number;
  content_afternoon: number;
  content_evening: number;
  content_by_type: Record<string, number>;
  created_at: string;
  updated_at?: string;
}

/**
 * Map database row to domain entity
 */
function mapRowToEntity(row: WeeklyReportRow): WeeklyReport {
  return {
    id: row.id,
    periodStart: row.period_start,
    periodEnd: row.period_end,
    totalGenerated: row.total_generated,
    totalPublished: row.total_published,
    totalFailed: row.total_failed,
    totalDrafts: row.total_drafts,
    totalLikes: row.total_likes,
    totalShares: row.total_shares,
    avgLikesPerContent: row.avg_likes_per_content,
    avgSharesPerContent: row.avg_shares_per_content,
    topPerformingContent: row.top_performing_content || [],
    contentMorning: row.content_morning,
    contentLunch: row.content_lunch,
    contentAfternoon: row.content_afternoon,
    contentEvening: row.content_evening,
    contentByType: row.content_by_type || {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Map DTO to database row
 */
function mapDtoToRow(dto: CreateWeeklyReportDTO): Omit<WeeklyReportRow, 'id' | 'created_at' | 'updated_at'> {
  return {
    period_start: dto.periodStart,
    period_end: dto.periodEnd,
    total_generated: dto.totalGenerated,
    total_published: dto.totalPublished,
    total_failed: dto.totalFailed,
    total_drafts: dto.totalDrafts,
    total_likes: dto.totalLikes,
    total_shares: dto.totalShares,
    avg_likes_per_content: dto.avgLikesPerContent,
    avg_shares_per_content: dto.avgSharesPerContent,
    top_performing_content: dto.topPerformingContent,
    content_morning: dto.contentMorning,
    content_lunch: dto.contentLunch,
    content_afternoon: dto.contentAfternoon,
    content_evening: dto.contentEvening,
    content_by_type: dto.contentByType,
  };
}

export class SupabaseWeeklyReportRepository implements IWeeklyReportRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async getAll(): Promise<WeeklyReport[]> {
    const { data, error } = await this.supabase
      .from('ai_weekly_reports')
      .select('*')
      .order('period_start', { ascending: false });

    if (error) {
      console.error('[WeeklyReportRepo] Error fetching reports:', error);
      throw new Error(error.message);
    }

    return (data || []).map(mapRowToEntity);
  }

  async getById(id: string): Promise<WeeklyReport | null> {
    const { data, error } = await this.supabase
      .from('ai_weekly_reports')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      console.error('[WeeklyReportRepo] Error fetching report:', error);
      throw new Error(error.message);
    }

    return data ? mapRowToEntity(data) : null;
  }

  async getLatest(): Promise<WeeklyReport | null> {
    const { data, error } = await this.supabase
      .from('ai_weekly_reports')
      .select('*')
      .order('period_start', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      console.error('[WeeklyReportRepo] Error fetching latest report:', error);
      throw new Error(error.message);
    }

    return data ? mapRowToEntity(data) : null;
  }

  async getByPeriod(periodStart: string, periodEnd: string): Promise<WeeklyReport | null> {
    const { data, error } = await this.supabase
      .from('ai_weekly_reports')
      .select('*')
      .eq('period_start', periodStart)
      .eq('period_end', periodEnd)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      console.error('[WeeklyReportRepo] Error fetching report by period:', error);
      throw new Error(error.message);
    }

    return data ? mapRowToEntity(data) : null;
  }

  async upsert(dto: CreateWeeklyReportDTO): Promise<WeeklyReport> {
    const row = mapDtoToRow(dto);

    const { data, error } = await this.supabase
      .from('ai_weekly_reports')
      .upsert(row, {
        onConflict: 'period_start,period_end',
      })
      .select()
      .single();

    if (error) {
      console.error('[WeeklyReportRepo] Error upserting report:', error);
      throw new Error(error.message);
    }

    return mapRowToEntity(data);
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('ai_weekly_reports')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[WeeklyReportRepo] Error deleting report:', error);
      throw new Error(error.message);
    }

    return true;
  }
}
