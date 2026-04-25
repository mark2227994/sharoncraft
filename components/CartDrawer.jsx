import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useCart } from "../lib/cart-context";
import Icon from "./icons";

function formatKES(value) {
  return `KES ${value.toLocaleString()}`;
}

export default function CartDrawer() {
  const {
    isCartOpen,
    items,
    subtotal,
    count,
    closeCart,
    updateQuantity,
    removeItem,
    orderNote,
    setOrderNote,
  } = useCart();
  const scrollLockRef = useRef(0);
  const [isNoteOpen, setIsNoteOpen] = useState(false);

  useEffect(() => {
    if (!isCartOpen) return undefined;

    scrollLockRef.current = window.scrollY || window.pageYOffset || 0;
    const originalBodyStyle = {
      overflow: document.body.style.overflow,
      position: document.body.style.position,
      top: document.body.style.top,
      width: document.body.style.width,
      left: document.body.style.left,
      right: document.body.style.right,
    };
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        closeCart();
      }
    };

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollLockRef.current}px`;
    document.body.style.width = "100%";
    document.body.style.left = "0";
    document.body.style.right = "0";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.overflow = originalBodyStyle.overflow;
      document.body.style.position = originalBodyStyle.position;
      document.body.style.top = originalBodyStyle.top;
      document.body.style.width = originalBodyStyle.width;
      document.body.style.left = originalBodyStyle.left;
      document.body.style.right = originalBodyStyle.right;
      window.removeEventListener("keydown", onKeyDown);
      window.scrollTo(0, scrollLockRef.current);
    };
  }, [closeCart, isCartOpen]);

  useEffect(() => {
    if (orderNote) {
      setIsNoteOpen(true);
    }
  }, [orderNote]);

  if (!isCartOpen) return null;

  return (
    <div className="cart-drawer" role="dialog" aria-modal="true" aria-label="Shopping cart">
      <button type="button" className="cart-drawer__overlay" onClick={closeCart} aria-label="Close cart" />

      <aside className="cart-drawer__panel">
        {/* Cart header */}
        <header className="cart-drawer__header">
          <div className="cart-drawer__header-copy">
            <p className="cart-drawer__eyebrow">Your Selection</p>
            <h2 className="cart-drawer__title">{count} {count === 1 ? "Piece" : "Pieces"}</h2>
            <p className="cart-drawer__subcopy">Handmade pieces reserved for this moment.</p>
          </div>
          <button type="button" className="cart-drawer__close" onClick={closeCart} aria-label="Close cart">
            <Icon name="close" size={14} />
          </button>
        </header>

        {items.length === 0 ? (
          <div className="cart-drawer__empty">
            <p className="cart-drawer__empty-title">Your cart is still empty.</p>
            <p className="cart-drawer__empty-copy">
              Start with one statement piece, then build a collection that feels considered.
            </p>
            <Link href="/shop" className="cart-drawer__shop-link" onClick={closeCart}>
              Continue Shopping
            </Link>
          </div>
        ) : (
          <>
            {/* Cart items */}
            <div className="cart-drawer__body">
              <div className="cart-drawer__body-intro">
                <span className="cart-drawer__body-kicker">Curated For You</span>
                <p>Review your selected handmade pieces before moving to secure checkout.</p>
              </div>

              {items.map((item) => (
                <article key={item.id} className="cart-drawer__item">
                  <div className="cart-drawer__item-media">
                    <img src={item.image} alt={item.name} loading="lazy" decoding="async" className="cart-drawer__image" />
                  </div>

                  <div className="cart-drawer__meta">
                    <div className="cart-drawer__meta-top">
                      <div>
                        {(item.category || item.artisan) ? (
                          <p className="cart-drawer__category">{[item.category, item.artisan].filter(Boolean).join(" • ")}</p>
                        ) : null}
                        <Link href={item.slug ? `/product/${item.slug}` : "/shop"} className="cart-drawer__name" onClick={closeCart}>
                          {item.name}
                        </Link>
                      </div>

                      <button type="button" className="cart-drawer__remove" onClick={() => removeItem(item.id)}>
                        Remove
                      </button>
                    </div>

                    <div className="cart-drawer__inline">
                      <span className="cart-drawer__unit-price">{formatKES(item.price)} each</span>
                      <span className="cart-drawer__price">{formatKES(item.price * item.quantity)}</span>
                    </div>

                    <div className="cart-drawer__controls">
                      <div className="cart-drawer__quantity" aria-label={`Quantity for ${item.name}`}>
                        <button
                          type="button"
                          className="cart-drawer__qty-button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          aria-label={`Decrease quantity for ${item.name}`}
                          disabled={item.quantity <= 1}
                        >
                          <Icon name="minus" size={14} />
                        </button>
                        <span className="cart-drawer__qty-value">{item.quantity}</span>
                        <button
                          type="button"
                          className="cart-drawer__qty-button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          aria-label={`Increase quantity for ${item.name}`}
                        >
                          <Icon name="plus" size={14} />
                        </button>
                      </div>

                      <Link href={item.slug ? `/product/${item.slug}` : "/shop"} className="cart-drawer__edit-link" onClick={closeCart}>
                        View piece
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Cart summary and actions */}
            <footer className="cart-drawer__footer">
              <div className="cart-drawer__summary cart-drawer__summary--simple">
                <div className="cart-drawer__summary-row">
                  <span className="cart-drawer__summary-label">Subtotal</span>
                  <strong className="cart-drawer__summary-amount">{formatKES(subtotal)}</strong>
                </div>
              </div>

              <p className="cart-drawer__shipping-note">Shipping calculated at checkout</p>

              <div className="cart-drawer__note">
                <button
                  type="button"
                  className="cart-drawer__note-toggle"
                  onClick={() => setIsNoteOpen((current) => !current)}
                  aria-expanded={isNoteOpen}
                >
                  <span className="cart-drawer__note-label">+ add a note</span>
                </button>

                {isNoteOpen ? (
                  <label className="cart-drawer__note-field">
                    <span>Special instructions for SharonCraft</span>
                    <textarea
                      value={orderNote}
                      onChange={(event) => setOrderNote(event.target.value)}
                      rows={3}
                      maxLength={280}
                      placeholder="Packaging preferences, gifting details, or anything we should note."
                    />
                  </label>
                ) : null}
              </div>

              <div className="cart-drawer__actions cart-drawer__actions--stacked">
                <Link href="/checkout" className="cart-drawer__checkout" onClick={closeCart}>
                  Secure Checkout
                </Link>

                <Link href="/cart" className="cart-drawer__view-full" onClick={closeCart}>
                  View full cart {"\u2192"}
                </Link>
              </div>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
