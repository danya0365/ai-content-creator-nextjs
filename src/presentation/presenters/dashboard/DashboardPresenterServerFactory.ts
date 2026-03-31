import { DashboardPresenter } from './DashboardPresenter';
import { SupabaseContentRepository } from '@/src/infrastructure/repositories/SupabaseContentRepository';
import { createClient } from '@/src/infrastructure/supabase/server';

/**
 * DashboardPresenterServerFactory
 * Factory for creating DashboardPresenter instances on the server side
 * ✅ Following Clean Architecture - Static Class Pattern
 * ✅ USES SESSION CLIENT (RLS ENABLED)
 */
export class DashboardPresenterServerFactory {
  static async create(): Promise<DashboardPresenter> {
    // Standard user client (respects RLS)
    const supabase = await createClient();
    const repository = new SupabaseContentRepository(supabase);
    
    return new DashboardPresenter(repository);
  }
}

/**
 * Standard factory function for easier invocation
 */
export async function createServerDashboardPresenter(): Promise<DashboardPresenter> {
  return await DashboardPresenterServerFactory.create();
}
