import Link from "next/link";
import Footer from "../components/Footer";
import Icon from "../components/icons";
import Nav from "../components/Nav";
import SeoHead from "../components/SeoHead";
import { useCart } from "../lib/cart-context";
import { DELIVERY_OPTIONS, getDeliveryFee } from "../lib/delivery";

export default function CartPage() {
  const { items, subtotal, updateQuantity, removeItem, deliveryMethod, setDeliveryMethod } = useCart();
  const delivery = items.length ? getDeliveryFee(deliveryMethod) : 0;
  const estimatedTotal = subtotal + delivery;

  return (
    <>
      <SeoHead
        title="Cart"
        description="Review your SharonCraft selections before checkout."
        path="/cart"
        noindex
      />
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
                  <div className="cart-page__item-main">
                    <div>
                      <p className="overline">{item.artisan}</p>
                      <h2 className="cart-page__item-name">{item.name}</h2>
                      <p className="cart-page__item-price">KES {item.price.toLocaleString()}</p>
                    </div>
                    <div className="cart-page__item-actions">
                      <div className="cart-page__qty">
                        <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                        <span>{item.quantity}</span>
                        <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                      </div>
                      <button type="button" className="cart-page__remove" onClick={() => removeItem(item.id)}>
                        Remove
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <aside className="cart-page__summary">
              <p className="overline">Order Summary</p>
              <div className="cart-page__delivery" role="radiogroup" aria-label="Delivery option">
                {Object.entries(DELIVERY_OPTIONS).map(([key, option]) => (
                  <button
                    key={key}
                    type="button"
                    className={`cart-page__delivery-option ${deliveryMethod === key ? "cart-page__delivery-option--active" : ""}`}
                    onClick={() => setDeliveryMethod(key)}
                    disabled={!option.available}
                    aria-label={option.label}
                    aria-checked={deliveryMethod === key}
                    role="radio"
                    title={option.label}
                  >
                    <Icon name={option.icon} size={18} />
                    <span>{option.fee}</span>
                    {!option.available ? <span className="cart-page__delivery-soon">Soon</span> : null}
                  </button>
                ))}
              </div>
              <div className="cart-page__summary-row">
                <span>Subtotal</span>
                <strong>KES {subtotal.toLocaleString()}</strong>
              </div>
              <div className="cart-page__summary-row">
                <span>Delivery</span>
                <strong>KES {delivery.toLocaleString()}</strong>
              </div>
              <div className="cart-page__summary-row cart-page__summary-row--total">
                <span>Estimated total</span>
                <strong>KES {estimatedTotal.toLocaleString()}</strong>
              </div>
              <Link href="/checkout" className="cart-page__cta" aria-label="Proceed to checkout">
                Proceed to Checkout <span aria-hidden="true">-&gt;</span>
              </Link>
              <p className="cart-page__cta-note">Delivery is confirmed at checkout. You can still review your order before sending it.</p>
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
          border: 1px solid rgba(28, 18, 9, 0.12);
          padding: var(--space-5);
        }
        .cart-page__item {
          display: grid;
          grid-template-columns: 104px 1fr;
          align-items: start;
          gap: var(--space-4);
          padding: var(--space-4) 0;
          border-bottom: 1px solid rgba(28, 18, 9, 0.1);
        }
        .cart-page__item:last-child {
          border-bottom: none;
        }
        .cart-page__item img {
          width: 104px;
          height: 118px;
          object-fit: cover;
          background: var(--color-cream-dark);
        }
        .cart-page__item-main {
          min-width: 0;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: var(--space-4);
        }
        .cart-page__item-name {
          font-size: 0.98rem;
          line-height: 1.35;
          font-weight: 600;
          margin-top: 2px;
        }
        .cart-page__item-price {
          margin-top: 6px;
          font-size: 0.95rem;
          color: var(--text-primary);
          font-weight: 500;
        }
        .cart-page__item-actions {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: var(--space-2);
          flex: 0 0 auto;
        }
        .cart-page__qty {
          display: inline-flex;
          align-items: center;
          border: 1px solid rgba(28, 18, 9, 0.16);
        }
        .cart-page__qty button,
        .cart-page__qty span {
          min-width: 34px;
          height: 34px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 0.9rem;
        }
        .cart-page__qty span {
          border-left: 1px solid rgba(28, 18, 9, 0.16);
          border-right: 1px solid rgba(28, 18, 9, 0.16);
        }
        .cart-page__remove {
          color: var(--color-terracotta);
          font-size: 0.82rem;
        }
        .cart-page__summary {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .cart-page__delivery {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: var(--space-2);
          margin: var(--space-2) 0;
        }
        .cart-page__delivery-option {
          min-height: 48px;
          border: 1px solid rgba(28, 18, 9, 0.12);
          background: var(--color-white);
          color: var(--text-primary);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          position: relative;
          font-size: 0.82rem;
          font-weight: 600;
        }
        .cart-page__delivery-option--active {
          border-color: var(--color-terracotta);
          color: var(--color-terracotta);
        }
        .cart-page__delivery-option:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .cart-page__delivery-soon {
          position: absolute;
          right: 8px;
          top: 7px;
          font-size: 0.62rem;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }
        .cart-page__summary-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 0;
          border-bottom: 1px solid rgba(28, 18, 9, 0.1);
          font-size: 0.92rem;
        }
        .cart-page__summary-row--total {
          font-size: 1.03rem;
          font-weight: 600;
          color: var(--text-primary);
        }
        .cart-page__cta {
          margin-top: var(--space-4);
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          padding: 15px 20px;
          background: var(--color-terracotta);
          color: var(--color-white);
          border-radius: 2px;
          font-size: 0.95rem;
          font-weight: 600;
          letter-spacing: 0.02em;
          transition: background var(--transition-fast), transform var(--transition-fast);
        }
        .cart-page__cta:hover {
          background: var(--color-terracotta-dark);
          transform: translateY(-1px);
        }
        .cart-page__cta-note {
          margin-top: var(--space-3);
          font-size: 0.8125rem;
          line-height: 1.5;
          color: var(--text-muted);
        }
        @media (min-width: 960px) {
          .cart-page__layout {
            grid-template-columns: 1.4fr 0.6fr;
          }
          .cart-page__summary {
            position: sticky;
            top: calc(var(--nav-height) + var(--space-5));
          }
        }
        @media (max-width: 767px) {
          .cart-page {
            gap: var(--space-4);
            padding: calc(var(--nav-height) + var(--space-5)) var(--gutter) var(--space-6);
          }
          .cart-page__items,
          .cart-page__summary {
            padding: var(--space-4);
          }
          .cart-page__item {
            grid-template-columns: 78px 1fr;
            gap: var(--space-3);
            padding: 12px 0;
          }
          .cart-page__item img {
            width: 78px;
            height: 92px;
          }
          .cart-page__item-main {
            flex-direction: column;
            gap: var(--space-2);
          }
          .cart-page__item-name {
            font-size: 0.93rem;
            line-height: 1.3;
          }
          .cart-page__item-price {
            margin-top: 4px;
            font-size: 0.92rem;
          }
          .cart-page__item-actions {
            width: 100%;
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
          }
          .cart-page__remove {
            font-size: 0.8rem;
          }
          .cart-page__summary-row {
            font-size: 0.85rem;
            padding: 9px 0;
          }
          .cart-page__summary-row--total {
            font-size: 1rem;
          }
        }
      `}</style>
    </>
  );
}
