/**
 * AnalyticsPresenter
 * Handles business logic for Analytics page
 * ✅ Uses dependency injection for repository
 * ✅ Single Source of Truth - All chart data comes from here
 */

import { ContentStats, IContentRepository } from '@/src/application/repositories/IContentRepository';
import { Metadata } from 'next';

// Chart data point (for bar/line charts)
export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

// Top performer content
export interface TopPerformer {
  title: string;
  likes: number;
  shares: number;
  type: string;
}

export interface AnalyticsChartData {
  labels: string[];
  data: number[];
}

export interface AnalyticsGoal {
  id: string;
  label: string;
  current: number;
  target: number;
  unit: string;
}

export interface AnalyticsViewModel {
  stats: ContentStats;
  engagementChart: AnalyticsChartData;
  contentTypeChart: AnalyticsChartData;
  goals: AnalyticsGoal[];
  growthRate: number;
  // ✅ New: Chart data for View
  weeklyData: ChartDataPoint[];
  monthlyData: ChartDataPoint[];
  contentTypeData: ChartDataPoint[];
  topPerformers: TopPerformer[];
}

/**
 * Presenter for Analytics page
 * ✅ Receives repository via constructor injection
 */
export class AnalyticsPresenter {
  constructor(
    private readonly repository: IContentRepository
  ) {}

  /**
   * Get view model for the page
   */
  async getViewModel(): Promise<AnalyticsViewModel> {
    const stats = await this.repository.getStats();
    const allContents = await this.repository.getAll();

    // Generate chart data based on stats
    const engagementChart: AnalyticsChartData = {
      labels: ['จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส', 'อา'],
      data: [65, 78, 90, 81, 56, 55, 40],
    };

    const contentTypeChart: AnalyticsChartData = {
      labels: ['ข่าว', 'อาหาร', 'เทค', 'เกม', 'มีม', 'คำคม'],
      data: [25, 18, 15, 12, 20, 10],
    };

    const goals: AnalyticsGoal[] = [
      { id: 'posts', label: 'โพสต์รายเดือน', current: stats.totalContents, target: 30, unit: 'โพสต์' },
      { id: 'likes', label: 'ยอดไลค์', current: stats.totalLikes, target: 1000, unit: 'ไลค์' },
      { id: 'shares', label: 'ยอดแชร์', current: stats.totalShares, target: 500, unit: 'แชร์' },
    ];

    // Calculate growth rate (mock for now)
    const growthRate = 15.4;

    // ✅ Weekly engagement data
    const weeklyData: ChartDataPoint[] = [
      { label: 'จ', value: 142 },
      { label: 'อ', value: 189 },
      { label: 'พ', value: 156 },
      { label: 'พฤ', value: 234 },
      { label: 'ศ', value: 312 },
      { label: 'ส', value: 278 },
      { label: 'อา', value: 198 },
    ];

    // ✅ Monthly data
    const monthlyData: ChartDataPoint[] = [
      { label: 'W1', value: 850 },
      { label: 'W2', value: 1200 },
      { label: 'W3', value: 980 },
      { label: 'W4', value: 1450 },
    ];

    // ✅ Content type distribution
    const contentTypeData: ChartDataPoint[] = [
      { label: 'Morning News', value: 35, color: '#FFB347' },
      { label: 'Food', value: 25, color: '#FF6B6B' },
      { label: 'Tech Tips', value: 20, color: '#4ECDC4' },
      { label: 'Entertainment', value: 12, color: '#C9B1FF' },
      { label: 'Motivation', value: 8, color: '#45B7D1' },
    ];

    // ✅ Top performers from actual content
    const sortedByLikes = [...allContents].sort((a, b) => (b.likes || 0) - (a.likes || 0));
    const topPerformers: TopPerformer[] = sortedByLikes.slice(0, 5).map((c) => ({
      title: c.title,
      likes: c.likes || 0,
      shares: c.shares || 0,
      type: c.contentTypeId,
    }));

    return {
      stats,
      engagementChart,
      contentTypeChart,
      goals,
      growthRate,
      weeklyData,
      monthlyData,
      contentTypeData,
      topPerformers,
    };
  }

  /**
   * Generate metadata for the page
   */
  generateMetadata(): Metadata {
    return {
      title: 'Analytics | AI Content Creator',
      description: 'วิเคราะห์ประสิทธิภาพคอนเทนต์และดู insights',
    };
  }
}
