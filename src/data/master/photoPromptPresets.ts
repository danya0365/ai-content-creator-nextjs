/**
 * Photo Prompt Presets Master Data
 * Configurable options for the Photo Prompt Generator Modal
 * ✅ Single Source of Truth for all image prompt building blocks
 */

// ─── Types ───────────────────────────────────────────────────

export interface PresetOption {
  id: string;
  label: string;
  labelTh: string;
  emoji: string;
  promptSnippet: string;
  description?: string;
}

export interface ColorPaletteOption {
  id: string;
  label: string;
  labelTh: string;
  colors: string[]; // Tailwind classes for visual swatches
  promptSnippet: string;
}

export interface AspectRatioOption {
  id: string;
  label: string;
  ratio: string;
  width: number;
  height: number;
  platformHint: string;
}

// ─── Theme / Purpose ─────────────────────────────────────────

export const PHOTO_THEMES: PresetOption[] = [
  {
    id: 'hadith',
    label: 'Hadith Quote',
    labelTh: 'หะดีษ',
    emoji: '📖',
    promptSnippet: 'Islamic Hadith quote post',
    description: 'คำกล่าวของท่านนบี ﷺ',
  },
  {
    id: 'quran',
    label: 'Quran Verse',
    labelTh: 'อายะฮ์อัลกุรอาน',
    emoji: '🕋',
    promptSnippet: 'Quran verse inspirational post',
    description: 'อายะฮ์จากอัลกุรอาน',
  },
  {
    id: 'islamic-reminder',
    label: 'Islamic Reminder',
    labelTh: 'เตือนสติอิสลาม',
    emoji: '🕌',
    promptSnippet: 'Islamic reminder and spiritual reflection post',
    description: 'ข้อคิดและเตือนสติตามหลักอิสลาม',
  },
  {
    id: 'dua',
    label: "Du'a (Supplication)",
    labelTh: 'ดุอาอ์',
    emoji: '🤲',
    promptSnippet: 'Islamic dua supplication prayer post',
    description: 'บทดุอาอ์ (การวิงวอน)',
  },
  {
    id: 'general-inspirational',
    label: 'General Inspirational',
    labelTh: 'สร้างแรงบันดาลใจทั่วไป',
    emoji: '✨',
    promptSnippet: 'inspirational motivational quote post',
    description: 'โพสต์สร้างแรงบันดาลใจทั่วไป',
  },
];

// ─── Frame Style ─────────────────────────────────────────────

export const FRAME_STYLES: PresetOption[] = [
  {
    id: 'luxury-emerald',
    label: 'Luxury Emerald + Gold',
    labelTh: 'มรกต + ทอง (หรูหรา)',
    emoji: '💎',
    promptSnippet: 'luxurious deep emerald green Islamic frame with gold trim, symmetrical curves, fine floral ornament',
  },
  {
    id: 'dark-navy',
    label: 'Dark Navy + Silver',
    labelTh: 'กรมท่า + เงิน (กลางคืน)',
    emoji: '🌙',
    promptSnippet: 'dark navy blue Islamic frame with subtle silver accents, minimal ornament',
  },
  {
    id: 'black-gold',
    label: 'Black + Gold',
    labelTh: 'ดำ + ทอง (ทรงพลัง)',
    emoji: '⚜️',
    promptSnippet: 'black and gold elegant Islamic frame, clean and strong, bold presence',
  },
  {
    id: 'no-frame',
    label: 'No Frame (Minimal)',
    labelTh: 'ไม่มีกรอบ (มินิมอล)',
    emoji: '✨',
    promptSnippet: 'no frame, clean centered typography layout with elegant spacing',
  },
  {
    id: 'soft-green',
    label: 'Soft Green + Gold',
    labelTh: 'เขียวอ่อน + ทอง (อ่อนโยน)',
    emoji: '🌿',
    promptSnippet: 'rounded soft green frame with light gold accents, gentle curves',
  },
  {
    id: 'royal-blue',
    label: 'Royal Blue + Pearl',
    labelTh: 'น้ำเงินรอยัล + มุก',
    emoji: '👑',
    promptSnippet: 'royal blue frame with pearl white accents and delicate arabesque patterns',
  },
  {
    id: 'marble-gold',
    label: 'Marble + Gold',
    labelTh: 'หินอ่อน + ทอง',
    emoji: '🏛️',
    promptSnippet: 'white marble texture frame with gold foil Islamic calligraphy border ornament',
  },
  {
    id: 'wooden-carved',
    label: 'Wooden Carved',
    labelTh: 'ไม้แกะสลัก',
    emoji: '🪵',
    promptSnippet: 'intricately carved dark wooden Islamic frame, traditional craftsmanship, warm natural tones',
  },
];

// ─── Background Scene ────────────────────────────────────────

export const BACKGROUND_SCENES: PresetOption[] = [
  {
    id: 'islamic-garden',
    label: 'Islamic Garden',
    labelTh: 'สวนอิสลาม',
    emoji: '🌺',
    promptSnippet: 'cinematic Islamic garden with mosque silhouette, golden hour sunlight, volumetric light rays, soft bokeh',
  },
  {
    id: 'night-sky',
    label: 'Night Sky + Stars',
    labelTh: 'ท้องฟ้ากลางคืน + ดาว',
    emoji: '🌌',
    promptSnippet: 'night sky full of stars, crescent moon, mosque silhouette, soft fog, deep atmosphere',
  },
  {
    id: 'makkah',
    label: 'Makkah / Kaaba',
    labelTh: 'มักกะฮ์ / กะอ์บะฮ์',
    emoji: '🕋',
    promptSnippet: 'Kaaba in Mecca, soft blur, pilgrims walking, golden light reflection, emotional depth',
  },
  {
    id: 'madinah',
    label: 'Madinah Mosque',
    labelTh: 'มัสยิดนบี มะดีนะฮ์',
    emoji: '🕌',
    promptSnippet: "Prophet's Mosque in Madinah, green dome, peaceful atmosphere, golden hour light, spiritual depth",
  },
  {
    id: 'desert-sunrise',
    label: 'Desert Sunrise',
    labelTh: 'ทะเลทรายยามเช้า',
    emoji: '🏜️',
    promptSnippet: 'vast desert landscape at sunrise, golden sand dunes, warm orange sky, peaceful solitude',
  },
  {
    id: 'ocean-sunset',
    label: 'Ocean Sunset',
    labelTh: 'ทะเลยามเย็น',
    emoji: '🌅',
    promptSnippet: 'calm ocean at sunset, warm reflections on water, distant mosque silhouette, tranquil atmosphere',
  },
  {
    id: 'abstract-geometric',
    label: 'Abstract Geometric',
    labelTh: 'เรขาคณิตนามธรรม',
    emoji: '🔷',
    promptSnippet: 'abstract Islamic geometric pattern background, intricate tessellations, rich jewel tones, elegant and modern',
  },
  {
    id: 'clean-beige',
    label: 'Clean Beige',
    labelTh: 'เบจสะอาด',
    emoji: '📃',
    promptSnippet: 'clean beige or off-white background with subtle Islamic geometric pattern',
  },
  {
    id: 'rainy-window',
    label: 'Rainy Window',
    labelTh: 'หน้าต่างวันฝนตก',
    emoji: '🌧️',
    promptSnippet: 'soft rainy window with water droplets, warm interior light, cozy spiritual atmosphere, bokeh city lights',
  },
  {
    id: 'mountain-mist',
    label: 'Mountain Mist',
    labelTh: 'ภูเขาหมอก',
    emoji: '⛰️',
    promptSnippet: 'misty mountain landscape, soft fog, peaceful valley, morning light breaking through clouds',
  },
];

// ─── Foreground Elements ─────────────────────────────────────

export const FOREGROUND_ELEMENTS: PresetOption[] = [
  {
    id: 'lantern-glow',
    label: 'Lantern Glow',
    labelTh: 'โคมไฟเรืองแสง',
    emoji: '🏮',
    promptSnippet: 'ornate Islamic lantern glowing warmly, soft golden light',
  },
  {
    id: 'flowers-leaves',
    label: 'Flowers & Leaves',
    labelTh: 'ดอกไม้และใบไม้',
    emoji: '🌸',
    promptSnippet: 'gentle flowers and leaves framing edges, natural beauty',
  },
  {
    id: 'particles-bokeh',
    label: 'Particles & Bokeh',
    labelTh: 'อนุภาคและโบเก้',
    emoji: '✨',
    promptSnippet: 'floating golden particles, soft bokeh light, magical atmosphere',
  },
  {
    id: 'subtle-haze',
    label: 'Subtle Haze',
    labelTh: 'หมอกบางเบา',
    emoji: '🌫️',
    promptSnippet: 'subtle haze and soft fog at edges, dreamy depth',
  },
  {
    id: 'candle-light',
    label: 'Candle Light',
    labelTh: 'แสงเทียน',
    emoji: '🕯️',
    promptSnippet: 'warm candle light in foreground, intimate spiritual glow',
  },
  {
    id: 'none',
    label: 'None / Clean',
    labelTh: 'ไม่มี (สะอาด)',
    emoji: '🚫',
    promptSnippet: 'clean foreground, no distracting elements',
  },
];

// ─── Lighting ────────────────────────────────────────────────

export const LIGHTING_STYLES: PresetOption[] = [
  {
    id: 'golden-hour',
    label: 'Golden Hour',
    labelTh: 'แสงทอง (โกลเด้นฮาวร์)',
    emoji: '🌅',
    promptSnippet: 'warm golden hour sunlight, soft glow, cinematic warmth',
  },
  {
    id: 'moonlight',
    label: 'Moonlight',
    labelTh: 'แสงจันทร์',
    emoji: '🌙',
    promptSnippet: 'soft moonlight glow, gentle blue-silver tones, peaceful night',
  },
  {
    id: 'soft-diffused',
    label: 'Soft Diffused',
    labelTh: 'แสงนุ่มกระจาย',
    emoji: '☁️',
    promptSnippet: 'soft diffused light, glowing highlights, even illumination',
  },
  {
    id: 'dramatic-volumetric',
    label: 'Dramatic Volumetric',
    labelTh: 'แสงดรามาติก',
    emoji: '💡',
    promptSnippet: 'dramatic volumetric light rays, god rays, strong contrast, cinematic',
  },
  {
    id: 'flat-studio',
    label: 'Flat / Studio',
    labelTh: 'แสงแบน (สตูดิโอ)',
    emoji: '📷',
    promptSnippet: 'soft flat studio lighting, clean and even, professional',
  },
  {
    id: 'neon-glow',
    label: 'Neon Glow',
    labelTh: 'แสงนีออน',
    emoji: '💜',
    promptSnippet: 'subtle neon glow accents, modern spiritual atmosphere, colorful rim light',
  },
];

// ─── Global Style ────────────────────────────────────────────

export const GLOBAL_STYLES: PresetOption[] = [
  {
    id: 'luxury',
    label: 'Luxury Aesthetic',
    labelTh: 'หรูหราสง่างาม',
    emoji: '💎',
    promptSnippet: 'luxury Islamic aesthetic, elegant, premium, warm tones',
  },
  {
    id: 'spiritual',
    label: 'Deep Spiritual',
    labelTh: 'ลึกซึ้งทางจิตวิญญาณ',
    emoji: '🕊️',
    promptSnippet: 'deep spiritual mood, dark cinematic tone, emotional depth',
  },
  {
    id: 'sacred',
    label: 'Powerful / Sacred',
    labelTh: 'ทรงพลัง / ศักดิ์สิทธิ์',
    emoji: '⚡',
    promptSnippet: 'powerful, sacred, emotional, realistic, high impact',
  },
  {
    id: 'minimal',
    label: 'Modern Minimal',
    labelTh: 'โมเดิร์นมินิมอล',
    emoji: '✨',
    promptSnippet: 'modern minimal, premium branding style, clean, contemporary',
  },
  {
    id: 'dreamy',
    label: 'Soft / Dreamy',
    labelTh: 'นุ่มนวล / ฝันหวาน',
    emoji: '🌸',
    promptSnippet: 'emotional, calming, warm tone, soft glow, dreamy atmosphere',
  },
  {
    id: 'cinematic',
    label: 'Cinematic Realistic',
    labelTh: 'ซีเนมาติกสมจริง',
    emoji: '🎬',
    promptSnippet: 'cinematic, photorealistic, movie-grade lighting, ultra detailed',
  },
];

// ─── Color Palette ───────────────────────────────────────────

export const COLOR_PALETTES: ColorPaletteOption[] = [
  {
    id: 'emerald-gold',
    label: 'Emerald + Gold',
    labelTh: 'มรกต + ทอง',
    colors: ['bg-emerald-600', 'bg-amber-500', 'bg-emerald-900'],
    promptSnippet: 'emerald green and gold color palette, rich and luxurious tones',
  },
  {
    id: 'navy-silver',
    label: 'Navy + Silver',
    labelTh: 'กรมท่า + เงิน',
    colors: ['bg-blue-900', 'bg-slate-300', 'bg-indigo-950'],
    promptSnippet: 'dark navy blue and silver color palette, cool elegant tones',
  },
  {
    id: 'black-gold',
    label: 'Black + Gold',
    labelTh: 'ดำ + ทอง',
    colors: ['bg-gray-900', 'bg-amber-400', 'bg-black'],
    promptSnippet: 'black and gold color palette, bold and powerful contrast',
  },
  {
    id: 'beige-white',
    label: 'Beige + White',
    labelTh: 'เบจ + ขาว',
    colors: ['bg-amber-100', 'bg-white', 'bg-stone-200'],
    promptSnippet: 'beige and white color palette, clean, minimal, soft warmth',
  },
  {
    id: 'pastel-warm',
    label: 'Pastel Warm',
    labelTh: 'พาสเทลอุ่น',
    colors: ['bg-rose-200', 'bg-amber-200', 'bg-pink-100'],
    promptSnippet: 'warm pastel color palette, soft pink, peach, light gold tones',
  },
  {
    id: 'teal-copper',
    label: 'Teal + Copper',
    labelTh: 'น้ำเงินเขียว + ทองแดง',
    colors: ['bg-teal-600', 'bg-orange-700', 'bg-teal-900'],
    promptSnippet: 'teal and copper color palette, rich warm contrast, sophisticated',
  },
  {
    id: 'purple-rose',
    label: 'Purple + Rose',
    labelTh: 'ม่วง + กุหลาบ',
    colors: ['bg-purple-700', 'bg-rose-400', 'bg-violet-900'],
    promptSnippet: 'deep purple and rose color palette, romantic spiritual mood',
  },
];

// ─── Aspect Ratio ────────────────────────────────────────────

export const ASPECT_RATIOS: AspectRatioOption[] = [
  { id: '1:1', label: '1:1', ratio: '1:1', width: 1024, height: 1024, platformHint: 'Instagram Feed' },
  { id: '9:16', label: '9:16', ratio: '9:16', width: 768, height: 1365, platformHint: 'Story / Reels' },
  { id: '4:5', label: '4:5', ratio: '4:5', width: 896, height: 1120, platformHint: 'IG / FB Feed' },
  { id: '16:9', label: '16:9', ratio: '16:9', width: 1365, height: 768, platformHint: 'Landscape / YT' },
];

// ─── Quality ─────────────────────────────────────────────────

export const QUALITY_OPTIONS: PresetOption[] = [
  { id: 'standard', label: 'Standard (4K)', labelTh: 'มาตรฐาน (4K)', emoji: '🖼️', promptSnippet: '4k, ultra detailed' },
  { id: 'ultra', label: 'Ultra (8K)', labelTh: 'อัลตร้า (8K)', emoji: '🎯', promptSnippet: '8k resolution, extremely detailed, masterpiece quality' },
  { id: 'max', label: 'Maximum Detail', labelTh: 'รายละเอียดสูงสุด', emoji: '💎', promptSnippet: '8k, hyper detailed, maximum quality, HDR, ray tracing' },
];

// ─── Platform Target ─────────────────────────────────────────

export const PLATFORM_TARGETS: PresetOption[] = [
  { id: 'instagram', label: 'Instagram', labelTh: 'อินสตาแกรม', emoji: '📸', promptSnippet: 'optimized for Instagram, highly shareable, viral aesthetic' },
  { id: 'facebook', label: 'Facebook', labelTh: 'เฟซบุ๊ก', emoji: '📘', promptSnippet: 'optimized for Facebook sharing, strong emotional impact' },
  { id: 'twitter', label: 'X (Twitter)', labelTh: 'ทวิตเตอร์ (X)', emoji: '🐦', promptSnippet: 'optimized for Twitter/X, eye-catching, scroll-stopping' },
  { id: 'tiktok', label: 'TikTok', labelTh: 'ติ๊กต็อก', emoji: '🎵', promptSnippet: 'optimized for TikTok, trendy, vibrant colors' },
];

// ─── Style Presets (Quick Apply) ─────────────────────────────

export interface StylePreset {
  id: string;
  label: string;
  labelTh: string;
  emoji: string;
  frameStyle: string;
  backgroundScene: string;
  foreground: string;
  lighting: string;
  globalStyle: string;
  colorPalette: string;
}

export const STYLE_PRESETS: StylePreset[] = [
  {
    id: 'luxury',
    label: 'Luxury',
    labelTh: 'หรูหรา',
    emoji: '💎',
    frameStyle: 'luxury-emerald',
    backgroundScene: 'islamic-garden',
    foreground: 'lantern-glow',
    lighting: 'golden-hour',
    globalStyle: 'luxury',
    colorPalette: 'emerald-gold',
  },
  {
    id: 'night',
    label: 'Night',
    labelTh: 'กลางคืน',
    emoji: '🌙',
    frameStyle: 'dark-navy',
    backgroundScene: 'night-sky',
    foreground: 'particles-bokeh',
    lighting: 'moonlight',
    globalStyle: 'spiritual',
    colorPalette: 'navy-silver',
  },
  {
    id: 'makkah',
    label: 'Makkah',
    labelTh: 'มักกะฮ์',
    emoji: '🕋',
    frameStyle: 'black-gold',
    backgroundScene: 'makkah',
    foreground: 'subtle-haze',
    lighting: 'golden-hour',
    globalStyle: 'sacred',
    colorPalette: 'black-gold',
  },
  {
    id: 'minimal',
    label: 'Minimal',
    labelTh: 'มินิมอล',
    emoji: '✨',
    frameStyle: 'no-frame',
    backgroundScene: 'clean-beige',
    foreground: 'none',
    lighting: 'flat-studio',
    globalStyle: 'minimal',
    colorPalette: 'beige-white',
  },
  {
    id: 'soft',
    label: 'Soft',
    labelTh: 'นุ่มนวล',
    emoji: '🌸',
    frameStyle: 'soft-green',
    backgroundScene: 'islamic-garden',
    foreground: 'flowers-leaves',
    lighting: 'soft-diffused',
    globalStyle: 'dreamy',
    colorPalette: 'pastel-warm',
  },
];
