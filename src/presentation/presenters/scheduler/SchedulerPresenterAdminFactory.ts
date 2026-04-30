import { SchedulerPresenter } from './SchedulerPresenter';
import { SchedulerRepository } from '@/src/infrastructure/repositories/SchedulerRepository';

/**
 * SchedulerPresenterAdminFactory
 * Factory for creating SchedulerPresenter instances with Admin privileges
 * Used by internal cron jobs to bypass RLS.
 * ✅ Following Clean Architecture - Static Class Pattern
 */
export class SchedulerPresenterAdminFactory {
  static create(): SchedulerPresenter {
    // SchedulerRepository currently doesn't require a supabase client in its constructor
    // It uses internal singleton and http calls
    const repository = new SchedulerRepository();
    
    return new SchedulerPresenter(repository);
  }
}

/**
 * Standard factory function for easier invocation
 */
export function createAdminSchedulerPresenter(): SchedulerPresenter {
  return SchedulerPresenterAdminFactory.create();
}
