import { GoogleTrendsRepository } from '@/src/infrastructure/repositories/api/GoogleTrendsRepository';
import { mockTrendsRepository } from '@/src/infrastructure/repositories/mock/MockTrendsRepository';
import { TrendsPresenter } from './TrendsPresenter';

/**
 * Factory for creating the TrendsPresenter on the server
 * Avoids circular dependencies and keeps server logic out of client components
 */
export function createServerTrendsPresenter(): TrendsPresenter {
  const useMock = process.env.USE_MOCK_DATA === 'true';
  const repository = useMock ? mockTrendsRepository : new GoogleTrendsRepository();
  return new TrendsPresenter(repository);
}
