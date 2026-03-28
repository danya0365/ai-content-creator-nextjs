'use client';

import { SchedulerPresenter } from './SchedulerPresenter';
import { SchedulerRepository } from '@/src/infrastructure/repositories/SchedulerRepository';

export function createClientSchedulerPresenter(): SchedulerPresenter {
  const repository = new SchedulerRepository();
  return new SchedulerPresenter(repository);
}
