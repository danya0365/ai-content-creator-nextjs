/**
 * AnalyticsPresenterServerFactory
 * Factory for creating AnalyticsPresenter instances on the server side
 * ✅ Uses Supabase Repository for production
 */

import { SupabaseContentRepository } from '@/src/infrastructure/repositories/SupabaseContentRepository';
import { createClient } from '@/src/infrastructure/supabase/server';
import { AnalyticsPresenter } from './AnalyticsPresenter';

export class AnalyticsPresenterServerFactory {
  static async create(): Promise<AnalyticsPresenter> {
    // ✅ Use Supabase Repository for production
    const supabase = await createClient();
    const repository = new SupabaseContentRepository(supabase);

    return new AnalyticsPresenter(repository);
  }
}

export async function createServerAnalyticsPresenter(): Promise<AnalyticsPresenter> {
  return await AnalyticsPresenterServerFactory.create();
}
