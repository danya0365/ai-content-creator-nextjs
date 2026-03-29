import { ProfilePresenter } from './ProfilePresenter';
import { SupabaseProfileRepository } from '@/src/infrastructure/repositories/supabase/SupabaseProfileRepository';
import { createAdminClient } from '@/src/infrastructure/supabase/server';

/**
 * ProfilePresenterServerFactory
 * Factory for creating ProfilePresenter instances on the server side
 * ✅ Following Clean Architecture - Static Class Pattern
 */
export class ProfilePresenterServerFactory {
  static create(): ProfilePresenter {
    // Service role admin client for backend operations
    const supabase = createAdminClient();
    const repository = new SupabaseProfileRepository(supabase);
    
    return new ProfilePresenter(repository);
  }
}

/**
 * Standard factory function for easier invocation
 */
export function createServerProfilePresenter(): ProfilePresenter {
  return ProfilePresenterServerFactory.create();
}
