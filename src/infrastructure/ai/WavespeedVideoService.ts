/**
 * WavespeedVideoService
 * Service for generating videos using Wavespeed AI API
 * 
 * ✅ Supports high-end AI video models (Vidu, Kling, Minimax, etc.)
 * ✅ Async task-based generation (polling)
 * ✅ Unified API interface
 * 
 * Get API key: https://wavespeed.ai/
 */

import {
  GenerateVideoRequest,
  GenerateVideoResponse,
  IVideoService,
} from '@/src/application/services/IVideoService';
import {
  WavespeedVideoModel,
  resolveWavespeedVideoModel,
} from './WavespeedModels';

/**
 * WavespeedVideoService class
 * Implements IVideoService using Wavespeed AI API
 */
export class WavespeedVideoService implements IVideoService {
  private apiKey: string;
  // Wavespeed Model UUID - Video generation (strict typed)
  private modelUuid: WavespeedVideoModel;
  private baseUrl = 'https://api.wavespeed.ai/api/v3';

  /**
   * @param apiKey - Wavespeed AI API key
   * @param modelUuid - Optional Model UUID (validated against WavespeedVideoModel)
   */
  constructor(apiKey: string, modelUuid?: string) {
    this.apiKey = apiKey;
    this.modelUuid = resolveWavespeedVideoModel(modelUuid);
  }

  async generateVideo(request: GenerateVideoRequest): Promise<GenerateVideoResponse> {
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
      console.log(`[WavespeedVideoService] Submitting task for model: ${this.modelUuid}`);
      
      // 1. Submit the task
      const submitResponse = await fetch(`${this.baseUrl}/${this.modelUuid}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          prompt: request.prompt,
          aspect_ratio: request.aspect_ratio || "16:9",
          // Add default parameters if needed
          duration: request.duration || 5,
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

      console.log(`[WavespeedVideoService] Task created: ${taskId}. Polling for results...`);

      // 2. Poll for results
      return await this.pollForResults(pollUrl, taskId);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Wavespeed video generation error:', errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Poll Wavespeed API for task completion
   */
  private async pollForResults(pollUrl: string, taskId: string, maxRetries = 60, intervalMs = 5000): Promise<GenerateVideoResponse> {
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
          const videoUrl = outputs?.[0]?.url || outputs?.[0];

          if (videoUrl) {
            return {
              success: true,
              videoUrl: videoUrl,
              taskId: taskId
            };
          }
          return {
            success: false,
            error: 'Task completed but no video URL found',
          };
        } else if (status === 'failed') {
          return {
            success: false,
            error: `Wavespeed task failed: ${data.data?.error || data.error || 'Unknown error'}`,
          };
        }

        // Wait before next poll
        // Videos take longer than images, so 5s interval is reasonable
        await new Promise(resolve => setTimeout(resolve, intervalMs));
      } catch (error) {
        console.error('Polling error:', error);
      }
    }

    return {
      success: false,
      error: 'Polling timed out after 5 minutes',
    };
  }
}
