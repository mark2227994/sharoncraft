import { useState } from "react";
import Link from "next/link";
import Nav from "../../components/Nav";
import Footer from "../../components/Footer";
import SeoHead from "../../components/SeoHead";
import Icon from "../../components/icons";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (loading) return;

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send reset email");
      }

      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <>
        <SeoHead title="Check Email - SharonCraft" description="Check your email to reset password" path="/auth/forgot-password" />
        <Nav />
        <main className="auth-page">
          <div className="auth-card">
            <div className="success-icon">
              <Icon name="mail" size={48} />
            </div>
            <h1 className="auth-title">Check Your Email</h1>
            <p className="auth-subtitle">
              We've sent a password reset link to<br />
              <strong>{email}</strong>
            </p>
            <p className="auth-message">
              Click the link in the email to reset your password. The link will expire in 24 hours.
            </p>
            <div className="auth-actions">
              <Link href="/login" className="auth-button">
                Back to Login
              </Link>
              <button
                onClick={() => {
                  setSuccess(false);
                  setEmail("");
                  setError("");
                }}
                className="auth-link-button"
              >
                Try another email
              </button>
            </div>
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
            max-width: 450px;
            padding: var(--space-8);
            background: var(--color-white);
            border: 1px solid var(--border-default);
            border-radius: var(--radius-lg);
            text-align: center;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          }
          .success-icon {
            margin-bottom: var(--space-4);
            color: var(--color-terracotta);
          }
          .auth-title {
            font-family: var(--font-display);
            font-size: var(--text-2xl);
            margin-bottom: var(--space-2);
            color: var(--text-primary);
          }
          .auth-subtitle {
            color: var(--text-secondary);
            margin-bottom: var(--space-4);
            font-size: var(--text-base);
          }
          .auth-message {
            font-size: var(--text-sm);
            color: var(--text-secondary);
            margin-bottom: var(--space-6);
            line-height: 1.6;
          }
          .auth-actions {
            display: flex;
            flex-direction: column;
            gap: var(--space-3);
          }
          .auth-button {
            display: inline-block;
            padding: var(--space-4) var(--space-6);
            background: var(--color-terracotta);
            color: var(--color-white);
            border-radius: var(--radius-md);
            font-weight: 600;
            text-decoration: none;
            text-align: center;
            transition: all 0.2s;
          }
          .auth-button:hover {
            background: #a63f1f;
            transform: translateY(-1px);
          }
          .auth-link-button {
            background: none;
            border: none;
            color: var(--color-terracotta);
            font-weight: 600;
            cursor: pointer;
            text-decoration: none;
            padding: var(--space-2);
            transition: opacity 0.2s;
          }
          .auth-link-button:hover {
            opacity: 0.8;
          }
        `}</style>
      </>
    );
  }

  return (
    <>
      <SeoHead title="Forgot Password - SharonCraft" description="Reset your SharonCraft account password" path="/auth/forgot-password" />
      <Nav />
      <main className="auth-page">
        <div className="auth-card">
          <h1 className="auth-title">Forgot Password?</h1>
          <p className="auth-subtitle">Enter your email and we'll send you a link to reset your password</p>

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

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>

          <p className="auth-footer">
            Remember your password?{" "}
            <Link href="/login" className="auth-link">
              Back to login
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
          background: linear-gradient(135deg, #f9f6ee 0%, #fff 100%);
        }

        .auth-card {
          width: 100%;
          max-width: 450px;
          padding: var(--space-8);
          background: var(--color-white);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-lg);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .auth-title {
          font-family: var(--font-display);
          font-size: var(--text-2xl);
          margin-bottom: var(--space-2);
          text-align: center;
          color: var(--text-primary);
        }

        .auth-subtitle {
          color: var(--text-secondary);
          text-align: center;
          margin-bottom: var(--space-6);
          font-size: var(--text-base);
        }

        .auth-form {
          display: grid;
          gap: var(--space-4);
          margin-bottom: var(--space-6);
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

        .auth-footer {
          text-align: center;
          color: var(--text-secondary);
          font-size: var(--text-sm);
        }

        .auth-link {
          color: var(--color-terracotta);
          text-decoration: none;
          font-weight: 600;
        }

        .auth-link:hover {
          text-decoration: underline;
        }

        @media (max-width: 600px) {
          .auth-page {
            padding: var(--space-4) var(--gutter);
          }

          .auth-card {
            padding: var(--space-6);
          }

          .auth-button {
            padding: var(--space-3) var(--space-4);
          }

          .auth-title {
            font-size: var(--text-xl);
          }
        }
      `}</style>
    </>
  );
}
