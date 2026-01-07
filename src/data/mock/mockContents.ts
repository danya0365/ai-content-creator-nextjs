/**
 * Mock Contents Data
 * Sample generated content for development
 * ✅ Single Source of Truth for all Content data
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
  // Unified Content fields
  comments: number;
  tags: string[];
  emoji?: string;
}

export const MOCK_CONTENTS: GeneratedContent[] = [
  // ===== Today - Jan 4, 2026 =====
  {
    id: 'content-001',
    contentTypeId: 'tech-tips',
    title: 'AI Revolution: ChatGPT 5 เปิดตัวแล้ว! 🤖',
    description: 'OpenAI เปิดตัว ChatGPT 5 พร้อมความสามารถใหม่ที่น่าทึ่ง รองรับการประมวลผลวิดีโอแบบ real-time',
    imageUrl: '/mock/tech-ai.png',
    prompt: 'Create a cute pixel art illustration of AI robots. Style: retro 16-bit, cheerful colors.',
    timeSlot: 'morning',
    scheduledAt: '2026-01-04T09:00:00.000Z',
    publishedAt: '2026-01-04T09:30:00.000Z',
    status: 'published',
    likes: 1254,
    shares: 432,
    createdAt: '2026-01-04T09:00:00.000Z',
    comments: 89,
    tags: ['AI', 'ChatGPT', 'Technology'],
    emoji: '🤖',
  },
  {
    id: 'content-002',
    contentTypeId: 'food',
    title: 'เมนูมื้อเที่ยง: ข้าวผัดกะเพราหมูกรอบ 🌶️',
    description: 'วันนี้มาทำเมนูยอดฮิตของคนไทย รสชาติจัดจ้าน หอมกลิ่นกะเพรา',
    imageUrl: '/mock/food-kaprao.png',
    prompt: 'Create a mouth-watering pixel art of Thai basil stir fry. Style: retro 16-bit, vibrant.',
    timeSlot: 'lunch',
    scheduledAt: '2026-01-04T11:00:00.000Z',
    publishedAt: '2026-01-04T12:00:00.000Z',
    status: 'published',
    likes: 892,
    shares: 156,
    createdAt: '2026-01-04T11:00:00.000Z',
    comments: 45,
    tags: ['อาหารไทย', 'ข้าวผัด', 'มื้อเที่ยง'],
    emoji: '🍳',
  },
  {
    id: 'content-003',
    contentTypeId: 'entertainment',
    title: 'สรุปข่าวบันเทิง: ดาราดังประกาศแต่งงาน 💍',
    description: 'คู่รักซุปตาร์เซอร์ไพรส์แฟนคลับ ประกาศวันแต่งงานกลางรายการดัง',
    imageUrl: '/mock/entertainment-wedding.png',
    prompt: 'Create a pixel art of wedding celebration. Style: retro 16-bit, romantic.',
    timeSlot: 'afternoon',
    scheduledAt: '2026-01-04T14:00:00.000Z',
    publishedAt: '2026-01-04T15:00:00.000Z',
    status: 'published',
    likes: 3421,
    shares: 1203,
    createdAt: '2026-01-04T14:00:00.000Z',
    comments: 567,
    tags: ['ดารา', 'บันเทิง', 'งานแต่ง'],
    emoji: '💍',
  },
  {
    id: 'content-004',
    contentTypeId: 'gaming',
    title: 'GTA 6 Trailer ใหม่มาแล้ว! 🎮',
    description: 'Rockstar ปล่อย trailer ใหม่ของ GTA 6 โชว์กราฟิกสุดอลังการ',
    imageUrl: '/mock/gaming-gta6.png',
    prompt: 'Create a pixel art of gaming scene. Style: retro 16-bit, exciting.',
    timeSlot: 'evening',
    scheduledAt: '2026-01-04T20:00:00.000Z',
    publishedAt: null,
    status: 'scheduled',
    likes: 0,
    shares: 0,
    createdAt: '2026-01-04T16:00:00.000Z',
    comments: 0,
    tags: ['GTA6', 'Gaming', 'Rockstar'],
    emoji: '🎮',
  },
  // ===== Yesterday - Jan 3, 2026 =====
  {
    id: 'content-005',
    contentTypeId: 'daily-motivation',
    title: 'คำคมประจำวัน: ความพยายามไม่เคยทรยศ 🌟',
    description: 'เริ่มต้นวันใหม่ด้วยพลังบวก อย่ายอมแพ้กับอุปสรรค',
    imageUrl: '/mock/motivation-sunrise.png',
    prompt: 'Create an inspiring pixel art of sunrise. Style: retro 16-bit, warm and uplifting.',
    timeSlot: 'morning',
    scheduledAt: '2026-01-03T06:00:00.000Z',
    publishedAt: '2026-01-03T07:00:00.000Z',
    status: 'published',
    likes: 2156,
    shares: 543,
    createdAt: '2026-01-03T06:00:00.000Z',
    comments: 123,
    tags: ['Motivation', 'คำคม', 'กำลังใจ'],
    emoji: '💪',
  },
  {
    id: 'content-006',
    contentTypeId: 'tech-tips',
    title: 'รีวิว iPhone 17 Pro Max 📱',
    description: 'ทดสอบ iPhone รุ่นใหม่ล่าสุด กล้องสุดเทพ แบตอึดขึ้น 50%',
    imageUrl: '/mock/tech-iphone.png',
    prompt: 'Create a pixel art of smartphone. Style: retro 16-bit, clean and modern.',
    timeSlot: 'morning',
    scheduledAt: '2026-01-03T10:00:00.000Z',
    publishedAt: '2026-01-03T11:00:00.000Z',
    status: 'published',
    likes: 1876,
    shares: 342,
    createdAt: '2026-01-03T10:00:00.000Z',
    comments: 234,
    tags: ['iPhone', 'Apple', 'Review'],
    emoji: '📱',
  },
  {
    id: 'content-007',
    contentTypeId: 'food',
    title: 'ก๋วยเตี๋ยวเรือ ร้านดังย่านอารีย์ 🍜',
    description: 'พาไปชิมก๋วยเตี๋ยวเรือสูตรดั้งเดิม น้ำซุปเข้มข้น เนื้อนุ่ม',
    imageUrl: '/mock/food-boat-noodle.png',
    prompt: 'Create a pixel art of boat noodles. Style: retro 16-bit, appetizing.',
    timeSlot: 'lunch',
    scheduledAt: '2026-01-03T12:00:00.000Z',
    publishedAt: '2026-01-03T12:30:00.000Z',
    status: 'published',
    likes: 1243,
    shares: 298,
    createdAt: '2026-01-03T12:00:00.000Z',
    comments: 87,
    tags: ['ก๋วยเตี๋ยวเรือ', 'อาหารไทย', 'รีวิว'],
    emoji: '🍜',
  },
  // ===== Jan 2, 2026 =====
  {
    id: 'content-008',
    contentTypeId: 'gaming',
    title: 'Elden Ring DLC: Shadow of the Erdtree 🗡️',
    description: 'รีวิว DLC ใหม่ของ Elden Ring มาพร้อมบอสสุดโหด',
    imageUrl: '/mock/gaming-elden.png',
    prompt: 'Create a pixel art of fantasy game. Style: retro 16-bit, epic.',
    timeSlot: 'evening',
    scheduledAt: '2026-01-02T09:00:00.000Z',
    publishedAt: '2026-01-02T10:00:00.000Z',
    status: 'published',
    likes: 3421,
    shares: 876,
    createdAt: '2026-01-02T09:00:00.000Z',
    comments: 432,
    tags: ['EldenRing', 'Gaming', 'DLC'],
    emoji: '⚔️',
  },
  {
    id: 'content-009',
    contentTypeId: 'morning-news',
    title: 'สรุปข่าวเศรษฐกิจ: SET Index ทำนิวไฮ 📈',
    description: 'ตลาดหุ้นไทยคึกคัก นักลงทุนต่างชาติกลับมาซื้อสุทธิ',
    imageUrl: '/mock/news-stock.png',
    prompt: 'Create a pixel art of stock market. Style: retro 16-bit, professional.',
    timeSlot: 'morning',
    scheduledAt: '2026-01-02T08:00:00.000Z',
    publishedAt: '2026-01-02T09:00:00.000Z',
    status: 'published',
    likes: 654,
    shares: 123,
    createdAt: '2026-01-02T08:00:00.000Z',
    comments: 45,
    tags: ['หุ้น', 'เศรษฐกิจ', 'การลงทุน'],
    emoji: '📈',
  },
  // ===== Jan 1, 2026 - New Year =====
  {
    id: 'content-010',
    contentTypeId: 'entertainment',
    title: 'สวัสดีปีใหม่ 2026! 🎉',
    description: 'ขอให้ปีนี้เป็นปีที่ดี มีความสุข สุขภาพแข็งแรง',
    imageUrl: '/mock/newyear-celebration.png',
    prompt: 'Create a pixel art of new year celebration. Style: retro 16-bit, festive.',
    timeSlot: 'morning',
    scheduledAt: '2026-01-01T00:00:00.000Z',
    publishedAt: '2026-01-01T00:01:00.000Z',
    status: 'published',
    likes: 8765,
    shares: 2345,
    createdAt: '2026-01-01T00:00:00.000Z',
    comments: 1234,
    tags: ['ปีใหม่', 'HappyNewYear', '2026'],
    emoji: '🎊',
  },
  // ===== Drafts =====
  {
    id: 'content-011',
    contentTypeId: 'tech-tips',
    title: 'วิธีหาเงินออนไลน์ในปี 2026 💰',
    description: 'รวมวิธีหาเงินออนไลน์ที่ยังใช้ได้จริง',
    imageUrl: '/mock/money-online.png',
    prompt: 'Create a pixel art of online money. Style: retro 16-bit, inspiring.',
    timeSlot: 'afternoon',
    scheduledAt: '2026-01-06T14:00:00.000Z',
    publishedAt: null,
    status: 'draft',
    likes: 0,
    shares: 0,
    createdAt: '2026-01-04T08:00:00.000Z',
    comments: 0,
    tags: ['Income', 'Online', 'Money'],
    emoji: '💰',
  },
  {
    id: 'content-012',
    contentTypeId: 'entertainment',
    title: 'ซีรีส์ Netflix ที่ต้องดูในเดือนนี้ 📺',
    description: 'รวมซีรีส์ใหม่ที่น่าสนใจบน Netflix',
    imageUrl: '/mock/netflix-series.png',
    prompt: 'Create a pixel art of TV streaming. Style: retro 16-bit, cozy.',
    timeSlot: 'evening',
    scheduledAt: '2026-01-07T19:00:00.000Z',
    publishedAt: null,
    status: 'draft',
    likes: 0,
    shares: 0,
    createdAt: '2026-01-03T15:00:00.000Z',
    comments: 0,
    tags: ['Netflix', 'Series', 'Streaming'],
    emoji: '📺',
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
  const totalComments = published.reduce((sum, c) => sum + c.comments, 0);

  return {
    totalContents: MOCK_CONTENTS.length,
    publishedCount: published.length,
    scheduledCount: scheduled.length,
    draftCount: draft.length,
    totalLikes,
    totalShares,
    totalComments,
  };
}
