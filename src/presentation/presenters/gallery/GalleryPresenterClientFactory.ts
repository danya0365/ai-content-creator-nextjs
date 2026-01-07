/**
 * GalleryPresenterClientFactory
 * Factory for creating GalleryPresenter instances on the client side
 * ✅ Injects the appropriate repository based on env config
 */

'use client';

import { getContentRepository } from '@/src/lib/getRepository';
import { GalleryPresenter } from './GalleryPresenter';

export class GalleryPresenterClientFactory {
  static create(): GalleryPresenter {
    const repository = getContentRepository();
    return new GalleryPresenter(repository);
  }
}

export function createClientGalleryPresenter(): GalleryPresenter {
  return GalleryPresenterClientFactory.create();
}
