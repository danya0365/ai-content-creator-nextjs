/**
 * TimelinePresenterClientFactory
 * Factory for creating TimelinePresenter instances on the client side
 * ✅ Uses ApiContentRepository for production (calls API routes)
 */

'use client';

import { ApiContentRepository } from '@/src/infrastructure/repositories/api/ApiContentRepository';
import { TimelinePresenter } from './TimelinePresenter';

export class TimelinePresenterClientFactory {
  static create(): TimelinePresenter {
    // ✅ Use API Repository for client-side
    const repository = new ApiContentRepository();

    return new TimelinePresenter(repository);
  }
}

export function createClientTimelinePresenter(): TimelinePresenter {
  return TimelinePresenterClientFactory.create();
}
