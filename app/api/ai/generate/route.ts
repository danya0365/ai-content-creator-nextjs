/**
 * AI Content Generation API Route
 * POST /api/ai/generate
 * 
 * Exclusively handles AI content generation (text + image) 
 * via AIServiceFactory and uploads the result to Supabase Storage.
 * DOES NOT save to the database.
 */

import { CONTENT_TYPES, TimeSlot } from '@/src/data/master/contentTypes';
import { AIServiceFactory } from '@/src/infrastructure/ai/AIServiceFactory';
import { SupabaseStorageRepository } from '@/src/infrastructure/repositories/SupabaseStorageRepository';
import { createAdminClient } from '@/src/infrastructure/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

const AI_CONTENTS_BUCKET = 'ai-contents';

interface AIGenerateRequest {
  contentTypeId: string;
  topic: string;
  timeSlot: TimeSlot;
  generateImage?: boolean; // Optional: whether to generate image
}

export async function POST(request: NextRequest) {
  try {
    // Initialize Supabase admin client for storage uploads
    const supabase = createAdminClient();
    const storageRepo = new SupabaseStorageRepository(supabase);

    const body: AIGenerateRequest = await request.json();

    // Validate request
    if (!body.contentTypeId || !body.topic) {
      return NextResponse.json(
        { error: 'Missing required fields: contentTypeId and topic' },
        { status: 400 }
      );
    }

    const contentType = CONTENT_TYPES.find((t) => t.id === body.contentTypeId);
    if (!contentType) {
      return NextResponse.json(
        { error: 'Invalid content type' },
        { status: 400 }
      );
    }

    // Use AIServiceFactory for provider switching
    const contentService = AIServiceFactory.createContentService();
    const imageService = AIServiceFactory.createImageService();

    // Generate text content
    const result = await contentService.generateContent({
      contentType,
      topic: body.topic,
      timeSlot: body.timeSlot,
      language: 'th',
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to generate content' },
        { status: 500 }
      );
    }

    // Generate pixel art image if requested (default: true)
    let imageUrl: string | null = null;
    if (body.generateImage !== false && result.imagePrompt) {
      const imageResult = await imageService.generateImage({
        imagePrompt: result.imagePrompt,
      });
      
      // Upload to storage if generation was successful
      if (imageResult.success) {
        if (imageResult.base64Data) {
          // Upload base64 data to Supabase Storage
          try {
            imageUrl = await storageRepo.uploadBase64(
              imageResult.base64Data,
              `gen-${Date.now()}`,
              AI_CONTENTS_BUCKET,
              'generated',
              imageResult.contentType,
              imageResult.extension
            );
          } catch (uploadError) {
            console.error('[AI Generate API] Failed to upload image:', uploadError);
          }
        } else if (imageResult.imageUrl) {
          // Use direct URL (for mock/placeholder services)
          imageUrl = imageResult.imageUrl;
        }
      }
    }

    // Return pure generated payload back to the client
    return NextResponse.json({
      success: true,
      content: {
        contentTypeId: body.contentTypeId,
        title: result.title || `${body.topic} 🎨`,
        description: result.description || '',
        imageUrl: imageUrl || '',
        prompt: result.imagePrompt || result.prompt || '',
        timeSlot: body.timeSlot,
        tags: result.hashtags || [],
        emoji: contentType.icon,
      }
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : '';
    
    console.error('[AI Generate API] ❌ Error:', errorMessage);
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? errorStack : undefined
      },
      { status: 500 }
    );
  }
}
