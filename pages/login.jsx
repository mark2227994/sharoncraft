import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import SeoHead from "../components/SeoHead";
import Icon from "../components/icons";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    if (loading) return;

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setLoading(false);
        throw new Error(data.error || "Login failed");
      }

      window.location.href = "/account";
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <>
      <SeoHead title="Login - SharonCraft" description="Login to your SharonCraft account" path="/login" />
      <Nav />
      <main className="auth-page">
        <div className="auth-card">
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Login to your account</p>

          <form onSubmit={handleSubmit} className="auth-form">
            {error ? <p className="auth-error">{error}</p> : null}

            <label className="auth-field">
              <span>Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
                className="auth-input"
              />
            </label>

            <label className="auth-field">
              <span>Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Your password"
                className="auth-input"
              />
            </label>

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="auth-footer">
            Don't have an account?{" "}
            <Link href="/register" className="auth-link">
              Register
            </Link>
          </p>
        </div>
      </main>
      <Footer />

      <style jsx>{`
        .auth-page {
          min-height: 80vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--space-6) var(--gutter);
        }
        .auth-card {
          width: 100%;
          max-width: 400px;
          padding: var(--space-6);
          background: var(--color-white);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-lg);
        }
        .auth-title {
          font-family: var(--font-display);
          font-size: var(--text-2xl);
          margin-bottom: var(--space-2);
          text-align: center;
        }
        .auth-subtitle {
          color: var(--text-secondary);
          text-align: center;
          margin-bottom: var(--space-5);
        }
        .auth-form {
          display: grid;
          gap: var(--space-4);
        }
        .auth-field {
          display: grid;
          gap: var(--space-2);
        }
        .auth-field span {
          font-size: var(--text-sm);
          font-weight: 500;
        }
        .auth-input {
          padding: 12px 16px;
          border: 1px solid var(--border-default);
          border-radius: var(--radius-md);
          font-size: var(--text-base);
        }
        .auth-input:focus {
          outline: none;
          border-color: var(--color-terracotta);
        }
        .auth-button {
          padding: 14px 24px;
          background: var(--color-terracotta);
          color: var(--color-white);
          border: none;
          border-radius: var(--radius-md);
          font-size: var(--text-base);
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.2s;
        }
        .auth-button:hover {
          opacity: 0.9;
        }
        .auth-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .auth-error {
          padding: var(--space-3);
          background: #fef2f2;
          color: #dc2626;
          border-radius: var(--radius-md);
          font-size: var(--text-sm);
        }
        .auth-footer {
          margin-top: var(--space-5);
          text-align: center;
          color: var(--text-secondary);
        }
        .auth-link {
          color: var(--color-terracotta);
          font-weight: 600;
        }
      `}</style>
    </>
  );
}