/**
 * GoogleTrendsRepository
 * Implementation of ITrendsRepository using Google Trends RSS
 * Following Clean Architecture - this is in the Infrastructure layer
 */

import { ITrendsRepository, TrendItem } from '@/src/application/repositories/ITrendsRepository';

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

export class GoogleTrendsRepository implements ITrendsRepository {
  private static RSS_URL = 'https://trends.google.co.th/trending/rss?geo=TH';

  async getTopTrends(limit: number = 5): Promise<string[]> {
    try {
      const response = await fetch(GoogleTrendsRepository.RSS_URL, {
        next: { revalidate: 3600 },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch Google Trends: ${response.status}`);
      }

      const xmlText = await response.text();
      const itemRegex = /<item>[\s\S]*?<title>(.*?)<\/title>[\s\S]*?<\/item>/g;
      const trends: string[] = [];
      let match;

      while ((match = itemRegex.exec(xmlText)) !== null) {
        if (match[1]) {
          let cleanTitle = match[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1');
          cleanTitle = decodeHtmlEntities(cleanTitle.trim());
          trends.push(cleanTitle);
        }
      }

      return trends.slice(0, limit);
    } catch (error) {
      console.error('GoogleTrendsRepository Error:', error);
      return [];
    }
  }

  async getDetailedTrends(limit: number = 20): Promise<TrendItem[]> {
    try {
      const response = await fetch(GoogleTrendsRepository.RSS_URL, {
        next: { revalidate: 3600 },
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
            id: title, // Using title as unique id
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
      console.error('GoogleTrendsRepository Error:', error);
      return [];
    }
  }
}
