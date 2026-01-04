/**
 * TimelinePresenterServerFactory
 * Factory for creating TimelinePresenter instances on the server side
 */

import { TimelinePresenter } from './TimelinePresenter';

export class TimelinePresenterServerFactory {
  static create(): TimelinePresenter {
    return new TimelinePresenter();
  }
}

export function createServerTimelinePresenter(): TimelinePresenter {
  return TimelinePresenterServerFactory.create();
}
