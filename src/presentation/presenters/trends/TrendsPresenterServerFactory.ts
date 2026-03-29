import { GoogleTrendsRepository } from '@/src/infrastructure/repositories/api/GoogleTrendsRepository';
import { TrendsPresenter } from './TrendsPresenter';

/**
 * TrendsPresenterServerFactory
 * Factory for creating TrendsPresenter instances on the server side
 * ✅ Following Clean Architecture - Static Class Pattern
 */
export class TrendsPresenterServerFactory {
  static create(): TrendsPresenter {
    const repository = new GoogleTrendsRepository();
    return new TrendsPresenter(repository);
  }
}

/**
 * Standard factory function for easier invocation
 */
export function createServerTrendsPresenter(): TrendsPresenter {
  return TrendsPresenterServerFactory.create();
}
