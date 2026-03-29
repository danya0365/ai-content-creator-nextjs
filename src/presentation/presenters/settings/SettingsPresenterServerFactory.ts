import { SettingsPresenter } from './SettingsPresenter';
import { SupabaseContentRepository } from '@/src/infrastructure/repositories/SupabaseContentRepository';
import { createAdminClient } from '@/src/infrastructure/supabase/server';

/**
 * SettingsPresenterServerFactory
 * Factory for creating SettingsPresenter instances on the server side
 * ✅ Following Clean Architecture - Static Class Pattern
 */
export class SettingsPresenterServerFactory {
  static create(): SettingsPresenter {
    // Service role admin client for backend operations
    const supabase = createAdminClient();
    const repository = new SupabaseContentRepository(supabase);
    
    return new SettingsPresenter(repository);
  }
}

/**
 * Standard factory function for easier invocation
 */
export function createServerSettingsPresenter(): SettingsPresenter {
  return SettingsPresenterServerFactory.create();
}
