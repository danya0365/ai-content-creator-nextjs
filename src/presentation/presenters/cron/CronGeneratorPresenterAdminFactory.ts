import { AIServiceFactory } from '@/src/infrastructure/ai/AIServiceFactory';
import { SupabaseContentRepository } from '@/src/infrastructure/repositories/SupabaseContentRepository';
import { SupabaseStorageRepository } from '@/src/infrastructure/repositories/SupabaseStorageRepository';
import { createAdminClient } from '@/src/infrastructure/supabase/server';
import { CronGeneratorPresenter } from './CronGeneratorPresenter';

/**
 * Factory and instance creation for CronGeneratorPresenter (Admin Context)
 * Optimized for use in Next.js API Routes (Cron)
 */
export function createAdminCronGeneratorPresenter(): CronGeneratorPresenter {
  // ✅ Use admin client for cron operations (Service Role)
  const supabase = createAdminClient();
  const contentRepository = new SupabaseContentRepository(supabase);
  const storageRepository = new SupabaseStorageRepository(supabase);
  
  // ✅ Create AI services using factory
  const contentService = AIServiceFactory.createContentService();
  const imageService = AIServiceFactory.createImageService();
  
  return new CronGeneratorPresenter(
    contentRepository,
    storageRepository,
    contentService,
    imageService
  );
}
