import { SupabaseContentRepository } from '@/src/infrastructure/repositories/SupabaseContentRepository';
import { createAdminClient } from '@/src/infrastructure/supabase/server';
import { CronPublisherPresenter } from './CronPublisherPresenter';

/**
 * Factory and instance creation for CronPublisherPresenter (Admin Context)
 * Optimized for use in Next.js API Routes (Cron)
 */
export function createAdminCronPublisherPresenter(): CronPublisherPresenter {
  // ✅ Use admin client for cron operations (Service Role)
  const supabase = createAdminClient();
  const contentRepository = new SupabaseContentRepository(supabase);
  
  return new CronPublisherPresenter(contentRepository);
}
