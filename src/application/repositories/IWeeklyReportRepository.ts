/**
 * Weekly Report Repository Interface
 * Defines the contract for weekly report data access
 */

export interface WeeklyReport {
  id: string;
  periodStart: string;
  periodEnd: string;
  // Summary
  totalGenerated: number;
  totalPublished: number;
  totalFailed: number;
  totalDrafts: number;
  // Engagement
  totalLikes: number;
  totalShares: number;
  avgLikesPerContent: number;
  avgSharesPerContent: number;
  // Top performing
  topPerformingContent: {
    id: string;
    title: string;
    likes: number;
    shares: number;
  }[];
  // Content breakdown
  contentMorning: number;
  contentLunch: number;
  contentAfternoon: number;
  contentEvening: number;
  contentByType: Record<string, number>;
  // Metadata
  createdAt: string;
  updatedAt?: string;
}

export interface CreateWeeklyReportDTO {
  periodStart: string;
  periodEnd: string;
  totalGenerated: number;
  totalPublished: number;
  totalFailed: number;
  totalDrafts: number;
  totalLikes: number;
  totalShares: number;
  avgLikesPerContent: number;
  avgSharesPerContent: number;
  topPerformingContent: {
    id: string;
    title: string;
    likes: number;
    shares: number;
  }[];
  contentMorning: number;
  contentLunch: number;
  contentAfternoon: number;
  contentEvening: number;
  contentByType: Record<string, number>;
}

export interface IWeeklyReportRepository {
  /**
   * Get all weekly reports
   */
  getAll(): Promise<WeeklyReport[]>;

  /**
   * Get weekly report by ID
   */
  getById(id: string): Promise<WeeklyReport | null>;

  /**
   * Get latest weekly report
   */
  getLatest(): Promise<WeeklyReport | null>;

  /**
   * Get weekly report by period
   */
  getByPeriod(periodStart: string, periodEnd: string): Promise<WeeklyReport | null>;

  /**
   * Create or update weekly report (upsert by period)
   */
  upsert(data: CreateWeeklyReportDTO): Promise<WeeklyReport>;

  /**
   * Delete weekly report
   */
  delete(id: string): Promise<boolean>;
}
