/**
 * ContentEditPresenterServerFactory
 * Factory for creating ContentEditPresenter instances on the server side
 * ✅ Injects the appropriate repository based on env config
 */

import { getContentRepository } from '@/src/lib/getRepository';
import { ContentEditPresenter } from './ContentEditPresenter';

export class ContentEditPresenterServerFactory {
  static create(): ContentEditPresenter {
    const repository = getContentRepository();
    return new ContentEditPresenter(repository);
  }
}

export function createServerContentEditPresenter(): ContentEditPresenter {
  return ContentEditPresenterServerFactory.create();
}
