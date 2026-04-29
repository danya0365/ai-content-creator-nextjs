/**
 * SchedulePresenterClientFactory
 * Factory for creating SchedulePresenter instances on the client side
 * ✅ Uses ApiContentRepository for production (calls API routes)
 */

"use client";

import { Database } from "@/src/domain/types/supabase";
import { ApiContentRepository } from "@/src/infrastructure/repositories/api/ApiContentRepository";
import { createClient } from "@/src/infrastructure/supabase/client";
import { SupabaseClient } from "@supabase/supabase-js";
import { SchedulePresenter } from "./SchedulePresenter";

export class SchedulePresenterClientFactory {
  static create(supabase?: SupabaseClient<Database>): SchedulePresenter {
    // ✅ Use API Repository for client-side, pass Supabase for real-time
    const repository = new ApiContentRepository(supabase ?? createClient());

    return new SchedulePresenter(repository);
  }
}

export function createClientSchedulePresenter(
  supabase?: SupabaseClient<Database>,
): SchedulePresenter {
  return SchedulePresenterClientFactory.create(supabase);
}
