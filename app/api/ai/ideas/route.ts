import { createServerAIPresenter } from '@/src/presentation/presenters/ai/AIPresenterServerFactory';
import { CONTENT_TYPES } from '@/src/data/master/contentTypes';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/ai/ideas
 * Generates a creative topic idea based on the provided contentTypeId
 * ✅ Refactored to use AIPresenter (Clean Architecture)
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
        { success: false, error: 'Invalid contentTypeId' },
        { status: 400 }
      );
    }

    // ✅ Delegate to AIPresenter
    const presenter = createServerAIPresenter();
    const result = await presenter.generateTopicIdea(contentType, {
      mode: mode || undefined,
      brandContext: brandContext || undefined,
    });

    if (!result.success) {
      return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('[API AI Ideas] ❌ Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
