/**
 * HomePresenterClientFactory
 * Factory for creating HomePresenter instances on the client side
 */

'use client';

import { getContentRepository } from '@/src/lib/getRepository';
import { HomePresenter } from './HomePresenter';

export class HomePresenterClientFactory {
  static create(): HomePresenter {
    const repository = getContentRepository();
    return new HomePresenter(repository);
  }
}

export function createClientHomePresenter(): HomePresenter {
  return HomePresenterClientFactory.create();
}
