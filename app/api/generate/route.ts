/**
 * Generate Content API Route
 * POST /api/generate
 * 
 * Generates content with AI text and pixel art image
 */

import { CONTENT_TYPES, TimeSlot } from '@/src/data/master/contentTypes';
import { GeminiContentService } from '@/src/infrastructure/ai/GeminiContentService';
import { GeminiImageService } from '@/src/infrastructure/ai/GeminiImageService';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

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

    // Get API key from environment or headers
    const apiKey = process.env.GEMINI_API_KEY || request.headers.get('x-gemini-api-key') || '';

    // Generate text content
    const geminiService = new GeminiContentService(apiKey);
    const result = await geminiService.generateContent({
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
    if (body.generateImage !== false) {
      const imageService = new GeminiImageService(apiKey);
      const imageResult = await imageService.generateImage({
        imagePrompt: result.imagePrompt,
        contentId: `gen-${Date.now()}`,
      });
      
      if (imageResult.success && imageResult.imageUrl) {
        imageUrl = imageResult.imageUrl;
      }
    }

    // Create generated content object
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
      scheduledAt: `${body.scheduledDate}T${body.scheduledTime}:00.000Z`,
      publishedAt: null,
      status: 'scheduled' as const,
      likes: 0,
      shares: 0,
      createdAt: new Date().toISOString(),
    };

    // Save to database if requested
    if (body.saveToDb !== false) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (supabaseUrl && supabaseServiceKey) {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        
        const { data: savedContent, error: saveError } = await supabase
          .from('ai_contents')
          .insert({
            content_type_id: body.contentTypeId,
            title: result.title,
            description: result.description,
            image_url: imageUrl,
            prompt: result.imagePrompt,
            time_slot: body.timeSlot,
            scheduled_at: generatedContent.scheduledAt,
            status: 'scheduled',
            tags: result.hashtags,
            emoji: contentType.icon,
          })
          .select()
          .single();

        if (!saveError && savedContent) {
          generatedContent.id = savedContent.id;
        }
      }
    }

    return NextResponse.json({
      success: true,
      content: generatedContent,
    });
  } catch (error) {
    console.error('Generate API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
