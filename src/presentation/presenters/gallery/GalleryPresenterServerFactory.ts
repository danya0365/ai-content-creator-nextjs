/**
 * GalleryPresenterServerFactory
 * Factory for creating GalleryPresenter instances on the server side
 */

import { GalleryPresenter } from './GalleryPresenter';

export class GalleryPresenterServerFactory {
  static create(): GalleryPresenter {
    return new GalleryPresenter();
  }
}

export function createServerGalleryPresenter(): GalleryPresenter {
  return GalleryPresenterServerFactory.create();
}
