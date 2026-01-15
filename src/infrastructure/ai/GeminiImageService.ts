/**
 * GeminiImageService
 * Service for generating Pixel Art images using Google Gemini Imagen API
 * 
 * ✅ Implements IImageService for provider switching
 * ✅ Single Responsibility: Only generates images, does NOT upload
 */

import {
  GenerateImageRequest,
  GenerateImageResponse,
  IImageService,
} from '@/src/application/services/IImageService';

const AI_CONTENTS_BUCKET = 'ai-contents';

/**
 * GeminiImageService class
 * Implements IImageService for provider switching
 */
export class GeminiImageService implements IImageService {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Generate a pixel art image using Gemini Imagen API
   * Returns base64 data - caller is responsible for uploading
   */
  async generateImage(request: GenerateImageRequest): Promise<GenerateImageResponse> {
    if (!this.apiKey) {
      console.warn('No Gemini API key provided');
      return {
        success: false,
        error: 'No Gemini API key provided',
      };
    }

    try {
      // Enhance prompt for pixel art style
      const enhancedPrompt = this.enhancePromptForPixelArt(request.imagePrompt);

      // Call Gemini Imagen API
      const response = await fetch(
        `${this.baseUrl}/models/imagen-3.0-generate-002:predict?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            instances: [
              {
                prompt: enhancedPrompt,
              },
            ],
            parameters: {
              sampleCount: 1,
              aspectRatio: '1:1',
              personGeneration: 'DONT_ALLOW',
              safetyFilterLevel: 'BLOCK_MEDIUM_AND_ABOVE',
            },
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini Imagen API error:', errorText);
        return {
          success: false,
          error: `Imagen API error: ${response.status}`,
        };
      }

      const data = await response.json();
      
      if (!data.predictions?.[0]?.bytesBase64Encoded) {
        console.error('No image data in response');
        return {
          success: false,
          error: 'No image data in API response',
        };
      }

      return {
        success: true,
        base64Data: data.predictions[0].bytesBase64Encoded,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Image generation error:', errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Enhance the prompt for pixel art style
   */
  private enhancePromptForPixelArt(prompt: string): string {
    const pixelArtStyleGuide = [
      'Pixel art style',
      '16-bit retro SNES era aesthetic',
      'Bright and cheerful colors',
      'Clean pixel-perfect lines',
      'Cute and kawaii style',
      'Detailed background',
      'High quality pixel art',
    ].join(', ');

    return `${prompt}. ${pixelArtStyleGuide}. Square aspect ratio, centered composition.`;
  }

  /**
   * Get bucket name for AI contents
   */
  static getBucketName(): string {
    return AI_CONTENTS_BUCKET;
  }
}
