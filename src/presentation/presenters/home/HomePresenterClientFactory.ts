/**
 * HomePresenterClientFactory
 * Factory for creating HomePresenter instances on the client side
 * ✅ Uses ApiContentRepository for production (calls API routes)
 */

'use client';

import { ApiContentRepository } from '@/src/infrastructure/repositories/api/ApiContentRepository';
import { createClient } from '@/src/infrastructure/supabase/client';
import { HomePresenter } from './HomePresenter';

export class HomePresenterClientFactory {
  static create(): HomePresenter {
    // ✅ Use API Repository for client-side
    // ✅ Pass browser Supabase client *only* for realtime channel subscription
    const supabase = createClient();
    const repository = new ApiContentRepository(supabase);
    //const repository = new SupabaseContentRepository(supabase);

    return new HomePresenter(repository);
  }
}

export function createClientHomePresenter(): HomePresenter {
  return HomePresenterClientFactory.create();
}
