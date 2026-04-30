import { GalleryPresenter } from './GalleryPresenter';
import { SupabaseContentRepository } from '@/src/infrastructure/repositories/SupabaseContentRepository';
import { createClient } from '@/src/infrastructure/supabase/server';

/**
 * GalleryPresenterServerFactory
 * Factory for creating GalleryPresenter instances on the server side
 * ✅ Following Clean Architecture - Static Class Pattern
 * ✅ USES SESSION CLIENT (RLS ENABLED)
 */
export class GalleryPresenterServerFactory {
  static async create(): Promise<GalleryPresenter> {
    // Standard user client (respects RLS)
    const supabase = await createClient();
    const repository = new SupabaseContentRepository(supabase);
    
    return new GalleryPresenter(repository);
  }
}

/**
 * Standard factory function for easier invocation
 */
export async function createServerGalleryPresenter(): Promise<GalleryPresenter> {
  return await GalleryPresenterServerFactory.create();
}
