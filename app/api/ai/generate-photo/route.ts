import { createServerAIPresenter } from "@/src/presentation/presenters/ai/AIPresenterServerFactory";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/ai/generate-photo
 * Generates an image from a photo prompt built by GeneratePhotoPromptModal.
 * Accepts: { prompt: string, width?: number, height?: number }
 *
 * ✅ Uses AIPresenter → IImageService (Clean Architecture)
 * ✅ Supports all configured image providers (Wavespeed, Gemini, Pollinations, etc.)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt } = body as {
      prompt?: string;
      width?: number;
      height?: number;
    };

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: "Missing required field: prompt" },
        { status: 400 },
      );
    }

    const presenter = createServerAIPresenter();

    // Build a style hint from dimensions for the image service
    const imageStyle = "photo-realistic";

    const imageResult = await presenter.generateImage({
      imagePrompt: prompt,
      imageStyle,
    });

    if (!imageResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: imageResult.error || "Failed to generate image",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      imageUrl: imageResult.imageUrl || null,
      base64Data: imageResult.base64Data || null,
      contentType: imageResult.contentType || null,
    });
  } catch (error) {
    console.error("[API generate-photo] ❌ Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 },
    );
  }
}
