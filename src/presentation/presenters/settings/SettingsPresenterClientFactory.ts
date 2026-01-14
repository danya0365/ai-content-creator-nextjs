'use client';

import { mockContentRepository } from '@/src/infrastructure/repositories/mock/MockContentRepository';
import { SettingsPresenter } from './SettingsPresenter';
// import { SupabaseContentRepository } from '@/src/infrastructure/repositories/SupabaseContentRepository';
// import { getSupabaseClient } from '@/src/infrastructure/supabase/client';

export class SettingsPresenterClientFactory {
  static create(): SettingsPresenter {
    // ✅ Use Mock Repository for development
    const repository = mockContentRepository;
    
    // ⏳ TODO: Switch to Supabase Repository when backend is ready
    // const supabase = getSupabaseClient();
    // const repository = new SupabaseContentRepository(supabase);

    return new SettingsPresenter(repository);
  }
}

export function createClientSettingsPresenter(): SettingsPresenter {
  return SettingsPresenterClientFactory.create();
}
