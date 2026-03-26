export interface ImageStyle {
  id: string;
  nameTh: string;
  nameEn: string;
  emoji: string;
  descriptionTh?: string;
  promptModifier: string; // Appended to image generator prompt
  contentPromptInstruction: string; // Injected into text LLM instructions
}

export const IMAGE_STYLES: ImageStyle[] = [
  {
    id: 'pixel-art',
    nameTh: 'พิกเซลอาร์ท (Pixel Art)',
    nameEn: 'Pixel Art',
    emoji: '👾',
    descriptionTh: 'ศิลปะ 16-bit ยุคคลาสสิค น่ารักๆ',
    promptModifier: 'Pixel art style, 16-bit retro SNES era aesthetic, bright colors, detailed background',
    contentPromptInstruction: 'a cute pixel art illustration of'
  },
  {
    id: 'anime',
    nameTh: 'อนิเมะ (Anime)',
    nameEn: 'Anime',
    emoji: '🌸',
    descriptionTh: 'ลายเส้นการ์ตูนญี่ปุ่น สวยละมุน',
    promptModifier: 'Anime style, Studio Ghibli style, beautiful cel shading, detailed illustration, vibrant colors',
    contentPromptInstruction: 'a beautiful anime style illustration of'
  },
  {
    id: 'realistic',
    nameTh: 'สมจริง (Realistic)',
    nameEn: 'Realistic',
    emoji: '📸',
    descriptionTh: 'ภาพถ่ายสมจริง รายละเอียดครบ',
    promptModifier: 'Photorealistic, 8k resolution, highly detailed, professional photography, cinematic lighting',
    contentPromptInstruction: 'a highly realistic cinematic photograph of'
  },
  {
    id: '3d-render',
    nameTh: 'โมเดล 3 มิติ (3D Render)',
    nameEn: '3D Render',
    emoji: '🧊',
    descriptionTh: 'เหมือนโมเดล 3D แบบ Pixar',
    promptModifier: '3D render, Pixar style, cute, smooth textures, octane render, soft lighting',
    contentPromptInstruction: 'a cute 3D render Pixar style illustration of'
  },
  {
    id: 'watercolor',
    nameTh: 'สีน้ำ (Watercolor)',
    nameEn: 'Watercolor',
    emoji: '🎨',
    descriptionTh: 'ภาพวาดสีน้ำ อ่อนโยน',
    promptModifier: 'Watercolor painting, delicate brushstrokes, soft edges, artistic, beautiful color blending',
    contentPromptInstruction: 'a beautiful artistic watercolor painting of'
  },
  {
    id: 'minimalist',
    nameTh: 'มินิมอล (Minimalist)',
    nameEn: 'Minimalist',
    emoji: '✨',
    descriptionTh: 'คลีนๆ เรียบง่าย ดูแพง',
    promptModifier: 'Minimalist, flat design, clean lines, simple background, vector illustration style, elegant',
    contentPromptInstruction: 'a clean minimalist flat design illustration of'
  }
];

/**
 * Helper to get a style by ID, defaults to pixel-art
 */
export const getImageStyleById = (id: string): ImageStyle => {
  if (!id) return IMAGE_STYLES[0];
  const found = IMAGE_STYLES.find(s => s.id === id);
  return found || IMAGE_STYLES[0];
};
