/**
 * SettingsPresenterServerFactory
 * Factory for creating SettingsPresenter instances on the server side
 */

import { SettingsPresenter } from './SettingsPresenter';

export class SettingsPresenterServerFactory {
  static create(): SettingsPresenter {
    return new SettingsPresenter();
  }
}

export function createServerSettingsPresenter(): SettingsPresenter {
  return SettingsPresenterServerFactory.create();
}
