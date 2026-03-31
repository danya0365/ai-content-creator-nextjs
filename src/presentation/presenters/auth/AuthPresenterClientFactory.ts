import { AuthPresenter } from './AuthPresenter';
import { ApiAuthRepository } from '@/src/infrastructure/repositories/api/ApiAuthRepository';

let cachedPresenter: AuthPresenter | null = null;

/**
 * AuthPresenterClientFactory
 * Factory for creating AuthPresenter instances on the client side
 * ✅ Following Clean Architecture - Static Class Pattern
 */
export class AuthPresenterClientFactory {
  static create(): AuthPresenter {
    if (cachedPresenter) return cachedPresenter;

    const repository = new ApiAuthRepository();
    cachedPresenter = new AuthPresenter(repository);
    
    return cachedPresenter;
  }
}

/**
 * Standard factory function for easier invocation
 */
export function createClientAuthPresenter(): AuthPresenter {
  return AuthPresenterClientFactory.create();
}
