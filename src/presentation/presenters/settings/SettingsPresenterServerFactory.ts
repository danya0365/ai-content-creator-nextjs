/**
 * SettingsPresenterServerFactory
 * Factory for creating SettingsPresenter instances on the server side
 * ✅ Injects the appropriate repository based on env config
 */

import { getContentRepository } from '@/src/lib/getRepository';
import { SettingsPresenter } from './SettingsPresenter';

export class SettingsPresenterServerFactory {
  static create(): SettingsPresenter {
    const repository = getContentRepository();
    return new SettingsPresenter(repository);
  }
}

export function createServerSettingsPresenter(): SettingsPresenter {
  return SettingsPresenterServerFactory.create();
}
