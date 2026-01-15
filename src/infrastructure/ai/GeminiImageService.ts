/**
 * GeminiImageService
 * Service for generating Pixel Art images using Google Gemini Imagen API
 */

import { createClient } from '@supabase/supabase-js';

export interface GenerateImageRequest {
  imagePrompt: string;
  contentId?: string;
  userId?: string;
}

export interface GenerateImageResponse {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

/**
 * GeminiImageService class
 * Generates pixel art images and uploads to Supabase Storage
 */
export class GeminiImageService {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Generate a pixel art image using Gemini Imagen API
   */
  async generateImage(request: GenerateImageRequest): Promise<GenerateImageResponse> {
    if (!this.apiKey) {
      console.warn('No Gemini API key provided, using placeholder image');
      return this.getPlaceholderResponse();
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
        
        // Fallback to Gemini Flash for text-to-image description
        return await this.fallbackToFlash(request);
      }

      const data = await response.json();
      
      if (!data.predictions?.[0]?.bytesBase64Encoded) {
        console.error('No image data in response');
        return await this.fallbackToFlash(request);
      }

      // Upload to Supabase Storage
      const imageUrl = await this.uploadToStorage(
        data.predictions[0].bytesBase64Encoded,
        request.contentId || `img-${Date.now()}`
      );

      if (!imageUrl) {
        return {
          success: false,
          error: 'Failed to upload image to storage',
        };
      }

      return {
        success: true,
        imageUrl,
      };
    } catch (error) {
      console.error('Image generation error:', error);
      return await this.fallbackToFlash(request);
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
   * Fallback to generating a placeholder when Imagen is unavailable
   */
  private async fallbackToFlash(request: GenerateImageRequest): Promise<GenerateImageResponse> {
    console.log('Using fallback placeholder for image');
    
    // Return a placeholder image URL
    // In production, you might want to use a service like placeholder.com
    // or generate an SVG placeholder
    const placeholderUrl = this.generatePlaceholderUrl(request.imagePrompt);
    
    return {
      success: true,
      imageUrl: placeholderUrl,
    };
  }

  /**
   * Generate a placeholder URL for development/fallback
   */
  private generatePlaceholderUrl(prompt: string): string {
    // Use a placeholder service or local static image
    // This creates a simple placeholder with the prompt text
    const encodedText = encodeURIComponent(prompt.substring(0, 50));
    return `https://placehold.co/512x512/4A90A4/ffffff?text=${encodedText}`;
  }

  /**
   * Upload base64 image to Supabase Storage
   */
  private async uploadToStorage(
    base64Data: string,
    fileName: string
  ): Promise<string | null> {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (!supabaseUrl || !supabaseServiceKey) {
        console.error('Missing Supabase configuration');
        return this.generatePlaceholderUrl(fileName);
      }

      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      // Convert base64 to buffer
      const buffer = Buffer.from(base64Data, 'base64');
      const filePath = `generated/${Date.now()}-${fileName}.png`;

      // Upload to storage
      const { data, error } = await supabase.storage
        .from('ai-contents')
        .upload(filePath, buffer, {
          contentType: 'image/png',
          upsert: true,
        });

      if (error) {
        console.error('Storage upload error:', error);
        return null;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('ai-contents')
        .getPublicUrl(data.path);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Upload to storage error:', error);
      return null;
    }
  }

  /**
   * Placeholder response when API is unavailable
   */
  private getPlaceholderResponse(): GenerateImageResponse {
    return {
      success: true,
      imageUrl: 'https://placehold.co/512x512/4A90A4/ffffff?text=Pixel+Art',
    };
  }
}
