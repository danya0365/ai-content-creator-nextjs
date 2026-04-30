/**
 * MockTrendsRepository
 * Mock implementation for development and testing
 * Following Clean Architecture - this is in the Infrastructure layer
 */

import { ITrendsRepository, TrendItem } from '@/src/application/repositories/ITrendsRepository';

const MOCK_TRENDS: TrendItem[] = [
  {
    id: 'โอลิมปิกฤดูหนาว 2026',
    title: 'โอลิมปิกฤดูหนาว 2026',
    traffic: '500,000+',
    picture: 'https://images.unsplash.com/photo-1551524164-687a55dd1126?q=80&w=600&auto=format&fit=crop',
    pictureSource: 'Daily News',
    newsTitle: 'พิธีเปิดกีฬาโอลิมปิกฤดูหนาว 2026 อิตาลี สุดยิ่งใหญ่',
    newsSnippet: 'ชมภาพบรรยากาศพิธีเปิดสุดอลังการ ผู้ชมกว่าล้านคนชื่นชม',
    newsUrl: '#',
    pubDate: new Date().toISOString(),
  },
  {
    id: 'AI อัจฉริยะ',
    title: 'AI อัจฉริยะ',
    traffic: '100,000+',
    picture: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=600&auto=format&fit=crop',
    pictureSource: 'Tech Crunch',
    newsTitle: 'เปิดตัว AI รุ่นใหม่ล่าสุด พลิกโฉมวงการ Content Creator',
    newsSnippet: 'Generative AI อัปเกรดความสามารถในการเขียนและวิเคราะห์',
    newsUrl: '#',
    pubDate: new Date().toISOString(),
  },
  {
    id: 'หุ้นไทยวันนี้',
    title: 'หุ้นไทยวันนี้',
    traffic: '50,000+',
    picture: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=600&auto=format&fit=crop',
    pictureSource: 'Bangkok Post',
    newsTitle: 'หุ้นไทยปิดพุ่ง 15 จุด รับแรงซื้อเก็งกำไรผลประกอบการ',
    newsSnippet: 'ดัชนีหุ้นไทยปรับตัวสูงขึ้นทะลุแนวต้าน',
    newsUrl: '#',
    pubDate: new Date().toISOString(),
  }
];

export class MockTrendsRepository implements ITrendsRepository {
  private items: TrendItem[] = [...MOCK_TRENDS];

  async getTopTrends(limit: number = 5): Promise<string[]> {
    await this.delay(500);
    return this.items.map(item => item.title).slice(0, limit);
  }

  async getDetailedTrends(limit: number = 20): Promise<TrendItem[]> {
    await this.delay(800);
    return this.items.slice(0, limit);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const mockTrendsRepository = new MockTrendsRepository();
