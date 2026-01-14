'use client';

import { mockContentRepository } from '@/src/infrastructure/repositories/mock/MockContentRepository';
import { AnalyticsPresenter } from './AnalyticsPresenter';

export class AnalyticsPresenterClientFactory {
  static create(): AnalyticsPresenter {
    // ✅ Use Mock Repository for development
    const repository = mockContentRepository;
    
    // ⏳ TODO: Switch to Supabase Repository when backend is ready
    // const supabase = getSupabaseClient();
    // const repository = new SupabaseContentRepository(supabase);

    return new AnalyticsPresenter(repository);
  }
}

export function createClientAnalyticsPresenter(): AnalyticsPresenter {
  return AnalyticsPresenterClientFactory.create();
}
