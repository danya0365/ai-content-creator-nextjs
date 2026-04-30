/**
 * ITrendsRepository
 * Repository interface for Google Trends data access
 * Following Clean Architecture - this is in the Application layer
 */

export interface TrendItem {
  id: string; // Required by generic pattern, we'll use title as ID
  title: string;
  traffic: string;
  picture: string;
  pictureSource: string;
  newsTitle: string;
  newsSnippet: string;
  newsUrl: string;
  pubDate: string;
}

export interface ITrendsRepository {
  /**
   * Get simple string keywords for AI Context (e.g. ['Lakers', 'Bitcoin'])
   */
  getTopTrends(limit?: number): Promise<string[]>;

  /**
   * Get visually rich trend objects for the Trends Explorer Dashboard
   */
  getDetailedTrends(limit?: number): Promise<TrendItem[]>;
}
