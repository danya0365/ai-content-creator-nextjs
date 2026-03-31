import { AIPresenter } from './AIPresenter';
import { AIServiceFactory } from '@/src/infrastructure/ai/AIServiceFactory';
import { SupabaseStorageRepository } from '@/src/infrastructure/repositories/SupabaseStorageRepository';
import { GoogleTrendsRepository } from '@/src/infrastructure/repositories/api/GoogleTrendsRepository';
import { createAdminClient } from '@/src/infrastructure/supabase/server';

/**
 * AIPresenterServerFactory
 * Factory for creating AIPresenter instances on the server side
 * ✅ Following Clean Architecture - Static Class Pattern
 * ✅ Injects all infrastructure dependencies (Services, Storage, Trends)
 */
export class AIPresenterServerFactory {
  static create(): AIPresenter {
    // Service role admin client for backend operations
    const supabase = createAdminClient();
    
    const contentService = AIServiceFactory.createContentService();
    const imageService = AIServiceFactory.createImageService();
    const storageRepository = new SupabaseStorageRepository(supabase);
    const trendsRepository = new GoogleTrendsRepository();
    
    return new AIPresenter(
      contentService, 
      imageService, 
      storageRepository,
      trendsRepository
    );
  }
}

/**
 * Standard factory function for easier invocation
 */
export function createServerAIPresenter(): AIPresenter {
  return AIPresenterServerFactory.create();
}
