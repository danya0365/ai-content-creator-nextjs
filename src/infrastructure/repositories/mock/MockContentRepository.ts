/**
 * MockContentRepository
 * Mock implementation for development and testing
 * Following Clean Architecture - this is in the Infrastructure layer
 */

import {
  Content,
  ContentFilter,
  ContentStats,
  CreateContentDTO,
  IContentRepository,
  PaginatedResult,
  UpdateContentDTO,
} from '@/src/application/repositories/IContentRepository';
import { GeneratedContent, MOCK_CONTENTS } from '@/src/data/mock/mockContents';

function mapMockToContent(mock: GeneratedContent): Content {
  return {
    id: mock.id,
    contentTypeId: mock.contentTypeId,
    title: mock.title,
    description: mock.description,
    imageUrl: mock.imageUrl,
    prompt: mock.prompt,
    timeSlot: mock.timeSlot,
    scheduledAt: mock.scheduledAt,
    publishedAt: mock.publishedAt,
    status: mock.status,
    likes: mock.likes,
    shares: mock.shares,
    createdAt: mock.createdAt,
    // New fields
    comments: mock.comments || 0,
    tags: mock.tags || [],
    emoji: mock.emoji,
  };
}

export class MockContentRepository implements IContentRepository {
  private items: Content[] = MOCK_CONTENTS.map(mapMockToContent);

  async getAll(filter?: ContentFilter): Promise<Content[]> {
    await this.delay(100);
    let result = [...this.items];

    if (filter?.status) {
      result = result.filter((c) => c.status === filter.status);
    }
    if (filter?.timeSlot) {
      result = result.filter((c) => c.timeSlot === filter.timeSlot);
    }
    if (filter?.contentTypeId) {
      result = result.filter((c) => c.contentTypeId === filter.contentTypeId);
    }

    return result.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getPaginated(page: number, perPage: number, filter?: ContentFilter): Promise<PaginatedResult<Content>> {
    await this.delay(100);
    
    let filteredItems = [...this.items];
    if (filter?.status) {
      filteredItems = filteredItems.filter((c) => c.status === filter.status);
    }
    if (filter?.timeSlot) {
      filteredItems = filteredItems.filter((c) => c.timeSlot === filter.timeSlot);
    }
    if (filter?.contentTypeId) {
      filteredItems = filteredItems.filter((c) => c.contentTypeId === filter.contentTypeId);
    }

    // Sort by created date descending
    filteredItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const start = (page - 1) * perPage;
    const end = start + perPage;
    const paginatedItems = filteredItems.slice(start, end);

    return {
      data: paginatedItems,
      total: filteredItems.length,
      page,
      perPage,
    };
  }

  async getById(id: string): Promise<Content | null> {
    await this.delay(100);
    return this.items.find((c) => c.id === id) || null;
  }

  async getRecentPublished(limit = 5): Promise<Content[]> {
    await this.delay(100);
    return this.items
      .filter((c) => c.status === 'published')
      .sort((a, b) => new Date(b.publishedAt!).getTime() - new Date(a.publishedAt!).getTime())
      .slice(0, limit);
  }

  async getScheduled(): Promise<Content[]> {
    await this.delay(100);
    return this.items
      .filter((c) => c.status === 'scheduled')
      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
  }

  async getStats(): Promise<ContentStats> {
    await this.delay(100);
    const published = this.items.filter((c) => c.status === 'published');
    const scheduled = this.items.filter((c) => c.status === 'scheduled');
    const draft = this.items.filter((c) => c.status === 'draft');

    return {
      totalContents: this.items.length,
      publishedCount: published.length,
      scheduledCount: scheduled.length,
      draftCount: draft.length,
      totalLikes: published.reduce((sum, c) => sum + c.likes, 0),
      totalShares: published.reduce((sum, c) => sum + c.shares, 0),
    };
  }

  async create(data: CreateContentDTO): Promise<Content> {
    await this.delay(200);
    const newContent: Content = {
      id: `content-${Date.now()}`,
      contentTypeId: data.contentTypeId,
      title: data.title,
      description: data.description,
      imageUrl: data.imageUrl || '',
      prompt: data.prompt,
      timeSlot: data.timeSlot,
      scheduledAt: data.scheduledAt || new Date().toISOString(),
      publishedAt: null,
      status: data.status || 'draft',
      likes: 0,
      shares: 0,
      createdAt: new Date().toISOString(),
      // New fields
      comments: 0,
      tags: data.tags || [],
      emoji: data.emoji,
    };

    this.items.unshift(newContent);
    return newContent;
  }

  async update(id: string, data: UpdateContentDTO): Promise<Content> {
    await this.delay(200);
    const index = this.items.findIndex((c) => c.id === id);
    if (index === -1) {
      throw new Error(`Content not found: ${id}`);
    }

    this.items[index] = {
      ...this.items[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    return this.items[index];
  }

  async delete(id: string): Promise<boolean> {
    await this.delay(200);
    const index = this.items.findIndex((c) => c.id === id);
    if (index === -1) {
      return false;
    }
    this.items.splice(index, 1);
    return true;
  }

  // Helper method to simulate network delay
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Export singleton instance for convenience
export const mockContentRepository = new MockContentRepository();
