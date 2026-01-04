/**
 * SchedulePresenterServerFactory
 * Factory for creating SchedulePresenter instances on the server side
 */

import { SchedulePresenter } from './SchedulePresenter';

export class SchedulePresenterServerFactory {
  static create(): SchedulePresenter {
    return new SchedulePresenter();
  }
}

export function createServerSchedulePresenter(): SchedulePresenter {
  return SchedulePresenterServerFactory.create();
}
