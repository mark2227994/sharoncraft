import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cachedClient: SupabaseClient | null | undefined;
let clientInitError: Error | null = null;

function createBrowserSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://localhost:54321";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "anon-key-stub";

  // Don't throw - just return null if values are still empty/stub
  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === "http://localhost:54321") {
    return null;
  }

  try {
    return createClient(supabaseUrl, supabaseAnonKey);
  } catch (err) {
    clientInitError = err as Error;
    return null;
  }
}

export function getSupabaseClient() {
  if (cachedClient === undefined) {
    cachedClient = createBrowserSupabaseClient();
  }

  return cachedClient;
}

// Create a mock client that defers real initialization
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, property, receiver) {
    const client = getSupabaseClient();
    
    if (!client) {
      // Return a mock object for missing client
      if (property === "auth") {
        return {
          signInWithPassword: async () => ({ data: null, error: new Error("Supabase not configured") }),
          signOut: async () => ({ error: new Error("Supabase not configured") }),
          getSession: async () => ({ data: null, error: new Error("Supabase not configured") }),
        };
      }
      if (property === "from") {
        return () => ({
          select: () => ({ then: (cb: any) => cb({ data: null, error: new Error("Supabase not configured") }) }),
          insert: () => ({ then: (cb: any) => cb({ data: null, error: new Error("Supabase not configured") }) }),
          update: () => ({ then: (cb: any) => cb({ data: null, error: new Error("Supabase not configured") }) }),
          delete: () => ({ then: (cb: any) => cb({ data: null, error: new Error("Supabase not configured") }) }),
        });
      }
      return undefined;
    }
    
    const typedClient = client as unknown as Record<PropertyKey, unknown>;
    const value = Reflect.get(typedClient, property, receiver);

    if (typeof value === "function") {
      return (value as (...args: unknown[]) => unknown).bind(typedClient);
    }

    return value;
  },
});
