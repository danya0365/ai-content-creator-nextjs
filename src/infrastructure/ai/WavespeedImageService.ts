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

/**
 * WavespeedImageService class
 * Implements IImageService using Wavespeed AI API
 */
export class WavespeedImageService implements IImageService {
  private apiKey: string;
  // Wavespeed Model UUID - Image generation (e.g., FLUX, Kling, etc.)
  private modelUuid = 'black-forest-labs/flux-schnell';
  private baseUrl = 'https://api.wavespeed.ai/api/v3';

  /**
   * @param apiKey - Wavespeed AI API key
   * @param modelUuid - Optional Model UUID to use
   */
  constructor(apiKey: string, modelUuid?: string) {
    this.apiKey = apiKey;
    if (modelUuid) this.modelUuid = modelUuid;
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
      
      // 1. Submit the task
      const submitResponse = await fetch(`${this.baseUrl}/${this.modelUuid}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          prompt: request.imagePrompt,
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
      const taskId = submitData.data?.task_id || submitData.task_id;

      if (!taskId) {
        return {
          success: false,
          error: 'Failed to get task ID from Wavespeed AI',
        };
      }

      console.log(`[WavespeedImageService] Task created: ${taskId}. Polling for results...`);

      // 2. Poll for results
      return await this.pollForResults(taskId);

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
  private async pollForResults(taskId: string, maxRetries = 30, intervalMs = 2000): Promise<GenerateImageResponse> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await fetch(`${this.baseUrl}/${this.modelUuid}/tasks/${taskId}`, {
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
}
