'use client';

import { mockContentRepository } from '@/src/infrastructure/repositories/mock/MockContentRepository';
import { ContentDetailPresenter } from './ContentDetailPresenter';
// import { SupabaseContentRepository } from '@/src/infrastructure/repositories/SupabaseContentRepository';
// import { getSupabaseClient } from '@/src/infrastructure/supabase/client';

export class ContentDetailPresenterClientFactory {
  static create(): ContentDetailPresenter {
    // ✅ Use Mock Repository for development
    const repository = mockContentRepository;
    
    // ⏳ TODO: Switch to Supabase Repository when backend is ready
    /*
    const supabase = getSupabaseClient();
    const repository = new SupabaseContentRepository(supabase);
    */

    return new ContentDetailPresenter(repository);
  }
}

export function createClientContentDetailPresenter(): ContentDetailPresenter {
  return ContentDetailPresenterClientFactory.create();
}
