import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import SeoHead from "../components/SeoHead";
import { signInWithGoogle } from "../lib/supabase-client";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      if (data.message?.includes("Check email")) {
        setSuccess(true);
      } else {
        router.push("/account");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignUp() {
    setGoogleLoading(true);
    setError("");
    
    try {
      const { data, error } = await signInWithGoogle();
      if (error) {
        throw error;
      }
    } catch (err) {
      setError("Failed to sign up with Google. Please try again.");
      setGoogleLoading(false);
    }
  }

  if (success) {
    return (
      <>
        <SeoHead title="Check Email - SharonCraft" description="Check your email to confirm" path="/register" />
        <Nav />
        <main className="auth-page">
          <div className="auth-card">
            <h1 className="auth-title">Check Your Email</h1>
            <p className="auth-subtitle">
              We've sent a confirmation link to <strong>{email}</strong>
            </p>
            <p className="auth-message">Click the link in the email to activate your account.</p>
            <Link href="/login" className="auth-button">
              Back to Login
            </Link>
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
            text-align: center;
          }
          .auth-title {
            font-family: var(--font-display);
            font-size: var(--text-2xl);
            margin-bottom: var(--space-2);
          }
          .auth-subtitle {
            color: var(--text-secondary);
            margin-bottom: var(--space-3);
          }
          .auth-message {
            font-size: var(--text-sm);
            color: var(--text-secondary);
            margin-bottom: var(--space-5);
          }
          .auth-button {
            display: inline-block;
            padding: 14px 24px;
            background: var(--color-terracotta);
            color: var(--color-white);
            border-radius: var(--radius-md);
            font-weight: 600;
          }
        `}</style>
      </>
    );
  }

  return (
    <>
      <SeoHead title="Register - SharonCraft" description="Create a SharonCraft account" path="/register" />
      <Nav />
      <main className="auth-page">
        <div className="auth-card">
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join SharonCraft for a better experience</p>

          <form onSubmit={handleSubmit} className="auth-form">
            {error ? <p className="auth-error">{error}</p> : null}

            <label className="auth-field">
              <span>Name</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="auth-input"
              />
            </label>

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
                minLength={6}
                placeholder="At least 6 characters"
                className="auth-input"
              />
            </label>

            <button type="submit" className="auth-button" disabled={loading || googleLoading}>
              {loading ? "Creating..." : "Create Account"}
            </button>
          </form>

          <div className="auth-divider">or</div>

          <button
            type="button"
            onClick={handleGoogleSignUp}
            disabled={loading || googleLoading}
            className="auth-google-button"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            {googleLoading ? "Signing up..." : "Sign up with Google"}
          </button>

          <p className="auth-footer">
            Already have an account?{" "}
            <Link href="/login" className="auth-link">
              Login
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
        .auth-divider {
          text-align: center;
          color: var(--text-secondary);
          font-size: var(--text-sm);
          margin: var(--space-4) 0;
          position: relative;
        }
        .auth-divider::before,
        .auth-divider::after {
          content: "";
          position: absolute;
          top: 50%;
          width: 45%;
          height: 1px;
          background: var(--border-default);
        }
        .auth-divider::before {
          left: 0;
        }
        .auth-divider::after {
          right: 0;
        }
        .auth-google-button {
          width: 100%;
          padding: 14px 24px;
          background: var(--color-white);
          color: var(--text-primary);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-md);
          font-size: var(--text-base);
          font-weight: 600;
          cursor: pointer;
          text-align: center;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-3);
        }
        .auth-google-button:hover:not(:disabled) {
          background: var(--color-off-white);
          border-color: #dadce0;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .auth-google-button:disabled {
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