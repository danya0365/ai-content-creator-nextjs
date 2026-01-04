/**
 * DashboardPresenterServerFactory
 * Factory for creating DashboardPresenter instances on the server side
 */

import { DashboardPresenter } from './DashboardPresenter';

export class DashboardPresenterServerFactory {
  static create(): DashboardPresenter {
    return new DashboardPresenter();
  }
}

export function createServerDashboardPresenter(): DashboardPresenter {
  return DashboardPresenterServerFactory.create();
}
