/**
 * Generate Content API Route
 * POST /api/generate
 */

import { CONTENT_TYPES, TimeSlot } from '@/src/data/master/contentTypes';
import { GeminiContentService } from '@/src/infrastructure/ai/GeminiContentService';
import { NextRequest, NextResponse } from 'next/server';

interface GenerateRequest {
  contentTypeId: string;
  topic: string;
  timeSlot: TimeSlot;
  scheduledDate: string;
  scheduledTime: string;
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

    // Generate content
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

    // Create generated content object
    const generatedContent = {
      id: `content-${Date.now()}`,
      contentTypeId: body.contentTypeId,
      title: result.title,
      description: result.description,
      imageUrl: null, // Will be generated separately
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
