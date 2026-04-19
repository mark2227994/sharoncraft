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

              <button type="submit" className="auth-button" disabled={loading}>
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