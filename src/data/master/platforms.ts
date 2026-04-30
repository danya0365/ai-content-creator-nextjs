export interface Platform {
  id: string;
  nameEn: string;
  nameTh: string;
  emoji: string;
  descriptionTh: string;
  promptGuidance: string; // Specific instruction for the LLM
}

export const PLATFORMS: Platform[] = [
  {
    id: 'facebook',
    nameEn: 'Facebook',
    nameTh: 'เฟซบุ๊ก',
    emoji: '📘',
    descriptionTh: 'ทั่วไป เล่าเรื่องชวนคุย',
    promptGuidance: 'Format for a Facebook post. Write an engaging, conversational post. Use a few relevant emojis and end with a question to encourage comments. Keep it moderate in length.',
  },
  {
    id: 'twitter',
    nameEn: 'X (Twitter)',
    nameTh: 'ทวิตเตอร์ (X)',
    emoji: '🐦',
    descriptionTh: 'สั้น กระชับ ทันเหตุการณ์',
    promptGuidance: 'Format for a Twitter (X) post. Keep it extremely concise, punchy, and under 250 characters. Use 1-2 trending hashtags. No fluff.',
  },
  {
    id: 'instagram',
    nameEn: 'Instagram',
    nameTh: 'ไอจี',
    emoji: '📸',
    descriptionTh: 'เน้นภาพ แคปชั่นสั้น แฮชแท็กเยอะ',
    promptGuidance: 'Format for an Instagram caption. Focus on aesthetics and visual imagery in the text. Use line breaks. Include 5-10 highly relevant hashtags at the end.',
  },
  {
    id: 'linkedin',
    nameEn: 'LinkedIn',
    nameTh: 'ลิงก์อิน',
    emoji: '💼',
    descriptionTh: 'มืออาชีพ บทเรียน มุมมอง',
    promptGuidance: 'Format for a LinkedIn post. Write in a professional, insightful tone. Structure with clear paragraphs. Focus on business value, career lessons, or industry trends.',
  },
  {
    id: 'tiktok',
    nameEn: 'TikTok',
    nameTh: 'ติ๊กต็อก',
    emoji: '🎵',
    descriptionTh: 'เกาะกระแส ความบันเทิง',
    promptGuidance: 'Format for a TikTok video caption. Make it highly engaging, catchy, and trendy. Encourage viewers to comment and share.',
  }
];

export const getPlatformById = (id: string): Platform => {
  if (!id) return PLATFORMS[0];
  return PLATFORMS.find(p => p.id === id) || PLATFORMS[0];
};
