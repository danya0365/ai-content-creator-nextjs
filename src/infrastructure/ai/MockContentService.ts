/**
 * MockContentService
 * Mock implementation for testing and development
 * 
 * ✅ No API key required - always works
 * ✅ Great for UI development and testing
 */

import {
    GenerateContentRequest,
    GenerateContentResponse,
    IContentService,
} from '@/src/application/services/IContentService';

export class MockContentService implements IContentService {
  private delay: number;

  /**
   * @param delay - Simulated delay in ms (default: 500)
   */
  constructor(delay = 500) {
    this.delay = delay;
  }

  async generateContent(request: GenerateContentRequest): Promise<GenerateContentResponse> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, this.delay));

    const timeContext = {
      morning: 'เช้าวันใหม่',
      lunch: 'ช่วงพักเที่ยง',
      afternoon: 'บ่ายนี้',
      evening: 'ค่ำนี้',
    }[request.timeSlot] || '';

    return {
      success: true,
      title: `${request.topic} 🎨`,
      description: `คอนเทนต์สุดน่ารักเกี่ยวกับ ${request.topic} สำหรับ${timeContext} สร้างด้วย AI`,
      prompt: `Create content about ${request.topic}`,
      imagePrompt: `Create a cute retro pixel art illustration about ${request.topic}. Style: 16-bit SNES era, bright colors, detailed backgrounds.`,
      hashtags: ['#PixelArt', '#AIContent', '#Creative', '#Digital', '#Retro'],
    };
  }
}
