/**
 * AI Multi-Platform Content Generation API Route
 * POST /api/ai/generate-multi
 * 
 * Generates variants of text content using Promise.all for different platforms,
 * but only generates ONE image (shared asset) to save time and API costs.
 */

import { CONTENT_TYPES, TimeSlot } from '@/src/data/master/contentTypes';
import { AIServiceFactory } from '@/src/infrastructure/ai/AIServiceFactory';
import { SupabaseStorageRepository } from '@/src/infrastructure/repositories/SupabaseStorageRepository';
import { createAdminClient } from '@/src/infrastructure/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

const AI_CONTENTS_BUCKET = 'ai-contents';

interface AIMultiGenerateRequest {
  contentTypeId: string;
  topic: string;
  timeSlot: TimeSlot;
  imageStyle: string;
  platforms: string[]; // array of platforms to target
  tone?: string;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const storageRepo = new SupabaseStorageRepository(supabase);

    const body: AIMultiGenerateRequest = await request.json();
    const { 
      contentTypeId, 
      topic, 
      timeSlot, 
      imageStyle, 
      platforms,
      tone
    } = body;

    // Validate
    if (!contentTypeId || !topic || !platforms || platforms.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: contentTypeId, topic, and at least one platform' },
        { status: 400 }
      );
    }

    const contentType = CONTENT_TYPES.find((t) => t.id === contentTypeId);
    if (!contentType) {
      return NextResponse.json(
        { error: 'Invalid content type' },
        { status: 400 }
      );
    }

    const contentService = AIServiceFactory.createContentService();
    const imageService = AIServiceFactory.createImageService();

    // 1. Fan-out Content Generation (Parallel LLM Inference)
    const textPromises = platforms.map(platform => 
      contentService.generateContent({
        contentType,
        topic,
        timeSlot,
        imageStyle,
        platform,
        tone,
        language: 'th',
      })
    );

    const textResults = await Promise.all(textPromises);

    // Check if ALL failed
    if (textResults.every(r => !r.success)) {
      return NextResponse.json(
        { error: 'Failed to generate any content variants', details: textResults[0].error },
        { status: 500 }
      );
    }

    // 2. Extract single master image prompt from the first successful result
    const masterImagePrompt = 
      textResults.find(r => r.success && r.imagePrompt)?.imagePrompt || 
      textResults.find(r => r.success && r.prompt)?.prompt;

    // 3. Generate Single Image Asset
    let imageUrl: string | null = null;
    
    if (masterImagePrompt) {
      const imageResult = await imageService.generateImage({
        imagePrompt: masterImagePrompt,
        imageStyle: body.imageStyle,
      });
      
      if (imageResult.success) {
        if (imageResult.base64Data) {
          try {
            imageUrl = await storageRepo.uploadBase64(
              imageResult.base64Data,
              `multi-gen-${Date.now()}`,
              AI_CONTENTS_BUCKET,
              'generated',
              imageResult.contentType,
              imageResult.extension
            );
          } catch (uploadError) {
            console.error('[AI Generate-Multi] Failed to upload image:', uploadError);
          }
        } else if (imageResult.imageUrl) {
          imageUrl = imageResult.imageUrl;
        }
      }
    }

    // 4. Map back into an array of perfectly shaped form instances
    const contents = textResults.map((result, index) => {
      // If a specific platform failed to generate, fallback gracefully or omit
      if (!result.success) {
        return null; 
      }
      
      return {
        contentTypeId: body.contentTypeId,
        title: result.title || `${body.topic} 🎨`,
        description: result.description || '',
        imageUrl: imageUrl || '',
        prompt: masterImagePrompt || result.prompt || '',
        timeSlot: body.timeSlot,
        tags: result.hashtags || [],
        emoji: contentType.icon,
        // we attach the target platform so the frontend knows which is which
        targetPlatform: platforms[index] 
      };
    }).filter(Boolean); // remove nulls

    return NextResponse.json({
      success: true,
      contents
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[AI Generate-Multi] ❌ Error:', errorMessage);
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
