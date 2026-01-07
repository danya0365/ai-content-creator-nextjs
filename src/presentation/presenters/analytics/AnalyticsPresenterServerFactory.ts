/**
 * AnalyticsPresenterServerFactory
 * Factory for creating AnalyticsPresenter instances on the server side
 * ✅ Injects the appropriate repository based on env config
 */

import { getContentRepository } from '@/src/lib/getRepository';
import { AnalyticsPresenter } from './AnalyticsPresenter';

export class AnalyticsPresenterServerFactory {
  static create(): AnalyticsPresenter {
    const repository = getContentRepository();
    return new AnalyticsPresenter(repository);
  }
}

export function createServerAnalyticsPresenter(): AnalyticsPresenter {
  return AnalyticsPresenterServerFactory.create();
}
