/**
 * SchedulePresenterServerFactory
 * Factory for creating SchedulePresenter instances on the server side
 * ✅ Injects the appropriate repository based on env config
 */

import { getContentRepository } from '@/src/lib/getRepository';
import { SchedulePresenter } from './SchedulePresenter';

export class SchedulePresenterServerFactory {
  static create(): SchedulePresenter {
    const repository = getContentRepository();
    return new SchedulePresenter(repository);
  }
}

export function createServerSchedulePresenter(): SchedulePresenter {
  return SchedulePresenterServerFactory.create();
}
