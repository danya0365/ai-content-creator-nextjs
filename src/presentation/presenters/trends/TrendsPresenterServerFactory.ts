import { GoogleTrendsRepository } from '@/src/infrastructure/repositories/api/GoogleTrendsRepository';
import { TrendsPresenter } from './TrendsPresenter';

/**
 * Factory for creating the TrendsPresenter on the server
 * Avoids circular dependencies and keeps server logic out of client components
 */
export function createServerTrendsPresenter(): TrendsPresenter {
  const repository = new GoogleTrendsRepository();
  return new TrendsPresenter(repository);
}
