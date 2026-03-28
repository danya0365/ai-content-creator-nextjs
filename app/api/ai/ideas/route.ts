// TODO: Refactor according to CREATE_PAGE_PATTERN.md - Move business logic and direct DB/Repository access to Server Presenter
import { NextRequest, NextResponse } from 'next/server';
import { AIServiceFactory } from '@/src/infrastructure/ai/AIServiceFactory';
import { CONTENT_TYPES } from '@/src/data/master/contentTypes';

/**
 * GET /api/ai/ideas
 * Generates a creative topic idea based on the provided contentTypeId
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const contentTypeId = searchParams.get('contentTypeId');
    const mode = searchParams.get('mode'); // e.g. 'trending'
    const brandContext = searchParams.get('brandContext');

    if (!contentTypeId) {
      return NextResponse.json(
        { success: false, error: 'contentTypeId parameter is required' },
        { status: 400 }
      );
    }

    const contentType = CONTENT_TYPES.find(ct => ct.id === contentTypeId);
    if (!contentType) {
      return NextResponse.json(
        { success: false, error: 'Invalid contentTypeId provide' },
        { status: 400 }
      );
    }

    // 1. Fetch Trends if requested
    let trends: string[] | undefined = undefined;
    if (mode === 'trending') {
      const { GoogleTrendsRepository } = await import('@/src/infrastructure/repositories/api/GoogleTrendsRepository');
      const trendsRepo = new GoogleTrendsRepository();
      trends = await trendsRepo.getTopTrends(5);
    }

    // 2. Initialize correct Content Service
    const provider = process.env.AI_PROVIDER || 'mock';
    const contentService = AIServiceFactory.createContentService(provider as any);

    // 3. Request idea generation
    const ideaResponse = await contentService.generateTopicIdea(contentType, {
      trends,
      brandContext: brandContext || undefined,
    });

    if (!ideaResponse.success || !ideaResponse.idea) {
      return NextResponse.json(ideaResponse, { status: 500 });
    }

    return NextResponse.json(ideaResponse);

  } catch (error) {
    console.error('API Error generating topic idea:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
