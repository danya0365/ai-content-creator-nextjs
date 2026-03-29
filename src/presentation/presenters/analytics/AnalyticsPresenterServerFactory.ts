import { AnalyticsPresenter } from './AnalyticsPresenter';
import { SupabaseContentRepository } from '@/src/infrastructure/repositories/SupabaseContentRepository';
import { createAdminClient } from '@/src/infrastructure/supabase/server';

/**
 * AnalyticsPresenterServerFactory
 * Factory for creating AnalyticsPresenter instances on the server side
 * ✅ Following Clean Architecture - Static Class Pattern
 */
export class AnalyticsPresenterServerFactory {
  static create(): AnalyticsPresenter {
    // Service role admin client for backend operations
    const supabase = createAdminClient();
    const repository = new SupabaseContentRepository(supabase);
    
    return new AnalyticsPresenter(repository);
  }
}

/**
 * Standard factory function for easier invocation
 */
export function createServerAnalyticsPresenter(): AnalyticsPresenter {
  return AnalyticsPresenterServerFactory.create();
}
