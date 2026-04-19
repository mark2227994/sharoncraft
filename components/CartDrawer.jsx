import Link from "next/link";
import { useEffect } from "react";
import { useCart } from "../lib/cart-context";
import { DELIVERY_OPTIONS, getDeliveryFee } from "../lib/delivery";
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
    deliveryMethod,
    setDeliveryMethod,
  } = useCart();
  const delivery = items.length ? getDeliveryFee(deliveryMethod) : 0;
  const estimatedTotal = subtotal + delivery;

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
          <h2>Cart ({count})</h2>
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
                    {item.category && <p className="cart-drawer__category">{item.category}</p>}
                    <Link href={`/product/${item.slug}`} className="cart-drawer__name" onClick={closeCart}>
                      {item.name}
                    </Link>
                    <div className="cart-drawer__inline">
                      <span className="cart-drawer__qty-simple">×{item.quantity}</span>
                      <span className="cart-drawer__price">{formatKES(item.price * item.quantity)}</span>
                    </div>
                  </div>
                  <button type="button" className="cart-drawer__remove" onClick={() => removeItem(item.id)}>
                    ✕
                  </button>
                </article>
              ))}
            </div>

            <footer className="cart-drawer__footer">
              <div className="cart-drawer__delivery" role="radiogroup" aria-label="Delivery option">
                {Object.entries(DELIVERY_OPTIONS).map(([key, option]) => (
                  <button
                    key={key}
                    type="button"
                    className={`cart-drawer__delivery-option ${
                      deliveryMethod === key ? "cart-drawer__delivery-option--active" : ""
                    }`}
                    onClick={() => setDeliveryMethod(key)}
                    disabled={!option.available}
                    aria-label={option.label}
                    aria-checked={deliveryMethod === key}
                    role="radio"
                  >
                    <Icon name={option.icon} size={16} />
                    <span>{formatKES(option.fee)}</span>
                  </button>
                ))}
              </div>
              
              <div className="cart-drawer__summary">
                <div className="cart-drawer__summary-row">
                  <span>Subtotal</span>
                  <strong>{formatKES(subtotal)}</strong>
                </div>
                <div className="cart-drawer__summary-row">
                  <span>Delivery</span>
                  <strong>{formatKES(delivery)}</strong>
                </div>
                <div className="cart-drawer__summary-row cart-drawer__summary-total">
                  <span>Total</span>
                  <strong>{formatKES(estimatedTotal)}</strong>
                </div>
              </div>

              <div className="cart-drawer__actions">
                <Link href="/checkout" className="cart-drawer__checkout" onClick={closeCart}>
                  Checkout
                </Link>
              </div>
              
              <Link href="/cart" className="cart-drawer__view-full" onClick={closeCart}>
                View Full Cart
              </Link>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
