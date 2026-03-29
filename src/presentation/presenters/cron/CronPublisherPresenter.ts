import { IContentRepository, PublishResult } from '@/src/application/repositories/IContentRepository';

export interface CronPublishResponse {
  success: boolean;
  message: string;
  published: number;
  failed: number;
  details: PublishResult['details'];
  status?: number;
}

export interface CronPublishErrorResponse {
  success: false;
  message: string;
  error: string;
  status: number;
}

export class CronPublisherPresenter {
  constructor(private readonly contentRepository: IContentRepository) {}

  /**
   * Handle the publishing request from the cron endpoint
   */
  async handlePublishRequest(isAuthorized: boolean): Promise<CronPublishResponse | CronPublishErrorResponse> {
    if (!isAuthorized) {
      return { 
        success: false, 
        message: 'Unauthorized access', 
        error: 'Unauthorized', 
        status: 401 
      };
    }

    try {
      const now = new Date();
      console.log(`[Cron Publisher] 🕐 Running at ${now.toISOString()}`);

      const results = await this.contentRepository.publishDueContent(now);

      return {
        success: true,
        message: `Published ${results.success} content(s)`,
        published: results.success,
        failed: results.failed,
        details: results.details,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[Cron Publisher] ❌ Error:', errorMessage);
      return { 
        success: false, 
        message: 'Publishing failed', 
        error: errorMessage, 
        status: 500 
      };
    }
  }
}
