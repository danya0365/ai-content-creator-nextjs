import { SchedulerPresenter } from './SchedulerPresenter';
import { SchedulerRepository } from '@/src/infrastructure/repositories/SchedulerRepository';

export function createServerSchedulerPresenter(): SchedulerPresenter {
  const repository = new SchedulerRepository();
  return new SchedulerPresenter(repository);
}
