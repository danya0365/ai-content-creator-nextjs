// TODO: Refactor according to CREATE_PAGE_PATTERN.md - Move business logic and direct DB/Repository access to Server Presenter
import { NextRequest, NextResponse } from 'next/server';
import { AIServiceFactory } from '@/src/infrastructure/ai/AIServiceFactory';

interface AIImageRequest {
  imagePrompt: string;
  imageStyle: string;
}

/**
 * POST /api/ai/image
 * Regenerates an image from a specific explicit prompt and style.
 */
export async function POST(request: NextRequest) {
  try {
    const body: AIImageRequest = await request.json();

    if (!body.imagePrompt || !body.imageStyle) {
      return NextResponse.json(
        { error: 'Missing required fields: imagePrompt and imageStyle' },
        { status: 400 }
      );
    }

    const imageService = AIServiceFactory.createImageService();
    const imageResult = await imageService.generateImage({
      imagePrompt: body.imagePrompt,
      imageStyle: body.imageStyle,
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
    console.error('API Error generating image:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
