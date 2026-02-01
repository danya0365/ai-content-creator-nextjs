/**
 * GalleryPresenterServerFactory
 * Factory for creating GalleryPresenter instances on the server side
 * ✅ Uses Supabase Repository for production
 */

import { SupabaseContentRepository } from '@/src/infrastructure/repositories/SupabaseContentRepository';
import { createClient } from '@/src/infrastructure/supabase/server';
import { GalleryPresenter } from './GalleryPresenter';

export class GalleryPresenterServerFactory {
  static async create(): Promise<GalleryPresenter> {
    // ✅ Use Supabase Repository for production
    const supabase = await createClient();
    const repository = new SupabaseContentRepository(supabase);

    return new GalleryPresenter(repository);
  }
}

export async function createServerGalleryPresenter(): Promise<GalleryPresenter> {
  return await GalleryPresenterServerFactory.create();
}
