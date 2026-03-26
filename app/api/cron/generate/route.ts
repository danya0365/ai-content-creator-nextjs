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

// Sample topics for auto-generation
const SAMPLE_TOPICS = {
  'morning-news': [
    'เทคโนโลยี AI ล่าสุดวันนี้',
    'ข่าวเด่นประจำวัน',
    'นวัตกรรมที่น่าสนใจ',
    'เทรนด์ใหม่ในโลกดิจิทัล',
    'ความก้าวหน้าทางวิทยาศาสตร์',
  ],
  'food': [
    'ผัดกะเพราหมูสับ',
    'ต้มยำกุ้ง',
    'ข้าวมันไก่',
    'ส้มตำ',
    'ก๋วยเตี๋ยวเรือ',
    'ข้าวผัดปู',
    'แกงเขียวหวาน',
  ],
  'entertainment': [
    'มุกตลกวันนี้',
    'เรื่องขำขัน',
    'ความบันเทิงออนไลน์',
    'หนังดังที่ต้องดู',
    'ซีรีส์น่าติดตาม',
  ],
  'tech-tips': [
    'วิธีประหยัดแบตมือถือ',
    'เทคนิคใช้ AI ให้เก่งขึ้น',
    'แอปดีๆ ที่ควรมี',
    'เคล็ดลับเพิ่มความเร็วคอม',
    'การรักษาความปลอดภัยออนไลน์',
  ],
  'daily-motivation': [
    'คำคมสร้างแรงบันดาลใจ',
    'เริ่มต้นวันใหม่อย่างมีพลัง',
    'ก้าวข้ามอุปสรรคในชีวิต',
    'ความสำเร็จเริ่มจากก้าวแรก',
    'วันนี้ดีกว่าเมื่อวาน',
  ],
  'gaming': [
    'เกมใหม่น่าเล่น',
    'เทคนิคเล่นเกมให้เก่งขึ้น',
    'ข่าววงการเกม',
    'อีสปอร์ตไทย',
    'เกมมือถือยอดนิยม',
  ],
};

function getRandomTopic(contentTypeId: string): string {
  const topics = SAMPLE_TOPICS[contentTypeId as keyof typeof SAMPLE_TOPICS] || ['คอนเทนต์น่าสนใจประจำวัน'];
  return topics[Math.floor(Math.random() * topics.length)];
}

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

    // Get current time slot
    const currentTimeSlot = getCurrentTimeSlot();
    if (!currentTimeSlot) {
      return NextResponse.json({
        success: true,
        message: 'No content to generate at this time (outside time slots)',
        timeSlot: null,
      });
    }

    // Get content types for current time slot
    const contentTypes = getContentTypesByTimeSlot(currentTimeSlot.id);
    if (contentTypes.length === 0) {
      return NextResponse.json({
        success: true,
        message: `No content types configured for ${currentTimeSlot.name}`,
        timeSlot: currentTimeSlot.id,
      });
    }

    // ✅ Use admin client and repositories (single source of truth)
    const supabase = createAdminClient();
    const contentRepo = new SupabaseContentRepository(supabase);
    const storageRepo = new SupabaseStorageRepository(supabase);

    // ✅ Use AIServiceFactory for easy provider switching
    const contentService = AIServiceFactory.createContentService();
    const imageService = AIServiceFactory.createImageService();

    // Pick a random content type from available ones
    const selectedContentType = contentTypes[Math.floor(Math.random() * contentTypes.length)];
    const topic = getRandomTopic(selectedContentType.id);

    // Generate text content
    const contentResult = await contentService.generateContent({
      contentType: selectedContentType,
      topic,
      timeSlot: currentTimeSlot.id,
      language: 'th',
      imageStyle: 'pixel-art', // Required field
      platform: 'facebook', // Default
      tone: 'casual', // Default
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
        imageStyle: 'pixel-art', // Required field
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
      timeSlot: currentTimeSlot.id as 'morning' | 'lunch' | 'afternoon' | 'evening',
      scheduledAt: scheduledAt.toISOString(),
      status: 'scheduled',
      tags: contentResult.hashtags || [],
      emoji: selectedContentType.icon,
    };

    const savedContent = await contentRepo.create(createDto);

    return NextResponse.json({
      success: true,
      message: `Generated ${selectedContentType.nameTh} content for ${currentTimeSlot.nameTh}`,
      providers: {
        content: process.env.AI_PROVIDER || 'gemini',
        image: process.env.AI_IMAGE_PROVIDER || 'mock',
      },
      content: {
        id: savedContent.id,
        title: savedContent.title,
        contentType: selectedContentType.nameTh,
        timeSlot: currentTimeSlot.nameTh,
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
