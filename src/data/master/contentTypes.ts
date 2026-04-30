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
  typographyGuidance?: string; // Guidance for LLM to put text on the image using FLUX
  contentGuidance?: string; // Guidance for LLM to generate the text content (Viral Hooks, Full Text, etc.)
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
    typographyGuidance: 'Include a clean bold news-style overlay with a headline related to {topic} at the bottom-left.',
    contentGuidance: 'VIRAL STRATEGY: Start with a "BREAKING NEWS" or "DON\'T MISS" hook. Summarize the most impactful part of the news in 1-2 sentences. Use emojis for high engagement.'
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
    typographyGuidance: 'Include the dish name in elegant handwritten font styled as a restaurant logo or menu heading.',
    contentGuidance: 'VIRAL STRATEGY: Start with a "SECRET RECIPE" or "TASTE OF HEAVEN" hook. Focus on the sensory experience (smell, taste, texture). End with a "YUM!" call to action.'
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
    typographyGuidance: 'Include a funny or expressive caption in a speech bubble or 3D floating text styled like social media stickers.',
    contentGuidance: 'VIRAL STRATEGY: Use a "POV" (Point of View) or "WAIT FOR IT" style hook. Keep it short, relatable, and high-energy. Focus on a common funny situation.'
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
    typographyGuidance: 'Include the primary tech keyword in a modern tech-badge or sleek digital font.',
    contentGuidance: 'VIRAL STRATEGY: Start with "PRO TIP" or "THE HIDDEN TRICK". Highlight one specific benefit (Save time, Boost speed). Use clear bullet points for the steps.'
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
    typographyGuidance: 'Include a short inspirational keyword or the main quote text in a beautiful serif font centered with high transparency/artistic integration.',
    contentGuidance: 'VIRAL STRATEGY: Create a "Message for you today" atmosphere. Start with an emotional hook that resonates with current feelings. Keep the main quote central and powerful.'
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
    typographyGuidance: 'Include a vibrant "Level Up" or gaming-style heading related to {topic} in neon/futuristic font.',
    contentGuidance: 'VIRAL STRATEGY: Use high-energy "GAMER ALERT" or "LEVEL UP" hooks. Focus on excitement, competition, or a hot new update. Use gaming slang naturally.'
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
    typographyGuidance: 'The text is the star of this image. Render the FULL Quranic Verse (Ayah) in large, bold, elegant typography centered on the frame, covering 70-80% of the image. The original Arabic/English text should be at the top and the Thai translation prominent at the bottom. Use a high-contrast color (Gold or White). The background must be a subtle, blurred Islamic pattern or a serene scene that does not distract from the text.',
    contentGuidance: 'STRICT REQUIREMENT: You MUST provide the FULL and VERBATIM original Quranic Verse (Ayah) in either Arabic or English, AND the full Thai translation. Do not summarize or paraphrase. Focus on its deep spiritual meaning and reflection.'
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
    typographyGuidance: 'Include the name of the Prophet or the key location related to {topic} in an elegant, respectful font (e.g. "STORY OF PROPHET MUSA (AS)").',
    contentGuidance: 'VIRAL STRATEGY: Use a "THE LESSON OF A PROPHET" or "DID YOU KNOW?" hook. Focus on the emotional and moral weight of the story. Draw a parallel to modern life challenges.'
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
    typographyGuidance: 'The text is the star of this image. Render the FULL Hadith text and its Thai translation in large, clear, and powerful modern typography centered on the frame, covering 70-80% of the screen. Use high-contrast colors (Gold/White text on Dark background). The background should be a subtle, high-quality blurred scenery or minimalist pattern to ensure absolute legibility for sharing.',
    contentGuidance: 'STRICT REQUIREMENT: You MUST provide the FULL and VERBATIM original Hadith text (Prophetic saying) AND the full Thai translation. Include the narrator (Sahabi) and the source (e.g., Al-Bukhari). Do not summarize the core text.'
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
    typographyGuidance: 'Include a bold, dramatic title or a catchy "historical hook" phrase in a cinematic serif font centered at the bottom (e.g. "THE GOLDEN AGE").',
    contentGuidance: 'VIRAL STRATEGY: Use a "THE MOMENT THAT CHANGED EVERYTHING" or "HIDDEN HISTORY" hook. Focus on the awe-inspiring achievements and the glory of the Islamic civilization.'
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
    typographyGuidance: 'Create a minimalist "Spiritual Quote" image. Render the core wisdom or spiritual advice in large, elegant, and artistic serif font centered on the canvas. The background should be soft, artistic watercolor with lots of negative space, allowing the typography to be the primary focal point of the image.',
    contentGuidance: 'VIRAL STRATEGY: Create a "Heart-Healing" atmosphere. Use a hook that addresses common struggles like anxiety or stress. Provide spiritual "GPS" for the soul based on pious predecessors.'
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
