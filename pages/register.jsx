import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import SeoHead from "../components/SeoHead";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
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

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? "Creating..." : "Create Account"}
            </button>
          </form>

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