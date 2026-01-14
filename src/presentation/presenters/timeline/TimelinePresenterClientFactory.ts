'use client';

import { mockContentRepository } from '@/src/infrastructure/repositories/mock/MockContentRepository';
import { TimelinePresenter } from './TimelinePresenter';
// import { SupabaseContentRepository } from '@/src/infrastructure/repositories/SupabaseContentRepository';
// import { getSupabaseClient } from '@/src/infrastructure/supabase/client';

export class TimelinePresenterClientFactory {
  static create(): TimelinePresenter {
    // ✅ Use Mock Repository for development
    const repository = mockContentRepository;
    
    // ⏳ TODO: Switch to Supabase Repository when backend is ready
    /*
    const supabase = getSupabaseClient();
    const repository = new SupabaseContentRepository(supabase);
    */

    return new TimelinePresenter(repository);
  }
}

export function createClientTimelinePresenter(): TimelinePresenter {
  return TimelinePresenterClientFactory.create();
}
