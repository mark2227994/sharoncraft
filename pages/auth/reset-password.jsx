import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Nav from "../../components/Nav";
import Footer from "../../components/Footer";
import SeoHead from "../../components/SeoHead";
import Icon from "../../components/icons";
import { supabase } from "../../lib/supabase-client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { token, type } = router.query;
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Validate token on mount
  useEffect(() => {
    if (!token || type !== "recovery") {
      setError("Invalid or missing reset link. Please request a new one.");
    }
  }, [token, type]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (loading) return;

    // Validation
    if (!password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // Use the token to update password
      const { error: updateError } = await supabase.auth.updateUser(
        { password },
        { accessToken: token }
      );

      if (updateError) {
        throw new Error(updateError.message || "Failed to reset password");
      }

      setSuccess(true);
    } catch (err) {
      setError(err.message || "Failed to reset password. The link may have expired.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <>
        <SeoHead title="Password Reset - SharonCraft" description="Your password has been reset" path="/auth/reset-password" />
        <Nav />
        <main className="auth-page">
          <div className="auth-card">
            <div className="success-icon">
              <Icon name="check-circle" size={48} />
            </div>
            <h1 className="auth-title">Password Reset</h1>
            <p className="auth-subtitle">Your password has been successfully reset</p>
            <p className="auth-message">You can now log in with your new password.</p>
            <Link href="/login" className="auth-button">
              Go to Login
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
          }
          .auth-message {
            font-size: var(--text-sm);
            color: var(--text-secondary);
            margin-bottom: var(--space-6);
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
        `}</style>
      </>
    );
  }

  if (error && (error.includes("Invalid") || error.includes("expired"))) {
    return (
      <>
        <SeoHead title="Reset Password - SharonCraft" description="Reset your password" path="/auth/reset-password" />
        <Nav />
        <main className="auth-page">
          <div className="auth-card">
            <div className="error-icon">
              <Icon name="alert-circle" size={48} />
            </div>
            <h1 className="auth-title">Invalid Link</h1>
            <p className="auth-subtitle">{error}</p>
            <Link href="/auth/forgot-password" className="auth-button">
              Request New Reset Link
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
            max-width: 450px;
            padding: var(--space-8);
            background: var(--color-white);
            border: 1px solid var(--border-default);
            border-radius: var(--radius-lg);
            text-align: center;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          }
          .error-icon {
            margin-bottom: var(--space-4);
            color: #dc2626;
          }
          .auth-title {
            font-family: var(--font-display);
            font-size: var(--text-2xl);
            margin-bottom: var(--space-2);
            color: var(--text-primary);
          }
          .auth-subtitle {
            color: var(--text-secondary);
            margin-bottom: var(--space-6);
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
        `}</style>
      </>
    );
  }

  return (
    <>
      <SeoHead title="Reset Password - SharonCraft" description="Reset your password" path="/auth/reset-password" />
      <Nav />
      <main className="auth-page">
        <div className="auth-card">
          <h1 className="auth-title">Reset Password</h1>
          <p className="auth-subtitle">Enter your new password below</p>

          <form onSubmit={handleSubmit} className="auth-form">
            {error && (
              <div className="auth-alert auth-alert--error">
                <Icon name="alert-circle" size={18} />
                <span>{error}</span>
              </div>
            )}

            <div className="auth-field">
              <label htmlFor="password" className="auth-label">
                New Password
              </label>
              <div className="auth-password-wrapper">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
                  className="auth-input"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                  tabIndex={-1}
                >
                  <Icon name={showPassword ? "eye-off" : "eye"} size={18} />
                </button>
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="confirm" className="auth-label">
                Confirm Password
              </label>
              <div className="auth-password-wrapper">
                <input
                  id="confirm"
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="Confirm your password"
                  className="auth-input"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowConfirm(!showConfirm)}
                  aria-label="Toggle password visibility"
                  tabIndex={-1}
                >
                  <Icon name={showConfirm ? "eye-off" : "eye"} size={18} />
                </button>
              </div>
            </div>

            <button type="submit" className="auth-button" disabled={loading || !token}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>

          <p className="auth-footer">
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
