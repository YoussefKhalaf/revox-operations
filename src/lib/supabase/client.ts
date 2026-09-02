import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "@/lib/supabase/env";

let browserClient: SupabaseClient | undefined;

export function createBrowserClient(): SupabaseClient {
  if (browserClient) {
    return browserClient;
  }

  const { url, key } = getSupabaseEnv();
  browserClient = createSupabaseBrowserClient(url, key);
  return browserClient;
}
