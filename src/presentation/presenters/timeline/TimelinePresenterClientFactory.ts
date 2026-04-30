/**
 * TimelinePresenterClientFactory
 * Factory for creating TimelinePresenter instances on the client side
 * ✅ Uses ApiContentRepository for production (calls API routes)
 */

"use client";

import { Database } from "@/src/domain/types/supabase";
import { ApiContentRepository } from "@/src/infrastructure/repositories/api/ApiContentRepository";
import { createClient } from "@/src/infrastructure/supabase/client";
import { SupabaseClient } from "@supabase/supabase-js";
import { TimelinePresenter } from "./TimelinePresenter";

export class TimelinePresenterClientFactory {
  static create(supabase?: SupabaseClient<Database>): TimelinePresenter {
    // ✅ Use API Repository for client-side, pass Supabase for real-time
    const repository = new ApiContentRepository(supabase ?? createClient());

    return new TimelinePresenter(repository);
  }
}

export function createClientTimelinePresenter(
  supabase?: SupabaseClient<Database>,
): TimelinePresenter {
  return TimelinePresenterClientFactory.create(supabase);
}
