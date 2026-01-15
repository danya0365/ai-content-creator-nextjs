/**
 * Cron Job API Route for Auto-generating Content
 * POST /api/cron/generate
 * 
 * This endpoint should be called by a cron scheduler (Vercel Cron, external cron, etc.)
 * to automatically generate content based on the current time slot.
 */

import { getContentTypesByTimeSlot, getCurrentTimeSlot } from '@/src/data/master/contentTypes';
import { GeminiContentService } from '@/src/infrastructure/ai/GeminiContentService';
import { GeminiImageService } from '@/src/infrastructure/ai/GeminiImageService';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

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

    // Get API key
    const apiKey = process.env.GEMINI_API_KEY || '';

    // Initialize services
    const contentService = new GeminiContentService(apiKey);
    const imageService = new GeminiImageService(apiKey);

    // Setup Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Missing Supabase configuration' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Pick a random content type from available ones
    const selectedContentType = contentTypes[Math.floor(Math.random() * contentTypes.length)];
    const topic = getRandomTopic(selectedContentType.id);

    // Generate text content
    const contentResult = await contentService.generateContent({
      contentType: selectedContentType,
      topic,
      timeSlot: currentTimeSlot.id,
      language: 'th',
    });

    if (!contentResult.success) {
      return NextResponse.json(
        { error: 'Failed to generate content', details: contentResult.error },
        { status: 500 }
      );
    }

    // Generate pixel art image
    const imageResult = await imageService.generateImage({
      imagePrompt: contentResult.imagePrompt,
      contentId: `cron-${Date.now()}`,
    });

    // Calculate scheduled time
    const now = new Date();
    const scheduledAt = new Date(now);
    scheduledAt.setMinutes(scheduledAt.getMinutes() + 5); // Schedule 5 minutes from now

    // Save to database
    const { data: savedContent, error: saveError } = await supabase
      .from('ai_contents')
      .insert({
        content_type_id: selectedContentType.id,
        title: contentResult.title,
        description: contentResult.description,
        image_url: imageResult.imageUrl || null,
        prompt: contentResult.imagePrompt,
        time_slot: currentTimeSlot.id,
        scheduled_at: scheduledAt.toISOString(),
        status: 'scheduled',
        tags: contentResult.hashtags,
        emoji: selectedContentType.icon,
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving content:', saveError);
      return NextResponse.json(
        { error: 'Failed to save content', details: saveError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Generated ${selectedContentType.nameTh} content for ${currentTimeSlot.nameTh}`,
      content: {
        id: savedContent.id,
        title: savedContent.title,
        contentType: selectedContentType.nameTh,
        timeSlot: currentTimeSlot.nameTh,
        imageUrl: savedContent.image_url,
        scheduledAt: savedContent.scheduled_at,
      },
    });
  } catch (error) {
    console.error('Cron generate error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Also allow GET for easier testing
export async function GET(request: NextRequest) {
  return POST(request);
}
