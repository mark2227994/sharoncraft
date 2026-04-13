import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import Footer from "../components/Footer";
import Nav from "../components/Nav";
import { useCart } from "../lib/cart-context";

const WHATSAPP_NUMBER = "254112222572"; // 0112222572 in international format

function buildWhatsAppMessage({ name, phone, area, items, subtotal, total }) {
  const lines = [];
  lines.push("Hello SharonCraft! 👋");
  lines.push("");
  lines.push("I'd like to place an order:");
  lines.push("");
  lines.push("📦 *Items:*");
  items.forEach((item) => {
    const lineTotal = (item.price * item.quantity).toLocaleString();
    lines.push(`  - ${item.name} × ${item.quantity} — KES ${lineTotal}`);
  });
  lines.push("");
  lines.push(`🛒 Subtotal: KES ${subtotal.toLocaleString()}`);
  lines.push(`🚚 Delivery: KES 300`);
  lines.push(`💰 *Total: KES ${total.toLocaleString()}*`);
  lines.push("");
  lines.push(`📍 Delivery area: ${area}`);
  lines.push(`👤 Name: ${name}`);
  lines.push(`📞 Phone: ${phone}`);
  lines.push("");
  lines.push("Please confirm my order. Thank you! 🙏");
  return lines.join("\n");
}

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [completed, setCompleted] = useState(false);

  const delivery = 300;
  const total = subtotal + delivery;

  function onSubmit(data) {
    if (items.length === 0) return;

    const message = buildWhatsAppMessage({
      name: data.name,
      phone: data.phone,
      area: data.area,
      items,
      subtotal,
      total,
    });

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    clear();
    setCompleted(true);

    // Open WhatsApp in a new tab
    window.open(url, "_blank", "noopener,noreferrer");
  }

  if (items.length === 0 && !completed) {
    return (
      <>
        <Nav />
        <main className="checkout-page">
          <div className="checkout-page__card" style={{ textAlign: "center", padding: "var(--space-7)" }}>
            <p className="body-lg" style={{ marginBottom: "var(--space-4)" }}>Your cart is empty.</p>
            <Link href="/shop" className="checkout-page__cta">Browse the gallery</Link>
          </div>
        </main>
        <Footer />
        <style jsx>{styles}</style>
      </>
    );
  }

  return (
    <>
      <Nav />
      <main className="checkout-page">
        <div>
          <p className="overline">Checkout</p>
          <h1 className="display-lg">Complete your order</h1>
        </div>

        {completed ? (
          <div className="checkout-page__card checkout-page__success">
            <div className="checkout-page__success-icon">✅</div>
            <h2 className="display-sm">Order sent to WhatsApp!</h2>
            <p className="body-base">
              A WhatsApp chat with SharonCraft should have opened. If it didn&apos;t,{" "}
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--color-terracotta)", textDecoration: "underline" }}
              >
                click here to open WhatsApp
              </a>.
            </p>
            <p className="body-sm" style={{ color: "var(--color-muted, #888)", marginTop: "var(--space-3)" }}>
              Sharon will confirm your order and share payment details shortly.
            </p>
            <Link href="/shop" className="checkout-page__cta" style={{ marginTop: "var(--space-5)" }}>
              Return to the gallery
            </Link>
          </div>
        ) : (
          <div className="checkout-page__layout">
            <form className="checkout-page__card" onSubmit={handleSubmit(onSubmit)}>
              <h2 className="checkout-page__section-title">Your details</h2>

              <div className="checkout-page__field-grid">
                <label className="checkout-page__field">
                  <span>Full name *</span>
                  <input
                    {...register("name", { required: "Name is required" })}
                    className="admin-input"
                    placeholder="e.g. Jane Mwangi"
                  />
                  {errors.name && <span className="checkout-page__error">{errors.name.message}</span>}
                </label>
                <label className="checkout-page__field">
                  <span>Phone number *</span>
                  <input
                    {...register("phone", { required: "Phone is required" })}
                    className="admin-input"
                    placeholder="e.g. 0712 345 678"
                    type="tel"
                  />
                  {errors.phone && <span className="checkout-page__error">{errors.phone.message}</span>}
                </label>
              </div>

              <label className="checkout-page__field">
                <span>Delivery area *</span>
                <input
                  {...register("area", { required: "Delivery area is required" })}
                  className="admin-input"
                  placeholder="e.g. Westlands, Nairobi"
                />
                {errors.area && <span className="checkout-page__error">{errors.area.message}</span>}
              </label>

              <div className="checkout-page__whatsapp-note">
                <span>📲</span>
                <p>
                  Clicking <strong>Send Order via WhatsApp</strong> will open WhatsApp with your order
                  details pre-filled. Sharon will confirm and share payment instructions.
                </p>
              </div>

              <button type="submit" className="checkout-page__cta checkout-page__cta--whatsapp">
                <span>💬</span> Send Order via WhatsApp
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

      <style jsx>{styles}</style>
    </>
  );
}

const styles = `
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
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }
  .checkout-page__section-title {
    font-size: 1rem;
    font-weight: 600;
    margin: 0;
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
  }
  .checkout-page__error {
    color: #c0392b;
    font-size: 0.8rem;
  }
  .checkout-page__whatsapp-note {
    display: flex;
    gap: var(--space-3);
    align-items: flex-start;
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    border-radius: var(--radius-md);
    padding: var(--space-3) var(--space-4);
    font-size: 0.875rem;
    color: #166534;
  }
  .checkout-page__whatsapp-note p {
    margin: 0;
    line-height: 1.5;
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
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    padding: 14px 20px;
    background: var(--color-terracotta);
    color: var(--color-white);
    border-radius: var(--radius-md);
    font-weight: 600;
    border: none;
    cursor: pointer;
    text-decoration: none;
  }
  .checkout-page__cta--whatsapp {
    background: #25d366;
    font-size: 1rem;
  }
  .checkout-page__cta--whatsapp:hover {
    background: #1ebe5d;
  }
  .checkout-page__success {
    text-align: center;
    align-items: center;
    padding: var(--space-7) var(--space-5);
  }
  .checkout-page__success-icon {
    font-size: 3rem;
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
`;
