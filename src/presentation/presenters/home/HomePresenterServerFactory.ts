/**
 * HomePresenterServerFactory
 * Factory for creating HomePresenter instances on the server side
 * Following Clean Architecture pattern
 */

import { HomePresenter } from './HomePresenter';

export class HomePresenterServerFactory {
  static create(): HomePresenter {
    return new HomePresenter();
  }
}

export function createServerHomePresenter(): HomePresenter {
  return HomePresenterServerFactory.create();
}
