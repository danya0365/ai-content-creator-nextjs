/**
 * HomePresenterServerFactory
 * Factory for creating HomePresenter instances on the server side
 * ✅ Injects the appropriate repository based on env config
 */

import { mockContentRepository } from '@/src/infrastructure/repositories/mock/MockContentRepository';
import { HomePresenter } from './HomePresenter';
// import { SupabaseContentRepository } from '@/src/infrastructure/repositories/SupabaseContentRepository';
// import { createClient } from '@/src/infrastructure/supabase/server';

export class HomePresenterServerFactory {
  static async create(): Promise<HomePresenter> {
    // ✅ Use Mock Repository for development
    const repository = mockContentRepository;
    
    // ⏳ TODO: Switch to Supabase Repository when backend is ready
    /*
    const supabase = await createClient();
    const repository = new SupabaseContentRepository(supabase);
    */

    return new HomePresenter(repository);
  }
}

export async function createServerHomePresenter(): Promise<HomePresenter> {
  return await HomePresenterServerFactory.create();
}
