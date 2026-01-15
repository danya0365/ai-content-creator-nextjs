/**
 * DashboardPresenterServerFactory
 * Factory for creating DashboardPresenter instances on the server side
 * ✅ Uses Supabase Repository for production
 */

import { SupabaseContentRepository } from '@/src/infrastructure/repositories/SupabaseContentRepository';
import { createClient } from '@/src/infrastructure/supabase/server';
import { DashboardPresenter } from './DashboardPresenter';

export class DashboardPresenterServerFactory {
  static async create(): Promise<DashboardPresenter> {
    // ✅ Use Supabase Repository for production
    const supabase = await createClient();
    const repository = new SupabaseContentRepository(supabase);

    return new DashboardPresenter(repository);
  }
}

export async function createServerDashboardPresenter(): Promise<DashboardPresenter> {
  return await DashboardPresenterServerFactory.create();
}
