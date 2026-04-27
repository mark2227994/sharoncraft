import { supabaseAdmin } from "@/lib/supabase/server";

export type AdminIdentity = {
  id: string;
  email: string;
  name: string | null;
  role: string | null;
};

export async function getAdminIdentityFromToken(token?: string | null): Promise<AdminIdentity | null> {
  if (!token) return null;

  const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
  if (userError || !userData.user) return null;

  const { data: adminRecord, error: adminError } = await supabaseAdmin
    .from("admin_users")
    .select("id, email, name, role")
    .eq("id", userData.user.id)
    .maybeSingle();

  if (adminError || !adminRecord) return null;

  return {
    id: String(adminRecord.id),
    email: String(adminRecord.email || userData.user.email || ""),
    name: adminRecord.name ?? null,
    role: adminRecord.role ?? null,
  };
}
