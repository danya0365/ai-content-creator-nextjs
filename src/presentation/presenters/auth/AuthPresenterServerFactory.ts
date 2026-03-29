import { AuthPresenter } from './AuthPresenter';
import { SupabaseAuthRepository } from '@/src/infrastructure/repositories/supabase/SupabaseAuthRepository';
import { createAdminClient } from '@/src/infrastructure/supabase/server';

/**
 * AuthPresenterServerFactory
 * Factory for creating AuthPresenter instances on the server side
 * ✅ Following Clean Architecture - Static Class Pattern
 */
export class AuthPresenterServerFactory {
  static create(): AuthPresenter {
    // Service role admin client for backend operations
    const supabase = createAdminClient();
    const repository = new SupabaseAuthRepository(supabase);
    
    return new AuthPresenter(repository);
  }
}

/**
 * Standard factory function for easier invocation
 */
export function createServerAuthPresenter(): AuthPresenter {
  return AuthPresenterServerFactory.create();
}
