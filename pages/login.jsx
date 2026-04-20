import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import SeoHead from "../components/SeoHead";
import Icon from "../components/icons";
import { signInWithGoogle } from "../lib/supabase-client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

  async function handleGoogleSignIn() {
    setGoogleLoading(true);
    setError("");
    
    try {
      const { data, error } = await signInWithGoogle();
      if (error) {
        throw error;
      }
    } catch (err) {
      setError("Failed to sign in with Google. Please try again.");
      setGoogleLoading(false);
    }
  }

  return (
    <>
      <SeoHead title="Login - SharonCraft" description="Login to your SharonCraft account" path="/login" />
      <Nav />
      <main className="auth-page">
        <div className="auth-container">
          <div className="auth-form-wrapper">
            <div className="auth-header">
              <h1 className="auth-title">Welcome Back</h1>
              <p className="auth-subtitle">Sign in to your SharonCraft account</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              {error && (
                <div className="auth-alert auth-alert--error">
                  <Icon name="alert-circle" size={18} />
                  <span>{error}</span>
                </div>
              )}

              <div className="auth-field">
                <label htmlFor="email" className="auth-label">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your@email.com"
                  className="auth-input"
                  disabled={loading}
                />
              </div>

              <div className="auth-field">
                <div className="auth-label-row">
                  <label htmlFor="password" className="auth-label">
                    Password
                  </label>
                  <Link href="/auth/forgot-password" className="auth-help-link">
                    Forgot?
                  </Link>
                </div>
                <div className="auth-password-wrapper">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="auth-input"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                  >
                    <Icon name={showPassword ? "eye-off" : "eye"} size={18} />
                  </button>
                </div>
              </div>

              <button type="submit" className="auth-button" disabled={loading || googleLoading}>
                {loading ? (
                  <>
                    <span style={{ opacity: 0 }}>L</span>
                    Logging in...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            <div className="auth-divider">
              <span>or</span>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
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
              {googleLoading ? "Signing in..." : "Sign in with Google"}
            </button>

            <div className="auth-divider">
              <span>Don't have an account?</span>
            </div>

            <Link href="/register" className="auth-secondary-button">
              Create Account
            </Link>

            <p className="auth-help-text">
              Need help?{" "}
              <Link href="/contact" className="auth-link">
                Contact us
              </Link>
            </p>
          </div>

          <div className="auth-side-content">
            <div className="auth-benefit">
              <Icon name="check-circle" size={24} />
              <div>
                <h3 className="auth-benefit-title">Track Orders</h3>
                <p className="auth-benefit-text">See your order history and status</p>
              </div>
            </div>

            <div className="auth-benefit">
              <Icon name="heart" size={24} />
              <div>
                <h3 className="auth-benefit-title">Save Favorites</h3>
                <p className="auth-benefit-text">Build your personal wishlist</p>
              </div>
            </div>

            <div className="auth-benefit">
              <Icon name="lightning" size={24} />
              <div>
                <h3 className="auth-benefit-title">Faster Checkout</h3>
                <p className="auth-benefit-text">Quick and easy ordering</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      <style jsx>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--space-8) var(--gutter);
          background: linear-gradient(135deg, #f9f6ee 0%, #fff 100%);
        }

        .auth-container {
          width: 100%;
          max-width: 1000px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-8);
          align-items: center;
        }

        .auth-form-wrapper {
          display: flex;
          flex-direction: column;
          gap: var(--space-6);
          background: var(--color-white);
          padding: var(--space-8);
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-default);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .auth-header {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .auth-title {
          font-family: var(--font-display);
          font-size: var(--text-3xl);
          font-weight: 700;
          color: var(--text-primary);
        }

        .auth-subtitle {
          color: var(--text-secondary);
          font-size: var(--text-base);
        }

        .auth-form {
          display: grid;
          gap: var(--space-4);
        }

        .auth-alert {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-3) var(--space-4);
          border-radius: var(--radius-md);
          font-size: var(--text-sm);
        }

        .auth-alert--error {
          background: #fef2f2;
          color: #dc2626;
          border: 1px solid #fecaca;
        }

        .auth-field {
          display: grid;
          gap: var(--space-2);
        }

        .auth-label {
          font-weight: 600;
          font-size: var(--text-sm);
          color: var(--text-primary);
        }

        .auth-label-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .auth-help-link {
          font-size: var(--text-xs);
          color: var(--color-terracotta);
          text-decoration: none;
          font-weight: 600;
          transition: opacity 0.2s;
        }

        .auth-help-link:hover {
          opacity: 0.8;
        }

        .auth-password-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .auth-input {
          width: 100%;
          padding: var(--space-3) var(--space-4);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-md);
          font-size: var(--text-base);
          font-family: inherit;
          transition: all 0.2s;
        }

        .auth-input:focus {
          outline: none;
          border-color: var(--color-terracotta);
          box-shadow: 0 0 0 3px rgba(192, 77, 41, 0.1);
        }

        .auth-input:disabled {
          background: var(--color-off-white);
          cursor: not-allowed;
        }

        .auth-password-toggle {
          position: absolute;
          right: var(--space-4);
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: var(--space-2);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .auth-button {
          padding: var(--space-4) var(--space-6);
          background: var(--color-terracotta);
          color: var(--color-white);
          border: none;
          border-radius: var(--radius-md);
          font-size: var(--text-base);
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          letter-spacing: 0.5px;
        }

        .auth-button:hover:not(:disabled) {
          background: #a63f1f;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(192, 77, 41, 0.3);
        }

        .auth-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .auth-divider {
          text-align: center;
          position: relative;
          color: var(--text-secondary);
          font-size: var(--text-sm);
        }

        .auth-divider::before,
        .auth-divider::after {
          content: "";
          position: absolute;
          top: 50%;
          width: calc(50% - 60px);
          height: 1px;
          background: var(--border-default);
        }

        .auth-divider::before {
          left: 0;
        }

        .auth-divider::after {
          right: 0;
        }

        .auth-secondary-button {
          padding: var(--space-4) var(--space-6);
          background: var(--color-off-white);
          color: var(--color-terracotta);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-md);
          font-size: var(--text-base);
          font-weight: 700;
          cursor: pointer;
          text-align: center;
          text-decoration: none;
          transition: all 0.2s;
        }

        .auth-secondary-button:hover {
          background: var(--color-white);
          border-color: var(--color-terracotta);
        }

        .auth-google-button {
          padding: var(--space-4) var(--space-6);
          background: var(--color-white);
          color: var(--text-primary);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-md);
          font-size: var(--text-base);
          font-weight: 600;
          cursor: pointer;
          text-align: center;
          text-decoration: none;
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

        .auth-help-text {
          text-align: center;
          font-size: var(--text-sm);
          color: var(--text-secondary);
        }

        .auth-link {
          color: var(--color-terracotta);
          text-decoration: none;
          font-weight: 600;
        }

        .auth-link:hover {
          text-decoration: underline;
        }

        .auth-side-content {
          display: flex;
          flex-direction: column;
          gap: var(--space-6);
        }

        .auth-benefit {
          display: flex;
          gap: var(--space-4);
          align-items: flex-start;
        }

        .auth-benefit :global(svg) {
          color: var(--color-terracotta);
          flex-shrink: 0;
          margin-top: 2px;
        }

        .auth-benefit-title {
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: var(--space-1);
        }

        .auth-benefit-text {
          font-size: var(--text-sm);
          color: var(--text-secondary);
          line-height: 1.5;
        }

        @media (max-width: 900px) {
          .auth-container {
            grid-template-columns: 1fr;
          }

          .auth-form-wrapper {
            padding: var(--space-6);
          }

          .auth-side-content {
            display: none;
          }

          .auth-title {
            font-size: var(--text-2xl);
          }
        }

        @media (max-width: 600px) {
          .auth-page {
            padding: var(--space-4) var(--gutter);
          }

          .auth-form-wrapper {
            padding: var(--space-4);
          }

          .auth-button {
            padding: var(--space-3) var(--space-4);
          }
        }
      `}</style>
    </>
  );
}