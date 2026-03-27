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
    description: 'Cute pixel art summarizing morning news',
    descriptionTh: 'สรุปข่าวเช้าพร้อมรูป pixel art น่ารักๆ',
    suggestedTimeSlots: ['morning'],
    promptTemplate: "Create a cute pixel art illustration summarizing today's news: {topic}. Style: retro 16-bit, cheerful colors.",
    icon: '📰',
    color: '#FFB347',
    category: 'general',
  },
  {
    id: 'food',
    name: 'Food & Recipe',
    nameTh: 'อาหารและสูตร',
    description: 'Delicious pixel art food illustrations',
    descriptionTh: 'รูปอาหาร pixel art น่ากิน',
    suggestedTimeSlots: ['lunch'],
    promptTemplate: 'Create a mouth-watering pixel art of {food}. Style: retro 16-bit, vibrant and appetizing.',
    icon: '🍜',
    color: '#FF6B6B',
    category: 'general',
  },
  {
    id: 'entertainment',
    name: 'Entertainment & Jokes',
    nameTh: 'ความบันเทิงและมุกตลก',
    description: 'Funny and entertaining pixel art content',
    descriptionTh: 'คอนเทนต์ตลกๆ และสนุกสนาน',
    suggestedTimeSlots: ['afternoon', 'evening'],
    promptTemplate: 'Create a funny pixel art scene about: {joke}. Style: retro 16-bit, expressive characters.',
    icon: '😂',
    color: '#C9B1FF',
    category: 'general',
  },
  {
    id: 'tech-tips',
    name: 'Tech Tips',
    nameTh: 'เคล็ดลับเทคโนโลยี',
    description: 'Useful tech tips with pixel art visualization',
    descriptionTh: 'เคล็ดลับเทคโนโลยีพร้อมรูป pixel art',
    suggestedTimeSlots: ['afternoon'],
    promptTemplate: 'Create a pixel art illustration explaining: {tip}. Style: retro 16-bit, clean and informative.',
    icon: '💻',
    color: '#4ECDC4',
    category: 'general',
  },
  {
    id: 'daily-motivation',
    name: 'Daily Motivation',
    nameTh: 'คำคมประจำวัน',
    description: 'Inspirational quotes with pixel art',
    descriptionTh: 'คำคมสร้างแรงบันาลใจพร้อม pixel art',
    suggestedTimeSlots: ['morning', 'evening'],
    promptTemplate: 'Create an inspiring pixel art scene for the quote: "{quote}". Style: retro 16-bit, warm and uplifting.',
    icon: '✨',
    color: '#45B7D1',
    category: 'general',
  },
  {
    id: 'gaming',
    name: 'Gaming Content',
    nameTh: 'คอนเทนต์เกม',
    description: 'Gaming news and tips in pixel art style',
    descriptionTh: 'ข่าวและเคล็ดลับเกมแบบ pixel art',
    suggestedTimeSlots: ['evening'],
    promptTemplate: 'Create a pixel art scene about gaming: {topic}. Style: retro 16-bit, nostalgic gaming vibes.',
    icon: '🎮',
    color: '#96CEB4',
    category: 'general',
  },
  // ==========================================
  // Islamic Content Category
  // ==========================================
  {
    id: 'islamic-quran',
    name: 'Quranic Reflection',
    nameTh: 'อัลกุรอานและการเตือนสติ',
    description: 'Daily Quranic verse with reflection',
    descriptionTh: 'ข้อคิดจากอัลกุรอานและคำแปล',
    suggestedTimeSlots: ['morning'],
    promptTemplate: 'Create a serene Islamic pixel art with Quranic verse: {topic}. Style: respectful, green and gold accents.',
    icon: '📖',
    color: '#059669',
    category: 'islamic',
  },
  {
    id: 'islamic-seerah',
    name: 'Prophetic Stories',
    nameTh: 'ประวัตินบี',
    description: 'Life lessons from Prophetic biographies',
    descriptionTh: 'บทเรียนชีวิตจากจริยวัตรของท่านนบี',
    suggestedTimeSlots: ['morning'],
    promptTemplate: 'Create an inspiring Islamic pixel art about Prophet story: {topic}. Style: retro 16-bit, educational and peaceful.',
    icon: '🌟',
    color: '#10B981',
    category: 'islamic',
  },
  {
    id: 'islamic-hadith',
    name: 'Daily Hadith',
    nameTh: 'ฮะดีซประจำวัน',
    description: 'Prophetic teachings and examples',
    descriptionTh: 'คำสอนและแบบอย่างจากท่านนบี',
    suggestedTimeSlots: ['lunch'],
    promptTemplate: 'Create an educational Islamic pixel art about Hadith: {topic}. Style: retro 16-bit, clean and insightful.',
    icon: '📿',
    color: '#34D399',
    category: 'islamic',
  },
  {
    id: 'islamic-history',
    name: 'Islamic History',
    nameTh: 'ประวัติศาสตร์อิสลาม',
    description: 'Key events and knowledge from history',
    descriptionTh: 'ความรู้และเหตุการณ์สำคัญทางประวัติศาสตร์',
    suggestedTimeSlots: ['evening'],
    promptTemplate: 'Create a historical Islamic pixel art about: {topic}. Style: retro 16-bit, informative and noble.',
    icon: '🕌',
    color: '#6EE7B7',
    category: 'islamic',
  },
  {
    id: 'islamic-wisdom',
    name: 'Islamic Wisdom',
    nameTh: 'ข้อคิด/คำคมอิสลาม',
    description: 'Spiritual advice for daily life',
    descriptionTh: 'คติเตือนใจจากศาสนาอิสลาม',
    suggestedTimeSlots: ['evening'],
    promptTemplate: 'Create a peaceful Islamic pixel art for wisdom: {topic}. Style: warm, spiritual, simplified pixel art.',
    icon: '✨',
    color: '#A7F3D0',
    category: 'islamic',
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
