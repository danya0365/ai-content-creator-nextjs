/**
 * SchedulePresenterServerFactory
 * Factory for creating SchedulePresenter instances on the server side
 * ✅ Injects the appropriate repository based on env config
 */

import { mockContentRepository } from '@/src/infrastructure/repositories/mock/MockContentRepository';
import { SchedulePresenter } from './SchedulePresenter';
// import { SupabaseContentRepository } from '@/src/infrastructure/repositories/SupabaseContentRepository';
// import { createClient } from '@/src/infrastructure/supabase/server';

export class SchedulePresenterServerFactory {
  static async create(): Promise<SchedulePresenter> {
    // ✅ Use Mock Repository for development
    const repository = mockContentRepository;
    
    // ⏳ TODO: Switch to Supabase Repository when backend is ready
    /*
    const supabase = await createClient();
    const repository = new SupabaseContentRepository(supabase);
    */

    return new SchedulePresenter(repository);
  }
}

export async function createServerSchedulePresenter(): Promise<SchedulePresenter> {
  return await SchedulePresenterServerFactory.create();
}
