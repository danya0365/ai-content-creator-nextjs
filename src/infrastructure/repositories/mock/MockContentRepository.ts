/**
 * Mock Content Repository
 * Uses in-memory mock data for development/testing
 */

import {
    Content,
    ContentFilter,
    ContentStats,
    CreateContentDTO,
    IContentRepository,
    UpdateContentDTO,
} from '@/src/application/repositories/IContentRepository';
import { GeneratedContent, MOCK_CONTENTS } from '@/src/data/mock/mockContents';

// In-memory store (starts with mock data)
let contents: Content[] = MOCK_CONTENTS.map(mapMockToContent);

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

/**
 * MockContentRepository - In-memory implementation
 */
export class MockContentRepository implements IContentRepository {
  async getAll(filter?: ContentFilter): Promise<Content[]> {
    let result = [...contents];

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

  async getById(id: string): Promise<Content | null> {
    return contents.find((c) => c.id === id) || null;
  }

  async getRecentPublished(limit = 5): Promise<Content[]> {
    return contents
      .filter((c) => c.status === 'published')
      .sort((a, b) => new Date(b.publishedAt!).getTime() - new Date(a.publishedAt!).getTime())
      .slice(0, limit);
  }

  async getScheduled(): Promise<Content[]> {
    return contents
      .filter((c) => c.status === 'scheduled')
      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
  }

  async getStats(): Promise<ContentStats> {
    const published = contents.filter((c) => c.status === 'published');
    const scheduled = contents.filter((c) => c.status === 'scheduled');
    const draft = contents.filter((c) => c.status === 'draft');

    return {
      totalContents: contents.length,
      publishedCount: published.length,
      scheduledCount: scheduled.length,
      draftCount: draft.length,
      totalLikes: published.reduce((sum, c) => sum + c.likes, 0),
      totalShares: published.reduce((sum, c) => sum + c.shares, 0),
    };
  }

  async create(data: CreateContentDTO): Promise<Content> {
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

    contents.unshift(newContent);
    return newContent;
  }

  async update(id: string, data: UpdateContentDTO): Promise<Content> {
    const index = contents.findIndex((c) => c.id === id);
    if (index === -1) {
      throw new Error(`Content not found: ${id}`);
    }

    contents[index] = {
      ...contents[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    return contents[index];
  }

  async delete(id: string): Promise<void> {
    const index = contents.findIndex((c) => c.id === id);
    if (index === -1) {
      throw new Error(`Content not found: ${id}`);
    }
    contents.splice(index, 1);
  }
}
