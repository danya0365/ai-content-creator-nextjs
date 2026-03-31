import { createServerAIPresenter } from '@/src/presentation/presenters/ai/AIPresenterServerFactory';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/ai/image
 * Regenerates an image from a specific explicit prompt and style.
 * ✅ Refactored to use AIPresenter (Clean Architecture)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imagePrompt, imageStyle } = body;

    if (!imagePrompt || !imageStyle) {
      return NextResponse.json(
        { error: 'Missing required fields: imagePrompt and imageStyle' },
        { status: 400 }
      );
    }

    // ✅ Delegate to AIPresenter
    const presenter = createServerAIPresenter();
    const imageResult = await presenter.generateImage({
      imagePrompt,
      imageStyle,
    });

    if (!imageResult.success) {
      return NextResponse.json(
        { error: imageResult.error || 'Failed to generate image' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      imageUrl: imageResult.imageUrl,
    });
  } catch (error) {
    console.error('[API AI Image] ❌ Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
