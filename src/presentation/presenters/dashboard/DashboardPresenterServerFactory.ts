/**
 * DashboardPresenterServerFactory
 * Factory for creating DashboardPresenter instances on the server side
 * ✅ Injects the appropriate repository based on env config
 */

import { getContentRepository } from '@/src/lib/getRepository';
import { DashboardPresenter } from './DashboardPresenter';

export class DashboardPresenterServerFactory {
  static create(): DashboardPresenter {
    // Get repository based on NEXT_PUBLIC_DATA_SOURCE env
    const repository = getContentRepository();
    return new DashboardPresenter(repository);
  }
}

export function createServerDashboardPresenter(): DashboardPresenter {
  return DashboardPresenterServerFactory.create();
}
