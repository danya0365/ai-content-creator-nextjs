/**
 * HomePresenterServerFactory
 * Factory for creating HomePresenter instances on the server side
 * ✅ Uses Supabase Repository for production
 */

import { SupabaseContentRepository } from '@/src/infrastructure/repositories/SupabaseContentRepository';
import { createClient } from '@/src/infrastructure/supabase/server';
import { HomePresenter } from './HomePresenter';

export class HomePresenterServerFactory {
  static async create(): Promise<HomePresenter> {
    // ✅ Use Supabase Repository for production
    const supabase = await createClient();
    const repository = new SupabaseContentRepository(supabase);

    return new HomePresenter(repository);
  }
}

export async function createServerHomePresenter(): Promise<HomePresenter> {
  return await HomePresenterServerFactory.create();
}
