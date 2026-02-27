/**
 * DiceBearImageService
 * Service for generating consistent avatar/placeholder images using DiceBear
 * 
 * ✅ 100% FREE - No API key required!
 * ✅ Generates SVG avatars based on a seed (prompt)
 * ✅ Perfect for development fallback when heavy AI generators (Pollinations) are down
 * 
 * Website: https://dicebear.com/
 */

import {
  GenerateImageRequest,
  GenerateImageResponse,
  IImageService,
} from '@/src/application/services/IImageService';

/**
 * DiceBearImageService class
 * Implements IImageService using DiceBear API
 */
export class DiceBearImageService implements IImageService {
  private baseUrl = 'https://api.dicebear.com/7.x/bottts/svg';

  constructor() {
    // No API key needed!
  }

  async generateImage(request: GenerateImageRequest): Promise<GenerateImageResponse> {
    try {
      // Use the prompt as the seed to generate a consistent image
      // Clean up the prompt slightly to make a good seed (alphanumeric mostly)
      const seed = encodeURIComponent(request.imagePrompt.replace(/[^a-zA-Z0-9ก-ฮ]/g, ''));
      
      // DiceBear image URL (bottts style generates robot avatars)
      const imageUrl = `${this.baseUrl}?seed=${seed}&size=512`;

      console.log('[DiceBearImageService] Generating image from:', imageUrl);

      // Download the image and convert to base64
      const response = await fetch(imageUrl);
      
      if (!response.ok) {
        console.error('[DiceBearImageService] Failed to fetch image:', response.status);
        return {
          success: false,
          error: `Failed to fetch image: ${response.status}`,
        };
      }

      // Get the SVG as text
      const svgText = await response.text();
      
      // Convert SVG string to base64
      const base64Data = Buffer.from(svgText).toString('base64');

      console.log('[DiceBearImageService] Image downloaded, base64 length:', base64Data.length);

      return {
        success: true,
        base64Data: base64Data,
        contentType: 'image/svg+xml',
        extension: 'svg',
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[DiceBearImageService] Error:', errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}
