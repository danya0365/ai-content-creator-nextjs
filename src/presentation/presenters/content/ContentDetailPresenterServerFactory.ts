/**
 * ContentDetailPresenterServerFactory
 * Factory for creating ContentDetailPresenter instances on the server side
 * ✅ Uses Supabase Repository for production
 */

import { SupabaseContentRepository } from '@/src/infrastructure/repositories/SupabaseContentRepository';
import { createClient } from '@/src/infrastructure/supabase/server';
import { ContentDetailPresenter } from './ContentDetailPresenter';

export class ContentDetailPresenterServerFactory {
  static async create(): Promise<ContentDetailPresenter> {
    // ✅ Use Supabase Repository for production
    const supabase = await createClient();
    const repository = new SupabaseContentRepository(supabase);

    return new ContentDetailPresenter(repository);
  }
}

export async function createServerContentDetailPresenter(): Promise<ContentDetailPresenter> {
  return await ContentDetailPresenterServerFactory.create();
}
