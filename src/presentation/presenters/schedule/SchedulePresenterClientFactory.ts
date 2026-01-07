/**
 * SchedulePresenterClientFactory
 * Factory for creating SchedulePresenter instances on the client side
 * ✅ Injects the appropriate repository based on env config
 */

'use client';

import { getContentRepository } from '@/src/lib/getRepository';
import { SchedulePresenter } from './SchedulePresenter';

export class SchedulePresenterClientFactory {
  static create(): SchedulePresenter {
    const repository = getContentRepository();
    return new SchedulePresenter(repository);
  }
}

export function createClientSchedulePresenter(): SchedulePresenter {
  return SchedulePresenterClientFactory.create();
}
