import { SupabaseContentRepository } from '@/src/infrastructure/repositories/SupabaseContentRepository';
import { SupabaseStorageRepository } from '@/src/infrastructure/repositories/SupabaseStorageRepository';
import { AIServiceFactory } from '@/src/infrastructure/ai/AIServiceFactory';
import { createAdminClient } from '@/src/infrastructure/supabase/server';
import { CronGeneratorPresenter } from './CronGeneratorPresenter';
import { SupabaseProfileRepository } from '@/src/infrastructure/repositories/supabase/SupabaseProfileRepository';

/**
 * CronGeneratorPresenterAdminFactory
 * Factory for creating CronGeneratorPresenter instances for internal cron jobs.
 * ✅ Uses AIServiceFactory for smart service creation (respecting provider config)
 * ✅ Uses Admin Client to bypass RLS.
 * ✅ Standard Static Class Pattern.
 */
export class CronGeneratorPresenterAdminFactory {
  static create(): CronGeneratorPresenter {
    // ⚠️ Special Admin Client for Cron (Bypass RLS)
    const supabase = createAdminClient();
    
    const contentRepository = new SupabaseContentRepository(supabase);
    const storageRepository = new SupabaseStorageRepository(supabase);
    
    // ✅ Following the correct architecture: Use AIServiceFactory
    // This handles API keys, provider switching, and fallbacks internally.
    const contentService = AIServiceFactory.createContentService();
    const imageService = AIServiceFactory.createImageService();
    
    // ✅ Repository for fetching the admin profile identity
    const profileRepository = new SupabaseProfileRepository(supabase);
    
    return new CronGeneratorPresenter(
      contentRepository,
      storageRepository,
      contentService,
      imageService,
      profileRepository
    );
  }
}

/**
 * Standard factory function for easier invocation
 */
export function createAdminCronGeneratorPresenter(): CronGeneratorPresenter {
  return CronGeneratorPresenterAdminFactory.create();
}
