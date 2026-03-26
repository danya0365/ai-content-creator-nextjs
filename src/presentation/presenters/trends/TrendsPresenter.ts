/**
 * TrendsPresenter
 * Handles business logic for the Google Trends Explorer
 * Receives repository via dependency injection
 */

import { Metadata } from 'next';
import { ITrendsRepository, TrendItem } from '@/src/application/repositories/ITrendsRepository';

export interface TrendsViewModel {
  trends: TrendItem[];
}

export class TrendsPresenter {
  constructor(private readonly repository: ITrendsRepository) {}

  /**
   * Get view model for the page
   * ⚠️ Use this ONLY for rendering UI views, NOT for API route responses
   */
  async getViewModel(limit: number = 20): Promise<TrendsViewModel> {
    try {
      const trends = await this.repository.getDetailedTrends(limit);
      return { trends };
    } catch (error) {
      console.error('Error getting Trends view model:', error);
      throw error;
    }
  }

  /**
   * Generate metadata for the page
   */
  generateMetadata(): Metadata {
    return {
      title: 'Google Trends Explorer | AI Content Creator',
      description: 'Explore realtime search trends in Thailand and instantly generate AI content.',
    };
  }
}
