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
    AnalyticsMetrics,
    PublishResult,
    ContentReportData,
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
    if (filter?.contentTypeIds && filter.contentTypeIds.length > 0) {
      result = result.filter((c) => filter.contentTypeIds!.includes(c.contentTypeId));
    }
    if (filter?.startDate) {
      const start = new Date(filter.startDate);
      result = result.filter((c) => new Date(c.createdAt) >= start);
    }
    if (filter?.endDate) {
      const end = new Date(filter.endDate);
      result = result.filter((c) => new Date(c.createdAt) <= end);
    }
    if (filter?.scheduledBefore) {
      const before = new Date(filter.scheduledBefore);
      result = result.filter((c) => c.scheduledAt && new Date(c.scheduledAt) <= before);
    }

    // Sort by created date descending
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Apply limit and offset
    const offset = filter?.offset || 0;
    const limit = filter?.limit;
    if (limit !== undefined) {
      result = result.slice(offset, offset + limit);
    } else if (offset > 0) {
      result = result.slice(offset);
    }

    return result;
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
      totalComments: published.reduce((sum, c) => sum + c.comments, 0),
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
      profileId: data.profileId,
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

  /**
   * Subscribe to real-time content changes (dummy implementation)
   */
  subscribe(_callback: (event: any) => void): () => void {
    return () => {};
  }

  async getAnalyticsMetrics(): Promise<AnalyticsMetrics> {
    await this.delay(100);
    return {
      growth: { currentPeriod: 15, previousPeriod: 10, rate: 50 },
      dailyEngagement: [
        { date: '2026-03-20', total: 100 },
        { date: '2026-03-21', total: 150 },
        { date: '2026-03-22', total: 200 },
      ],
      contentTypes: [
        { id: 'tech', count: 5 },
        { id: 'news', count: 3 },
      ],
      weeklyTrends: [
        { weekLabel: 'W1', total: 500 },
        { weekLabel: 'W2', total: 600 },
      ],
    };
  }

  async publishDueContent(now: Date): Promise<PublishResult> {
    await this.delay(200);
    const nowIso = now.toISOString();
    
    const contentsToPublish = this.items.filter(content => {
      if (content.status !== 'scheduled' || !content.scheduledAt) return false;
      const scheduledTime = new Date(content.scheduledAt);
      return scheduledTime <= now;
    });

    if (contentsToPublish.length === 0) {
      return { success: 0, failed: 0, details: [] };
    }

    const details: PublishResult['details'] = contentsToPublish.map(content => {
      content.status = 'published';
      content.publishedAt = nowIso;
      content.updatedAt = nowIso;
      
      return {
        contentId: content.id,
        title: content.title,
        status: 'published' as const,
      };
    });

    return {
      success: details.length,
      failed: 0,
      details,
    };
  }

  async getReportData(startDate: string, endDate: string): Promise<ContentReportData> {
    await this.delay(100);
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const weeklyContents = this.items.filter(c => {
      const createdAt = new Date(c.createdAt);
      return createdAt >= start && createdAt <= end;
    });

    const publishedContents = weeklyContents.filter(c => c.status === 'published');
    const totalLikes = publishedContents.reduce((sum, c) => sum + (c.likes || 0), 0);
    const totalShares = publishedContents.reduce((sum, c) => sum + (c.shares || 0), 0);

    const topPerformingContent = [...publishedContents]
      .sort((a, b) => ((b.likes || 0) + (b.shares || 0)) - ((a.likes || 0) + (a.shares || 0)))
      .slice(0, 5)
      .map(c => ({
        id: c.id,
        title: c.title,
        likes: c.likes || 0,
        shares: c.shares || 0,
      }));

    const contentByTimeSlot: Record<string, number> = {
      morning: weeklyContents.filter(c => c.timeSlot === 'morning').length,
      lunch: weeklyContents.filter(c => c.timeSlot === 'lunch').length,
      afternoon: weeklyContents.filter(c => c.timeSlot === 'afternoon').length,
      evening: weeklyContents.filter(c => c.timeSlot === 'evening').length,
    };

    const contentByType: Record<string, number> = {};
    weeklyContents.forEach(c => {
      contentByType[c.contentTypeId] = (contentByType[c.contentTypeId] || 0) + 1;
    });

    return {
      totalGenerated: weeklyContents.length,
      totalPublished: publishedContents.length,
      totalFailed: weeklyContents.filter(c => c.status === 'failed').length,
      totalDrafts: weeklyContents.filter(c => c.status === 'draft').length,
      totalLikes,
      totalShares,
      topPerformingContent,
      contentByTimeSlot,
      contentByType,
    };
  }

  async getTopPerforming(limit = 5): Promise<Content[]> {
    await this.delay(100);
    return [...this.items]
      .filter((c) => c.status === 'published')
      .sort((a, b) => ((b.likes || 0) + (b.shares || 0)) - ((a.likes || 0) + (a.shares || 0)))
      .slice(0, limit);
  }

  // Helper method to simulate network delay
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Export singleton instance for convenience
export const mockContentRepository = new MockContentRepository();
