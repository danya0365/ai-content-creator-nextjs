import { ProfilePresenter } from './ProfilePresenter';
import { ApiProfileRepository } from '@/src/infrastructure/repositories/api/ApiProfileRepository';

let cachedPresenter: ProfilePresenter | null = null;

/**
 * ProfilePresenterClientFactory
 * Factory for creating ProfilePresenter instances on the client side
 * ✅ Following Clean Architecture - Static Class Pattern
 */
export class ProfilePresenterClientFactory {
  static create(): ProfilePresenter {
    if (cachedPresenter) return cachedPresenter;

    const repository = new ApiProfileRepository();
    cachedPresenter = new ProfilePresenter(repository);
    
    return cachedPresenter;
  }
}

/**
 * Standard factory function for easier invocation
 */
export function createClientProfilePresenter(): ProfilePresenter {
  return ProfilePresenterClientFactory.create();
}
