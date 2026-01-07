/**
 * SettingsPresenterClientFactory
 * Factory for creating SettingsPresenter instances on the client side
 */

'use client';

import { getContentRepository } from '@/src/lib/getRepository';
import { SettingsPresenter } from './SettingsPresenter';

export class SettingsPresenterClientFactory {
  static create(): SettingsPresenter {
    const repository = getContentRepository();
    return new SettingsPresenter(repository);
  }
}

export function createClientSettingsPresenter(): SettingsPresenter {
  return SettingsPresenterClientFactory.create();
}
