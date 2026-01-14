/**
 * GalleryPresenterServerFactory
 * Factory for creating GalleryPresenter instances on the server side
 * ✅ Injects the appropriate repository based on env config
 */

import { mockContentRepository } from '@/src/infrastructure/repositories/mock/MockContentRepository';
import { GalleryPresenter } from './GalleryPresenter';
// import { SupabaseContentRepository } from '@/src/infrastructure/repositories/SupabaseContentRepository';
// import { createClient } from '@/src/infrastructure/supabase/server';

export class GalleryPresenterServerFactory {
  static async create(): Promise<GalleryPresenter> {
    // ✅ Use Mock Repository for development
    const repository = mockContentRepository;
    
    // ⏳ TODO: Switch to Supabase Repository when backend is ready
    /*
    const supabase = await createClient();
    const repository = new SupabaseContentRepository(supabase);
    */

    return new GalleryPresenter(repository);
  }
}

export async function createServerGalleryPresenter(): Promise<GalleryPresenter> {
  return await GalleryPresenterServerFactory.create();
}
