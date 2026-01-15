/**
 * TogetherAIImageService
 * Service for generating images using Together AI API (FLUX models)
 * 
 * ✅ FREE credits on signup
 * ✅ High quality FLUX models
 * ✅ Fast generation
 * 
 * Get API key: https://api.together.ai/
 */

import {
    GenerateImageRequest,
    GenerateImageResponse,
    IImageService,
} from '@/src/application/services/IImageService';

/**
 * TogetherAIImageService class
 * Implements IImageService using Together AI API
 */
export class TogetherAIImageService implements IImageService {
  private apiKey: string;
  private baseUrl = 'https://api.together.xyz/v1';
  private model: string;

  /**
   * @param apiKey - Together AI API key
   * @param model - Model to use (default: black-forest-labs/FLUX.1-schnell-Free)
   */
  constructor(apiKey: string, model = 'black-forest-labs/FLUX.1-schnell-Free') {
    this.apiKey = apiKey;
    this.model = model;
  }

  async generateImage(request: GenerateImageRequest): Promise<GenerateImageResponse> {
    if (!this.apiKey) {
      return {
        success: false,
        error: 'No Together AI API key provided',
      };
    }

    try {
      // Enhance prompt for pixel art style
      const enhancedPrompt = this.enhancePromptForPixelArt(request.imagePrompt);

      const response = await fetch(`${this.baseUrl}/images/generations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          prompt: enhancedPrompt,
          width: 512,
          height: 512,
          steps: 4, // FLUX.1-schnell uses fewer steps
          n: 1,
          response_format: 'b64_json',
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Together AI API error:', errorText);
        return {
          success: false,
          error: `Together AI API error: ${response.status}`,
        };
      }

      const data = await response.json();
      
      if (!data.data?.[0]?.b64_json) {
        console.error('No image data in response');
        return {
          success: false,
          error: 'No image data in API response',
        };
      }

      return {
        success: true,
        base64Data: data.data[0].b64_json,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Together AI image generation error:', errorMessage);
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
}
