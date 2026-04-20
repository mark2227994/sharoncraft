import { useState } from "react";
import Head from "next/head";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import SeoHead from "../components/SeoHead";

const ORDER_STATUSES = {
  pending: { label: "Order Received", color: "#FFB84D", step: 1 },
  confirmed: { label: "Order Confirmed", color: "#FFB84D", step: 2 },
  processing: { label: "Being Handcrafted", color: "#FFB84D", step: 3 },
  ready: { label: "Ready to Ship", color: "#FFB84D", step: 4 },
  shipped: { label: "In Transit", color: "#3B9E8F", step: 5 },
  delivered: { label: "Delivered", color: "#3B9E8F", step: 6 },
  cancelled: { label: "Cancelled", color: "#D84C3C", step: 0 },
};

export default function TrackOrderPage() {
  const [orderID, setOrderID] = useState("");
  const [email, setEmail] = useState("");
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleTrackOrder(e) {
    e.preventDefault();
    setError("");
    setOrderData(null);
    setLoading(true);

    try {
      const response = await fetch("/api/orders/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: orderID.trim(), email: email.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Order not found");
        setLoading(false);
        return;
      }

      setOrderData(data);
    } catch (err) {
      setError("Unable to track order. Please try again or contact support.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <SeoHead
        title="Track Your Order - SharonCraft"
        description="Track your SharonCraft order status in real-time. Enter your order ID and email to see delivery updates."
        path="/track-order"
      />
      <Nav />

      <div className="track-order-page">
        <div className="container">
          <div className="track-order__header">
            <h1 className="display-lg">Track Your Order</h1>
            <p className="body-base">
              Enter your order ID and email address to see real-time updates on your SharonCraft handmade piece.
            </p>
          </div>

          <form className="track-order__form" onSubmit={handleTrackOrder}>
            <div className="track-order__grid">
              <label className="track-order__field">
                <span>Order ID *</span>
                <input
                  type="text"
                  placeholder="e.g., ORD-2026-001234"
                  value={orderID}
                  onChange={(e) => setOrderID(e.target.value)}
                  required
                  className="track-order__input"
                />
                <p className="track-order__hint">Found in your order confirmation email</p>
              </label>
              <label className="track-order__field">
                <span>Email Address *</span>
                <input
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="track-order__input"
                />
                <p className="track-order__hint">The email used when placing the order</p>
              </label>
            </div>

            <button type="submit" className="track-order__button" disabled={loading}>
              {loading ? "Searching..." : "Track Order"}
            </button>

            {error && <div className="track-order__error">{error}</div>}
          </form>

          {orderData && (
            <div className="track-order__result">
              <div className="order-card">
                <h2 className="order-card__title">Order {orderData.orderId}</h2>

                <div className="order-card__details">
                  <div className="detail-row">
                    <span className="detail-row__label">Status:</span>
                    <span className="detail-row__value">{ORDER_STATUSES[orderData.status]?.label || "Unknown"}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-row__label">Order Date:</span>
                    <span className="detail-row__value">{new Date(orderData.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-row__label">Total Amount:</span>
                    <span className="detail-row__value">KES {orderData.totalAmount?.toLocaleString()}</span>
                  </div>
                </div>

                {/* Timeline of status */}
                <div className="order-timeline">
                  <h3 className="order-timeline__title">Order Status Timeline</h3>

                  <div className="timeline-steps">
                    {[
                      { key: "pending", label: "Order Received" },
                      { key: "confirmed", label: "Order Confirmed" },
                      { key: "processing", label: "Handcrafting" },
                      { key: "ready", label: "Ready to Ship" },
                      { key: "shipped", label: "In Transit" },
                      { key: "delivered", label: "Delivered" },
                    ].map((step, idx) => {
                      const isCompleted = ["pending", "confirmed", "processing", "ready", "shipped", "delivered"].indexOf(
                        step.key
                      ) <= ["pending", "confirmed", "processing", "ready", "shipped", "delivered"].indexOf(orderData.status);

                      return (
                        <div key={step.key} className={`timeline-step ${isCompleted ? "timeline-step--completed" : ""}`}>
                          <div
                            className="timeline-step__circle"
                            style={{
                              backgroundColor: isCompleted ? ORDER_STATUSES[step.key]?.color : "#EEEEEE",
                            }}
                          ></div>
                          <div className="timeline-step__label">{step.label}</div>
                          {idx < 5 && <div className="timeline-step__line"></div>}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Delivery Info */}
                {orderData.trackingNumber && (
                  <div className="delivery-info">
                    <h3 className="delivery-info__title">Delivery Information</h3>
                    <div className="delivery-info__details">
                      <div className="detail-row">
                        <span className="detail-row__label">Tracking Number:</span>
                        <span className="detail-row__value">{orderData.trackingNumber}</span>
                      </div>
                      {orderData.deliveryEstimate && (
                        <div className="detail-row">
                          <span className="detail-row__label">Estimated Delivery:</span>
                          <span className="detail-row__value">{new Date(orderData.deliveryEstimate).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Items in order */}
                {orderData.items && orderData.items.length > 0 && (
                  <div className="order-items">
                    <h3 className="order-items__title">Items in Your Order</h3>
                    {orderData.items.map((item, idx) => (
                      <div key={idx} className="order-item">
                        <span className="order-item__name">{item.productName || item.name}</span>
                        <span className="order-item__qty">Qty: {item.quantity}</span>
                        <span className="order-item__price">KES {item.price?.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Help section */}
                <div className="order-help">
                  <p className="order-help__text">
                    Need help? Contact us via WhatsApp at <strong>+254 112 222 572</strong> or email{" "}
                    <a href="mailto:kelvinmark.services@gmail.com">kelvinmark.services@gmail.com</a>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* FAQ Section */}
          <section className="track-order__faq">
            <h2 className="section-title">Frequently Asked Questions</h2>
            <div className="faq-items">
              <div className="faq-item">
                <h3 className="faq-item__question">Where do I find my order ID?</h3>
                <p className="faq-item__answer">
                  Your order ID is in the confirmation email sent after you place an order. It starts with "ORD-" followed by the date and a number.
                </p>
              </div>

              <div className="faq-item">
                <h3 className="faq-item__question">How often is the tracking updated?</h3>
                <p className="faq-item__answer">
                  Tracking updates are sent via WhatsApp automatically. You can also check this page anytime to see the latest status. Updates typically happen within 24 hours of each status change.
                </p>
              </div>

              <div className="faq-item">
                <h3 className="faq-item__question">Can I cancel or modify my order?</h3>
                <p className="faq-item__answer">
                  Orders can be modified within 24 hours of placement if not yet in production. Contact us immediately via WhatsApp to discuss changes or cancellation. Custom orders are generally non-refundable once handcrafting begins.
                </p>
              </div>

              <div className="faq-item">
                <h3 className="faq-item__question">How long does handcrafting take?</h3>
                <p className="faq-item__answer">
                  Standard ready-to-ship items are dispatched within 2-3 business days. Custom orders take 5-10 business days for handcrafting, then 1-2 days for final quality check before shipping.
                </p>
              </div>

              <div className="faq-item">
                <h3 className="faq-item__question">What happens if my order is delayed?</h3>
                <p className="faq-item__answer">
                  If your order is delayed beyond the estimated delivery, we will contact you via WhatsApp with updates. Rare delays are due to weather, customs, or courier issues beyond our control. We will keep you informed throughout.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>

      <Footer />

      <style jsx>{`
        .track-order-page {
          min-height: 100vh;
          padding: calc(var(--nav-height) + var(--space-8)) var(--gutter) var(--space-8);
          background: linear-gradient(135deg, #f9f6ee 0%, #fefdfb 100%);
        }

        .container {
          max-width: 900px;
          margin: 0 auto;
        }

        .track-order__header {
          text-align: center;
          margin-bottom: var(--space-8);
        }

        .track-order__header h1 {
          margin-bottom: var(--space-3);
        }

        .track-order__header p {
          max-width: 60ch;
          margin: 0 auto;
          color: var(--text-secondary);
        }

        .track-order__form {
          background: white;
          border: 1px solid var(--border-default);
          border-radius: var(--radius-lg);
          padding: var(--space-6);
          margin-bottom: var(--space-8);
        }

        .track-order__grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: var(--space-4);
          margin-bottom: var(--space-6);
        }

        .track-order__field {
          display: grid;
          gap: var(--space-2);
        }

        .track-order__field span {
          font-weight: 600;
          color: var(--text-primary);
        }

        .track-order__input {
          padding: 12px 16px;
          border: 1px solid var(--border-default);
          border-radius: var(--radius-md);
          font-size: 1rem;
          font-family: inherit;
          transition: all 0.2s ease;
        }

        .track-order__input:focus {
          outline: none;
          border-color: var(--color-accent);
          box-shadow: 0 0 0 3px rgba(59, 158, 143, 0.1);
        }

        .track-order__hint {
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin: 0;
        }

        .track-order__button {
          padding: 12px 32px;
          background: var(--color-accent);
          color: white;
          border: none;
          border-radius: var(--radius-md);
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .track-order__button:hover:not(:disabled) {
          background: var(--color-accent-dark);
          transform: translateY(-2px);
        }

        .track-order__button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .track-order__error {
          color: #d84c3c;
          background: rgba(216, 76, 60, 0.1);
          border: 1px solid #d84c3c;
          border-radius: var(--radius-md);
          padding: var(--space-3);
          margin-top: var(--space-4);
        }

        .track-order__result {
          margin-bottom: var(--space-8);
        }

        .order-card {
          background: white;
          border: 1px solid var(--border-default);
          border-radius: var(--radius-lg);
          padding: var(--space-6);
        }

        .order-card__title {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0 0 var(--space-5) 0;
          color: var(--text-primary);
        }

        .order-card__details {
          background: #f9f6ee;
          border-radius: var(--radius-md);
          padding: var(--space-4);
          margin-bottom: var(--space-6);
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--space-2) 0;
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        }

        .detail-row:last-child {
          border-bottom: none;
        }

        .detail-row__label {
          font-weight: 600;
          color: var(--text-primary);
        }

        .detail-row__value {
          color: var(--text-secondary);
        }

        .order-timeline {
          margin-bottom: var(--space-6);
        }

        .order-timeline__title {
          font-size: 1.125rem;
          font-weight: 600;
          margin: 0 0 var(--space-4) 0;
          color: var(--text-primary);
        }

        .timeline-steps {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: var(--space-3);
        }

        .timeline-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          position: relative;
        }

        .timeline-step__circle {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: var(--space-2);
          transition: all 0.3s ease;
        }

        .timeline-step--completed .timeline-step__circle {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .timeline-step__label {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-secondary);
        }

        .timeline-step__line {
          display: none;
        }

        .delivery-info {
          background: #f0f8f6;
          border-left: 4px solid var(--color-accent);
          border-radius: var(--radius-md);
          padding: var(--space-4);
          margin-bottom: var(--space-6);
        }

        .delivery-info__title {
          font-size: 1rem;
          font-weight: 600;
          margin: 0 0 var(--space-3) 0;
          color: var(--text-primary);
        }

        .order-items {
          margin-bottom: var(--space-6);
        }

        .order-items__title {
          font-size: 1rem;
          font-weight: 600;
          margin: 0 0 var(--space-3) 0;
          color: var(--text-primary);
        }

        .order-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--space-3);
          border-bottom: 1px solid var(--border-default);
        }

        .order-item:last-child {
          border-bottom: none;
        }

        .order-item__name {
          font-weight: 500;
          color: var(--text-primary);
        }

        .order-item__qty {
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .order-item__price {
          font-weight: 600;
          color: var(--text-primary);
        }

        .order-help {
          background: #f0f8f6;
          border-radius: var(--radius-md);
          padding: var(--space-4);
          text-align: center;
        }

        .order-help__text {
          margin: 0;
          color: var(--text-secondary);
          line-height: 1.6;
        }

        .order-help__text a {
          color: var(--color-accent);
          text-decoration: none;
        }

        .order-help__text a:hover {
          text-decoration: underline;
        }

        .track-order__faq {
          margin-top: var(--space-8);
        }

        .section-title {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0 0 var(--space-6) 0;
          color: var(--text-primary);
        }

        .faq-items {
          display: grid;
          gap: var(--space-4);
        }

        .faq-item {
          background: white;
          border: 1px solid var(--border-default);
          border-radius: var(--radius-md);
          padding: var(--space-4);
        }

        .faq-item__question {
          font-weight: 600;
          margin: 0 0 var(--space-2) 0;
          color: var(--text-primary);
        }

        .faq-item__answer {
          margin: 0;
          color: var(--text-secondary);
          line-height: 1.6;
        }

        @media (max-width: 768px) {
          .track-order-page {
            padding: calc(var(--nav-height) + var(--space-4)) var(--gutter) var(--space-6);
          }

          .track-order__grid {
            grid-template-columns: 1fr;
          }

          .detail-row {
            flex-direction: column;
            align-items: flex-start;
            gap: var(--space-1);
          }

          .timeline-steps {
            grid-template-columns: repeat(3, 1fr);
          }
        }
      `}</style>
    </>
  );
}
