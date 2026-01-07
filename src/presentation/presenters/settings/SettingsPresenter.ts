/**
 * SettingsPresenter
 * Handles business logic for Settings page
 * ✅ Uses dependency injection for repository
 * ✅ Single Source of Truth - All data comes from here
 */

import { IContentRepository } from '@/src/application/repositories/IContentRepository';
import { Metadata } from 'next';

export interface AppSettings {
  geminiApiKey: string;
  autoSchedule: boolean;
  defaultTimeSlot: string;
  contentQuality: 'standard' | 'high' | 'ultra';
  language: 'th' | 'en';
  notifications: {
    onGenerate: boolean;
    onPublish: boolean;
    onSchedule: boolean;
  };
}

// ✅ User profile interface - Single Source of Truth
export interface UserProfile {
  name: string;
  email: string;
  bio: string;
  avatar: string;
  stats: {
    totalContents: number;
    published: number;
    likes: number;
    shares: number;
  };
}

export interface SettingsViewModel {
  settings: AppSettings;
  availableTimeSlots: Array<{ id: string; name: string }>;
  // ✅ Single Source of Truth - user profile comes from presenter
  userProfile: UserProfile;
}

const defaultSettings: AppSettings = {
  geminiApiKey: '',
  autoSchedule: true,
  defaultTimeSlot: 'morning',
  contentQuality: 'high',
  language: 'th',
  notifications: {
    onGenerate: true,
    onPublish: true,
    onSchedule: true,
  },
};

/**
 * Presenter for Settings page
 * ✅ Receives repository via constructor injection
 */
export class SettingsPresenter {
  constructor(
    private readonly repository: IContentRepository
  ) {}

  /**
   * Get view model for the page
   */
  async getViewModel(): Promise<SettingsViewModel> {
    // Get stats from repository for user profile
    const stats = await this.repository.getStats();

    // ✅ User profile - in production, this would come from auth/user service
    const userProfile: UserProfile = {
      name: 'ผู้สร้างคอนเทนต์',
      email: 'creator@example.com',
      bio: 'สร้างคอนเทนต์ Pixel Art ที่น่ารักด้วย AI',
      avatar: '👤',
      stats: {
        totalContents: stats.totalContents,
        published: stats.publishedCount,
        likes: stats.totalLikes,
        shares: stats.totalShares,
      },
    };

    return {
      settings: defaultSettings,
      availableTimeSlots: [
        { id: 'morning', name: '🌅 เช้า (6:00-9:00)' },
        { id: 'lunch', name: '🍱 เที่ยง (11:00-14:00)' },
        { id: 'afternoon', name: '☀️ บ่าย (14:00-18:00)' },
        { id: 'evening', name: '🌙 เย็น (18:00-22:00)' },
      ],
      userProfile,
    };
  }

  /**
   * Generate metadata for the page
   */
  generateMetadata(): Metadata {
    return {
      title: 'Settings | AI Content Creator',
      description: 'ตั้งค่าและปรับแต่งการทำงานของ AI Content Creator',
    };
  }
}
