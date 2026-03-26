/**
 * WavespeedImageService
 * Service for generating images using Wavespeed AI API
 * 
 * ✅ Supports 700+ AI models
 * ✅ Async task-based generation (polling)
 * ✅ Unified API interface
 * 
 * Get API key: https://wavespeed.ai/
 */

import {
  GenerateImageRequest,
  GenerateImageResponse,
  IImageService,
} from '@/src/application/services/IImageService';
import {
  WavespeedImageModel,
  resolveWavespeedImageModel,
} from './WavespeedModels';
import { getImageStyleById } from '@/src/data/master/imageStyles';

/**
 * WavespeedImageService class
 * Implements IImageService using Wavespeed AI API
 */
export class WavespeedImageService implements IImageService {
  private apiKey: string;
  // Wavespeed Model UUID - Image generation (strict typed)
  private modelUuid: WavespeedImageModel;
  private baseUrl = 'https://api.wavespeed.ai/api/v3';

  /**
   * @param apiKey - Wavespeed AI API key
   * @param modelUuid - Optional Model UUID (validated against WavespeedImageModel)
   */
  constructor(apiKey: string, modelUuid?: string) {
    this.apiKey = apiKey;
    this.modelUuid = resolveWavespeedImageModel(modelUuid);
  }

  async generateImage(request: GenerateImageRequest): Promise<GenerateImageResponse> {
    if (!this.apiKey) {
      return {
        success: false,
        error: 'No Wavespeed AI API key provided',
      };
    }

    if (!this.modelUuid) {
      return {
        success: false,
        error: 'No Wavespeed Model UUID provided',
      };
    }

    try {
      console.log(`[WavespeedImageService] Submitting task for model: ${this.modelUuid}`);
      
      const enhancedPrompt = this.enhancePromptForStyle(request.imagePrompt, request.imageStyle);

      // 1. Submit the task
      const submitResponse = await fetch(`${this.baseUrl}/${this.modelUuid}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          prompt: enhancedPrompt,
          // Add default parameters if needed, or allow them in request
          aspect_ratio: "1:1",
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

      console.log(`[WavespeedImageService] Task created: ${taskId}. Polling for results...`);

      // 2. Poll for results
      return await this.pollForResults(pollUrl, taskId);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Wavespeed image generation error:', errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Poll Wavespeed API for task completion
   */
  private async pollForResults(pollUrl: string, taskId: string, maxRetries = 30, intervalMs = 2000): Promise<GenerateImageResponse> {
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
          const imageUrl = outputs?.[0]?.url || outputs?.[0];

          if (imageUrl) {
            try {
              // Fetch the image to get base64 data for Supabase upload
              const imageResponse = await fetch(imageUrl);
              if (imageResponse.ok) {
                const arrayBuffer = await imageResponse.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                const base64Data = buffer.toString('base64');
                const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
                // Clean the extension (e.g. 'jpeg' instead of 'jpeg; charset=utf-8')
                const rawExtension = contentType.split('/')[1] || 'jpeg';
                const extension = rawExtension.split(';')[0].trim();

                return {
                  success: true,
                  imageUrl: imageUrl,
                  base64Data,
                  contentType,
                  extension
                };
              }
            } catch (fetchErr) {
              console.error('[WavespeedImageService] Failed to fetch image for base64 conversion:', fetchErr);
            }

            // Fallback to just URL if fetching fails
            return {
              success: true,
              imageUrl: imageUrl,
            };
          }
          return {
            success: false,
            error: 'Task completed but no image URL found',
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

  /**
   * Enhance the prompt for the selected style
   */
  private enhancePromptForStyle(prompt: string, imageStyle: string): string {
    const style = getImageStyleById(imageStyle);
    return `${prompt}. ${style.promptModifier}. Square aspect ratio, centered composition.`;
  }
}
