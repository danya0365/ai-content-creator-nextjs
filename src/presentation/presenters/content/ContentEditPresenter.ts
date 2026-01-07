/**
 * ContentEditPresenter
 * Handles business logic for Content Edit page
 * ✅ Uses dependency injection for repository
 */

import { CONTENT_TYPES, ContentType, TIME_SLOTS, TimeSlotConfig } from '@/src/data/master/contentTypes';
import { Content, IContentRepository, UpdateContentDTO } from '@/src/application/repositories/IContentRepository';
import { Metadata } from 'next';

export interface ContentEditViewModel {
  content: Content | null;
  contentTypes: ContentType[];
  timeSlots: TimeSlotConfig[];
}

/**
 * Presenter for Content Edit page
 * ✅ Receives repository via constructor injection
 */
export class ContentEditPresenter {
  constructor(
    private readonly repository: IContentRepository
  ) {}

  /**
   * Get view model for the page
   */
  async getViewModel(contentId: string): Promise<ContentEditViewModel> {
    const content = await this.repository.getById(contentId);

    return {
      content,
      contentTypes: CONTENT_TYPES,
      timeSlots: TIME_SLOTS,
    };
  }

  /**
   * Generate metadata for the page
   */
  async generateMetadata(contentId: string): Promise<Metadata> {
    const content = await this.repository.getById(contentId);
    
    if (!content) {
      return {
        title: 'ไม่พบคอนเทนต์ | AI Content Creator',
        description: 'ไม่พบคอนเทนต์ที่ต้องการแก้ไข',
      };
    }

    return {
      title: `แก้ไข: ${content.title} | AI Content Creator`,
      description: `แก้ไขคอนเทนต์: ${content.title}`,
    };
  }

  /**
   * Update content
   */
  async updateContent(contentId: string, data: UpdateContentDTO): Promise<Content> {
    return await this.repository.update(contentId, data);
  }

  /**
   * Get content by ID
   */
  async getContentById(contentId: string): Promise<Content | null> {
    return await this.repository.getById(contentId);
  }
}
