import Link from "next/link";
import { useEffect } from "react";
import { useCart } from "../lib/cart-context";
import Icon from "./icons";

function formatKES(value) {
  return `KES ${value.toLocaleString()}`;
}

export default function CartDrawer() {
  const { isCartOpen, items, subtotal, count, closeCart, updateQuantity, removeItem } = useCart();
  const estimatedTotal = subtotal + (items.length ? 300 : 0);

  useEffect(() => {
    if (!isCartOpen) return undefined;

    const originalOverflow = document.body.style.overflow;
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        closeCart();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [closeCart, isCartOpen]);

  if (!isCartOpen) return null;

  return (
    <div className="cart-drawer" role="dialog" aria-modal="true" aria-label="Shopping cart">
      <button type="button" className="cart-drawer__overlay" onClick={closeCart} aria-label="Close cart" />

      <aside className="cart-drawer__panel">
        <header className="cart-drawer__header">
          <div>
            <p className="overline">Your Cart</p>
            <h2 className="heading-md">Selected Pieces</h2>
          </div>
          <button type="button" className="cart-drawer__close" onClick={closeCart} aria-label="Close cart">
            <Icon name="close" size={18} />
          </button>
        </header>

        {items.length === 0 ? (
          <div className="cart-drawer__empty">
            <p className="body-lg">Your cart is still empty.</p>
            <Link href="/shop" className="cart-drawer__shop-link" onClick={closeCart}>
              Continue Shopping
            </Link>
          </div>
        ) : (
          <>
            <div className="cart-drawer__body">
              {items.map((item) => (
                <article key={item.id} className="cart-drawer__item">
                  <img src={item.image} alt={item.name} loading="lazy" decoding="async" className="cart-drawer__image" />
                  <div className="cart-drawer__meta">
                    {item.artisan ? <p className="overline">{item.artisan}</p> : null}
                    <Link href={`/product/${item.slug}`} className="cart-drawer__name" onClick={closeCart}>
                      {item.name}
                    </Link>
                    <p className="price">{formatKES(item.price)}</p>
                  </div>
                  <div className="cart-drawer__controls">
                    <div className="cart-drawer__qty" aria-label={`Quantity for ${item.name}`}>
                      <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)} aria-label={`Decrease quantity for ${item.name}`}>
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)} aria-label={`Increase quantity for ${item.name}`}>
                        +
                      </button>
                    </div>
                    <button type="button" className="cart-drawer__remove" onClick={() => removeItem(item.id)}>
                      Remove
                    </button>
                  </div>
                </article>
              ))}
            </div>

            <footer className="cart-drawer__footer">
              <div className="cart-drawer__summary-row">
                <span>Items</span>
                <strong>{count}</strong>
              </div>
              <div className="cart-drawer__summary-row">
                <span>Subtotal</span>
                <strong>{formatKES(subtotal)}</strong>
              </div>
              <div className="cart-drawer__summary-row">
                <span>Estimated total</span>
                <strong>{formatKES(estimatedTotal)}</strong>
              </div>
              <p className="cart-drawer__note">Delivery is confirmed at checkout before your WhatsApp order is sent.</p>
              <div className="cart-drawer__actions">
                <Link href="/checkout" className="cart-drawer__checkout" onClick={closeCart}>
                  Proceed to Checkout
                </Link>
                <Link href="/cart" className="cart-drawer__view-cart" onClick={closeCart}>
                  View Full Cart
                </Link>
              </div>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
