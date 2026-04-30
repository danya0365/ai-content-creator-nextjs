/**
 * AIPresenter
 * Orchestrates AI services (Content, Image) and Storage components
 * ✅ Used by API Routes to maintain Clean Architecture
 * ✅ Single Source of Truth for complex AI workflows
 * ✅ Standardized Error Handling and Logging
 */

import { IStorageRepository } from "@/src/application/repositories/IStorageRepository";
import { ITrendsRepository } from "@/src/application/repositories/ITrendsRepository";
import {
  GenerateTopicIdeaResponse,
  IContentService,
} from "@/src/application/services/IContentService";
import { IImageService } from "@/src/application/services/IImageService";
import { ContentType } from "@/src/data/master/contentTypes";

const AI_CONTENTS_BUCKET = "ai-contents";

/**
 * Standard response for AIPresenter generation methods
 */
export interface AIPresenterResponse {
  success: boolean;
  content: {
    contentTypeId: string;
    title: string;
    description: string;
    imageUrl: string;
    prompt: string;
    timeSlot: string;
    tags: string[];
    emoji: string;
  };
}

export class AIPresenter {
  constructor(
    private readonly contentService: IContentService,
    private readonly imageService: IImageService,
    private readonly storageRepository: IStorageRepository,
    private readonly trendsRepository: ITrendsRepository,
  ) {}

  /**
   * Orchestrate AI Generation -> Image Generation -> Storage Upload
   */
  async generateAndUpload(params: {
    contentType: ContentType;
    topic: string;
    timeSlot: string;
    imageStyle: string;
    generateImage?: boolean;
    platform?: string;
    tone?: string;
    brandContext?: string;
  }): Promise<AIPresenterResponse> {
    try {
      // 1. Generate text content via AI
      const textResult = await this.contentService.generateContent({
        contentType: params.contentType,
        topic: params.topic,
        timeSlot: params.timeSlot,
        imageStyle: params.imageStyle,
        platform: params.platform,
        tone: params.tone,
        brandContext: params.brandContext,
        language: "th",
      });

      if (!textResult.success) {
        throw new Error(textResult.error || "Failed to generate content");
      }

      // 2. Generate and upload image if requested and prompt exists
      let imageUrl = "";
      if (params.generateImage !== false && textResult.imagePrompt) {
        const imageResult = await this.imageService.generateImage({
          imagePrompt: textResult.imagePrompt,
          imageStyle: params.imageStyle,
        });

        if (imageResult.success) {
          if (imageResult.base64Data) {
            // Upload base64 data to Supabase Storage
            imageUrl = await this.storageRepository.uploadBase64(
              imageResult.base64Data,
              `gen-${Date.now()}`,
              AI_CONTENTS_BUCKET,
              "generated",
              imageResult.contentType,
              imageResult.extension,
            );
          } else if (imageResult.imageUrl) {
            // Use direct URL (for mock/placeholder services)
            imageUrl = imageResult.imageUrl;
          }
        }
      }

      return {
        success: true,
        content: {
          contentTypeId: params.contentType.id,
          title: textResult.title || `${params.topic} 🎨`,
          description: textResult.description || "",
          imageUrl: imageUrl,
          prompt: textResult.imagePrompt || textResult.prompt || "",
          timeSlot: params.timeSlot,
          tags: textResult.hashtags || [],
          emoji: params.contentType.icon,
        },
      };
    } catch (error) {
      console.error("[AIPresenter] Error in generateAndUpload:", error);
      throw error;
    }
  }

  /**
   * Orchestrate Multi-Platform AI Generation -> Single Image Generation -> Storage Upload
   */
  async generateMultiAndUpload(params: {
    contentType: ContentType;
    topic: string;
    timeSlot: string;
    imageStyle: string;
    platforms: string[];
    tone?: string;
    brandContext?: string;
  }) {
    try {
      // 1. Fan-out Content Generation (Parallel LLM Inference)
      const textPromises = params.platforms.map((platform) =>
        this.contentService.generateContent({
          contentType: params.contentType,
          topic: params.topic,
          timeSlot: params.timeSlot,
          imageStyle: params.imageStyle,
          platform,
          tone: params.tone,
          brandContext: params.brandContext,
          language: "th",
        }),
      );

      const textResults = await Promise.all(textPromises);

      // Check if ALL failed
      if (textResults.every((r) => !r.success)) {
        throw new Error(
          `Failed to generate any content variants: ${textResults[0].error}`,
        );
      }

      // 2. Extract single master image prompt from the first successful result
      const masterImagePrompt =
        textResults.find((r) => r.success && r.imagePrompt)?.imagePrompt ||
        textResults.find((r) => r.success && r.prompt)?.prompt;

      // 3. Generate Single Image Asset
      let imageUrl = "";

      if (masterImagePrompt) {
        const imageResult = await this.imageService.generateImage({
          imagePrompt: masterImagePrompt,
          imageStyle: params.imageStyle,
        });

        if (imageResult.success) {
          if (imageResult.base64Data) {
            imageUrl = await this.storageRepository.uploadBase64(
              imageResult.base64Data,
              `multi-gen-${Date.now()}`,
              AI_CONTENTS_BUCKET,
              "generated",
              imageResult.contentType,
              imageResult.extension,
            );
          } else if (imageResult.imageUrl) {
            imageUrl = imageResult.imageUrl;
          }
        }
      }

      // 4. Map back into an array of results
      const contents = textResults
        .map((result, index) => {
          if (!result.success) return null;

          return {
            contentTypeId: params.contentType.id,
            title: result.title || `${params.topic} 🎨`,
            description: result.description || "",
            imageUrl: imageUrl,
            prompt: masterImagePrompt || result.prompt || "",
            timeSlot: params.timeSlot,
            tags: result.hashtags || [],
            emoji: params.contentType.icon,
            targetPlatform: params.platforms[index],
          };
        })
        .filter(Boolean);

      return {
        success: true,
        contents,
      };
    } catch (error) {
      console.error("[AIPresenter] Error in generateMultiAndUpload:", error);
      throw error;
    }
  }

  /**
   * Regenerate an image from an explicit prompt with style enhancement
   */
  async generateImage(params: { imagePrompt: string; imageStyle: string }) {
    try {
      return await this.imageService.generateImage(params);
    } catch (error) {
      console.error("[AIPresenter] Error in generateImage:", error);
      throw error;
    }
  }

  /**
   * Generate an image from a raw prompt without any style enhancement
   * Use this when the prompt is already fully composed by the user
   */
  async generateRawImage(params: { imagePrompt: string }) {
    try {
      return await this.imageService.generateRawImage(params);
    } catch (error) {
      console.error("[AIPresenter] Error in generateRawImage:", error);
      throw error;
    }
  }

  /**
   * Generate topic ideas for a content type
   */
  async generateTopicIdea(
    contentType: ContentType,
    options?: {
      trends?: string[];
      brandContext?: string;
      mode?: string;
    },
  ): Promise<GenerateTopicIdeaResponse> {
    try {
      let trends: string[] | undefined = undefined;

      if (options?.mode === "trending") {
        // ✅ ITrendsRepository is now injected into constructor
        // ✅ No direct manual instantiation or dynamic import leak here!
        trends = await this.trendsRepository.getTopTrends(5);
      }

      return await this.contentService.generateTopicIdea(contentType, {
        ...options,
        trends,
      });
    } catch (error) {
      console.error("[AIPresenter] Error in generateTopicIdea:", error);
      throw error;
    }
  }
}
