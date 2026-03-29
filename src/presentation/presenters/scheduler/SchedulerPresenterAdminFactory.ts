import { SchedulerPresenter } from './SchedulerPresenter';
import { SchedulerRepository } from '@/src/infrastructure/repositories/SchedulerRepository';

/**
 * Factory and instance creation for SchedulerPresenter (Admin Context)
 * Specialized for administrative tasks that bypass RLS
 */
export function createAdminSchedulerPresenter(): SchedulerPresenter {
  const repository = new SchedulerRepository();
  return new SchedulerPresenter(repository);
}
