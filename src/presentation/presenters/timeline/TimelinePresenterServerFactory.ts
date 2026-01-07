/**
 * TimelinePresenterServerFactory
 * Factory for creating TimelinePresenter instances on the server side
 * ✅ Injects the appropriate repository based on env config
 */

import { getContentRepository } from '@/src/lib/getRepository';
import { TimelinePresenter } from './TimelinePresenter';

export class TimelinePresenterServerFactory {
  static create(): TimelinePresenter {
    const repository = getContentRepository();
    return new TimelinePresenter(repository);
  }
}

export function createServerTimelinePresenter(): TimelinePresenter {
  return TimelinePresenterServerFactory.create();
}
