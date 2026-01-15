/**
 * TimelinePresenterServerFactory
 * Factory for creating TimelinePresenter instances on the server side
 * ✅ Uses Supabase Repository for production
 */

import { SupabaseContentRepository } from '@/src/infrastructure/repositories/SupabaseContentRepository';
import { createClient } from '@/src/infrastructure/supabase/server';
import { TimelinePresenter } from './TimelinePresenter';

export class TimelinePresenterServerFactory {
  static async create(): Promise<TimelinePresenter> {
    // ✅ Use Supabase Repository for production
    const supabase = await createClient();
    const repository = new SupabaseContentRepository(supabase);

    return new TimelinePresenter(repository);
  }
}

export async function createServerTimelinePresenter(): Promise<TimelinePresenter> {
  return await TimelinePresenterServerFactory.create();
}
