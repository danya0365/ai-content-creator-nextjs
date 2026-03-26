/**
 * WavespeedContentService
 * Service for generating content using Wavespeed AI API
 * 
 * ✅ Supports 700+ AI models
 * ✅ Async task-based generation (polling)
 * ✅ Unified API interface
 * 
 * Get API key: https://wavespeed.ai/
 */

import {
  GenerateContentRequest,
  GenerateContentResponse,
  GenerateTopicIdeaResponse,
  IContentService,
} from '@/src/application/services/IContentService';
import {
  WavespeedContentModel,
  resolveWavespeedContentModel,
} from './WavespeedModels';
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
  imageStyleId: string,
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

  const style = getImageStyleById(imageStyleId);
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
 * WavespeedContentService class
 * Implements IContentService using Wavespeed AI API
 */
export class WavespeedContentService implements IContentService {
  private apiKey: string;
  // Wavespeed Model UUID - Text generation (strict typed)
  private modelUuid: WavespeedContentModel;
  private baseUrl = 'https://api.wavespeed.ai/api/v3';

  /**
   * @param apiKey - Wavespeed AI API key
   * @param modelUuid - Optional Model UUID (validated against WavespeedContentModel)
   */
  constructor(apiKey: string, modelUuid?: string) {
    this.apiKey = apiKey;
    this.modelUuid = resolveWavespeedContentModel(modelUuid);
  }

  async generateContent(request: GenerateContentRequest): Promise<GenerateContentResponse> {
    if (!this.apiKey) {
      return {
        success: false,
        error: 'No Wavespeed AI API key provided',
      };
    }

    if (!this.modelUuid) {
      return {
        success: false,
        error: 'No Wavespeed Content Model UUID provided',
      };
    }

    try {
      const { contentType, topic, timeSlot, language = 'th', imageStyle, platform, tone, brandContext } = request;
      const prompt = buildPrompt(contentType, topic, timeSlot, language, imageStyle, platform, tone, brandContext);

      console.log(`[WavespeedContentService] Submitting task for model: ${this.modelUuid}`);
      
      // 1. Submit the task
      const submitResponse = await fetch(`${this.baseUrl}/${this.modelUuid}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          prompt: prompt,
        }),
      });

      if (!submitResponse.ok) {
        const errorText = await submitResponse.text();
        console.error('Wavespeed API submit error:', errorText);
        return {
          success: false,
          error: `Wavespeed API submit error: ${submitResponse.status}`,
        };
      }

      const submitData = await submitResponse.json();
      const taskId = submitData.data?.id || submitData.id;
      const pollUrl = submitData.data?.urls?.get || submitData.urls?.get || `${this.baseUrl}/predictions/${taskId}/result`;

      if (!taskId) {
        return {
          success: false,
          error: 'Failed to get task ID from Wavespeed AI',
        };
      }

      console.log(`[WavespeedContentService] Task created: ${taskId}. Polling for results...`);

      // 2. Poll for results
      return await this.pollForResults(pollUrl, taskId, prompt, topic, imageStyle);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Wavespeed content generation error:', errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Poll Wavespeed API for task completion
   */
  private async pollForResults(pollUrl: string, taskId: string, prompt: string, topic: string, imageStyle: string, maxRetries = 30, intervalMs = 2000): Promise<GenerateContentResponse> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await fetch(pollUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
          },
        });

        if (!response.ok) {
          console.error(`Wavespeed poll error (${response.status})`);
          continue; // Try again
        }

        const data = await response.json();
        const status = data.data?.status || data.status;

        if (status === 'completed' || status === 'success') {
          const outputs = data.data?.outputs || data.outputs;
          const textContent = outputs?.[0]?.text || outputs?.[0];

          if (textContent) {
             // Parse JSON from response
            const jsonMatch = textContent.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                return {
                success: false,
                error: 'Failed to parse Wavespeed response as JSON',
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
          }
          return {
            success: false,
            error: 'Task completed but no content found',
          };
        } else if (status === 'failed') {
          return {
            success: false,
            error: `Wavespeed task failed: ${data.data?.error || data.error || 'Unknown error'}`,
          };
        }

        // Wait before next poll
        await new Promise(resolve => setTimeout(resolve, intervalMs));
      } catch (error) {
        console.error('Polling error:', error);
      }
    }

    return {
      success: false,
      error: 'Polling timed out after 60 seconds',
    };
  }

  async generateTopicIdea(
    contentType: ContentType,
    options?: { trends?: string[]; brandContext?: string }
  ): Promise<GenerateTopicIdeaResponse> {
    if (!this.apiKey) return { success: false, error: 'No Wavespeed API key' };
    try {
      let systemPrompt = 'You are a creative brainstorming assistant. Reply with ONLY ONE short, engaging topic idea (in Thai) for the requested category. Do not include any quotes or markdown formatting.';
      if (options?.trends && options.trends.length > 0) {
        systemPrompt += `\n\nCRITICAL CONTEXT: Base your topic idea heavily around at least one of these current trending topics in Thailand: [${options.trends.join(', ')}]. This is a "Trendjacking" requirement.`;
      }
      if (options?.brandContext && options.brandContext.trim() !== '') {
        systemPrompt += `\n\nBRAND PERSONA: Ensure the idea aligns strictly with this brand styling: ${options.brandContext}`;
      }

      // 1. Submit the task
      const submitResponse = await fetch(`${this.baseUrl}/${this.modelUuid}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Generate one topic idea about ${contentType.nameTh} (${contentType.name}).` }
          ],
          temperature: 0.9, max_tokens: 100,
        }),
      });

      if (!submitResponse.ok) return { success: false, error: `Wavespeed API error: ${submitResponse.status}` };
      const submitData = await submitResponse.json();
      const taskId = submitData.data?.id || submitData.id;
      const pollUrl = submitData.data?.urls?.get || submitData.urls?.get || `${this.baseUrl}/predictions/${taskId}/result`;

      // 2. Poll for results (fast polling for idea generation)
      for (let i = 0; i < 20; i++) {
        const pollResponse = await fetch(pollUrl, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${this.apiKey}` },
        });

        if (pollResponse.ok) {
          const data = await pollResponse.json();
          const status = data.data?.status || data.status;

          if (status === 'completed' || status === 'success') {
            const outputs = data.data?.outputs || data.outputs;
            const idea = outputs?.[0]?.replace(/["*/]/g, '').trim();
            return { success: !!idea, idea, error: idea ? undefined : 'No idea generated' };
          } else if (status === 'failed') {
            return { success: false, error: `Task failed` };
          }
        }
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
      return { success: false, error: 'Polling timed out' };
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
    }
  }
}
