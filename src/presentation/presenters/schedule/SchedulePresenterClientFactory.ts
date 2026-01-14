/**
 * SchedulePresenterClientFactory
 * Factory for creating SchedulePresenter instances on the client side
 * ✅ Injects the appropriate repository based on env config
 */

'use client';

import { mockContentRepository } from '@/src/infrastructure/repositories/mock/MockContentRepository';
import { SchedulePresenter } from './SchedulePresenter';
// import { SupabaseContentRepository } from '@/src/infrastructure/repositories/SupabaseContentRepository';
// import { getSupabaseClient } from '@/src/infrastructure/supabase/client';

export class SchedulePresenterClientFactory {
  static create(): SchedulePresenter {
    // ✅ Use Mock Repository for development
    const repository = mockContentRepository;
    
    // ⏳ TODO: Switch to Supabase Repository when backend is ready
    /*
    const supabase = getSupabaseClient();
    const repository = new SupabaseContentRepository(supabase);
    */

    return new SchedulePresenter(repository);
  }
}

export function createClientSchedulePresenter(): SchedulePresenter {
  return SchedulePresenterClientFactory.create();
}
