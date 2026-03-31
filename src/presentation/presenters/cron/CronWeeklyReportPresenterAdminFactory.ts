import { SupabaseContentRepository } from '@/src/infrastructure/repositories/SupabaseContentRepository';
import { SupabaseWeeklyReportRepository } from '@/src/infrastructure/repositories/SupabaseWeeklyReportRepository';
import { createAdminClient } from '@/src/infrastructure/supabase/server';
import { CronWeeklyReportPresenter } from './CronWeeklyReportPresenter';

/**
 * Factory and instance creation for CronWeeklyReportPresenter (Admin Context)
 * Optimized for use in Next.js API Routes (Cron)
 */
export function createAdminCronWeeklyReportPresenter(): CronWeeklyReportPresenter {
  // ✅ Use admin client for cron operations (Service Role)
  const supabase = createAdminClient();
  const contentRepository = new SupabaseContentRepository(supabase);
  const reportRepository = new SupabaseWeeklyReportRepository(supabase);
  
  return new CronWeeklyReportPresenter(contentRepository, reportRepository);
}
