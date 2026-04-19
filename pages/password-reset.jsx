import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import SeoHead from "../components/SeoHead";
import Icon from "../components/icons";

export default function PasswordResetPage() {
  const router = useRouter();
  const [step, setStep] = useState("email"); // email, code, password, success
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleRequestReset(e) {
    e.preventDefault();
    if (loading) return;

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/request-password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to request reset");
      }

      setStep("code");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyCode(e) {
    e.preventDefault();
    if (loading) return;

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify-reset-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      if (!res.ok) {
        throw new Error("Invalid reset code");
      }

      setStep("password");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(e) {
    e.preventDefault();
    if (loading) return;

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to reset password");
      }

      setStep("success");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <SeoHead
        title="Reset Password - SharonCraft"
        description="Reset your SharonCraft account password"
        path="/password-reset"
      />
      <Nav />
      <main className="auth-page">
        <div className="password-reset-container">
          <div className="auth-card">
            {step === "email" && (
              <>
                <div className="auth-header">
                  <h1 className="auth-title">Reset Password</h1>
                  <p className="auth-subtitle">Enter your email address to receive a reset code</p>
                </div>

                <form onSubmit={handleRequestReset} className="auth-form">
                  {error && (
                    <div className="auth-error-box">
                      <Icon name="alert" size={18} />
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
                    {loading ? "Sending..." : "Send Reset Code"}
                  </button>
                </form>

                <p className="auth-footer-text">
                  <Link href="/login" className="auth-link">Back to login</Link>
                </p>
              </>
            )}

            {step === "code" && (
              <>
                <div className="auth-header">
                  <h1 className="auth-title">Check Your Email</h1>
                  <p className="auth-subtitle">We sent a reset code to {email}</p>
                </div>

                <form onSubmit={handleVerifyCode} className="auth-form">
                  {error && (
                    <div className="auth-error-box">
                      <Icon name="alert" size={18} />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="auth-field">
                    <label htmlFor="code" className="auth-label">
                      Reset Code
                    </label>
                    <input
                      id="code"
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      required
                      placeholder="e.g., 123456"
                      className="auth-input"
                      disabled={loading}
                      autoComplete="off"
                    />
                  </div>

                  <button type="submit" className="auth-button" disabled={loading}>
                    {loading ? "Verifying..." : "Verify Code"}
                  </button>
                </form>

                <p className="auth-footer-text">
                  <button
                    type="button"
                    onClick={() => { setStep("email"); setError(""); }}
                    className="auth-link"
                  >
                    Use different email
                  </button>
                </p>
              </>
            )}

            {step === "password" && (
              <>
                <div className="auth-header">
                  <h1 className="auth-title">Create New Password</h1>
                  <p className="auth-subtitle">Enter your new password</p>
                </div>

                <form onSubmit={handleResetPassword} className="auth-form">
                  {error && (
                    <div className="auth-error-box">
                      <Icon name="alert" size={18} />
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

                  <div className="auth-field">
                    <label htmlFor="confirm" className="auth-label">
                      Confirm Password
                    </label>
                    <input
                      id="confirm"
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="auth-input"
                      disabled={loading}
                    />
                  </div>

                  <button type="submit" className="auth-button" disabled={loading}>
                    {loading ? "Resetting..." : "Reset Password"}
                  </button>
                </form>
              </>
            )}

            {step === "success" && (
              <>
                <div className="auth-header" style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "48px", marginBottom: "var(--space-4)", color: "var(--color-terracotta)" }}>
                    ✓
                  </div>
                  <h1 className="auth-title">Password Reset Successful</h1>
                  <p className="auth-subtitle">Your password has been updated. You can now login with your new password.</p>
                </div>

                <Link href="/login" className="auth-button" style={{ display: "block", textAlign: "center" }}>
                  Back to Login
                </Link>
              </>
            )}
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
          padding: var(--space-6) var(--gutter);
          background: linear-gradient(135deg, #ffffff 0%, #fafafa 100%);
        }

        .password-reset-container {
          width: 100%;
          max-width: 500px;
        }

        .auth-card {
          background: var(--color-white);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-xl);
          padding: var(--space-8);
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
        }

        .auth-header {
          margin-bottom: var(--space-8);
        }

        .auth-title {
          font-family: var(--font-display);
          font-size: var(--text-2xl);
          font-weight: 700;
          margin-bottom: var(--space-2);
          color: var(--text-primary);
        }

        .auth-subtitle {
          color: var(--text-secondary);
          font-size: var(--text-base);
          line-height: 1.6;
        }

        .auth-form {
          display: grid;
          gap: var(--space-6);
          margin-bottom: var(--space-6);
        }

        .auth-error-box {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-3) var(--space-4);
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: var(--radius-md);
          color: #dc2626;
          font-size: var(--text-sm);
          font-weight: 500;
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
          cursor: pointer;
          color: var(--text-secondary);
          padding: var(--space-2);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .auth-button {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--space-3) var(--space-6);
          background: var(--color-terracotta);
          color: var(--color-white);
          border: none;
          border-radius: var(--radius-md);
          font-size: var(--text-base);
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
        }

        .auth-button:hover:not(:disabled) {
          opacity: 0.9;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(192, 77, 41, 0.2);
        }

        .auth-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .auth-footer-text {
          margin-top: var(--space-6);
          text-align: center;
          font-size: var(--text-sm);
          color: var(--text-secondary);
        }

        .auth-link {
          color: var(--color-terracotta);
          font-weight: 600;
          background: none;
          border: none;
          cursor: pointer;
          text-decoration: none;
          transition: opacity 0.2s;
        }

        .auth-link:hover {
          opacity: 0.8;
        }

        @media (max-width: 768px) {
          .auth-card {
            padding: var(--space-6);
          }

          .auth-title {
            font-size: var(--text-xl);
          }
        }
      `}</style>
    </>
  );
}
