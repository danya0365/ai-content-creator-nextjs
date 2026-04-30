import { createServerAIPresenter } from '@/src/presentation/presenters/ai/AIPresenterServerFactory';
import { CONTENT_TYPES } from '@/src/data/master/contentTypes';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contentTypeId, topic, timeSlot, imageStyle, generateImage = true, platform, tone, brandContext } = body;

    // 1. Validation
    if (!contentTypeId || !topic) {
      return NextResponse.json({ error: 'Missing required fields: contentTypeId and topic' }, { status: 400 });
    }

    const contentType = CONTENT_TYPES.find((t) => t.id === contentTypeId);
    if (!contentType) {
      return NextResponse.json({ error: 'Invalid content type' }, { status: 400 });
    }

    // 2. Delegate to AIPresenter
    const presenter = createServerAIPresenter();
    const result = await presenter.generateAndUpload({
      contentType,
      topic,
      timeSlot,
      imageStyle,
      generateImage,
      platform,
      tone,
      brandContext,
    });

    return NextResponse.json(result);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[API AI Generate] ❌ Error:', errorMessage);
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
