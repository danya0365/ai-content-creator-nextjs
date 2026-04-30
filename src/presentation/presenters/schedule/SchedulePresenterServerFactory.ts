/**
 * SchedulePresenterServerFactory
 * Factory for creating SchedulePresenter instances on the server side
 * ✅ Uses Supabase Repository for production
 */

import { SupabaseContentRepository } from '@/src/infrastructure/repositories/SupabaseContentRepository';
import { createClient } from '@/src/infrastructure/supabase/server';
import { SchedulePresenter } from './SchedulePresenter';

export class SchedulePresenterServerFactory {
  static async create(): Promise<SchedulePresenter> {
    // ✅ Use Supabase Repository for production
    const supabase = await createClient();
    const repository = new SupabaseContentRepository(supabase);

    return new SchedulePresenter(repository);
  }
}

export async function createServerSchedulePresenter(): Promise<SchedulePresenter> {
  return await SchedulePresenterServerFactory.create();
}
