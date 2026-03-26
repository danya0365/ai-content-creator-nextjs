/**
 * OpenRouterContentService
 * Service for generating content using OpenRouter API
 * 
 * ✅ FREE models available (some Llama/Mistral variants)
 * ✅ Many models to choose from
 * ✅ Pay-per-use for premium models
 * 
 * Get API key: https://openrouter.ai/keys
 * Free models: https://openrouter.ai/docs#models (filter by free)
 */

import {
    GenerateContentRequest,
    GenerateContentResponse,
    IContentService,
} from '@/src/application/services/IContentService';
import { ContentType } from '@/src/data/master/contentTypes';
import { getImageStyleById } from '@/src/data/master/imageStyles';

/**
 * Generate content prompt based on type and topic
 */
function buildPrompt(contentType: ContentType, topic: string, timeSlot: string, language: string, imageStyle: string): string {
  const timeContext = {
    morning: 'เช้าวันใหม่ที่สดใส',
    lunch: 'ช่วงพักเที่ยง',
    afternoon: 'บ่ายอันแสนสดใส',
    evening: 'ค่ำคืนที่ผ่อนคลาย',
  }[timeSlot] || '';

  const style = getImageStyleById(imageStyle);

  return `You are a creative content creator specializing in ${contentType.name} content. 
Create engaging social media content about: "${topic}"

Context: This content will be posted during ${timeContext}.
Content Type: ${contentType.name} - ${contentType.description}
Language: ${language === 'th' ? 'Thai' : 'English'}

Please provide your response in this exact JSON format (no markdown, just raw JSON):
{
  "title": "A catchy title (max 50 chars)",
  "description": "An engaging description (100-200 chars)",
  "imagePrompt": "Create ${style.contentPromptInstruction}...",
  "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"]
}`;
}

/**
 * OpenRouterContentService class
 * Implements IContentService using OpenRouter API
 */
export class OpenRouterContentService implements IContentService {
  private apiKey: string;
  private baseUrl = 'https://openrouter.ai/api/v1';
  private model: string;

  /**
   * @param apiKey - OpenRouter API key
   * @param model - Model to use (default: meta-llama/llama-3.2-3b-instruct:free)
   */
  constructor(apiKey: string, model = 'meta-llama/llama-3.2-3b-instruct:free') {
    this.apiKey = apiKey;
    this.model = model;
  }

  async generateContent(request: GenerateContentRequest): Promise<GenerateContentResponse> {
    if (!this.apiKey) {
      return {
        success: false,
        error: 'No OpenRouter API key provided',
      };
    }

    try {
      const { contentType, topic, timeSlot, language = 'th', imageStyle } = request;
      const prompt = buildPrompt(contentType, topic, timeSlot, language, imageStyle);

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
          'X-Title': 'AI Content Creator',
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
        console.error('OpenRouter API error:', errorText);
        return {
          success: false,
          error: `OpenRouter API error: ${response.status}`,
        };
      }

      const data = await response.json();
      const textContent = data.choices?.[0]?.message?.content || '';

      // Parse JSON from response
      const jsonMatch = textContent.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return {
          success: false,
          error: 'Failed to parse OpenRouter response',
        };
      }

      const parsed = JSON.parse(jsonMatch[0]);
      const style = getImageStyleById(imageStyle);

      return {
        success: true,
        title: parsed.title || `${topic} 🎨`,
        description: parsed.description || `AI generated content about ${topic}`,
        prompt: prompt,
        imagePrompt: parsed.imagePrompt || `Cute ${style.nameEn} illustration of ${topic}`,
        hashtags: parsed.hashtags || ['#pixelart', '#ai', '#content'],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('OpenRouter API error:', errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}
