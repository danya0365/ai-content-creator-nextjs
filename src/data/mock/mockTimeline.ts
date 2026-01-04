/**
 * Mock Timeline Data
 * Rich timeline data for development and demo
 */

export type TimelineCategory = 
  | 'news'
  | 'entertainment'
  | 'food'
  | 'gaming'
  | 'tech'
  | 'motivation'
  | 'lifestyle'
  | 'education';

export type TimelineStatus = 'published' | 'scheduled' | 'draft';

export interface TimelineEntry {
  id: string;
  title: string;
  description: string;
  category: TimelineCategory;
  emoji: string;
  status: TimelineStatus;
  createdAt: string;
  publishedAt: string | null;
  scheduledAt: string | null;
  likes: number;
  shares: number;
  comments: number;
  imageUrl?: string;
  tags: string[];
}

// Category configurations
export const TIMELINE_CATEGORIES: Record<TimelineCategory, { label: string; labelTh: string; emoji: string; color: string }> = {
  news: { label: 'News', labelTh: 'ข่าวสาร', emoji: '📰', color: 'from-blue-500 to-cyan-500' },
  entertainment: { label: 'Entertainment', labelTh: 'บันเทิง', emoji: '🎬', color: 'from-pink-500 to-rose-500' },
  food: { label: 'Food', labelTh: 'อาหาร', emoji: '🍜', color: 'from-orange-500 to-amber-500' },
  gaming: { label: 'Gaming', labelTh: 'เกม', emoji: '🎮', color: 'from-purple-500 to-indigo-500' },
  tech: { label: 'Tech', labelTh: 'เทคโนโลยี', emoji: '💻', color: 'from-emerald-500 to-teal-500' },
  motivation: { label: 'Motivation', labelTh: 'กำลังใจ', emoji: '💪', color: 'from-yellow-500 to-orange-500' },
  lifestyle: { label: 'Lifestyle', labelTh: 'ไลฟ์สไตล์', emoji: '✨', color: 'from-violet-500 to-fuchsia-500' },
  education: { label: 'Education', labelTh: 'ความรู้', emoji: '📚', color: 'from-sky-500 to-blue-500' },
};

// Rich mock data - 25+ entries
export const MOCK_TIMELINE: TimelineEntry[] = [
  // Today - Jan 4, 2026
  {
    id: 'tl-001',
    title: 'AI Revolution: ChatGPT 5 เปิดตัวแล้ว! 🤖',
    description: 'OpenAI เปิดตัว ChatGPT 5 พร้อมความสามารถใหม่ที่น่าทึ่ง รองรับการประมวลผลวิดีโอแบบ real-time',
    category: 'tech',
    emoji: '🤖',
    status: 'published',
    createdAt: '2026-01-04T09:00:00.000Z',
    publishedAt: '2026-01-04T09:30:00.000Z',
    scheduledAt: null,
    likes: 1254,
    shares: 432,
    comments: 89,
    tags: ['AI', 'ChatGPT', 'Technology'],
  },
  {
    id: 'tl-002',
    title: 'เมนูมื้อเที่ยง: ข้าวผัดกะเพราหมูกรอบ 🌶️',
    description: 'วันนี้มาทำเมนูยอดฮิตของคนไทย รสชาติจัดจ้าน หอมกลิ่นกะเพรา',
    category: 'food',
    emoji: '🍳',
    status: 'published',
    createdAt: '2026-01-04T11:00:00.000Z',
    publishedAt: '2026-01-04T12:00:00.000Z',
    scheduledAt: null,
    likes: 892,
    shares: 156,
    comments: 45,
    tags: ['อาหารไทย', 'ข้าวผัด', 'มื้อเที่ยง'],
  },
  {
    id: 'tl-003',
    title: 'สรุปข่าวบันเทิง: ดาราดังประกาศแต่งงาน 💍',
    description: 'คู่รักซุปตาร์เซอร์ไพรส์แฟนคลับ ประกาศวันแต่งงานกลางรายการดัง',
    category: 'entertainment',
    emoji: '💍',
    status: 'published',
    createdAt: '2026-01-04T14:00:00.000Z',
    publishedAt: '2026-01-04T15:00:00.000Z',
    scheduledAt: null,
    likes: 3421,
    shares: 1203,
    comments: 567,
    tags: ['ดารา', 'บันเทิง', 'งานแต่ง'],
  },
  {
    id: 'tl-004',
    title: 'GTA 6 Trailer ใหม่มาแล้ว! 🎮',
    description: 'Rockstar ปล่อย trailer ใหม่ของ GTA 6 โชว์กราฟิกสุดอลังการ',
    category: 'gaming',
    emoji: '🎮',
    status: 'scheduled',
    createdAt: '2026-01-04T16:00:00.000Z',
    publishedAt: null,
    scheduledAt: '2026-01-04T20:00:00.000Z',
    likes: 0,
    shares: 0,
    comments: 0,
    tags: ['GTA6', 'Gaming', 'Rockstar'],
  },
  // Yesterday - Jan 3, 2026
  {
    id: 'tl-005',
    title: 'คำคมประจำวัน: ความพยายามไม่เคยทรยศ 🌟',
    description: 'เริ่มต้นวันใหม่ด้วยพลังบวก อย่ายอมแพ้กับอุปสรรค',
    category: 'motivation',
    emoji: '💪',
    status: 'published',
    createdAt: '2026-01-03T06:00:00.000Z',
    publishedAt: '2026-01-03T07:00:00.000Z',
    scheduledAt: null,
    likes: 2156,
    shares: 543,
    comments: 123,
    tags: ['Motivation', 'คำคม', 'กำลังใจ'],
  },
  {
    id: 'tl-006',
    title: 'รีวิว iPhone 17 Pro Max 📱',
    description: 'ทดสอบ iPhone รุ่นใหม่ล่าสุด กล้องสุดเทพ แบตอึดขึ้น 50%',
    category: 'tech',
    emoji: '📱',
    status: 'published',
    createdAt: '2026-01-03T10:00:00.000Z',
    publishedAt: '2026-01-03T11:00:00.000Z',
    scheduledAt: null,
    likes: 1876,
    shares: 342,
    comments: 234,
    tags: ['iPhone', 'Apple', 'Review'],
  },
  {
    id: 'tl-007',
    title: 'ก๋วยเตี๋ยวเรือ ร้านดังย่านอารีย์ 🍜',
    description: 'พาไปชิมก๋วยเตี๋ยวเรือสูตรดั้งเดิม น้ำซุปเข้มข้น เนื้อนุ่ม',
    category: 'food',
    emoji: '🍜',
    status: 'published',
    createdAt: '2026-01-03T12:00:00.000Z',
    publishedAt: '2026-01-03T12:30:00.000Z',
    scheduledAt: null,
    likes: 1243,
    shares: 298,
    comments: 87,
    tags: ['ก๋วยเตี๋ยวเรือ', 'อาหารไทย', 'รีวิว'],
  },
  {
    id: 'tl-008',
    title: 'วิธีจัดห้องทำงานให้ Productive 🏠',
    description: 'เคล็ดลับการจัดโต๊ะทำงาน ให้โฟกัสได้ดีขึ้น ทำงานได้เร็วขึ้น',
    category: 'lifestyle',
    emoji: '🏠',
    status: 'published',
    createdAt: '2026-01-03T14:00:00.000Z',
    publishedAt: '2026-01-03T15:00:00.000Z',
    scheduledAt: null,
    likes: 987,
    shares: 234,
    comments: 56,
    tags: ['Lifestyle', 'WFH', 'Productivity'],
  },
  // Jan 2, 2026
  {
    id: 'tl-009',
    title: 'Elden Ring DLC: Shadow of the Erdtree 🗡️',
    description: 'รีวิว DLC ใหม่ของ Elden Ring มาพร้อมบอสสุดโหด',
    category: 'gaming',
    emoji: '⚔️',
    status: 'published',
    createdAt: '2026-01-02T09:00:00.000Z',
    publishedAt: '2026-01-02T10:00:00.000Z',
    scheduledAt: null,
    likes: 3421,
    shares: 876,
    comments: 432,
    tags: ['EldenRing', 'Gaming', 'DLC'],
  },
  {
    id: 'tl-010',
    title: 'สรุปข่าวเศรษฐกิจ: SET Index ทำนิวไฮ 📈',
    description: 'ตลาดหุ้นไทยคึกคัก นักลงทุนต่างชาติกลับมาซื้อสุทธิ',
    category: 'news',
    emoji: '📈',
    status: 'published',
    createdAt: '2026-01-02T08:00:00.000Z',
    publishedAt: '2026-01-02T09:00:00.000Z',
    scheduledAt: null,
    likes: 654,
    shares: 123,
    comments: 45,
    tags: ['หุ้น', 'เศรษฐกิจ', 'การลงทุน'],
  },
  {
    id: 'tl-011',
    title: 'เรียนรู้ Python ใน 30 วัน 🐍',
    description: 'คอร์สเรียน Python สำหรับมือใหม่ เข้าใจง่าย ทำตามได้',
    category: 'education',
    emoji: '🐍',
    status: 'published',
    createdAt: '2026-01-02T13:00:00.000Z',
    publishedAt: '2026-01-02T14:00:00.000Z',
    scheduledAt: null,
    likes: 2341,
    shares: 567,
    comments: 189,
    tags: ['Python', 'Programming', 'Education'],
  },
  {
    id: 'tl-012',
    title: 'อาหารคลีน: สลัดอกไก่ย่าง 🥗',
    description: 'เมนูสุขภาพ โปรตีนสูง แคลอรี่ต่ำ เหมาะกับคนลดน้ำหนัก',
    category: 'food',
    emoji: '🥗',
    status: 'published',
    createdAt: '2026-01-02T11:00:00.000Z',
    publishedAt: '2026-01-02T12:00:00.000Z',
    scheduledAt: null,
    likes: 1567,
    shares: 345,
    comments: 78,
    tags: ['CleanFood', 'สุขภาพ', 'ลดน้ำหนัก'],
  },
  // Jan 1, 2026 - New Year
  {
    id: 'tl-013',
    title: 'สวัสดีปีใหม่ 2026! 🎉',
    description: 'ขอให้ปีนี้เป็นปีที่ดี มีความสุข สุขภาพแข็งแรง',
    category: 'lifestyle',
    emoji: '🎊',
    status: 'published',
    createdAt: '2026-01-01T00:00:00.000Z',
    publishedAt: '2026-01-01T00:01:00.000Z',
    scheduledAt: null,
    likes: 8765,
    shares: 2345,
    comments: 1234,
    tags: ['ปีใหม่', 'HappyNewYear', '2026'],
  },
  {
    id: 'tl-014',
    title: 'New Year Resolution: ตั้งเป้าหมายปี 2026 🎯',
    description: 'วิธีตั้งเป้าหมายที่ทำได้จริง ไม่พังกลางปี',
    category: 'motivation',
    emoji: '🎯',
    status: 'published',
    createdAt: '2026-01-01T08:00:00.000Z',
    publishedAt: '2026-01-01T09:00:00.000Z',
    scheduledAt: null,
    likes: 4532,
    shares: 987,
    comments: 321,
    tags: ['NewYear', 'Resolution', 'Goals'],
  },
  {
    id: 'tl-015',
    title: 'พลุปีใหม่ทั่วโลก 2026 🎆',
    description: 'รวมภาพพลุปีใหม่สวยๆ จากทั่วโลก ตั้งแต่ซิดนีย์จน NYC',
    category: 'news',
    emoji: '🎆',
    status: 'published',
    createdAt: '2026-01-01T01:00:00.000Z',
    publishedAt: '2026-01-01T02:00:00.000Z',
    scheduledAt: null,
    likes: 5678,
    shares: 1234,
    comments: 456,
    tags: ['ปีใหม่', 'Fireworks', 'Celebration'],
  },
  // Dec 31, 2025
  {
    id: 'tl-016',
    title: 'Countdown Party 2026 🥳',
    description: 'รวมปาร์ตี้เคาท์ดาวน์ทั่วกรุงเทพ ไปฉลองที่ไหนดี?',
    category: 'entertainment',
    emoji: '🥳',
    status: 'published',
    createdAt: '2025-12-31T10:00:00.000Z',
    publishedAt: '2025-12-31T11:00:00.000Z',
    scheduledAt: null,
    likes: 3456,
    shares: 876,
    comments: 234,
    tags: ['Countdown', 'Party', 'NewYear'],
  },
  {
    id: 'tl-017',
    title: 'สรุปเกมแห่งปี 2025 🏆',
    description: 'รวมเกมที่ดีที่สุดในปี 2025 ทั้ง Action, RPG, Indie',
    category: 'gaming',
    emoji: '🏆',
    status: 'published',
    createdAt: '2025-12-31T14:00:00.000Z',
    publishedAt: '2025-12-31T15:00:00.000Z',
    scheduledAt: null,
    likes: 4321,
    shares: 765,
    comments: 543,
    tags: ['GOTY', 'Gaming', 'BestOf2025'],
  },
  // Dec 30, 2025
  {
    id: 'tl-018',
    title: 'Tech Wrap-up 2025: สรุปเทคโนโลยีแห่งปี 💡',
    description: 'รวมนวัตกรรมเด่นปี 2025 ตั้งแต่ AI จนถึง Quantum Computing',
    category: 'tech',
    emoji: '💡',
    status: 'published',
    createdAt: '2025-12-30T09:00:00.000Z',
    publishedAt: '2025-12-30T10:00:00.000Z',
    scheduledAt: null,
    likes: 2876,
    shares: 543,
    comments: 187,
    tags: ['Tech', '2025', 'Innovation'],
  },
  {
    id: 'tl-019',
    title: 'เมนูปีใหม่: หมูหัน สูตรกรอบนอกนุ่มใน 🐷',
    description: 'ทำหมูหันเองที่บ้าน อร่อยไม่แพ้ร้านดัง',
    category: 'food',
    emoji: '🐷',
    status: 'published',
    createdAt: '2025-12-30T11:00:00.000Z',
    publishedAt: '2025-12-30T12:00:00.000Z',
    scheduledAt: null,
    likes: 2134,
    shares: 456,
    comments: 123,
    tags: ['หมูหัน', 'ปีใหม่', 'อาหาร'],
  },
  // Dec 29, 2025
  {
    id: 'tl-020',
    title: '5 ทักษะต้องมีในปี 2026 🚀',
    description: 'ทักษะที่จะช่วยให้คุณโดดเด่นในตลาดงานปีหน้า',
    category: 'education',
    emoji: '🚀',
    status: 'published',
    createdAt: '2025-12-29T10:00:00.000Z',
    publishedAt: '2025-12-29T11:00:00.000Z',
    scheduledAt: null,
    likes: 3567,
    shares: 876,
    comments: 234,
    tags: ['Skills', 'Career', '2026'],
  },
  {
    id: 'tl-021',
    title: 'ละครดังส่งท้ายปี: สรุปฉากเด็ด 📺',
    description: 'รวมฉากที่คนดูเยอะที่สุดในปี 2025',
    category: 'entertainment',
    emoji: '📺',
    status: 'published',
    createdAt: '2025-12-29T18:00:00.000Z',
    publishedAt: '2025-12-29T19:00:00.000Z',
    scheduledAt: null,
    likes: 4532,
    shares: 1234,
    comments: 567,
    tags: ['ละคร', 'บันเทิง', 'Viral'],
  },
  // Dec 28, 2025
  {
    id: 'tl-022',
    title: 'Morning Yoga: เริ่มต้นเช้าด้วยโยคะ 🧘',
    description: 'ท่าโยคะง่ายๆ 10 นาที ช่วยให้ร่างกายสดชื่น',
    category: 'lifestyle',
    emoji: '🧘',
    status: 'published',
    createdAt: '2025-12-28T06:00:00.000Z',
    publishedAt: '2025-12-28T07:00:00.000Z',
    scheduledAt: null,
    likes: 1876,
    shares: 432,
    comments: 89,
    tags: ['Yoga', 'Morning', 'Wellness'],
  },
  {
    id: 'tl-023',
    title: 'สรุปข่าวโลก: เหตุการณ์สำคัญปี 2025 🌍',
    description: 'ย้อนดูเหตุการณ์ที่เปลี่ยนโลกในปี 2025',
    category: 'news',
    emoji: '🌍',
    status: 'published',
    createdAt: '2025-12-28T08:00:00.000Z',
    publishedAt: '2025-12-28T09:00:00.000Z',
    scheduledAt: null,
    likes: 2345,
    shares: 567,
    comments: 234,
    tags: ['WorldNews', '2025', 'Recap'],
  },
  // Upcoming scheduled
  {
    id: 'tl-024',
    title: 'คาเฟ่ลับย่านเอกมัย ☕',
    description: 'พาไปนั่งชิลคาเฟ่ใหม่ บรรยากาศดี กาแฟอร่อย',
    category: 'lifestyle',
    emoji: '☕',
    status: 'scheduled',
    createdAt: '2026-01-04T10:00:00.000Z',
    publishedAt: null,
    scheduledAt: '2026-01-05T09:00:00.000Z',
    likes: 0,
    shares: 0,
    comments: 0,
    tags: ['Cafe', 'เอกมัย', 'กาแฟ'],
  },
  {
    id: 'tl-025',
    title: 'รีวิว PS5 Pro: คุ้มไหม? 🎮',
    description: 'ทดสอบ PS5 Pro ในปี 2026 ยังน่าซื้ออยู่ไหม?',
    category: 'gaming',
    emoji: '🎮',
    status: 'scheduled',
    createdAt: '2026-01-04T11:00:00.000Z',
    publishedAt: null,
    scheduledAt: '2026-01-05T15:00:00.000Z',
    likes: 0,
    shares: 0,
    comments: 0,
    tags: ['PS5Pro', 'PlayStation', 'Gaming'],
  },
  // Drafts
  {
    id: 'tl-026',
    title: 'วิธีหาเงินออนไลน์ในปี 2026 💰',
    description: 'รวมวิธีหาเงินออนไลน์ที่ยังใช้ได้จริง',
    category: 'education',
    emoji: '💰',
    status: 'draft',
    createdAt: '2026-01-04T08:00:00.000Z',
    publishedAt: null,
    scheduledAt: null,
    likes: 0,
    shares: 0,
    comments: 0,
    tags: ['Income', 'Online', 'Money'],
  },
  {
    id: 'tl-027',
    title: 'ซีรีส์ Netflix ที่ต้องดูในเดือนนี้ 📺',
    description: 'รวมซีรีส์ใหม่ที่น่าสนใจบน Netflix',
    category: 'entertainment',
    emoji: '📺',
    status: 'draft',
    createdAt: '2026-01-03T15:00:00.000Z',
    publishedAt: null,
    scheduledAt: null,
    likes: 0,
    shares: 0,
    comments: 0,
    tags: ['Netflix', 'Series', 'Streaming'],
  },
];

/**
 * Get all timeline categories
 */
export function getTimelineCategories(): TimelineCategory[] {
  return Object.keys(TIMELINE_CATEGORIES) as TimelineCategory[];
}

/**
 * Get timeline entries by category
 */
export function getTimelineByCategory(category: TimelineCategory): TimelineEntry[] {
  return MOCK_TIMELINE.filter((entry) => entry.category === category);
}

/**
 * Get timeline entries by status
 */
export function getTimelineByStatus(status: TimelineStatus): TimelineEntry[] {
  return MOCK_TIMELINE.filter((entry) => entry.status === status);
}

/**
 * Group timeline entries by date
 */
export function groupTimelineByDate(entries: TimelineEntry[]): Map<string, TimelineEntry[]> {
  const grouped = new Map<string, TimelineEntry[]>();
  
  // Sort by date descending
  const sorted = [...entries].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  sorted.forEach((entry) => {
    const dateKey = entry.createdAt.split('T')[0];
    if (!grouped.has(dateKey)) {
      grouped.set(dateKey, []);
    }
    grouped.get(dateKey)!.push(entry);
  });
  
  return grouped;
}

/**
 * Get timeline stats
 */
export function getTimelineStats() {
  const published = MOCK_TIMELINE.filter((e) => e.status === 'published');
  const scheduled = MOCK_TIMELINE.filter((e) => e.status === 'scheduled');
  const draft = MOCK_TIMELINE.filter((e) => e.status === 'draft');
  
  return {
    total: MOCK_TIMELINE.length,
    published: published.length,
    scheduled: scheduled.length,
    draft: draft.length,
    totalLikes: published.reduce((sum, e) => sum + e.likes, 0),
    totalShares: published.reduce((sum, e) => sum + e.shares, 0),
    totalComments: published.reduce((sum, e) => sum + e.comments, 0),
  };
}
