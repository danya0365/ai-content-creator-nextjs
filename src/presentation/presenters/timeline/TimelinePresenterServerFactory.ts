/**
 * TimelinePresenterServerFactory
 * Factory for creating TimelinePresenter instances on the server side
 * ✅ Injects the appropriate repository based on env config
 */

import { mockContentRepository } from '@/src/infrastructure/repositories/mock/MockContentRepository';
import { TimelinePresenter } from './TimelinePresenter';
// import { SupabaseContentRepository } from '@/src/infrastructure/repositories/SupabaseContentRepository';
// import { createClient } from '@/src/infrastructure/supabase/server';

export class TimelinePresenterServerFactory {
  static async create(): Promise<TimelinePresenter> {
    // ✅ Use Mock Repository for development
    const repository = mockContentRepository;
    
    // ⏳ TODO: Switch to Supabase Repository when backend is ready
    /*
    const supabase = await createClient();
    const repository = new SupabaseContentRepository(supabase);
    */

    return new TimelinePresenter(repository);
  }
}

export async function createServerTimelinePresenter(): Promise<TimelinePresenter> {
  return await TimelinePresenterServerFactory.create();
}
