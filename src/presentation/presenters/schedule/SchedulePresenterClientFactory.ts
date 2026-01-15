/**
 * SchedulePresenterClientFactory
 * Factory for creating SchedulePresenter instances on the client side
 * ✅ Uses ApiContentRepository for production (calls API routes)
 */

'use client';

import { ApiContentRepository } from '@/src/infrastructure/repositories/api/ApiContentRepository';
import { SchedulePresenter } from './SchedulePresenter';

export class SchedulePresenterClientFactory {
  static create(): SchedulePresenter {
    // ✅ Use API Repository for client-side
    const repository = new ApiContentRepository();

    return new SchedulePresenter(repository);
  }
}

export function createClientSchedulePresenter(): SchedulePresenter {
  return SchedulePresenterClientFactory.create();
}
