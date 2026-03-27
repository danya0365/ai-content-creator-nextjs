/**
 * AI Service Factory
 * Creates content and image services based on configuration
 * 
 * ✅ Easy switching between providers via environment variables
 * 
 * Content Providers:
 * - gemini: Google Gemini (requires GEMINI_API_KEY)
 * - groq: Groq API with Llama (requires GROQ_API_KEY) - FREE tier
 * - openrouter: OpenRouter with various models (requires OPENROUTER_API_KEY) - has FREE models
 * - mock: Mock service for testing (no API key needed)
 * 
 * Image Providers:
 * - gemini: Google Gemini Imagen (requires GEMINI_API_KEY)
 * - together: Together AI with FLUX (requires TOGETHER_API_KEY)
 * - pollinations: Pollinations.ai - 100% FREE, no API key needed
 * - dicebear: DiceBear.com - 100% FREE, no API key needed, stable SVGs
 * - mock: Mock service with placeholder images (no API key needed)
 */

import { IContentService } from '@/src/application/services/IContentService';
import { IImageService } from '@/src/application/services/IImageService';
import { IVideoService } from '@/src/application/services/IVideoService';
import { DiceBearImageService } from './DiceBearImageService';
import { GeminiContentService } from './GeminiContentService';
import { GeminiImageService } from './GeminiImageService';
import { GroqContentService } from './GroqContentService';
import { MockContentService } from './MockContentService';
import { MockImageService } from './MockImageService';
import { OpenRouterContentService } from './OpenRouterContentService';
import { PollinationsImageService } from './PollinationsImageService';
import { TogetherAIImageService } from './TogetherAIImageService';
import { WavespeedContentService } from './WavespeedContentService';
import { WavespeedImageService } from './WavespeedImageService';
import { WavespeedVideoService } from './WavespeedVideoService';

export type AIProvider = 'gemini' | 'groq' | 'openrouter' | 'together' | 'pollinations' | 'dicebear' | 'wavespeed' | 'mock';

interface AIServiceConfig {
  provider: AIProvider;
  apiKey?: string;
  model?: string;
}

/**
 * Get default content provider from environment
 */
function getDefaultContentProvider(): AIProvider {
  const provider = process.env.AI_PROVIDER as AIProvider;
  if (['gemini', 'groq', 'openrouter', 'wavespeed', 'mock'].includes(provider)) {
    return provider;
  }
  return 'gemini'; // default
}

/**
 * Get default image provider from environment
 */
function getDefaultImageProvider(): AIProvider {
  const provider = process.env.AI_IMAGE_PROVIDER as AIProvider;
  if (['gemini', 'together', 'pollinations', 'dicebear', 'wavespeed', 'mock'].includes(provider)) {
    return provider;
  }
  // If no image provider set, use dicebear (FREE & STABLE)
  return 'dicebear';
}

/**
 * Get default video provider from environment
 */
function getDefaultVideoProvider(): AIProvider {
  const provider = process.env.AI_VIDEO_PROVIDER as AIProvider;
  if (!provider) {
    return 'wavespeed'; // default
  }
  return provider;
}

/**
 * Get API keys from environment
 */
function getApiKey(provider: AIProvider): string {
  switch (provider) {
    case 'gemini':
      return process.env.GEMINI_API_KEY || '';
    case 'groq':
      return process.env.GROQ_API_KEY || '';
    case 'openrouter':
      return process.env.OPENROUTER_API_KEY || '';
    case 'together':
      return process.env.TOGETHER_API_KEY || '';
    case 'wavespeed':
      return process.env.WAVESPEED_API_KEY || '';
    case 'pollinations':
    case 'dicebear':
      return ''; // No API key needed
    default:
      return '';
  }
}

/**
 * AI Service Factory
 */
export class AIServiceFactory {
  /**
   * Create content service based on provider
   */
  static createContentService(config?: Partial<AIServiceConfig>): IContentService {
    const provider = config?.provider || getDefaultContentProvider();
    const apiKey = config?.apiKey || getApiKey(provider);

    console.log(`[AIServiceFactory] Creating content service: ${provider}`);

    switch (provider) {
      case 'groq':
        if (!apiKey) {
          console.warn('[AIServiceFactory] No GROQ_API_KEY, using MockContentService');
          return new MockContentService();
        }
        return new GroqContentService(apiKey, config?.model);

      case 'openrouter':
        if (!apiKey) {
          console.warn('[AIServiceFactory] No OPENROUTER_API_KEY, using MockContentService');
          return new MockContentService();
        }
        return new OpenRouterContentService(apiKey, config?.model);

      case 'wavespeed':
        if (!apiKey) {
          console.warn('[AIServiceFactory] No WAVESPEED_API_KEY, using MockContentService');
          return new MockContentService();
        }
        return new WavespeedContentService(apiKey, config?.model);

      case 'mock':
        return new MockContentService();

      case 'gemini':
      default:
        if (!apiKey) {
          console.warn('[AIServiceFactory] No GEMINI_API_KEY, using MockContentService');
          return new MockContentService();
        }
        return new GeminiContentService(apiKey);
    }
  }

  /**
   * Create image service based on provider
   */
  static createImageService(config?: Partial<AIServiceConfig>): IImageService {
    const provider = config?.provider || getDefaultImageProvider();
    const apiKey = config?.apiKey || getApiKey(provider);

    console.log(`[AIServiceFactory] Creating image service: ${provider}`);

    switch (provider) {
      case 'gemini':
        if (!apiKey) {
          console.warn('[AIServiceFactory] No GEMINI_API_KEY, using DiceBearImageService');
          return new DiceBearImageService();
        }
        return new GeminiImageService(apiKey);

      case 'together':
        if (!apiKey) {
          console.warn('[AIServiceFactory] No TOGETHER_API_KEY, using DiceBearImageService');
          return new DiceBearImageService();
        }
        return new TogetherAIImageService(apiKey, config?.model);

      case 'wavespeed':
        if (!apiKey) {
          console.warn('[AIServiceFactory] No WAVESPEED_API_KEY, using DiceBearImageService');
          return new DiceBearImageService();
        }
        return new WavespeedImageService(apiKey, config?.model);

      case 'pollinations':
        // FREE - no API key needed!
        return new PollinationsImageService();

      case 'dicebear':
        // FREE - no API key needed!
        return new DiceBearImageService();

      case 'mock':
      default:
        return new MockImageService();
    }
  }

  /**
   * Create video service based on provider
   */
  static createVideoService(config?: Partial<AIServiceConfig>): IVideoService {
    const provider = config?.provider || getDefaultVideoProvider();
    const apiKey = config?.apiKey || getApiKey(provider);

    console.log(`[AIServiceFactory] Creating video service: ${provider}`);

    switch (provider) {
      case 'wavespeed':
        if (!apiKey) {
          throw new Error('[AIServiceFactory] No WAVESPEED_API_KEY provided for video generation');
        }
        return new WavespeedVideoService(apiKey, config?.model);

      case 'mock':
        // For testing, we could have a MockVideoService, but let's just throw for now as per instructions
        // or support it if needed. The user said "ส่วน provider ไหน ที่ไม่รองรับ ให้ thrown error"
        throw new Error(`[AIServiceFactory] Provider "${provider}" does not support video generation yet.`);

      default:
        throw new Error(`[AIServiceFactory] Provider "${provider}" does not support video generation yet.`);
    }
  }

  /**
   * Get list of available providers
   */
  static getAvailableProviders(): {
    content: { id: AIProvider; name: string; hasApiKey: boolean; free: boolean }[];
    image: { id: AIProvider; name: string; hasApiKey: boolean; free: boolean }[];
  } {
    return {
      content: [
        { id: 'gemini', name: 'Google Gemini', hasApiKey: !!process.env.GEMINI_API_KEY, free: false },
        { id: 'groq', name: 'Groq (Llama)', hasApiKey: !!process.env.GROQ_API_KEY, free: true },
        { id: 'openrouter', name: 'OpenRouter', hasApiKey: !!process.env.OPENROUTER_API_KEY, free: true },
        { id: 'wavespeed', name: 'Wavespeed AI', hasApiKey: !!process.env.WAVESPEED_API_KEY, free: false },
        { id: 'mock', name: 'Mock (Testing)', hasApiKey: true, free: true },
      ],
      image: [
        { id: 'gemini', name: 'Google Gemini Imagen', hasApiKey: !!process.env.GEMINI_API_KEY, free: false },
        { id: 'together', name: 'Together AI (FLUX)', hasApiKey: !!process.env.TOGETHER_API_KEY, free: false },
        { id: 'wavespeed', name: 'Wavespeed AI', hasApiKey: !!process.env.WAVESPEED_API_KEY, free: false },
        { id: 'pollinations', name: 'Pollinations.ai (FREE - AI Art)', hasApiKey: true, free: true },
        { id: 'dicebear', name: 'DiceBear (FREE Dev Fallback - Avatars)', hasApiKey: true, free: true },
        { id: 'mock', name: 'Mock (Placeholder)', hasApiKey: true, free: true },
      ],
      video: [
        { id: 'wavespeed', name: 'Wavespeed AI (Sora-level Video)', hasApiKey: !!process.env.WAVESPEED_API_KEY, free: false },
      ],
    };
  }
}

