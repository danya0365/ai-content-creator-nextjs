/**
 * ContentDetailPresenterServerFactory
 * Factory for creating ContentDetailPresenter instances on the server side
 * ✅ Injects the appropriate repository based on env config
 */

import { getContentRepository } from '@/src/lib/getRepository';
import { ContentDetailPresenter } from './ContentDetailPresenter';

export class ContentDetailPresenterServerFactory {
  static create(): ContentDetailPresenter {
    const repository = getContentRepository();
    return new ContentDetailPresenter(repository);
  }
}

export function createServerContentDetailPresenter(): ContentDetailPresenter {
  return ContentDetailPresenterServerFactory.create();
}
