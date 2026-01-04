/**
 * SettingsPresenter
 * Handles business logic for Settings page
 */

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

export interface SettingsViewModel {
  settings: AppSettings;
  availableTimeSlots: Array<{ id: string; name: string }>;
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
 */
export class SettingsPresenter {
  /**
   * Get view model for the page
   */
  async getViewModel(): Promise<SettingsViewModel> {
    // In production, load from database/localStorage
    return {
      settings: defaultSettings,
      availableTimeSlots: [
        { id: 'morning', name: '🌅 เช้า (6:00-9:00)' },
        { id: 'lunch', name: '🍱 เที่ยง (11:00-14:00)' },
        { id: 'afternoon', name: '☀️ บ่าย (14:00-18:00)' },
        { id: 'evening', name: '🌙 เย็น (18:00-22:00)' },
      ],
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
