/**
 * GalleryPresenterClientFactory
 * Factory for creating GalleryPresenter instances on the client side
 * ✅ Uses ApiContentRepository for production (calls API routes)
 */

'use client';

import { ApiContentRepository } from '@/src/infrastructure/repositories/api/ApiContentRepository';
import { GalleryPresenter } from './GalleryPresenter';

export class GalleryPresenterClientFactory {
  static create(): GalleryPresenter {
    // ✅ Use API Repository for client-side
    const repository = new ApiContentRepository();

    return new GalleryPresenter(repository);
  }
}

export function createClientGalleryPresenter(): GalleryPresenter {
  return GalleryPresenterClientFactory.create();
}
