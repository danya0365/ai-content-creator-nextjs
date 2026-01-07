/**
 * GalleryPresenterServerFactory
 * Factory for creating GalleryPresenter instances on the server side
 * ✅ Injects the appropriate repository based on env config
 */

import { getContentRepository } from '@/src/lib/getRepository';
import { GalleryPresenter } from './GalleryPresenter';

export class GalleryPresenterServerFactory {
  static create(): GalleryPresenter {
    const repository = getContentRepository();
    return new GalleryPresenter(repository);
  }
}

export function createServerGalleryPresenter(): GalleryPresenter {
  return GalleryPresenterServerFactory.create();
}
