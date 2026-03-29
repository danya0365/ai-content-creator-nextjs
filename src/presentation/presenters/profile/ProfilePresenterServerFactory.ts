import { SupabaseProfileRepository } from '@/src/infrastructure/repositories/supabase/SupabaseProfileRepository';
import { createClient } from '@/src/infrastructure/supabase/server';
import { ProfilePresenter } from './ProfilePresenter';

export class ProfilePresenterServerFactory {
  static async create(): Promise<ProfilePresenter> {
    const supabase = await createClient();
    const repository = new SupabaseProfileRepository(supabase);
    return new ProfilePresenter(repository);
  }
}

export async function createServerProfilePresenter(): Promise<ProfilePresenter> {
  return ProfilePresenterServerFactory.create();
}
