import { TimelinePresenter } from './TimelinePresenter';
import { SupabaseContentRepository } from '@/src/infrastructure/repositories/SupabaseContentRepository';
import { createClient } from '@/src/infrastructure/supabase/server';

/**
 * TimelinePresenterServerFactory
 * Factory for creating TimelinePresenter instances on the server side
 * ✅ Following Clean Architecture - Static Class Pattern
 * ✅ USES SESSION CLIENT (RLS ENABLED)
 */
export class TimelinePresenterServerFactory {
  static async create(): Promise<TimelinePresenter> {
    // Standard user client (respects RLS)
    const supabase = await createClient();
    const repository = new SupabaseContentRepository(supabase);
    
    return new TimelinePresenter(repository);
  }
}

/**
 * Standard factory function for easier invocation
 */
export async function createServerTimelinePresenter(): Promise<TimelinePresenter> {
  return await TimelinePresenterServerFactory.create();
}
