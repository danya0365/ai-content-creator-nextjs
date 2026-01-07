/**
 * ContentDetailPresenterClientFactory
 * Factory for creating ContentDetailPresenter instances on the client side
 */

'use client';

import { getContentRepository } from '@/src/lib/getRepository';
import { ContentDetailPresenter } from './ContentDetailPresenter';

export class ContentDetailPresenterClientFactory {
  static create(): ContentDetailPresenter {
    const repository = getContentRepository();
    return new ContentDetailPresenter(repository);
  }
}

export function createClientContentDetailPresenter(): ContentDetailPresenter {
  return ContentDetailPresenterClientFactory.create();
}
