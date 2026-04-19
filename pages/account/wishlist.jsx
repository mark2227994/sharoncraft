import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Nav from "../../components/Nav";
import Footer from "../../components/Footer";
import SeoHead from "../../components/SeoHead";
import AccountNav from "../../components/AccountNav";
import Icon from "../../components/icons";

export default function WishlistPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [navOpen, setNavOpen] = useState(false);

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

        const wishlistRes = await fetch("/api/user/wishlist");
        const wishlistData = await wishlistRes.json();

        setWishlistIds(wishlistData.product_ids || []);

        // Fetch product details for wishlisted items
        if (wishlistData.product_ids?.length > 0) {
          try {
            const productsRes = await fetch("/data/products.json");
            const productsData = await productsRes.json();

            const products = productsData.filter((p) =>
              wishlistData.product_ids.includes(p.id)
            );
            setWishlistProducts(products);
          } catch (error) {
            console.error("Products fetch error:", error);
          }
        }
      } catch (error) {
        console.error("Load error:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  async function toggleWishlist(productId) {
    const updated = wishlistIds.includes(productId)
      ? wishlistIds.filter((id) => id !== productId)
      : [...wishlistIds, productId];

    setWishlistIds(updated);
    setWishlistProducts(
      wishlistProducts.filter((p) => updated.includes(p.id))
    );

    try {
      await fetch("/api/user/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_ids: updated }),
      });
    } catch (error) {
      console.error("Wishlist update error:", error);
    }
  }

  if (loading) {
    return (
      <>
        <SeoHead title="My Wishlist" description="View your wishlist" path="/account/wishlist" noindex />
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
      <SeoHead
        title="My Wishlist - SharonCraft"
        description="Your saved items from SharonCraft"
        path="/account/wishlist"
        noindex
      />
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
              <div className="account-card">
                <div className="account-card__header">
                  <h1 className="account-card__title">My Wishlist</h1>
                </div>

                {wishlistProducts.length === 0 ? (
                  <div className="wishlist-grid__empty">
                    <Icon name="heart" size={48} style={{ color: "var(--text-secondary)", marginBottom: "var(--space-4)" }} />
                    <p style={{ fontSize: "var(--text-lg)", marginBottom: "var(--space-2)" }}>Your wishlist is empty</p>
                    <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", marginBottom: "var(--space-4)" }}>
                      Heart items from the shop to save them here
                    </p>
                    <button
                      onClick={() => router.push("/shop")}
                      style={{
                        padding: "var(--space-2) var(--space-4)",
                        background: "var(--color-terracotta)",
                        color: "var(--color-white)",
                        border: "none",
                        borderRadius: "var(--radius-md)",
                        cursor: "pointer",
                        fontWeight: "600",
                      }}
                    >
                      Continue Shopping
                    </button>
                  </div>
                ) : (
                  <div className="wishlist-grid">
                    {wishlistProducts.map((product) => (
                      <div key={product.id} className="wishlist-item">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="wishlist-item__image"
                        />
                        <h3 className="wishlist-item__name">{product.name}</h3>
                        <p className="wishlist-item__price">
                          KES {product.price.toLocaleString()}
                        </p>
                        <div className="wishlist-item__actions">
                          <button
                            className="wishlist-item__action wishlist-item__action--primary"
                            onClick={() => router.push(`/product/${product.slug}`)}
                          >
                            View
                          </button>
                          <button
                            className="wishlist-item__action"
                            onClick={() => toggleWishlist(product.id)}
                            title="Remove from wishlist"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
