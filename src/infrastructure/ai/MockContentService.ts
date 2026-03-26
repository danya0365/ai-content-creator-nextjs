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
    GenerateTopicIdeaResponse,
    IContentService,
} from '@/src/application/services/IContentService';
import { ContentType } from '@/src/data/master/contentTypes';
import { getImageStyleById } from '@/src/data/master/imageStyles';

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

    const style = getImageStyleById(request.imageStyle);

    return {
      success: true,
      title: `${request.topic} 🎨`,
      description: `คอนเทนต์สุดน่ารักเกี่ยวกับ ${request.topic} สำหรับ${timeContext} สร้างด้วย AI`,
      prompt: `Create content about ${request.topic}`,
      imagePrompt: `Create ${style.contentPromptInstruction} about ${request.topic}. ${style.promptModifier}`,
      hashtags: ['#AIContent', '#Creative', '#Digital'],
    };
  }

  async generateTopicIdea(contentType: ContentType): Promise<GenerateTopicIdeaResponse> {
    await new Promise((resolve) => setTimeout(resolve, this.delay));
    const ideas = [
      `10 ไอเดียสุดเจ๋งเกี่ยวกับ ${contentType.nameTh}`,
      `เคล็ดลับการทำ ${contentType.nameTh} ให้ปัง`,
      `สรุปสั้นๆ เรื่อง ${contentType.nameTh} ที่ควรรู้`,
      `มีอะไรใหม่ในวงการ ${contentType.nameTh}`,
    ];
    return {
      success: true,
      idea: ideas[Math.floor(Math.random() * ideas.length)],
    };
  }
}
