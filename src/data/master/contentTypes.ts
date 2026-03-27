/**
 * Content Types Master Data
 * Defines the types of content that can be generated
 */

export type TimeSlot = 'morning' | 'lunch' | 'afternoon' | 'evening';

export interface TimeSlotConfig {
  id: TimeSlot;
  name: string;
  nameTh: string;
  startHour: number;
  endHour: number;
  emoji: string;
}

export interface ContentType {
  id: string;
  name: string;
  nameTh: string;
  description: string;
  descriptionTh: string;
  suggestedTimeSlots: TimeSlot[];
  promptTemplate: string;
  icon: string;
  color: string;
  category: 'general' | 'islamic';
  imageStyle?: string; // Preferred image style ID from imageStyles.ts
}

export const TIME_SLOTS: TimeSlotConfig[] = [
  {
    id: 'morning',
    name: 'Morning',
    nameTh: 'ตอนเช้า',
    startHour: 6,
    endHour: 9,
    emoji: '🌅',
  },
  {
    id: 'lunch',
    name: 'Lunch',
    nameTh: 'ตอนเที่ยง',
    startHour: 11,
    endHour: 14,
    emoji: '🍱',
  },
  {
    id: 'afternoon',
    name: 'Afternoon',
    nameTh: 'ตอนบ่าย',
    startHour: 14,
    endHour: 18,
    emoji: '☀️',
  },
  {
    id: 'evening',
    name: 'Evening',
    nameTh: 'ตอนเย็น',
    startHour: 18,
    endHour: 22,
    emoji: '🌙',
  },
];

export const CONTENT_TYPES: ContentType[] = [
  {
    id: 'morning-news',
    name: 'Morning News Summary',
    nameTh: 'สรุปข่าวเช้า',
    description: 'Concise summary of morning news with high-quality visualization',
    descriptionTh: 'สรุปข่าวเช้าพร้อมภาพประกอบคุณภาพสูง',
    suggestedTimeSlots: ['morning'],
    promptTemplate: "Create a cinematic high-quality illustration summarizing today's news: {topic}.",
    icon: '📰',
    color: '#FFB347',
    category: 'general',
    imageStyle: 'realistic',
  },
  {
    id: 'food',
    name: 'Food & Recipe',
    nameTh: 'อาหารและสูตร',
    description: 'Delicious food photography and recipes',
    descriptionTh: 'รูปอาหารและสูตรอาหารที่น่ากิน',
    suggestedTimeSlots: ['lunch'],
    promptTemplate: 'Create a mouth-watering professional photograph of {food}.',
    icon: '🍜',
    color: '#FF6B6B',
    category: 'general',
    imageStyle: 'realistic',
  },
  {
    id: 'entertainment',
    name: 'Entertainment & Jokes',
    nameTh: 'ความบันเทิงและมุกตลก',
    description: 'Funny and entertaining visual stories',
    descriptionTh: 'คอนเทนต์ความบันเทิงและมุกตลก',
    suggestedTimeSlots: ['afternoon', 'evening'],
    promptTemplate: 'Create an expressive and entertaining 3D render scene about: {joke}.',
    icon: '😂',
    color: '#C9B1FF',
    category: 'general',
    imageStyle: '3d-render',
  },
  {
    id: 'tech-tips',
    name: 'Tech Tips',
    nameTh: 'เคล็ดลับเทคโนโลยี',
    description: 'Useful tech tips with clean modern visualization',
    descriptionTh: 'เคล็ดลับเทคโนโลยีพร้อมรูปประกอบสไตล์มินิมอล',
    suggestedTimeSlots: ['afternoon'],
    promptTemplate: 'Create a clean minimalist illustration for this tech tip: {tip}.',
    icon: '💻',
    color: '#4ECDC4',
    category: 'general',
    imageStyle: 'minimalist',
  },
  {
    id: 'daily-motivation',
    name: 'Daily Motivation',
    nameTh: 'คำคมประจำวัน',
    description: 'Inspirational quotes with beautiful artistic background',
    descriptionTh: 'คำคมสร้างแรงบันาลใจพร้อมรูปประกอบสวยงาม',
    suggestedTimeSlots: ['morning', 'evening'],
    promptTemplate: 'Create an inspiring and beautiful artistic scene for the quote: "{quote}".',
    icon: '✨',
    color: '#45B7D1',
    category: 'general',
    imageStyle: 'watercolor',
  },
  {
    id: 'gaming',
    name: 'Gaming Content',
    nameTh: 'คอนเทนต์เกม',
    description: 'Gaming news and tips with vibrant 3D visuals',
    descriptionTh: 'ข่าวและเคล็ดลับเกมพร้อมภาพ 3D สุดล้ำ',
    suggestedTimeSlots: ['evening'],
    promptTemplate: 'Create a vibrant high-quality 3D scene about gaming: {topic}.',
    icon: '🎮',
    color: '#96CEB4',
    category: 'general',
    imageStyle: '3d-render',
  },
  // ==========================================
  // Islamic Content Category
  // ==========================================
  {
    id: 'islamic-quran',
    name: 'Quranic Reflection',
    nameTh: 'อัลกุรอานและการเตือนสติ',
    description: 'Daily Quranic verse with beautiful reflection',
    descriptionTh: 'ข้อคิดจากอัลกุรอานและคำแปลพร้อมภาพประกอบที่สงบ',
    suggestedTimeSlots: ['morning'],
    promptTemplate: 'Create a serene and beautiful Islamic scene for the Quranic verse: {topic}. Elegant Islamic art style with peaceful atmosphere.',
    icon: '📖',
    color: '#059669',
    category: 'islamic',
    imageStyle: 'realistic',
  },
  {
    id: 'islamic-seerah',
    name: 'Prophetic Stories',
    nameTh: 'ประวัตินบี',
    description: 'Life lessons from Prophetic biographies with peaceful art',
    descriptionTh: 'บทเรียนชีวิตจากจริยวัตรของท่านนบีพร้อมภาพที่งดงาม',
    suggestedTimeSlots: ['morning'],
    promptTemplate: 'Create an inspiring and majestic Islamic scene about this Prophetic story: {topic}. Professional artistic style.',
    icon: '🌟',
    color: '#10B981',
    category: 'islamic',
    imageStyle: 'realistic',
  },
  {
    id: 'islamic-hadith',
    name: 'Daily Hadith',
    nameTh: 'ฮะดีซประจำวัน',
    description: 'Prophetic teachings with elegant visualization',
    descriptionTh: 'คำสอนของท่านนบีพร้อมภาพประกอบที่ทรงพลัง',
    suggestedTimeSlots: ['lunch'],
    promptTemplate: 'Create an elegant and insightful Islamic illustration about this Hadith: {topic}. Clean and modern artistic style.',
    icon: '📿',
    color: '#34D399',
    category: 'islamic',
    imageStyle: 'realistic',
  },
  {
    id: 'islamic-history',
    name: 'Islamic History',
    nameTh: 'ประวัติศาสตร์อิสลาม',
    description: 'Key events from Islamic history with epic visuals',
    descriptionTh: 'เหตุการณ์สำคัญทางประวัติศาสตร์พร้อมภาพที่ทรงพลัง',
    suggestedTimeSlots: ['evening'],
    promptTemplate: 'Create an epic and historical scene about this event in Islamic history: {topic}. Majestic cinematic style.',
    icon: '🕌',
    color: '#6EE7B7',
    category: 'islamic',
    imageStyle: 'realistic',
  },
  {
    id: 'islamic-wisdom',
    name: 'Islamic Wisdom',
    nameTh: 'ข้อคิด/คำคมอิสลาม',
    description: 'Spiritual advice with soft artistic visuals',
    descriptionTh: 'คติเตือนใจจากศาสนาอิสลามพร้อมภาพประกอบที่อ่อนโยน',
    suggestedTimeSlots: ['evening'],
    promptTemplate: 'Create a peaceful and spiritual watercolor-style Islamic art for this wisdom: {topic}. Elegant and refined.',
    icon: '✨',
    color: '#A7F3D0',
    category: 'islamic',
    imageStyle: 'watercolor',
  },
];

/**
 * Get content types by time slot
 */
export function getContentTypesByTimeSlot(timeSlot: TimeSlot): ContentType[] {
  return CONTENT_TYPES.filter((type) =>
    type.suggestedTimeSlots.includes(timeSlot)
  );
}

/**
 * Get current time slot based on hour
 */
export function getCurrentTimeSlot(): TimeSlotConfig | null {
  const currentHour = new Date().getHours();
  return (
    TIME_SLOTS.find(
      (slot) => currentHour >= slot.startHour && currentHour < slot.endHour
    ) || null
  );
}

/**
 * Get content type by ID
 */
export function getContentTypeById(id: string): ContentType | undefined {
  return CONTENT_TYPES.find((type) => type.id === id);
}
