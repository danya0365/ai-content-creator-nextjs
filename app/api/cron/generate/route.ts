/**
 * Cron Job API Route for Auto-generating Content
 * POST /api/cron/generate
 * 
 * This endpoint should be called by a cron scheduler (Vercel Cron, external cron, etc.)
 * to automatically generate content based on the current time slot.
 * 
 * ✅ Uses AIServiceFactory for provider switching
 * ✅ Uses SupabaseContentRepository for single source of truth
 */

import { CreateContentDTO } from '@/src/application/repositories/IContentRepository';
import { getContentTypesByTimeSlot, getCurrentTimeSlot } from '@/src/data/master/contentTypes';
import { AIServiceFactory } from '@/src/infrastructure/ai/AIServiceFactory';
import { SupabaseContentRepository } from '@/src/infrastructure/repositories/SupabaseContentRepository';
import { SupabaseStorageRepository } from '@/src/infrastructure/repositories/SupabaseStorageRepository';
import { createAdminClient } from '@/src/infrastructure/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

const AI_CONTENTS_BUCKET = 'ai-contents';

// No more static sample topics - we use AI to generate ideas instead!

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret (security check)
    const cronSecret = request.headers.get('x-cron-secret') || request.headers.get('authorization')?.replace('Bearer ', '');
    const expectedSecret = process.env.CRON_SECRET;

    // Allow localhost or valid secret
    const isLocalhost = request.headers.get('host')?.includes('localhost');
    if (!isLocalhost && expectedSecret && cronSecret !== expectedSecret) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // ✅ Check for specific content type requested via query param
    const { searchParams } = new URL(request.url);
    const requestedType = searchParams.get('type');
    
    // Get current time slot (optional if requestedType is present)
    const currentTimeSlot = getCurrentTimeSlot();
    if (!currentTimeSlot && !requestedType) {
      return NextResponse.json({
        success: true,
        message: 'No content to generate at this time (outside time slots)',
        timeSlot: null,
      });
    }

    let selectedContentType;
    let currentTimeSlotConfig = currentTimeSlot;

    if (requestedType) {
      const { getContentTypeById } = await import('@/src/data/master/contentTypes');
      selectedContentType = getContentTypeById(requestedType);
      
      // If requested type valid, we continue even if it doesn't match current time slot
      if (!selectedContentType) {
        return NextResponse.json({ error: 'Invalid content type requested' }, { status: 400 });
      }
    } else {
      // Get content types for current time slot
      const contentTypes = getContentTypesByTimeSlot(currentTimeSlot!.id);
      if (contentTypes.length === 0) {
        return NextResponse.json({
          success: true,
          message: `No content types configured for ${currentTimeSlot!.name}`,
          timeSlot: currentTimeSlot!.id,
        });
      }
      // Pick a random content type from available ones
      selectedContentType = contentTypes[Math.floor(Math.random() * contentTypes.length)];
    }

    // ✅ Use admin client and repositories (single source of truth)
    const supabase = createAdminClient();
    const contentRepo = new SupabaseContentRepository(supabase);
    const storageRepo = new SupabaseStorageRepository(supabase);

    // ✅ Use AIServiceFactory for easy provider switching
    const contentService = AIServiceFactory.createContentService();
    const imageService = AIServiceFactory.createImageService();

    // ✅ Generate dynamic topic idea using AI
    console.log(`[Cron] 🎨 Generating dynamic idea for: ${selectedContentType.id}`);
    const ideaResult = await contentService.generateTopicIdea(selectedContentType, {
      mode: 'trending', // Try to get trending ideas for cron
    });

    const topic = ideaResult.success && ideaResult.idea 
      ? ideaResult.idea 
      : `${selectedContentType.nameTh} ที่น่าสนใจประจำวัน`; // Fallback if AI idea fails

    // Generate text content
    const contentResult = await contentService.generateContent({
      contentType: selectedContentType,
      topic,
      timeSlot: currentTimeSlotConfig?.id || 'morning',
      language: 'th',
      imageStyle: selectedContentType.imageStyle || 'realistic', // Dynamic style
      platform: 'facebook', // Default
      tone: selectedContentType.category === 'islamic' ? 'respectful' : 'casual',
      brandContext: '',
    });

    if (!contentResult.success) {
      return NextResponse.json(
        { error: 'Failed to generate content', details: contentResult.error },
        { status: 500 }
      );
    }

    // Generate image
    let imageUrl = '';
    if (contentResult.imagePrompt) {
      const imageResult = await imageService.generateImage({
        imagePrompt: contentResult.imagePrompt,
        imageStyle: selectedContentType.imageStyle || 'realistic', // Dynamic style
      });

      // Upload to storage if generation was successful
      if (imageResult.success) {
        if (imageResult.base64Data) {
          // Upload base64 data
          try {
            imageUrl = await storageRepo.uploadBase64(
              imageResult.base64Data,
              `cron-${Date.now()}`,
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

    // Calculate scheduled time
    const now = new Date();
    const scheduledAt = new Date(now);
    scheduledAt.setMinutes(scheduledAt.getMinutes() + 5); // Schedule 5 minutes from now

    // ✅ Save to database using repository (single source of truth)
    const createDto: CreateContentDTO = {
      contentTypeId: selectedContentType.id,
      title: contentResult.title || `${topic} 🎨`,
      description: contentResult.description || '',
      imageUrl: imageUrl,
      prompt: contentResult.imagePrompt || '',
      timeSlot: (currentTimeSlotConfig?.id || 'morning') as 'morning' | 'lunch' | 'afternoon' | 'evening',
      scheduledAt: scheduledAt.toISOString(),
      status: 'scheduled',
      tags: contentResult.hashtags || [],
      emoji: selectedContentType.icon,
    };

    const savedContent = await contentRepo.create(createDto);

    return NextResponse.json({
      success: true,
      message: `Generated ${selectedContentType.nameTh} content${currentTimeSlot ? ` for ${currentTimeSlot.nameTh}` : ''}`,
      providers: {
        content: process.env.AI_PROVIDER || 'gemini',
        image: process.env.AI_IMAGE_PROVIDER || 'mock',
      },
      content: {
        id: savedContent.id,
        title: savedContent.title,
        contentType: selectedContentType.nameTh,
        timeSlot: currentTimeSlot?.nameTh || 'Custom',
        imageUrl: savedContent.imageUrl,
        scheduledAt: savedContent.scheduledAt,
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Cron Generate] ❌ Error:', errorMessage);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// Also allow GET for easier testing
export async function GET(request: NextRequest) {
  return POST(request);
}
