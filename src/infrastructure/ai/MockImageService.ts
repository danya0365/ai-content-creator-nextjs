/**
 * MockImageService
 * Mock implementation for testing and development
 *
 * ✅ No API key required - uses placeholder images
 * ✅ Great for UI development and testing
 */

import {
  GenerateImageRequest,
  GenerateImageResponse,
  IImageService,
} from "@/src/application/services/IImageService";

interface RawImageRequest {
  imagePrompt: string;
}

export class MockImageService implements IImageService {
  private delay: number;

  /**
   * @param delay - Simulated delay in ms (default: 300)
   */
  constructor(delay = 300) {
    this.delay = delay;
  }

  async generateImage(
    request: GenerateImageRequest,
  ): Promise<GenerateImageResponse> {
    return this.executeGeneration(request.imagePrompt);
  }

  async generateRawImage(
    request: RawImageRequest,
  ): Promise<GenerateImageResponse> {
    return this.executeGeneration(request.imagePrompt);
  }

  private async executeGeneration(
    prompt: string,
  ): Promise<GenerateImageResponse> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, this.delay));

    // Generate placeholder URL based on prompt
    const encodedText = encodeURIComponent(prompt.substring(0, 30));
    const placeholderUrl = `https://placehold.co/512x512/4A90A4/ffffff?text=${encodedText}`;

    return {
      success: true,
      imageUrl: placeholderUrl,
    };
  }
}
