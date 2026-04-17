import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://vonzscriztdcdhobulhy.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_3CbiLXuCbqRGjKmBp7Ez3w_NV4HaLXa";

export const supabase = createClient(supabaseUrl, supabaseKey);

// Helper to get current user from session cookie/token
export async function getUser(req) {
  const token = req?.cookies?.get("auth-token")?.value;
  if (!token) return null;

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error) return null;
    return user;
  } catch (e) {
    return null;
  }
}

// Helper to verify session
export async function verifySession(req) {
  const token = req?.cookies?.get("auth-token")?.value;
  if (!token) return { user: null, session: null };

  const { data: { session }, error } = await supabase.auth.getSession(token);
  if (error || !session) return { user: null, session: null };

  return { user: session.user, session };
}