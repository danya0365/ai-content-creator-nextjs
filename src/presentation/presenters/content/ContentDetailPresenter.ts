/**
 * ContentDetailPresenter
 * Handles business logic for Content Detail page
 * ✅ Uses dependency injection for repository
 * ✅ Single Source of Truth - All data comes from here
 */

import { Content, IContentRepository } from '@/src/application/repositories/IContentRepository';
import { CONTENT_TYPES } from '@/src/data/master/contentTypes';
import { Metadata } from 'next';

// Engagement data point for charts
export interface EngagementDataPoint {
  label: string;
  value: number;
  color: string;
}

export interface ContentDetailViewModel {
  content: Content | null;
  contentTypeName: string;
  contentTypeIcon: string;
  relatedContents: Content[];
  // ✅ Single Source of Truth - engagement data comes from presenter
  engagementData: EngagementDataPoint[];
}

/**
 * Presenter for Content Detail page
 * ✅ Receives repository via constructor injection
 */
export class ContentDetailPresenter {
  constructor(
    private readonly repository: IContentRepository
  ) {}

  /**
   * Get view model for the page
   */
  async getViewModel(contentId: string): Promise<ContentDetailViewModel> {
    const content = await this.repository.getById(contentId);
    
    // Get content type details
    const contentType = CONTENT_TYPES.find((t) => t.id === content?.contentTypeId);
    
    // Get related contents (same type)
    let relatedContents: Content[] = [];
    if (content) {
      // ✅ Use limit to avoid fetching all contents of this type
      const allContents = await this.repository.getAll({ 
        contentTypeId: content.contentTypeId,
        limit: 4 
      });
      
      relatedContents = allContents
        .filter((c) => c.id !== contentId)
        .slice(0, 3);
    }

    // ✅ Generate engagement data from content stats
    const engagementData: EngagementDataPoint[] = content ? [
      { label: 'Likes', value: content.likes || 0, color: '#EC4899' },
      { label: 'Shares', value: content.shares || 0, color: '#8B5CF6' },
      { label: 'Comments', value: Math.floor(Math.random() * 100) + 20, color: '#06B6D4' }, // TODO: Add comments to Content model
    ] : [];

    return {
      content,
      contentTypeName: contentType?.nameTh || 'ไม่ทราบประเภท',
      contentTypeIcon: contentType?.icon || '📄',
      relatedContents,
      engagementData,
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
        description: 'ไม่พบคอนเทนต์ที่ต้องการ',
      };
    }

    return {
      title: `${content.title} | AI Content Creator`,
      description: content.description || 'รายละเอียดคอนเทนต์',
    };
  }

  /**
   * Delete content
   */
  async deleteContent(contentId: string): Promise<void> {
    await this.repository.delete(contentId);
  }
}
