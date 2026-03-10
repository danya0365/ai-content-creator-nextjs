/**
 * AuthPresenterClientFactory
 * Factory for creating AuthPresenter instances on the client side
 * ✅ Injects the Supabase Auth Repository
 */

'use client';

import { ApiAuthRepository } from '@/src/infrastructure/repositories/api/ApiAuthRepository';
import { createClient } from '@/src/infrastructure/supabase/client';
import { AuthPresenter } from './AuthPresenter';

// ✅ Cache repository instance to prevent creating multiple auth listeners
let cachedRepository: ApiAuthRepository | null = null;

export class AuthPresenterClientFactory {
  static create(): AuthPresenter {
    // ✅ Reuse repository to prevent multiple auth subscriptions
    if (!cachedRepository) {
      const supabase = createClient();
      cachedRepository = new ApiAuthRepository(supabase);
    }

    return new AuthPresenter(cachedRepository);
  }
}


export function createClientAuthPresenter(): AuthPresenter {
  return AuthPresenterClientFactory.create();
}
