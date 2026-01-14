/**
 * DashboardPresenterClientFactory
 * Factory for creating DashboardPresenter instances on the client side
 * ✅ Injects the appropriate repository based on env config
 */

'use client';

import { mockContentRepository } from '@/src/infrastructure/repositories/mock/MockContentRepository';
import { DashboardPresenter } from './DashboardPresenter';
// import { SupabaseContentRepository } from '@/src/infrastructure/repositories/SupabaseContentRepository';
// import { getSupabaseClient } from '@/src/infrastructure/supabase/client';

export class DashboardPresenterClientFactory {
  static create(): DashboardPresenter {
    // ✅ Use Mock Repository for development
    const repository = mockContentRepository;
    
    // ⏳ TODO: Switch to Supabase Repository when backend is ready
    /*
    const supabase = getSupabaseClient();
    const repository = new SupabaseContentRepository(supabase);
    */

    return new DashboardPresenter(repository);
  }
}

export function createClientDashboardPresenter(): DashboardPresenter {
  return DashboardPresenterClientFactory.create();
}
