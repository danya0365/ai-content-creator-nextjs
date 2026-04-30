import { createServerAIPresenter } from '@/src/presentation/presenters/ai/AIPresenterServerFactory';
import { CONTENT_TYPES } from '@/src/data/master/contentTypes';
import { NextRequest, NextResponse } from 'next/server';

/**
 * AI Multi-Platform Content Generation API Route
 * POST /api/ai/generate-multi
 * ✅ Refactored to use AIPresenter (Clean Architecture)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contentTypeId, topic, timeSlot, imageStyle, platforms, tone, brandContext } = body;

    // 1. Validation
    if (!contentTypeId || !topic || !platforms || platforms.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: contentTypeId, topic, and at least one platform' },
        { status: 400 }
      );
    }

    const contentType = CONTENT_TYPES.find((t) => t.id === contentTypeId);
    if (!contentType) {
      return NextResponse.json({ error: 'Invalid content type' }, { status: 400 });
    }

    // 2. Delegate to AIPresenter
    const presenter = createServerAIPresenter();
    const result = await presenter.generateMultiAndUpload({
      contentType,
      topic,
      timeSlot,
      imageStyle,
      platforms,
      tone,
      brandContext,
    });

    return NextResponse.json(result);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[API AI Generate-Multi] ❌ Error:', errorMessage);
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
