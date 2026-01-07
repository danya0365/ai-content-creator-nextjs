/**
 * ContentEditPresenterClientFactory
 * Factory for creating ContentEditPresenter instances on the client side
 */

'use client';

import { getContentRepository } from '@/src/lib/getRepository';
import { ContentEditPresenter } from './ContentEditPresenter';

export class ContentEditPresenterClientFactory {
  static create(): ContentEditPresenter {
    const repository = getContentRepository();
    return new ContentEditPresenter(repository);
  }
}

export function createClientContentEditPresenter(): ContentEditPresenter {
  return ContentEditPresenterClientFactory.create();
}
