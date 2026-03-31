import { ContentPresenter } from './ContentPresenter';
import { SupabaseContentRepository } from '@/src/infrastructure/repositories/SupabaseContentRepository';
import { createAdminClient } from '@/src/infrastructure/supabase/server';

/**
 * ContentPresenterServerFactory
 * Factory for creating ContentPresenter instances on the server side
 * ✅ Following Clean Architecture - Static Class Pattern
 */
export class ContentPresenterServerFactory {
  static create(): ContentPresenter {
    // Service role admin client for backend operations
    const supabase = createAdminClient();
    const repository = new SupabaseContentRepository(supabase);
    
    return new ContentPresenter(repository);
  }
}

/**
 * Standard factory function for easier invocation
 */
export function createServerContentPresenter(): ContentPresenter {
  return ContentPresenterServerFactory.create();
}
