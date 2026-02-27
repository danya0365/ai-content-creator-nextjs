'use client';

import { ApiProfileRepository } from '@/src/infrastructure/repositories/api/ApiProfileRepository';
import { ProfilePresenter } from './ProfilePresenter';

let cachedRepository: ApiProfileRepository | null = null;

export class ProfilePresenterClientFactory {
  static create(): ProfilePresenter {
    if (!cachedRepository) {
      cachedRepository = new ApiProfileRepository();
    }
    return new ProfilePresenter(cachedRepository);
  }
}

export function createClientProfilePresenter(): ProfilePresenter {
  return ProfilePresenterClientFactory.create();
}
