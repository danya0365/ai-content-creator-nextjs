/**
 * Image Service Interface
 * Defines contract for AI image generation services
 * 
 * ✅ Allows switching between providers (Gemini, Mock, Placeholder, etc.)
 */

export interface GenerateImageRequest {
  imagePrompt: string;
  imageStyle: string;
}

export interface GenerateImageResponse {
  success: boolean;
  base64Data?: string;
  imageUrl?: string; // For services that return URLs directly
  error?: string;
  contentType?: string; // e.g. 'image/svg+xml'
  extension?: string; // e.g. 'svg'
}

/**
 * Interface for image generation services
 */
export interface IImageService {
  generateImage(request: GenerateImageRequest): Promise<GenerateImageResponse>;
}
