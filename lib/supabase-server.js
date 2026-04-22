import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

function createOptionalClient(key) {
  if (!supabaseUrl || !key) return null;
  return createClient(supabaseUrl, key);
}

export const supabase = createOptionalClient(supabaseAnonKey);
export const supabaseAdmin = createOptionalClient(supabaseServiceRoleKey);

// Helper to get current user from session cookie/token
export async function getUser(req) {
  if (!supabase) return null;
  const token = req?.cookies?.get("auth-token")?.value;
  if (!token) return null;

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);
    if (error) return null;
    return user;
  } catch {
    return null;
  }
}

// Helper to verify session
export async function verifySession(req) {
  if (!supabase) return { user: null, session: null };
  const token = req?.cookies?.get("auth-token")?.value;
  if (!token) return { user: null, session: null };

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession(token);
  if (error || !session) return { user: null, session: null };

  return { user: session.user, session };
}
