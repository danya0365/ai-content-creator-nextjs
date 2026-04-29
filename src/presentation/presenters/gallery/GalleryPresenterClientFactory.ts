/**
 * GalleryPresenterClientFactory
 * Factory for creating GalleryPresenter instances on the client side
 * ✅ Uses ApiContentRepository for production (calls API routes)
 */

"use client";

import { Database } from "@/src/domain/types/supabase";
import { ApiContentRepository } from "@/src/infrastructure/repositories/api/ApiContentRepository";
import { createClient } from "@/src/infrastructure/supabase/client";
import { SupabaseClient } from "@supabase/supabase-js";
import { GalleryPresenter } from "./GalleryPresenter";

export class GalleryPresenterClientFactory {
  static create(supabase?: SupabaseClient<Database>): GalleryPresenter {
    // ✅ Use API Repository for client-side, pass Supabase for real-time
    const repository = new ApiContentRepository(supabase ?? createClient());

    return new GalleryPresenter(repository);
  }
}

export function createClientGalleryPresenter(
  supabase?: SupabaseClient<Database>,
): GalleryPresenter {
  return GalleryPresenterClientFactory.create(supabase);
}
