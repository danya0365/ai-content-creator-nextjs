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
    const [stats, allContents, metrics] = await Promise.all([
      this.repository.getStats(),
      this.repository.getAll(),
      this.repository.getAnalyticsMetrics()
    ]);

    const goals: AnalyticsGoal[] = [
      { id: 'posts', label: 'โพสต์รายเดือน', current: stats.totalContents, target: 30, unit: 'โพสต์' },
      { id: 'likes', label: 'ยอดไลค์', current: stats.totalLikes, target: 1000, unit: 'ไลค์' },
      { id: 'shares', label: 'ยอดแชร์', current: stats.totalShares, target: 500, unit: 'แชร์' },
    ];

    const growthRate = metrics.growth.rate;

    // Transform repository dailyEngagement to weekly UI labels
    const days = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];
    const engagementChart: AnalyticsChartData = { labels: [], data: [] };
    const weeklyData: ChartDataPoint[] = metrics.dailyEngagement.map(d => {
      const dateObj = new Date(d.date);
      const label = days[dateObj.getDay()];
      engagementChart.labels.push(label);
      engagementChart.data.push(d.total);
      return { label, value: d.total };
    });

    // Types Data Mapping
    const typeColors = ['#FFB347', '#FF6B6B', '#4ECDC4', '#C9B1FF', '#45B7D1'];
    const contentTypeChart: AnalyticsChartData = { 
      labels: metrics.contentTypes.map(t => t.id), 
      data: metrics.contentTypes.map(t => t.count) 
    };
    
    const contentTypeData: ChartDataPoint[] = metrics.contentTypes.map((t, idx) => ({
      label: t.id,
      value: t.count,
      color: typeColors[idx % typeColors.length]
    }));

    // Monthly Trends
    const monthlyData: ChartDataPoint[] = metrics.weeklyTrends.map(w => ({
      label: w.weekLabel,
      value: w.total
    }));

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
