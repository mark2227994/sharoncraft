import Link from "next/link";
import Footer from "../components/Footer";
import Nav from "../components/Nav";
import SeoHead from "../components/SeoHead";
import { useCart } from "../lib/cart-context";

export default function WishlistPage() {
  const { wishlistItems, removeFromWishlist, addItem } = useCart();

  return (
    <>
      <SeoHead
        title="Wishlist"
        description="Saved SharonCraft pieces you may want to come back to."
        path="/wishlist"
        noindex
      />
      <Nav />
      <main className="wishlist-page">
        <div className="wishlist-page__header">
          <p className="overline">Wishlist</p>
          <h1 className="display-lg">Pieces you want to come back to.</h1>
        </div>

        {wishlistItems.length === 0 ? (
          <section className="wishlist-page__empty">
            <p className="body-lg">Your wishlist is empty right now.</p>
            <p className="body-sm">Tap the heart on any product to save it here for later.</p>
            <Link href="/shop" className="wishlist-page__cta">
              Browse the gallery
            </Link>
          </section>
        ) : (
          <section className="wishlist-page__list">
            {wishlistItems.map((item) => (
              <article key={item.id} className="wishlist-card">
                <Link href={`/product/${item.slug}`} className="wishlist-card__image-wrap">
                  <img src={item.image} alt={item.name} loading="lazy" decoding="async" />
                </Link>
                <div className="wishlist-card__content">
                  {item.artisan ? <p className="overline">{item.artisan}</p> : null}
                  <h2 className="heading-md">{item.name}</h2>
                  <p className="price">KES {item.price.toLocaleString()}</p>
                </div>
                <div className="wishlist-card__actions">
                  <button type="button" className="wishlist-page__cta" onClick={() => addItem(item)}>
                    Add to Cart
                  </button>
                  <button
                    type="button"
                    className="wishlist-page__ghost"
                    onClick={() => removeFromWishlist(item.id)}
                  >
                    Remove
                  </button>
                </div>
              </article>
            ))}
          </section>
        )}
      </main>
      <Footer />

      <style jsx>{`
        .wishlist-page {
          max-width: var(--max-width);
          margin: 0 auto;
          padding: calc(var(--nav-height) + var(--space-6)) var(--gutter) var(--space-7);
          display: grid;
          gap: var(--space-5);
        }
        .wishlist-page__header {
          display: grid;
          gap: var(--space-2);
        }
        .wishlist-page__empty {
          display: grid;
          gap: var(--space-3);
          justify-items: start;
          padding: var(--space-6);
          background: var(--color-white);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-lg);
        }
        .wishlist-page__list {
          display: grid;
          gap: var(--space-4);
        }
        .wishlist-card {
          display: grid;
          grid-template-columns: 140px 1fr auto;
          gap: var(--space-4);
          align-items: center;
          padding: var(--space-4);
          background: var(--color-white);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-lg);
        }
        .wishlist-card__image-wrap img {
          width: 100%;
          height: 140px;
          object-fit: cover;
          border-radius: var(--radius-md);
          background: var(--color-cream-dark);
        }
        .wishlist-card__content {
          display: grid;
          gap: var(--space-2);
        }
        .wishlist-card__actions {
          display: grid;
          gap: var(--space-2);
          justify-items: stretch;
          min-width: 170px;
        }
        .wishlist-page__cta,
        .wishlist-page__ghost {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 12px 18px;
          border-radius: var(--radius-md);
          font-weight: 600;
        }
        .wishlist-page__cta {
          background: var(--color-terracotta);
          color: var(--color-white);
        }
        .wishlist-page__ghost {
          background: var(--color-white);
          border: 1px solid var(--border-default);
        }
        @media (max-width: 767px) {
          .wishlist-card {
            grid-template-columns: 1fr;
          }
          .wishlist-card__actions {
            min-width: 0;
          }
        }
      `}</style>
    </>
  );
}
