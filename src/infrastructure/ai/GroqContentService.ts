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

  prompt += `\n\nPlease provide your response in this exact JSON format (no markdown, just raw JSON):
{
  "title": "A catchy title (max 50 chars)",
  "description": "An engaging description (100-200 chars)",
  "imagePrompt": "Create ${style.contentPromptInstruction}...",
  "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"]
}`;

  return prompt;
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
      const { contentType, topic, timeSlot, language = 'th', imageStyle, platform, tone, brandContext } = request;
      const prompt = buildPrompt(contentType, topic, timeSlot, language, imageStyle, platform, tone, brandContext);

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
      console.error('Groq API error:', errorMessage);
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
    if (!this.apiKey) return { success: false, error: 'No Groq API key' };
    try {
      let systemPrompt = 'You are a creative brainstorming assistant. Reply with ONLY ONE short, engaging topic idea (in Thai) for the requested category. Do not include any quotes or markdown formatting.';
      if (options?.trends && options.trends.length > 0) {
        systemPrompt += `\n\nCRITICAL CONTEXT: Base your topic idea heavily around at least one of these current trending topics in Thailand: [${options.trends.join(', ')}]. This is a "Trendjacking" requirement.`;
      }
      if (options?.brandContext && options.brandContext.trim() !== '') {
        systemPrompt += `\n\nBRAND PERSONA: Ensure the idea aligns strictly with this brand styling: ${options.brandContext}`;
      }

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.apiKey}` },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Generate one topic idea about ${contentType.nameTh} (${contentType.name}).` }
          ],
          temperature: 0.9, max_tokens: 100,
        }),
      });
      if (!response.ok) return { success: false, error: `Groq API error: ${response.status}` };
      const data = await response.json();
      const idea = data.choices?.[0]?.message?.content?.replace(/["*/]/g, '').trim();
      return { success: !!idea, idea, error: idea ? undefined : 'No idea generated' };
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
    }
  }
}
