'use client';

import { mockContentRepository } from '@/src/infrastructure/repositories/mock/MockContentRepository';
import { ContentEditPresenter } from './ContentEditPresenter';
// import { SupabaseContentRepository } from '@/src/infrastructure/repositories/SupabaseContentRepository';
// import { getSupabaseClient } from '@/src/infrastructure/supabase/client';

export class ContentEditPresenterClientFactory {
  static create(): ContentEditPresenter {
    // ✅ Use Mock Repository for development
    const repository = mockContentRepository;
    
    // ⏳ TODO: Switch to Supabase Repository when backend is ready
    /*
    const supabase = getSupabaseClient();
    const repository = new SupabaseContentRepository(supabase);
    */

    return new ContentEditPresenter(repository);
  }
}

export function createClientContentEditPresenter(): ContentEditPresenter {
  return ContentEditPresenterClientFactory.create();
}
