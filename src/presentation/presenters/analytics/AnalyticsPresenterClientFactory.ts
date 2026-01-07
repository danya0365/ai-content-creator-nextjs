/**
 * AnalyticsPresenterClientFactory
 * Factory for creating AnalyticsPresenter instances on the client side
 */

'use client';

import { getContentRepository } from '@/src/lib/getRepository';
import { AnalyticsPresenter } from './AnalyticsPresenter';

export class AnalyticsPresenterClientFactory {
  static create(): AnalyticsPresenter {
    const repository = getContentRepository();
    return new AnalyticsPresenter(repository);
  }
}

export function createClientAnalyticsPresenter(): AnalyticsPresenter {
  return AnalyticsPresenterClientFactory.create();
}
