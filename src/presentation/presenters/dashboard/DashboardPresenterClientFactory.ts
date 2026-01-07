/**
 * DashboardPresenterClientFactory
 * Factory for creating DashboardPresenter instances on the client side
 * ✅ Injects the appropriate repository based on env config
 */

'use client';

import { getContentRepository } from '@/src/lib/getRepository';
import { DashboardPresenter } from './DashboardPresenter';

export class DashboardPresenterClientFactory {
  static create(): DashboardPresenter {
    const repository = getContentRepository();
    return new DashboardPresenter(repository);
  }
}

export function createClientDashboardPresenter(): DashboardPresenter {
  return DashboardPresenterClientFactory.create();
}
