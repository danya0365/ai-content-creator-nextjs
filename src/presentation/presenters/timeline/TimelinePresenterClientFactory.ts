/**
 * TimelinePresenterClientFactory
 * Factory for creating TimelinePresenter instances on the client side
 */

'use client';

import { getContentRepository } from '@/src/lib/getRepository';
import { TimelinePresenter } from './TimelinePresenter';

export class TimelinePresenterClientFactory {
  static create(): TimelinePresenter {
    const repository = getContentRepository();
    return new TimelinePresenter(repository);
  }
}

export function createClientTimelinePresenter(): TimelinePresenter {
  return TimelinePresenterClientFactory.create();
}
