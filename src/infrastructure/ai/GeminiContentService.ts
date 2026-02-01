/**
 * GeminiContentService
 * Service for generating content using Google Gemini API
 * 
 * ✅ Implements IContentService for provider switching
 * ✅ Single Responsibility: Only generates text content via Gemini API
 */

import {
  GenerateContentRequest,
  GenerateContentResponse,
  IContentService,
} from '@/src/application/services/IContentService';
import { ContentType } from '@/src/data/master/contentTypes';

/**
 * Generate content prompt based on type and topic
 */
function buildPrompt(contentType: ContentType, topic: string, timeSlot: string, language: string): string {
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
 * Implements IContentService for provider switching
 */
export class GeminiContentService implements IContentService {
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
      return {
        success: false,
        error: 'No Gemini API key provided',
      };
    }

    try {
      const { contentType, topic, timeSlot, language = 'th' } = request;
      const prompt = buildPrompt(contentType, topic, timeSlot, language);

      const response = await fetch(
        `${this.baseUrl}/models/gemini-2.0-flash:generateContent?key=${this.apiKey}`,
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
        const errorText = await response.text();
        console.error('Gemini API error:', errorText);
        return {
          success: false,
          error: `Gemini API error: ${response.status}`,
        };
      }

      const data = await response.json();
      const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

      // Parse JSON from response
      const jsonMatch = textContent.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return {
          success: false,
          error: 'Failed to parse Gemini response',
        };
      }

      const parsed = JSON.parse(jsonMatch[0]);

      return {
        success: true,
        title: parsed.title || `${request.topic} 🎨`,
        description: parsed.description || `AI generated content about ${request.topic}`,
        prompt: prompt,
        imagePrompt: parsed.imagePrompt || `Cute pixel art illustration of ${request.topic}`,
        hashtags: parsed.hashtags || ['#pixelart', '#ai', '#content'],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Gemini API error:', errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}
