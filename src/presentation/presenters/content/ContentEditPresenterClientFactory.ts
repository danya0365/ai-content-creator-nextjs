/**
 * ContentEditPresenterClientFactory
 * Factory for creating ContentEditPresenter instances on the client side
 * ✅ Uses ApiContentRepository for production (calls API routes)
 */

'use client';

import { ApiContentRepository } from '@/src/infrastructure/repositories/api/ApiContentRepository';
import { ContentEditPresenter } from './ContentEditPresenter';

export class ContentEditPresenterClientFactory {
  static create(): ContentEditPresenter {
    // ✅ Use API Repository for client-side
    const repository = new ApiContentRepository();

    return new ContentEditPresenter(repository);
  }
}

export function createClientContentEditPresenter(): ContentEditPresenter {
  return ContentEditPresenterClientFactory.create();
}
