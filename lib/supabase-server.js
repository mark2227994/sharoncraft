import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://vonzscriztdcdhobulhy.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_3CbiLXuCbqRGjKmBp7Ez3w_NV4HaLXa";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvbnpzY3JpendkY2Rob2J1bGh5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjoxODU5NjM0ODAwfQ.Yr49_lRO_D7k0SbJfKXMWLvT5N_VV_QZ8qU8Zm8Qy0w";

export const supabase = createClient(supabaseUrl, supabaseKey);
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

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