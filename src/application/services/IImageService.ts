/**
 * Image Service Interface
 * Defines contract for AI image generation services
 * 
 * ✅ Allows switching between providers (Gemini, Mock, Placeholder, etc.)
 */

export interface GenerateImageRequest {
  imagePrompt: string;
}

export interface GenerateImageResponse {
  success: boolean;
  base64Data?: string;
  imageUrl?: string; // For services that return URLs directly
  error?: string;
}

/**
 * Interface for image generation services
 */
export interface IImageService {
  generateImage(request: GenerateImageRequest): Promise<GenerateImageResponse>;
}
