/**
 * AnalyticsPresenterClientFactory
 * Factory for creating AnalyticsPresenter instances on the client side
 * ✅ Uses ApiContentRepository for production (calls API routes)
 */

'use client';

import { ApiContentRepository } from '@/src/infrastructure/repositories/api/ApiContentRepository';
import { AnalyticsPresenter } from './AnalyticsPresenter';

export class AnalyticsPresenterClientFactory {
  static create(): AnalyticsPresenter {
    // ✅ Use API Repository for client-side
    const repository = new ApiContentRepository();

    return new AnalyticsPresenter(repository);
  }
}

export function createClientAnalyticsPresenter(): AnalyticsPresenter {
  return AnalyticsPresenterClientFactory.create();
}
