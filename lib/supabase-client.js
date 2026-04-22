import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const hasSupabaseClientConfig = Boolean(supabaseUrl && supabaseKey);

export const supabase = hasSupabaseClientConfig ? createClient(supabaseUrl, supabaseKey) : null;

// Get current session
export async function getSession() {
  if (!supabase) return null;
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
}

// Get current user
export async function getUser() {
  if (!supabase) return null;
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  } catch (error) {
    console.error("Error getting user:", error);
    return null;
  }
}

// Sign in with Google OAuth
export async function signInWithGoogle() {
  if (!supabase) {
    return { data: null, error: new Error("Supabase client is not configured") };
  }
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/api/auth/callback`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Google sign-in error:", error);
    return { data: null, error };
  }
}

// Sign out
export async function signOut() {
  if (!supabase) {
    return { error: new Error("Supabase client is not configured") };
  }
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error("Sign out error:", error);
    return { error };
  }
}
