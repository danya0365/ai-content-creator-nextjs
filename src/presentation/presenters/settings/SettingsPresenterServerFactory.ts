/**
 * SettingsPresenterServerFactory
 * Factory for creating SettingsPresenter instances on the server side
 * ✅ Uses Supabase Repository for production
 */

import { SupabaseContentRepository } from '@/src/infrastructure/repositories/SupabaseContentRepository';
import { createClient } from '@/src/infrastructure/supabase/server';
import { SettingsPresenter } from './SettingsPresenter';

export class SettingsPresenterServerFactory {
  static async create(): Promise<SettingsPresenter> {
    // ✅ Use Supabase Repository for production
    const supabase = await createClient();
    const repository = new SupabaseContentRepository(supabase);

    return new SettingsPresenter(repository);
  }
}

export async function createServerSettingsPresenter(): Promise<SettingsPresenter> {
  return await SettingsPresenterServerFactory.create();
}
