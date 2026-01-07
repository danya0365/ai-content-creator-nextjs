/**
 * SchedulePresenter
 * Handles business logic for Schedule page
 * ✅ Uses dependency injection for repository
 */

import {
    CONTENT_TYPES,
    ContentType,
    TIME_SLOTS,
    TimeSlotConfig,
} from '@/src/data/master/contentTypes';
import { Content, IContentRepository } from '@/src/application/repositories/IContentRepository';
import { Metadata } from 'next';

export interface ScheduleDay {
  date: Date;
  dateString: string;
  dayOfWeek: string;
  dayNumber: number;
  isToday: boolean;
  contents: Content[];
}

export interface ScheduleViewModel {
  currentWeek: ScheduleDay[];
  timeSlots: TimeSlotConfig[];
  contentTypes: ContentType[];
  scheduledContents: Content[];
  totalScheduled: number;
}

const DAY_NAMES = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];

/**
 * Presenter for Schedule page
 * ✅ Receives repository via constructor injection
 */
export class SchedulePresenter {
  constructor(
    private readonly repository: IContentRepository
  ) {}

  /**
   * Get view model for the page
   */
  async getViewModel(): Promise<ScheduleViewModel> {
    const scheduledContents = await this.repository.getScheduled();
    
    // Generate current week
    const today = new Date();
    const currentWeek: ScheduleDay[] = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const dateString = date.toISOString().split('T')[0];
      const dayContents = scheduledContents.filter((c) => 
        c.scheduledAt.startsWith(dateString)
      );

      currentWeek.push({
        date,
        dateString,
        dayOfWeek: DAY_NAMES[date.getDay()],
        dayNumber: date.getDate(),
        isToday: i === 0,
        contents: dayContents,
      });
    }

    return {
      currentWeek,
      timeSlots: TIME_SLOTS,
      contentTypes: CONTENT_TYPES,
      scheduledContents,
      totalScheduled: scheduledContents.length,
    };
  }

  /**
   * Generate metadata for the page
   */
  generateMetadata(): Metadata {
    return {
      title: 'Schedule | AI Content Creator',
      description: 'จัดตารางโพสต์คอนเทนต์ Pixel Art อัตโนมัติ',
    };
  }
}
