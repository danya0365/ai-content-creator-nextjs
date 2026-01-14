/**
 * DashboardPresenterServerFactory
 * Factory for creating DashboardPresenter instances on the server side
 * ✅ Injects the appropriate repository based on env config
 */

import { mockContentRepository } from '@/src/infrastructure/repositories/mock/MockContentRepository';
import { DashboardPresenter } from './DashboardPresenter';
// import { SupabaseContentRepository } from '@/src/infrastructure/repositories/SupabaseContentRepository';
// import { createClient } from '@/src/infrastructure/supabase/server';

export class DashboardPresenterServerFactory {
  static async create(): Promise<DashboardPresenter> {
    // ✅ Use Mock Repository for development
    const repository = mockContentRepository;
    
    // ⏳ TODO: Switch to Supabase Repository when backend is ready
    /*
    const supabase = await createClient();
    const repository = new SupabaseContentRepository(supabase);
    */

    return new DashboardPresenter(repository);
  }
}

export async function createServerDashboardPresenter(): Promise<DashboardPresenter> {
  return await DashboardPresenterServerFactory.create();
}
