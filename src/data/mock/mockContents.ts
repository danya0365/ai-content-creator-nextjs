/**
 * Mock Contents Data
 * Sample generated content for development
 */

import { TimeSlot } from '../master/contentTypes';

export interface GeneratedContent {
  id: string;
  contentTypeId: string;
  title: string;
  description: string;
  imageUrl: string;
  prompt: string;
  timeSlot: TimeSlot;
  scheduledAt: string;
  publishedAt: string | null;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  likes: number;
  shares: number;
  createdAt: string;
}

export const MOCK_CONTENTS: GeneratedContent[] = [
  {
    id: 'content-001',
    contentTypeId: 'morning-news',
    title: 'สรุปข่าวเช้า: AI กำลังมาแรง! 🤖',
    description: 'วันนี้มีข่าวเทคโนโลยี AI ที่น่าสนใจมากมาย มาดูกันว่าโลกเปลี่ยนไปยังไงบ้าง',
    imageUrl: '/mock/morning-news-ai.png',
    prompt: 'Create a cute pixel art illustration of robots reading newspapers. Style: retro 16-bit, cheerful colors.',
    timeSlot: 'morning',
    scheduledAt: '2026-01-04T07:00:00.000Z',
    publishedAt: '2026-01-04T07:00:00.000Z',
    status: 'published',
    likes: 156,
    shares: 42,
    createdAt: '2026-01-04T06:30:00.000Z',
  },
  {
    id: 'content-002',
    contentTypeId: 'food',
    title: 'ก๋วยเตี๋ยวเรือ สูตรต้นตำรับ 🍜',
    description: 'มาทำก๋วยเตี๋ยวเรือสูตรโบราณกันเถอะ อร่อยจนต้องสั่งซ้ำ!',
    imageUrl: '/mock/food-boat-noodle.png',
    prompt: 'Create a mouth-watering pixel art of Thai boat noodles. Style: retro 16-bit, vibrant and appetizing.',
    timeSlot: 'lunch',
    scheduledAt: '2026-01-04T12:00:00.000Z',
    publishedAt: '2026-01-04T12:00:00.000Z',
    status: 'published',
    likes: 234,
    shares: 89,
    createdAt: '2026-01-04T11:30:00.000Z',
  },
  {
    id: 'content-003',
    contentTypeId: 'entertainment',
    title: 'เมื่อโปรแกรมเมอร์เจอบัค 😂',
    description: 'สถานการณ์สุดฮาที่โปรแกรมเมอร์ทุกคนต้องเจอ!',
    imageUrl: '/mock/programmer-bug.png',
    prompt: 'Create a funny pixel art scene of a programmer shocked at finding a bug. Style: retro 16-bit, expressive characters.',
    timeSlot: 'afternoon',
    scheduledAt: '2026-01-04T15:00:00.000Z',
    publishedAt: null,
    status: 'scheduled',
    likes: 0,
    shares: 0,
    createdAt: '2026-01-04T14:00:00.000Z',
  },
  {
    id: 'content-004',
    contentTypeId: 'daily-motivation',
    title: 'ล้มได้ แต่ต้องลุกขึ้นสู้! 💪',
    description: 'คำคมสร้างกำลังใจสำหรับวันใหม่',
    imageUrl: '/mock/motivation-sunrise.png',
    prompt: 'Create an inspiring pixel art scene of a character climbing a mountain at sunrise. Style: retro 16-bit, warm and uplifting.',
    timeSlot: 'morning',
    scheduledAt: '2026-01-05T07:00:00.000Z',
    publishedAt: null,
    status: 'scheduled',
    likes: 0,
    shares: 0,
    createdAt: '2026-01-04T20:00:00.000Z',
  },
  {
    id: 'content-005',
    contentTypeId: 'gaming',
    title: 'เกมใหม่น่าเล่นในเดือนนี้ 🎮',
    description: 'รวมเกมใหม่ที่ต้องจับตามอง ทั้ง PC และ Console',
    imageUrl: '/mock/gaming-new-releases.png',
    prompt: 'Create a pixel art scene of gaming controllers and game cartridges. Style: retro 16-bit, nostalgic gaming vibes.',
    timeSlot: 'evening',
    scheduledAt: '2026-01-04T20:00:00.000Z',
    publishedAt: null,
    status: 'draft',
    likes: 0,
    shares: 0,
    createdAt: '2026-01-04T18:00:00.000Z',
  },
];

/**
 * Get contents by status
 */
export function getContentsByStatus(status: GeneratedContent['status']): GeneratedContent[] {
  return MOCK_CONTENTS.filter((content) => content.status === status);
}

/**
 * Get contents by time slot
 */
export function getContentsByTimeSlot(timeSlot: TimeSlot): GeneratedContent[] {
  return MOCK_CONTENTS.filter((content) => content.timeSlot === timeSlot);
}

/**
 * Get recent published contents
 */
export function getRecentPublishedContents(limit: number = 5): GeneratedContent[] {
  return MOCK_CONTENTS
    .filter((content) => content.status === 'published')
    .sort((a, b) => new Date(b.publishedAt!).getTime() - new Date(a.publishedAt!).getTime())
    .slice(0, limit);
}

/**
 * Get content statistics
 */
export function getContentStats() {
  const published = MOCK_CONTENTS.filter((c) => c.status === 'published');
  const scheduled = MOCK_CONTENTS.filter((c) => c.status === 'scheduled');
  const draft = MOCK_CONTENTS.filter((c) => c.status === 'draft');
  
  const totalLikes = published.reduce((sum, c) => sum + c.likes, 0);
  const totalShares = published.reduce((sum, c) => sum + c.shares, 0);

  return {
    totalContents: MOCK_CONTENTS.length,
    publishedCount: published.length,
    scheduledCount: scheduled.length,
    draftCount: draft.length,
    totalLikes,
    totalShares,
  };
}
