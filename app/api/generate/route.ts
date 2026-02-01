/**
 * Generate Content API Route
 * POST /api/generate
 * 
 * Generates content with AI text and pixel art image
 * Uses AIServiceFactory for provider switching
 */

import { CreateContentDTO } from '@/src/application/repositories/IContentRepository';
import { CONTENT_TYPES, TimeSlot } from '@/src/data/master/contentTypes';
import { AIServiceFactory } from '@/src/infrastructure/ai/AIServiceFactory';
import { SupabaseContentRepository } from '@/src/infrastructure/repositories/SupabaseContentRepository';
import { SupabaseStorageRepository } from '@/src/infrastructure/repositories/SupabaseStorageRepository';
import { createAdminClient } from '@/src/infrastructure/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

const AI_CONTENTS_BUCKET = 'ai-contents';

interface GenerateRequest {
  contentTypeId: string;
  topic: string;
  timeSlot: TimeSlot;
  scheduledDate: string;
  scheduledTime: string;
  generateImage?: boolean; // Optional: whether to generate image
  saveToDb?: boolean; // Optional: whether to save to database
}

export async function POST(request: NextRequest) {
  try {
    // Initialize Supabase admin client (bypasses RLS) and repositories
    const supabase = createAdminClient();
    const contentRepo = new SupabaseContentRepository(supabase);
    const storageRepo = new SupabaseStorageRepository(supabase);

    const body: GenerateRequest = await request.json();

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

    // ✅ Use AIServiceFactory for easy provider switching
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
          // Upload base64 data
          try {
            imageUrl = await storageRepo.uploadBase64(
              imageResult.base64Data,
              `gen-${Date.now()}`,
              AI_CONTENTS_BUCKET,
              'generated'
            );
          } catch (uploadError) {
            console.error('Failed to upload image:', uploadError);
          }
        } else if (imageResult.imageUrl) {
          // Use direct URL (for mock/placeholder services)
          imageUrl = imageResult.imageUrl;
        }
      }
    }

    // Build scheduled datetime
    const scheduledAt = `${body.scheduledDate}T${body.scheduledTime}:00.000Z`;

    // Save to database using repository if requested (default: true)
    if (body.saveToDb !== false) {
      const createDto: CreateContentDTO = {
        contentTypeId: body.contentTypeId,
        title: result.title || `${body.topic} 🎨`,
        description: result.description || '',
        imageUrl: imageUrl || '',
        prompt: result.imagePrompt || '',
        timeSlot: body.timeSlot,
        scheduledAt,
        status: 'scheduled',
        tags: result.hashtags || [],
        emoji: contentType.icon,
      };

      const savedContent = await contentRepo.create(createDto);

      return NextResponse.json({
        success: true,
        content: savedContent,
      });
    }

    // Return generated content without saving
    const generatedContent = {
      id: `content-${Date.now()}`,
      contentTypeId: body.contentTypeId,
      title: result.title,
      description: result.description,
      imageUrl,
      prompt: result.prompt,
      imagePrompt: result.imagePrompt,
      hashtags: result.hashtags,
      timeSlot: body.timeSlot,
      scheduledAt,
      publishedAt: null,
      status: 'scheduled' as const,
      likes: 0,
      shares: 0,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      content: generatedContent,
    });
  } catch (error) {
    // ✅ Enhanced error logging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : '';
    
    console.error('[Generate API] ❌ Error:', errorMessage);
    console.error('[Generate API] Stack:', errorStack);
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? errorStack : undefined
      },
      { status: 500 }
    );
  }
}

