import { IContentRepository, CreateContentDTO } from '@/src/application/repositories/IContentRepository';
import { IStorageRepository } from '@/src/application/repositories/IStorageRepository';
import { IProfileRepository } from '@/src/application/repositories/IProfileRepository';
import { IContentService } from '@/src/application/services/IContentService';
import { IImageService } from '@/src/application/services/IImageService';
import { 
  getContentTypesByTimeSlot, 
  getCurrentTimeSlot, 
  getContentTypeById,
  ContentType
} from '@/src/data/master/contentTypes';

const AI_CONTENTS_BUCKET = 'ai-contents';

export interface CronGeneratorResponse {
  success: boolean;
  message: string;
  providers?: {
    content: string;
    image: string;
  };
  content?: {
    id: string;
    title: string;
    contentType: string;
    timeSlot: string;
    imageUrl: string;
    scheduledAt: string;
  };
  error?: string;
  details?: string | Record<string, unknown>;
}

export class CronGeneratorPresenter {
  constructor(
    private readonly contentRepository: IContentRepository,
    private readonly storageRepository: IStorageRepository,
    private readonly contentService: IContentService,
    private readonly imageService: IImageService,
    private readonly profileRepository: IProfileRepository
  ) {}

  /**
   * Handle the content generation request
   */
  async handleGenerateRequest(
    isAuthorized: boolean, 
    requestedType: string | null
  ): Promise<CronGeneratorResponse> {
    if (!isAuthorized) {
      return { success: false, message: 'Unauthorized access', error: 'Unauthorized' };
    }

    try {
      // 1. Determine Content Type and Slot
      const currentTimeSlot = getCurrentTimeSlot();
      
      if (!currentTimeSlot && !requestedType) {
        return {
          success: true,
          message: 'No content to generate at this time (outside time slots)',
        };
      }

      let selectedContentType: ContentType | undefined;
      const timeSlotId = currentTimeSlot?.id || 'morning';

      if (requestedType) {
        selectedContentType = getContentTypeById(requestedType);
        if (!selectedContentType) {
          return { success: false, message: 'Invalid content type', error: 'Invalid content type requested' };
        }
      } else if (currentTimeSlot) {
        const contentTypes = getContentTypesByTimeSlot(currentTimeSlot.id);
        if (contentTypes.length === 0) {
          return {
            success: true,
            message: `No content types configured for ${currentTimeSlot.nameTh}`,
          };
        }
        // Pick a random content type
        selectedContentType = contentTypes[Math.floor(Math.random() * contentTypes.length)];
      }

      if (!selectedContentType) {
        return { success: false, message: 'Content type not determined', error: 'Could not determine content type' };
      }

      // 2. Generate Topic Idea
      console.log(`[Cron Generator] 🎨 Generating idea for: ${selectedContentType.id}`);
      const ideaResult = await this.contentService.generateTopicIdea(selectedContentType, {
        mode: 'trending',
      });

      const topic = ideaResult.success && ideaResult.idea 
        ? ideaResult.idea 
        : `${selectedContentType.nameTh} ที่น่าสนใจประจำวัน`;

      // 3. Generate Text Content
      const contentResult = await this.contentService.generateContent({
        contentType: selectedContentType,
        topic,
        timeSlot: timeSlotId,
        language: 'th',
        imageStyle: selectedContentType.imageStyle || 'realistic',
        platform: 'facebook',
        tone: selectedContentType.category === 'islamic' ? 'respectful' : 'casual',
        brandContext: '',
      });

      if (!contentResult.success) {
        return { success: false, message: 'Content generation failed', error: 'Failed to generate content', details: contentResult.error };
      }

      // 4. Generate & Upload Image
      let imageUrl = '';
      if (contentResult.imagePrompt) {
        const imageResult = await this.imageService.generateImage({
          imagePrompt: contentResult.imagePrompt,
          imageStyle: selectedContentType.imageStyle || 'realistic',
        });

        if (imageResult.success) {
          if (imageResult.base64Data) {
            imageUrl = await this.storageRepository.uploadBase64(
              imageResult.base64Data,
              `cron-${Date.now()}`,
              AI_CONTENTS_BUCKET,
              'generated'
            );
          } else if (imageResult.imageUrl) {
            imageUrl = imageResult.imageUrl;
          }
        }
      }

      // 5. Identify Admin Profile for attribution
      let adminProfileId: string | undefined = undefined;
      try {
        const adminProfile = await this.profileRepository.getAdminProfile();
        if (adminProfile) {
          adminProfileId = adminProfile.id;
          console.log(`[Cron Generator] 👤 Attributing content to Admin: ${adminProfileId}`);
        }
      } catch (error) {
        console.warn('[Cron Generator] ⚠️ Could not determine Admin profile identity:', error);
      }

      const now = new Date();
      const scheduledAt = new Date(now);
      scheduledAt.setMinutes(scheduledAt.getMinutes() + 5);

      const createDto: CreateContentDTO = {
        contentTypeId: selectedContentType.id,
        title: contentResult.title || `${topic} 🎨`,
        description: contentResult.description || '',
        imageUrl: imageUrl,
        prompt: contentResult.imagePrompt || '',
        timeSlot: timeSlotId,
        scheduledAt: scheduledAt.toISOString(),
        status: 'scheduled',
        tags: contentResult.hashtags || [],
        emoji: selectedContentType.icon,
        profileId: adminProfileId, // Attribution logic
      };

      const savedContent = await this.contentRepository.create(createDto);

      return {
        success: true,
        message: `Generated ${selectedContentType.nameTh} content${currentTimeSlot ? ` for ${currentTimeSlot.nameTh}` : ''}`,
        providers: {
          content: process.env.AI_PROVIDER || 'gemini',
          image: process.env.AI_IMAGE_PROVIDER || 'mock',
        },
        content: {
          id: savedContent.id,
          title: savedContent.title,
          contentType: selectedContentType.nameTh,
          timeSlot: currentTimeSlot?.nameTh || 'Custom',
          imageUrl: savedContent.imageUrl,
          scheduledAt: savedContent.scheduledAt,
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[Cron Generator] ❌ Error:', errorMessage);
      return { success: false, message: 'An unexpected error occurred', error: errorMessage };
    }
  }
}
