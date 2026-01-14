/**
 * SettingsPresenterServerFactory
 * Factory for creating SettingsPresenter instances on the server side
 * ✅ Injects the appropriate repository based on env config
 */

import { mockContentRepository } from '@/src/infrastructure/repositories/mock/MockContentRepository';
import { SettingsPresenter } from './SettingsPresenter';
// import { SupabaseContentRepository } from '@/src/infrastructure/repositories/SupabaseContentRepository';
// import { createClient } from '@/src/infrastructure/supabase/server';

export class SettingsPresenterServerFactory {
  static async create(): Promise<SettingsPresenter> {
    // ✅ Use Mock Repository for development
    const repository = mockContentRepository;
    
    // ⏳ TODO: Switch to Supabase Repository when backend is ready
    /*
    const supabase = await createClient();
    const repository = new SupabaseContentRepository(supabase);
    */

    return new SettingsPresenter(repository);
  }
}

export async function createServerSettingsPresenter(): Promise<SettingsPresenter> {
  return await SettingsPresenterServerFactory.create();
}
