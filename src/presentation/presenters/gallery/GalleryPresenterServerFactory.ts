import { GalleryPresenter } from './GalleryPresenter';
import { SupabaseContentRepository } from '@/src/infrastructure/repositories/SupabaseContentRepository';
import { createAdminClient } from '@/src/infrastructure/supabase/server';

/**
 * GalleryPresenterServerFactory
 * Factory for creating GalleryPresenter instances on the server side
 * ✅ Following Clean Architecture - Static Class Pattern
 */
export class GalleryPresenterServerFactory {
  static create(): GalleryPresenter {
    // Service role admin client for backend operations
    const supabase = createAdminClient();
    const repository = new SupabaseContentRepository(supabase);
    
    return new GalleryPresenter(repository);
  }
}

/**
 * Standard factory function for easier invocation
 */
export function createServerGalleryPresenter(): GalleryPresenter {
  return GalleryPresenterServerFactory.create();
}
