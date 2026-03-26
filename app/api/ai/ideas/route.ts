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

    // 1. Initialize correct Content Service
    const provider = process.env.AI_PROVIDER || 'mock';
    const contentService = AIServiceFactory.createContentService(provider as any);

    // 2. Request idea generation
    const ideaResponse = await contentService.generateTopicIdea(contentType);

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
