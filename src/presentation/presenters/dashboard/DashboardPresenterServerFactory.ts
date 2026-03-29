import { DashboardPresenter } from './DashboardPresenter';
import { SupabaseContentRepository } from '@/src/infrastructure/repositories/SupabaseContentRepository';
import { createAdminClient } from '@/src/infrastructure/supabase/server';

/**
 * DashboardPresenterServerFactory
 * Factory for creating DashboardPresenter instances on the server side
 * ✅ Following Clean Architecture - Static Class Pattern
 */
export class DashboardPresenterServerFactory {
  static create(): DashboardPresenter {
    // Service role admin client for backend operations
    const supabase = createAdminClient();
    const repository = new SupabaseContentRepository(supabase);
    
    return new DashboardPresenter(repository);
  }
}

/**
 * Standard factory function for easier invocation
 */
export function createServerDashboardPresenter(): DashboardPresenter {
  return DashboardPresenterServerFactory.create();
}
