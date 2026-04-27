"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError || !data.user || !data.session) {
        setError(signInError?.message || "Invalid email or password.");
        setLoading(false);
        return;
      }

      const { data: adminUser, error: adminError } = await supabase
        .from("admin_users")
        .select("id")
        .eq("id", data.user.id)
        .maybeSingle();

      if (adminError || !adminUser) {
        await supabase.auth.signOut();
        setError("You do not have admin access.");
        setLoading(false);
        return;
      }

      document.cookie = `auth-token=${data.session.access_token}; path=/; max-age=3600; samesite=lax`;
      router.push("/admin");
      router.refresh();
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-6">
      <div className="w-full max-w-[360px]">
        <div className="mb-12 text-center">
          <p className="text-[13px] uppercase tracking-[3px] text-[#1c1c1c]">SHARONCRAFT</p>
          <p className="mt-2 text-[10px] text-[#999]">Admin</p>
        </div>

        {error ? (
          <div className="mb-4 border border-[#C0392B]/20 bg-[#fde8e8] px-3 py-3 text-[11px] text-[#C0392B]">
            {error}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email"
            autoComplete="email"
            required
            className="h-9 w-full rounded-[2px] border border-[#e0e0e0] bg-[#fafafa] px-3 text-[12px] text-[#1c1c1c] outline-none transition-colors duration-200 ease-in-out focus:border-[#8B5E3C]"
          />
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
            autoComplete="current-password"
            required
            className="h-9 w-full rounded-[2px] border border-[#e0e0e0] bg-[#fafafa] px-3 text-[12px] text-[#1c1c1c] outline-none transition-colors duration-200 ease-in-out focus:border-[#8B5E3C]"
          />
          <button
            type="submit"
            disabled={loading}
            className="h-11 w-full rounded-[2px] bg-[#1c1c1c] text-[11px] uppercase tracking-[3px] text-white transition-opacity duration-200 ease-in-out hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Signing In" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
