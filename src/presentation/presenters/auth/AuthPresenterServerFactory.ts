import { AuthPresenter } from './AuthPresenter';
import { SupabaseAuthRepository } from '@/src/infrastructure/repositories/supabase/SupabaseAuthRepository';
import { createClient } from '@/src/infrastructure/supabase/server';

/**
 * AuthPresenterServerFactory
 * Factory for creating AuthPresenter instances on the server side
 * ✅ Following Clean Architecture - Static Class Pattern
 * ✅ USES SESSION CLIENT (RLS ENABLED)
 */
export class AuthPresenterServerFactory {
  static async create(): Promise<AuthPresenter> {
    // Standard user client (respects RLS)
    const supabase = await createClient();
    const repository = new SupabaseAuthRepository(supabase);
    
    return new AuthPresenter(repository);
  }
}

/**
 * Standard factory function for easier invocation
 */
export async function createServerAuthPresenter(): Promise<AuthPresenter> {
  return await AuthPresenterServerFactory.create();
}
