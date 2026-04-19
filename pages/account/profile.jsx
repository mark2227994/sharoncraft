import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Nav from "../../components/Nav";
import Footer from "../../components/Footer";
import SeoHead from "../../components/SeoHead";
import AccountNav from "../../components/AccountNav";
import Icon from "../../components/icons";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [editing, setEditing] = useState(false);
  const [navOpen, setNavOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
  });

  useEffect(() => {
    async function loadData() {
      try {
        const sessionRes = await fetch("/api/auth/session");
        const sessionData = await sessionRes.json();

        if (!sessionData.user) {
          router.push("/login");
          return;
        }

        setUser(sessionData.user);

        const profileRes = await fetch("/api/user/profile");
        const profileData = await profileRes.json();

        setProfile(profileData);
        setFormData({
          name: profileData.name || sessionData.user.name || "",
          phone: profileData.phone || "",
        });
      } catch (error) {
        console.error("Load error:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to save profile");

      const updated = await res.json();
      setProfile(updated);
      setMessage("Profile updated successfully!");
      setEditing(false);

      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <>
        <SeoHead title="Profile Settings" description="Manage your profile" path="/account/profile" noindex />
        <Nav />
        <main style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <p>Loading...</p>
        </main>
        <Footer />
      </>
    );
  }

  if (!user) return null;

  return (
    <>
      <SeoHead title="Profile Settings - SharonCraft" description="Manage your profile information" path="/account/profile" noindex />
      <Nav />
      <main className="account-page">
        <div style={{ position: "relative", width: "100%" }}>
          <div style={{ display: "none" }} className="account-page-mobile-header">
            <button
              className="account-page__nav-button"
              onClick={() => setNavOpen(!navOpen)}
              aria-label="Toggle navigation"
            >
              <Icon name="menu" size={20} />
              Menu
            </button>
          </div>

          {navOpen && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0, 0, 0, 0.5)",
                zIndex: 99,
              }}
              onClick={() => setNavOpen(false)}
            />
          )}

          <div className={`account-nav ${navOpen ? "account-nav--open" : ""}`}>
            <AccountNav isMobile onClose={() => setNavOpen(false)} />
          </div>

          <div className="account-page__layout" style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "var(--space-8)" }}>
            <div style={{ display: "none" }}>
              <AccountNav />
            </div>

            <div className="account-content">
              {message && (
                <div
                  style={{
                    padding: "var(--space-4)",
                    background: message.includes("Error") ? "#fef2f2" : "#d1fae5",
                    color: message.includes("Error") ? "#dc2626" : "#065f46",
                    borderRadius: "var(--radius-md)",
                    fontSize: "var(--text-sm)",
                  }}
                >
                  {message}
                </div>
              )}

              <div className="account-card">
                <div className="account-card__header">
                  <h1 className="account-card__title">Profile Settings</h1>
                  {!editing && (
                    <button
                      className="account-card__action"
                      onClick={() => setEditing(true)}
                    >
                      Edit Profile
                    </button>
                  )}
                </div>

                {editing ? (
                  <form onSubmit={handleSave} className="profile-form">
                    <div className="profile-form__group">
                      <label className="profile-form__label">Full Name</label>
                      <input
                        type="text"
                        className="profile-form__input"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Your name"
                      />
                    </div>

                    <div className="profile-form__group">
                      <label className="profile-form__label">Phone Number</label>
                      <input
                        type="tel"
                        className="profile-form__input"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+254..."
                      />
                    </div>

                    <div className="profile-form__group">
                      <label className="profile-form__label">Email</label>
                      <input
                        type="email"
                        className="profile-form__input"
                        value={user.email}
                        disabled
                        style={{ background: "var(--color-off-white)", cursor: "not-allowed" }}
                      />
                      <p style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", marginTop: "var(--space-2)" }}>
                        Email cannot be changed. Contact support for email changes.
                      </p>
                    </div>

                    <div className="profile-form__actions">
                      <button type="submit" className="profile-form__save" disabled={saving}>
                        {saving ? "Saving..." : "Save Changes"}
                      </button>
                      <button
                        type="button"
                        className="profile-form__cancel"
                        onClick={() => setEditing(false)}
                        disabled={saving}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div style={{ display: "grid", gap: "var(--space-4)" }}>
                    <div>
                      <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", marginBottom: "var(--space-2)" }}>
                        Full Name
                      </p>
                      <p style={{ fontSize: "var(--text-base)", fontWeight: "500" }}>
                        {profile?.name || "Not set"}
                      </p>
                    </div>

                    <div>
                      <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", marginBottom: "var(--space-2)" }}>
                        Phone Number
                      </p>
                      <p style={{ fontSize: "var(--text-base)", fontWeight: "500" }}>
                        {profile?.phone || "Not set"}
                      </p>
                    </div>

                    <div>
                      <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", marginBottom: "var(--space-2)" }}>
                        Email
                      </p>
                      <p style={{ fontSize: "var(--text-base)", fontWeight: "500" }}>
                        {user.email}
                      </p>
                      {user.email_confirmed_at && (
                        <p style={{ fontSize: "var(--text-xs)", color: "#65a30d", marginTop: "var(--space-2)" }}>
                          ✓ Email verified
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="account-card">
                <div className="account-card__header">
                  <h2 className="account-card__title">Security</h2>
                </div>

                <div style={{ display: "grid", gap: "var(--space-4)" }}>
                  <p style={{ color: "var(--text-secondary)" }}>
                    Password changes and two-factor authentication coming soon.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      <style jsx global>{`
        .account-page-mobile-header {
          display: none;
        }

        @media (max-width: 900px) {
          .account-page-mobile-header {
            display: block;
            padding: var(--space-4) var(--gutter);
            border-bottom: 1px solid var(--border-default);
          }

          .account-page__layout {
            grid-template-columns: 1fr !important;
          }

          .account-nav {
            display: none;
          }

          .account-nav--open {
            display: flex;
          }
        }
      `}</style>
    </>
  );
}
