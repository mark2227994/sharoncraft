import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cachedAdminClient: SupabaseClient | null = null;

function createSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error("Missing Supabase server environment variables");
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export function getSupabaseAdmin() {
  if (!cachedAdminClient) {
    cachedAdminClient = createSupabaseAdmin();
  }

  return cachedAdminClient;
}

export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, property, receiver) {
    const client = getSupabaseAdmin() as unknown as Record<PropertyKey, unknown>;
    const value = Reflect.get(client, property, receiver);

    if (typeof value === "function") {
      return (value as (...args: unknown[]) => unknown).bind(client);
    }

    return value;
  },
});
