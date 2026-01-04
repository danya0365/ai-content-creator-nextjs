/**
 * GeminiContentService
 * Service for generating content using Google Gemini API
 */

import { ContentType } from '@/src/data/master/contentTypes';

export interface GenerateContentRequest {
  contentType: ContentType;
  topic: string;
  timeSlot: string;
  language?: 'th' | 'en';
}

export interface GenerateContentResponse {
  title: string;
  description: string;
  prompt: string;
  imagePrompt: string;
  hashtags: string[];
  success: boolean;
  error?: string;
}

/**
 * Generate content prompt based on type and topic
 */
function buildPrompt(request: GenerateContentRequest): string {
  const { contentType, topic, timeSlot, language = 'th' } = request;

  const timeContext = {
    morning: 'เช้าวันใหม่ที่สดใส',
    lunch: 'ช่วงพักเที่ยง',
    afternoon: 'บ่ายอันแสนสดใส',
    evening: 'ค่ำคืนที่ผ่อนคลาย',
  }[timeSlot] || '';

  return `
You are a creative content creator specializing in ${contentType.name} content. 
Create engaging social media content about: "${topic}"

Context: This content will be posted during ${timeContext}.
Content Type: ${contentType.name} - ${contentType.description}
Language: ${language === 'th' ? 'Thai' : 'English'}

Please provide:
1. A catchy title (max 50 chars)
2. An engaging description (100-200 chars)
3. A prompt for generating a pixel art image
4. 5 relevant hashtags

Format your response as JSON:
{
  "title": "...",
  "description": "...",
  "imagePrompt": "Create a cute pixel art illustration of...",
  "hashtags": ["#tag1", "#tag2", ...]
}
`;
}

/**
 * GeminiContentService class
 */
export class GeminiContentService {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Generate content using Gemini API
   */
  async generateContent(request: GenerateContentRequest): Promise<GenerateContentResponse> {
    if (!this.apiKey) {
      return this.getMockResponse(request);
    }

    try {
      const prompt = buildPrompt(request);

      const response = await fetch(
        `${this.baseUrl}/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: prompt }],
              },
            ],
            generationConfig: {
              temperature: 0.9,
              topP: 0.95,
              topK: 40,
              maxOutputTokens: 1024,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

      // Parse JSON from response
      const jsonMatch = textContent.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to parse Gemini response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      return {
        title: parsed.title || `${request.topic} 🎨`,
        description: parsed.description || `AI generated content about ${request.topic}`,
        prompt: buildPrompt(request),
        imagePrompt: parsed.imagePrompt || `Cute pixel art illustration of ${request.topic}`,
        hashtags: parsed.hashtags || ['#pixelart', '#ai', '#content'],
        success: true,
      };
    } catch (error) {
      console.error('Gemini API error:', error);
      return this.getMockResponse(request);
    }
  }

  /**
   * Fallback mock response when API is unavailable
   */
  private getMockResponse(request: GenerateContentRequest): GenerateContentResponse {
    return {
      title: `${request.topic} 🎨`,
      description: `คอนเทนต์สุดน่ารักเกี่ยวกับ ${request.topic} สร้างด้วย AI`,
      prompt: buildPrompt(request),
      imagePrompt: `Create a cute retro pixel art illustration about ${request.topic}. Style: 16-bit SNES era, bright colors, detailed backgrounds.`,
      hashtags: ['#PixelArt', '#AIContent', '#Creative', '#Digital', '#Retro'],
      success: true,
    };
  }
}
