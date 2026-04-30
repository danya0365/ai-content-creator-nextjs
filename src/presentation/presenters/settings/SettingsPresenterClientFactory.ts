import { SettingsPresenter } from './SettingsPresenter';
import { ApiContentRepository } from '@/src/infrastructure/repositories/api/ApiContentRepository';

let cachedPresenter: SettingsPresenter | null = null;

/**
 * SettingsPresenterClientFactory
 * Factory for creating SettingsPresenter instances on the client side
 * ✅ Following Clean Architecture - Static Class Pattern
 */
export class SettingsPresenterClientFactory {
  static create(): SettingsPresenter {
    if (cachedPresenter) return cachedPresenter;

    const repository = new ApiContentRepository();
    cachedPresenter = new SettingsPresenter(repository);
    
    return cachedPresenter;
  }
}

/**
 * Standard factory function for easier invocation
 */
export function createClientSettingsPresenter(): SettingsPresenter {
  return SettingsPresenterClientFactory.create();
}
