/**
 * Timeline Categories Master Data
 * Static configuration for timeline categories
 * ✅ Single Source of Truth - No DB queries needed
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

export interface TimelineCategoryConfig {
  id: TimelineCategory;
  label: string;
  labelTh: string;
  emoji: string;
  color: string;
}

/**
 * Timeline categories configuration
 * Used for filtering and displaying content by category
 */
export const TIMELINE_CATEGORIES: Record<TimelineCategory, TimelineCategoryConfig> = {
  news: { 
    id: 'news',
    label: 'News', 
    labelTh: 'ข่าวสาร', 
    emoji: '📰', 
    color: 'from-blue-500 to-cyan-500' 
  },
  entertainment: { 
    id: 'entertainment',
    label: 'Entertainment', 
    labelTh: 'บันเทิง', 
    emoji: '🎬', 
    color: 'from-pink-500 to-rose-500' 
  },
  food: { 
    id: 'food',
    label: 'Food', 
    labelTh: 'อาหาร', 
    emoji: '🍜', 
    color: 'from-orange-500 to-amber-500' 
  },
  gaming: { 
    id: 'gaming',
    label: 'Gaming', 
    labelTh: 'เกม', 
    emoji: '🎮', 
    color: 'from-purple-500 to-indigo-500' 
  },
  tech: { 
    id: 'tech',
    label: 'Tech', 
    labelTh: 'เทคโนโลยี', 
    emoji: '💻', 
    color: 'from-emerald-500 to-teal-500' 
  },
  motivation: { 
    id: 'motivation',
    label: 'Motivation', 
    labelTh: 'กำลังใจ', 
    emoji: '💪', 
    color: 'from-yellow-500 to-orange-500' 
  },
  lifestyle: { 
    id: 'lifestyle',
    label: 'Lifestyle', 
    labelTh: 'ไลฟ์สไตล์', 
    emoji: '✨', 
    color: 'from-violet-500 to-fuchsia-500' 
  },
  education: { 
    id: 'education',
    label: 'Education', 
    labelTh: 'ความรู้', 
    emoji: '📚', 
    color: 'from-sky-500 to-blue-500' 
  },
};

/**
 * Get all timeline category IDs
 */
export function getTimelineCategoryIds(): TimelineCategory[] {
  return Object.keys(TIMELINE_CATEGORIES) as TimelineCategory[];
}

/**
 * Get category config by ID
 */
export function getTimelineCategoryById(id: TimelineCategory): TimelineCategoryConfig {
  return TIMELINE_CATEGORIES[id];
}

/**
 * Get all categories as array
 */
export function getTimelineCategoriesArray(): TimelineCategoryConfig[] {
  return Object.values(TIMELINE_CATEGORIES);
}
