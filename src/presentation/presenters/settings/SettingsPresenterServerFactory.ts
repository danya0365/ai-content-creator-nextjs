import { SettingsPresenter } from './SettingsPresenter';
import { SupabaseContentRepository } from '@/src/infrastructure/repositories/SupabaseContentRepository';
import { createClient } from '@/src/infrastructure/supabase/server';

/**
 * SettingsPresenterServerFactory
 * Factory for creating SettingsPresenter instances on the server side
 * ✅ Following Clean Architecture - Static Class Pattern
 * ✅ USES SESSION CLIENT (RLS ENABLED)
 */
export class SettingsPresenterServerFactory {
  static async create(): Promise<SettingsPresenter> {
    // Standard user client (respects RLS)
    const supabase = await createClient();
    const repository = new SupabaseContentRepository(supabase);
    
    return new SettingsPresenter(repository);
  }
}

/**
 * Standard factory function for easier invocation
 */
export async function createServerSettingsPresenter(): Promise<SettingsPresenter> {
  return await SettingsPresenterServerFactory.create();
}
