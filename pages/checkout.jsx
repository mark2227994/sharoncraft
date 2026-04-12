import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import Footer from "../components/Footer";
import Nav from "../components/Nav";
import { useCart } from "../lib/cart-context";

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const { register, handleSubmit } = useForm();
  const [completed, setCompleted] = useState(false);

  const total = subtotal + 300;

  function onSubmit() {
    setCompleted(true);
    clear();
  }

  return (
    <>
      <Nav />
      <main className="checkout-page">
        <div>
          <p className="overline">Secure checkout</p>
          <h1 className="display-lg">Checkout</h1>
        </div>

        {completed ? (
          <div className="checkout-page__card">
            <p className="body-lg">Your order request is ready for confirmation.</p>
            <p className="body-base">SharonCraft will follow up with M-Pesa and delivery details.</p>
            <Link href="/shop" className="checkout-page__cta">
              Return to the gallery
            </Link>
          </div>
        ) : (
          <div className="checkout-page__layout">
            <form className="checkout-page__card" onSubmit={handleSubmit(onSubmit)}>
              <div className="checkout-page__field-grid">
                <label className="checkout-page__field">
                  <span>Full name</span>
                  <input {...register("name", { required: true })} className="admin-input" />
                </label>
                <label className="checkout-page__field">
                  <span>Phone number</span>
                  <input {...register("phone", { required: true })} className="admin-input" />
                </label>
              </div>
              <label className="checkout-page__field">
                <span>Email</span>
                <input type="email" {...register("email", { required: true })} className="admin-input" />
              </label>
              <label className="checkout-page__field">
                <span>Delivery area</span>
                <input {...register("area", { required: true })} className="admin-input" />
              </label>
              <label className="checkout-page__field">
                <span>Payment method</span>
                <select {...register("paymentMethod")} className="admin-select">
                  <option value="mpesa">M-Pesa</option>
                  <option value="card">Card</option>
                </select>
              </label>
              <button type="submit" className="checkout-page__cta">
                Confirm Order
              </button>
            </form>

            <aside className="checkout-page__card">
              <p className="overline">Order summary</p>
              {items.map((item) => (
                <div key={item.id} className="checkout-page__summary-row">
                  <span>{item.name} × {item.quantity}</span>
                  <strong>KES {(item.price * item.quantity).toLocaleString()}</strong>
                </div>
              ))}
              <div className="checkout-page__summary-row">
                <span>Delivery</span>
                <strong>KES 300</strong>
              </div>
              <div className="checkout-page__summary-row checkout-page__summary-row--total">
                <span>Total</span>
                <strong>KES {total.toLocaleString()}</strong>
              </div>
            </aside>
          </div>
        )}
      </main>
      <Footer />

      <style jsx>{`
        .checkout-page {
          max-width: var(--max-width);
          margin: 0 auto;
          padding: calc(var(--nav-height) + var(--space-6)) var(--gutter) var(--space-7);
          display: grid;
          gap: var(--space-5);
        }
        .checkout-page__layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-5);
        }
        .checkout-page__card {
          background: var(--color-white);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-lg);
          padding: var(--space-5);
        }
        .checkout-page__field-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: var(--space-4);
        }
        .checkout-page__field {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
          margin-bottom: var(--space-4);
        }
        .checkout-page__summary-row {
          display: flex;
          justify-content: space-between;
          gap: var(--space-3);
          padding: var(--space-3) 0;
          border-bottom: 1px solid var(--border-default);
        }
        .checkout-page__summary-row--total {
          border-bottom: none;
          font-size: 1.1rem;
        }
        .checkout-page__cta {
          display: inline-flex;
          justify-content: center;
          padding: 14px 20px;
          background: var(--color-terracotta);
          color: var(--color-white);
          border-radius: var(--radius-md);
        }
        @media (min-width: 960px) {
          .checkout-page__layout {
            grid-template-columns: 1fr 0.7fr;
          }
        }
        @media (max-width: 767px) {
          .checkout-page__field-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}
