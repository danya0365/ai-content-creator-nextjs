/**
 * ContentDetailPresenterClientFactory
 * Factory for creating ContentDetailPresenter instances on the client side
 * ✅ Uses ApiContentRepository for production (calls API routes)
 */

'use client';

import { ApiContentRepository } from '@/src/infrastructure/repositories/api/ApiContentRepository';
import { ContentDetailPresenter } from './ContentDetailPresenter';

export class ContentDetailPresenterClientFactory {
  static create(): ContentDetailPresenter {
    // ✅ Use API Repository for client-side
    const repository = new ApiContentRepository();

    return new ContentDetailPresenter(repository);
  }
}

export function createClientContentDetailPresenter(): ContentDetailPresenter {
  return ContentDetailPresenterClientFactory.create();
}
