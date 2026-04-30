/**
 * ContentEditPresenterServerFactory
 * Factory for creating ContentEditPresenter instances on the server side
 * ✅ Uses Supabase Repository for production
 */

import { SupabaseContentRepository } from '@/src/infrastructure/repositories/SupabaseContentRepository';
import { createClient } from '@/src/infrastructure/supabase/server';
import { ContentEditPresenter } from './ContentEditPresenter';

export class ContentEditPresenterServerFactory {
  static async create(): Promise<ContentEditPresenter> {
    // ✅ Use Supabase Repository for production
    const supabase = await createClient();
    const repository = new SupabaseContentRepository(supabase);

    return new ContentEditPresenter(repository);
  }
}

export async function createServerContentEditPresenter(): Promise<ContentEditPresenter> {
  return await ContentEditPresenterServerFactory.create();
}
