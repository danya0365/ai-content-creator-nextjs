/**
 * Repository Factory
 * Returns the appropriate repository based on NEXT_PUBLIC_DATA_SOURCE env
 */

import { IContentRepository } from '@/src/application/repositories/IContentRepository';
import { MockContentRepository } from '@/src/infrastructure/repositories/mock/MockContentRepository';
import { SupabaseContentRepository } from '@/src/infrastructure/repositories/SupabaseContentRepository';

// Cache singleton instances
let mockContentRepository: MockContentRepository | null = null;
let supabaseContentRepository: SupabaseContentRepository | null = null;

/**
 * Check if using Supabase or Mock data source
 */
export function isUsingSupabase(): boolean {
  return process.env.NEXT_PUBLIC_DATA_SOURCE === 'supabase';
}

/**
 * Get the data source name for display
 */
export function getDataSourceName(): string {
  return isUsingSupabase() ? 'Supabase' : 'Mock Data';
}

/**
 * Get Content Repository
 * Returns MockContentRepository or SupabaseContentRepository based on env
 */
export function getContentRepository(): IContentRepository {
  if (isUsingSupabase()) {
    if (!supabaseContentRepository) {
      supabaseContentRepository = new SupabaseContentRepository();
    }
    return supabaseContentRepository;
  } else {
    if (!mockContentRepository) {
      mockContentRepository = new MockContentRepository();
    }
    return mockContentRepository;
  }
}

/**
 * Reset repositories (useful for testing)
 */
export function resetRepositories(): void {
  mockContentRepository = null;
  supabaseContentRepository = null;
}
