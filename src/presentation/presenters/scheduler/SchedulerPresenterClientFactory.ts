import { SchedulerPresenter } from './SchedulerPresenter';
import { ApiSchedulerRepository } from '@/src/infrastructure/repositories/api/ApiSchedulerRepository';

let cachedPresenter: SchedulerPresenter | null = null;

/**
 * SchedulerPresenterClientFactory
 * Factory for creating SchedulerPresenter instances on the client side
 * ✅ Following Clean Architecture - Static Class Pattern
 */
export class SchedulerPresenterClientFactory {
  static create(): SchedulerPresenter {
    if (cachedPresenter) return cachedPresenter;

    const repository = new ApiSchedulerRepository();
    cachedPresenter = new SchedulerPresenter(repository);
    
    return cachedPresenter;
  }
}

/**
 * Standard factory function for easier invocation
 */
export function createClientSchedulerPresenter(): SchedulerPresenter {
  return SchedulerPresenterClientFactory.create();
}
