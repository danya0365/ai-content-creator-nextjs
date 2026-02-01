/**
 * GroqContentService
 * Service for generating content using Groq API (Llama, Mixtral)
 * 
 * ✅ FREE tier available
 * ✅ Fast inference
 * ✅ Supports: llama-3.3-70b-versatile, mixtral-8x7b-32768
 * 
 * Get API key: https://console.groq.com/keys
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

  return `You are a creative content creator specializing in ${contentType.name} content. 
Create engaging social media content about: "${topic}"

Context: This content will be posted during ${timeContext}.
Content Type: ${contentType.name} - ${contentType.description}
Language: ${language === 'th' ? 'Thai' : 'English'}

Please provide your response in this exact JSON format (no markdown, just raw JSON):
{
  "title": "A catchy title (max 50 chars)",
  "description": "An engaging description (100-200 chars)",
  "imagePrompt": "Create a cute pixel art illustration of...",
  "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"]
}`;
}

/**
 * GroqContentService class
 * Implements IContentService using Groq API
 */
export class GroqContentService implements IContentService {
  private apiKey: string;
  private baseUrl = 'https://api.groq.com/openai/v1';
  private model = 'llama-3.3-70b-versatile'; // Free tier model

  constructor(apiKey: string, model?: string) {
    this.apiKey = apiKey;
    if (model) this.model = model;
  }

  async generateContent(request: GenerateContentRequest): Promise<GenerateContentResponse> {
    if (!this.apiKey) {
      return {
        success: false,
        error: 'No Groq API key provided',
      };
    }

    try {
      const { contentType, topic, timeSlot, language = 'th' } = request;
      const prompt = buildPrompt(contentType, topic, timeSlot, language);

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'You are a creative content creator. Always respond with valid JSON only, no markdown.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.9,
          max_tokens: 1024,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Groq API error:', errorText);
        return {
          success: false,
          error: `Groq API error: ${response.status}`,
        };
      }

      const data = await response.json();
      const textContent = data.choices?.[0]?.message?.content || '';

      // Parse JSON from response
      const jsonMatch = textContent.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return {
          success: false,
          error: 'Failed to parse Groq response',
        };
      }

      const parsed = JSON.parse(jsonMatch[0]);

      return {
        success: true,
        title: parsed.title || `${topic} 🎨`,
        description: parsed.description || `AI generated content about ${topic}`,
        prompt: prompt,
        imagePrompt: parsed.imagePrompt || `Cute pixel art illustration of ${topic}`,
        hashtags: parsed.hashtags || ['#pixelart', '#ai', '#content'],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Groq API error:', errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}
