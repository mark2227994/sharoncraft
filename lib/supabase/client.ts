import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cachedClient: SupabaseClient | null = null;

function createBrowserSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase environment variables");
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

export function getSupabaseClient() {
  if (!cachedClient) {
    cachedClient = createBrowserSupabaseClient();
  }

  return cachedClient;
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, property, receiver) {
    const client = getSupabaseClient() as unknown as Record<PropertyKey, unknown>;
    const value = Reflect.get(client, property, receiver);

    if (typeof value === "function") {
      return (value as (...args: unknown[]) => unknown).bind(client);
    }

    return value;
  },
});
