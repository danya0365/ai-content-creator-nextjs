/**
 * GoogleTrendsService
 * Fetches real-time trending keywords from Google Trends RSS Feed.
 * Used for the Trendjacking AI feature.
 */

export class GoogleTrendsService {
  private static RSS_URL = 'https://trends.google.co.th/trending/rss?geo=TH';

  /**
   * Fetches the top N trending keywords in Thailand today.
   */
  static async getTopTrends(limit: number = 5): Promise<string[]> {
    try {
      const response = await fetch(this.RSS_URL, {
        next: { revalidate: 3600 }, // Cache for 1 hour
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch Google Trends: ${response.status}`);
      }

      const xmlText = await response.text();
      
      // We extract <title> from inside <item> blocks using Regex
      // This avoids needing heavy XML parser dependencies for just one route.
      const itemRegex = /<item>[\s\S]*?<title>(.*?)<\/title>[\s\S]*?<\/item>/g;
      const trends: string[] = [];
      let match;

      while ((match = itemRegex.exec(xmlText)) !== null) {
        if (match[1]) {
          // Sometimes titles are wrapped in CDATA, e.g., <![CDATA[Keyword]]>
          let cleanTitle = match[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1');
          cleanTitle = cleanTitle.trim();
          trends.push(cleanTitle);
        }
      }

      return trends.slice(0, limit);
    } catch (error) {
      console.error('GoogleTrendsService Error:', error);
      return [];
    }
  }
}
