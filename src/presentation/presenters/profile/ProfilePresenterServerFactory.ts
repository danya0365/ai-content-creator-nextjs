import { ProfilePresenter } from './ProfilePresenter';
import { SupabaseProfileRepository } from '@/src/infrastructure/repositories/supabase/SupabaseProfileRepository';
import { createClient } from '@/src/infrastructure/supabase/server';

/**
 * ProfilePresenterServerFactory
 * Factory for creating ProfilePresenter instances on the server side
 * ✅ Following Clean Architecture - Static Class Pattern
 * ✅ USES SESSION CLIENT (RLS ENABLED)
 */
export class ProfilePresenterServerFactory {
  static async create(): Promise<ProfilePresenter> {
    // Standard user client (respects RLS)
    const supabase = await createClient();
    const repository = new SupabaseProfileRepository(supabase);
    
    return new ProfilePresenter(repository);
  }
}

/**
 * Standard factory function for easier invocation
 */
export async function createServerProfilePresenter(): Promise<ProfilePresenter> {
  return await ProfilePresenterServerFactory.create();
}
