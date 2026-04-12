import { useState } from "react";
import { useForm } from "react-hook-form";

export default function AdminLoginPage() {
  const { register, handleSubmit } = useForm();
  const [error, setError] = useState("");

  async function onSubmit(values) {
    setError("");
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: values.password }),
    });

    if (!response.ok) {
      setError("That password didn’t work.");
      return;
    }

    window.location.href = "/admin";
  }

  return (
    <main className="admin-login">
      <form className="admin-login-card" style={{ width: "min(420px, 100%)" }} onSubmit={handleSubmit(onSubmit)}>
        <p className="overline">Protected workspace</p>
        <h1 className="display-md" style={{ marginBottom: "12px" }}>Admin Login</h1>
        <p className="admin-note" style={{ marginBottom: "24px" }}>
          Enter your admin password to open the SharonCraft dashboard.
        </p>
        <label className="admin-field">
          <span>Password</span>
          <input type="password" className="admin-input" {...register("password", { required: true })} />
        </label>
        {error ? <p style={{ color: "var(--color-terracotta)", marginBottom: "12px" }}>{error}</p> : null}
        <button type="submit" className="admin-button" style={{ width: "100%" }}>
          Enter Dashboard
        </button>
      </form>
    </main>
  );
}
