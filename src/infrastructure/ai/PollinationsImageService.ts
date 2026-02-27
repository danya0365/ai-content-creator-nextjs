/**
 * PollinationsImageService
 * Service for generating images using Pollinations.ai
 * 
 * ✅ 100% FREE - No API key required!
 * ✅ Uses Stable Diffusion / FLUX
 * ✅ Downloads image and returns base64 for Supabase upload
 * 
 * Website: https://pollinations.ai/
 */

import {
    GenerateImageRequest,
    GenerateImageResponse,
    IImageService,
} from '@/src/application/services/IImageService';

/**
 * PollinationsImageService class
 * Implements IImageService using Pollinations.ai (FREE, no API key)
 */
export class PollinationsImageService implements IImageService {
  private baseUrl = 'https://image.pollinations.ai/prompt';

  constructor() {
    // No API key needed!
  }

  async generateImage(request: GenerateImageRequest): Promise<GenerateImageResponse> {
    try {
      // Enhance prompt for pixel art style
      const enhancedPrompt = this.enhancePromptForPixelArt(request.imagePrompt);
      
      // URL encode the prompt
      const encodedPrompt = encodeURIComponent(enhancedPrompt);
      
      // Pollinations image URL 
      const imageUrl = `${this.baseUrl}/${encodedPrompt}?width=512&height=512&model=flux&nologo=true&seed=${Date.now()}`;

      console.log('[PollinationsImageService] Generating image from:', imageUrl);

      // Download the image and convert to base64
      const response = await fetch(imageUrl);
      
      if (!response.ok) {
        console.error('[PollinationsImageService] Failed to fetch image:', response.status);
        return {
          success: false,
          error: `Failed to fetch image: ${response.status}`,
        };
      }

      // Get the image as ArrayBuffer
      const arrayBuffer = await response.arrayBuffer();
      
      // Convert to base64
      const base64Data = Buffer.from(arrayBuffer).toString('base64');

      console.log('[PollinationsImageService] Image downloaded, base64 length:', base64Data.length);

      return {
        success: true,
        base64Data: base64Data,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[PollinationsImageService] Error:', errorMessage);
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
      'pixel art style',
      '16-bit retro SNES era aesthetic',
      'bright and cheerful colors',
      'clean pixel-perfect lines',
      'cute kawaii style',
      'detailed background',
    ].join(', ');

    return `${prompt}, ${pixelArtStyleGuide}`;
  }
}
