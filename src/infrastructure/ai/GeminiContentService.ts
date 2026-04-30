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
  GenerateTopicIdeaResponse,
  IContentService,
} from '@/src/application/services/IContentService';
import { ContentType } from '@/src/data/master/contentTypes';
import { getImageStyleById } from '@/src/data/master/imageStyles';
import { getPlatformById } from '@/src/data/master/platforms';
import { getToneById } from '@/src/data/master/tones';

/**
 * Generate content prompt based on type and topic
 */
function buildPrompt(
  contentType: ContentType, 
  topic: string, 
  timeSlot: string, 
  language: string, 
  imageStyle: string,
  platformId?: string,
  toneId?: string,
  brandContext?: string
): string {
  const timeContext = {
    morning: 'เช้าวันใหม่ที่สดใส',
    lunch: 'ช่วงพักเที่ยง',
    afternoon: 'บ่ายอันแสนสดใส',
    evening: 'ค่ำคืนที่ผ่อนคลาย',
  }[timeSlot] || '';

  const style = getImageStyleById(imageStyle);
  const platform = platformId ? getPlatformById(platformId) : null;
  const tone = toneId ? getToneById(toneId) : null;

  let prompt = `You are a creative content creator specializing in ${contentType.name} content. 
Create engaging social media content about: "${topic}"

Context: This content will be posted during ${timeContext}.
Content Type: ${contentType.name} - ${contentType.description}
Language: ${language === 'th' ? 'Thai' : 'English'}`;

  if (platform) {
    prompt += `\n\n[CRITICAL SOCIAL PLATFORM CONSTRAINTS: ${platform.nameEn}]\n${platform.promptGuidance}`;
  }
  
  if (tone) {
    prompt += `\n\n[TONE OF VOICE: ${tone.nameEn}]\n${tone.promptModifier}`;
  }

  if (brandContext && brandContext.trim() !== '') {
    prompt += `\n\n[BRAND PERSONA & CUSTOM INSTRUCTIONS]\nYou must strictly adhere to the following brand guidelines and styles:\n${brandContext}`;
  }

  prompt += `

Please provide:
1. A catchy title (max 50 chars)
2. An engaging description (100-200 chars)
3. A prompt for generating a ${style.nameEn} image
4. 5 relevant hashtags

Format your response as JSON:
{
  "title": "...",
  "description": "...",
  "imagePrompt": "Create ${style.contentPromptInstruction}...",
  "hashtags": ["#tag1", "#tag2", ...]
}
`;

  return prompt;
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
      const { contentType, topic, timeSlot, language = 'th', imageStyle, platform, tone, brandContext } = request;
      const prompt = buildPrompt(contentType, topic, timeSlot, language, imageStyle, platform, tone, brandContext);

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
      const style = getImageStyleById(imageStyle);

      return {
        success: true,
        title: parsed.title || `${request.topic} 🎨`,
        description: parsed.description || `AI generated content about ${request.topic}`,
        prompt: prompt,
        imagePrompt: parsed.imagePrompt || `Cute ${style.nameEn} illustration of ${request.topic}`,
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

  async generateTopicIdea(
    contentType: ContentType,
    options?: { trends?: string[]; brandContext?: string; mode?: string }
  ): Promise<GenerateTopicIdeaResponse> {
    if (!this.apiKey) return { success: false, error: 'No Gemini API key' };
    try {
      let prompt = `You are a creative brainstorming assistant. Reply with ONLY ONE short, engaging topic idea (in Thai) for a ${contentType.nameTh} (${contentType.name}) content. Do not include any quotes or markdown formatting.`;
      if (options?.trends && options.trends.length > 0) {
        prompt += `\n\nCRITICAL CONTEXT: Base your topic idea heavily around at least one of these current trending topics in Thailand: [${options.trends.join(', ')}]. This is a "Trendjacking" requirement.`;
      }
      if (options?.brandContext && options.brandContext.trim() !== '') {
        prompt += `\n\nBRAND PERSONA: Ensure the idea aligns strictly with this brand styling: ${options.brandContext}`;
      }

      const response = await fetch(`${this.baseUrl}/models/gemini-2.0-flash:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.9, maxOutputTokens: 100 },
        }),
      });
      if (!response.ok) return { success: false, error: `Gemini API error: ${response.status}` };
      const data = await response.json();
      const idea = data.candidates?.[0]?.content?.parts?.[0]?.text?.replace(/["*/]/g, '').trim();
      return { success: !!idea, idea, error: idea ? undefined : 'No idea generated' };
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
    }
  }
}
