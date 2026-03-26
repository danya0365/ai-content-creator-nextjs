/**
 * GoogleTrendsService
 * Fetches real-time trending keywords from Google Trends RSS Feed.
 * Used for the Trendjacking AI feature.
 */

export interface TrendItem {
  title: string;
  traffic: string;
  picture: string;
  pictureSource: string;
  newsTitle: string;
  newsSnippet: string;
  newsUrl: string;
  pubDate: string;
}

function decodeHtmlEntities(text: string): string {
  if (!text) return '';
  return text
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/');
}

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
          cleanTitle = decodeHtmlEntities(cleanTitle.trim());
          trends.push(cleanTitle);
        }
      }

      return trends.slice(0, limit);
    } catch (error) {
      console.error('GoogleTrendsService Error:', error);
      return [];
    }
  }

  /**
   * Fetches detailed trending objects for the Trends Dashboard visual Explorer.
   */
  static async getDetailedTrends(limit: number = 20): Promise<TrendItem[]> {
    try {
      const response = await fetch(this.RSS_URL, {
        next: { revalidate: 3600 }, // Cache for 1 hour
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch Google Trends: ${response.status}`);
      }

      const xmlText = await response.text();
      const itemRegex = /<item>([\s\S]*?)<\/item>/g;
      const trends: TrendItem[] = [];
      let match;

      const extractTag = (xml: string, tag: string) => {
        const regex = new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`);
        const m = regex.exec(xml);
        if (!m) return '';
        let content = m[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1');
        return decodeHtmlEntities(content.trim());
      };

      while ((match = itemRegex.exec(xmlText)) !== null) {
        const itemXml = match[1];
        const title = extractTag(itemXml, 'title');
        if (title) {
          trends.push({
            title,
            traffic: extractTag(itemXml, 'ht:approx_traffic'),
            picture: extractTag(itemXml, 'ht:picture'),
            pictureSource: extractTag(itemXml, 'ht:picture_source'),
            newsTitle: extractTag(itemXml, 'ht:news_item_title'),
            newsSnippet: extractTag(itemXml, 'ht:news_item_snippet'),
            newsUrl: extractTag(itemXml, 'ht:news_item_url'),
            pubDate: extractTag(itemXml, 'pubDate'),
          });
        }
      }

      return trends.slice(0, limit);
    } catch (error) {
      console.error('GoogleTrendsService Error:', error);
      return [];
    }
  }
}
