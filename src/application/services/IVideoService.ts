/**
 * Video Service Interface
 * Defines contract for AI video generation services
 * 
 * ✅ Allows switching between providers (Wavespeed, etc.)
 */

export interface GenerateVideoRequest {
  prompt: string;
  imageStyle?: string;
  aspect_ratio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
  duration?: number; // In seconds, if supported
  fps?: number; // Frames per second, if supported
}

export interface GenerateVideoResponse {
  success: boolean;
  videoUrl?: string;
  taskId?: string;
  error?: string;
}

/**
 * Interface for video generation services
 */
export interface IVideoService {
  generateVideo(request: GenerateVideoRequest): Promise<GenerateVideoResponse>;
}
