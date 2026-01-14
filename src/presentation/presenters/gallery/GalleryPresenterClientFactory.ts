/**
 * GalleryPresenterClientFactory
 * Factory for creating GalleryPresenter instances on the client side
 * ✅ Injects the appropriate repository based on env config
 */

'use client';

import { mockContentRepository } from '@/src/infrastructure/repositories/mock/MockContentRepository';
import { GalleryPresenter } from './GalleryPresenter';
// import { SupabaseContentRepository } from '@/src/infrastructure/repositories/SupabaseContentRepository';
// import { getSupabaseClient } from '@/src/infrastructure/supabase/client';

export class GalleryPresenterClientFactory {
  static create(): GalleryPresenter {
    // ✅ Use Mock Repository for development
    const repository = mockContentRepository;
    
    // ⏳ TODO: Switch to Supabase Repository when backend is ready
    /*
    const supabase = getSupabaseClient();
    const repository = new SupabaseContentRepository(supabase);
    */

    return new GalleryPresenter(repository);
  }
}

export function createClientGalleryPresenter(): GalleryPresenter {
  return GalleryPresenterClientFactory.create();
}
