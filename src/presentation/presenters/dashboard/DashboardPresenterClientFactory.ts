/**
 * DashboardPresenterClientFactory
 * Factory for creating DashboardPresenter instances on the client side
 * ✅ Uses ApiContentRepository for production (calls API routes)
 */

'use client';

import { ApiContentRepository } from '@/src/infrastructure/repositories/api/ApiContentRepository';
import { DashboardPresenter } from './DashboardPresenter';

export class DashboardPresenterClientFactory {
  static create(): DashboardPresenter {
    // ✅ Use API Repository for client-side
    const repository = new ApiContentRepository();

    return new DashboardPresenter(repository);
  }
}

export function createClientDashboardPresenter(): DashboardPresenter {
  return DashboardPresenterClientFactory.create();
}
