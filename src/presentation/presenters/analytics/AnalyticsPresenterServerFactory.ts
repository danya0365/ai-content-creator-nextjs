import { AnalyticsPresenter } from './AnalyticsPresenter';
import { SupabaseContentRepository } from '@/src/infrastructure/repositories/SupabaseContentRepository';
import { createClient } from '@/src/infrastructure/supabase/server';

/**
 * AnalyticsPresenterServerFactory
 * Factory for creating AnalyticsPresenter instances on the server side
 * ✅ Following Clean Architecture - Static Class Pattern
 * ✅ USES SESSION CLIENT (RLS ENABLED)
 */
export class AnalyticsPresenterServerFactory {
  static async create(): Promise<AnalyticsPresenter> {
    // Standard user client (respects RLS)
    const supabase = await createClient();
    const repository = new SupabaseContentRepository(supabase);
    
    return new AnalyticsPresenter(repository);
  }
}

/**
 * Standard factory function for easier invocation
 */
export async function createServerAnalyticsPresenter(): Promise<AnalyticsPresenter> {
  return await AnalyticsPresenterServerFactory.create();
}
