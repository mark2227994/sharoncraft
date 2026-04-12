import Link from "next/link";
import Footer from "../components/Footer";
import Nav from "../components/Nav";
import { useCart } from "../lib/cart-context";

export default function CartPage() {
  const { items, subtotal, updateQuantity, removeItem } = useCart();

  return (
    <>
      <Nav />
      <main className="cart-page">
        <div>
          <p className="overline">Your selections</p>
          <h1 className="display-lg">Cart</h1>
        </div>

        {items.length === 0 ? (
          <div className="cart-page__empty">
            <p className="body-lg">Your cart is still empty.</p>
            <Link href="/shop" className="cart-page__cta">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="cart-page__layout">
            <div className="cart-page__items">
              {items.map((item) => (
                <article key={item.id} className="cart-page__item">
                  <img src={item.image} alt={item.name} loading="lazy" decoding="async" />
                  <div>
                    <p className="overline">{item.artisan}</p>
                    <h2 className="heading-md">{item.name}</h2>
                    <p className="price">KES {item.price.toLocaleString()}</p>
                  </div>
                  <div className="cart-page__qty">
                    <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                    <span>{item.quantity}</span>
                    <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                  </div>
                  <button type="button" className="cart-page__remove" onClick={() => removeItem(item.id)}>
                    Remove
                  </button>
                </article>
              ))}
            </div>

            <aside className="cart-page__summary">
              <p className="overline">Order Summary</p>
              <div className="cart-page__summary-row">
                <span>Subtotal</span>
                <strong>KES {subtotal.toLocaleString()}</strong>
              </div>
              <div className="cart-page__summary-row">
                <span>Delivery</span>
                <strong>Calculated at checkout</strong>
              </div>
              <Link href="/checkout" className="cart-page__cta">
                Proceed to Checkout
              </Link>
            </aside>
          </div>
        )}
      </main>
      <Footer />

      <style jsx>{`
        .cart-page {
          max-width: var(--max-width);
          margin: 0 auto;
          padding: calc(var(--nav-height) + var(--space-6)) var(--gutter) var(--space-7);
          display: grid;
          gap: var(--space-5);
        }
        .cart-page__layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-5);
        }
        .cart-page__items,
        .cart-page__summary,
        .cart-page__empty {
          background: var(--color-white);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-lg);
          padding: var(--space-5);
        }
        .cart-page__item {
          display: grid;
          grid-template-columns: 110px 1fr auto auto;
          align-items: center;
          gap: var(--space-4);
          padding: var(--space-3) 0;
          border-bottom: 1px solid var(--border-default);
        }
        .cart-page__item:last-child {
          border-bottom: none;
        }
        .cart-page__item img {
          width: 110px;
          height: 110px;
          object-fit: cover;
          border-radius: var(--radius-md);
        }
        .cart-page__qty {
          display: inline-flex;
          align-items: center;
          gap: var(--space-3);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-pill);
          padding: 6px 12px;
        }
        .cart-page__remove {
          color: var(--color-terracotta);
        }
        .cart-page__summary-row {
          display: flex;
          justify-content: space-between;
          padding: var(--space-3) 0;
          border-bottom: 1px solid var(--border-default);
        }
        .cart-page__cta {
          margin-top: var(--space-4);
          display: inline-flex;
          justify-content: center;
          padding: 14px 20px;
          background: var(--color-terracotta);
          color: var(--color-white);
          border-radius: var(--radius-md);
        }
        @media (min-width: 960px) {
          .cart-page__layout {
            grid-template-columns: 1.4fr 0.6fr;
          }
        }
        @media (max-width: 767px) {
          .cart-page__item {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}
