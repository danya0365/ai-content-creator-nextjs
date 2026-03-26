export interface ToneOfVoice {
  id: string;
  nameEn: string;
  nameTh: string;
  emoji: string;
  promptModifier: string; // How to instruct the LLM
}

export const TONE_OF_VOICE: ToneOfVoice[] = [
  {
    id: 'casual',
    nameEn: 'Casual',
    nameTh: 'เป็นกันเอง',
    emoji: '😊',
    promptModifier: 'Tone: strictly casual, friendly, and conversational like talking to a close friend.',
  },
  {
    id: 'professional',
    nameEn: 'Professional',
    nameTh: 'ทางการ/มืออาชีพ',
    emoji: '👔',
    promptModifier: 'Tone: highly professional, formal, polite, and authoritative. Use clear and business-appropriate vocabulary.',
  },
  {
    id: 'funny',
    nameEn: 'Funny',
    nameTh: 'ตลกขบขัน',
    emoji: '😂',
    promptModifier: 'Tone: very funny, humorous, playful, and witty. Use jokes or lighthearted remarks.',
  },
  {
    id: 'sarcastic',
    nameEn: 'Sarcastic',
    nameTh: 'กวนๆ/ประชด',
    emoji: '😏',
    promptModifier: 'Tone: sarcastic, edgy, cheeky, and slightly provocative. Use irony or dry humor without being offensive.',
  },
  {
    id: 'inspiring',
    nameEn: 'Inspiring',
    nameTh: 'สร้างแรงบันดาลใจ',
    emoji: '✨',
    promptModifier: 'Tone: deeply inspiring, motivational, and uplifting. Encourage the reader to take action or feel positive.',
  },
  {
    id: 'educational',
    nameEn: 'Educational',
    nameTh: 'ให้ความรู้',
    emoji: '📚',
    promptModifier: 'Tone: educational, informative, clear, and easy to understand. Break down complex topics simply.',
  }
];

export const getToneById = (id: string): ToneOfVoice => {
  if (!id) return TONE_OF_VOICE[0];
  return TONE_OF_VOICE.find(t => t.id === id) || TONE_OF_VOICE[0];
};
