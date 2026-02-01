/**
 * Content Service Interface
 * Defines contract for AI content generation services
 * 
 * ✅ Allows switching between providers (Gemini, Mock, OpenRouter, etc.)
 */

import { ContentType } from '@/src/data/master/contentTypes';

export interface GenerateContentRequest {
  contentType: ContentType;
  topic: string;
  timeSlot: string;
  language?: 'th' | 'en';
}

export interface GenerateContentResponse {
  success: boolean;
  title?: string;
  description?: string;
  prompt?: string;
  imagePrompt?: string;
  hashtags?: string[];
  error?: string;
}

/**
 * Interface for content generation services
 */
export interface IContentService {
  generateContent(request: GenerateContentRequest): Promise<GenerateContentResponse>;
}
