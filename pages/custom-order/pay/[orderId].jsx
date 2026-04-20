import { useState, useEffect } from "react";
import Link from "next/link";
import Footer from "../../components/Footer";
import Nav from "../../components/Nav";
import SeoHead from "../../components/SeoHead";

const MPESA_NUMBER = "0112222572";

export default function DepositPaymentPage({ orderId }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentRef, setPaymentRef] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  async function fetchOrder() {
    try {
      const res = await fetch(`/api/orders/custom-design/${orderId}`);
      if (!res.ok) throw new Error("Order not found");
      const data = await res.json();
      setOrder(data.order);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  async function handleSubmitProof(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/orders/custom-design/submit-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          paymentRef: paymentRef.trim(),
          paymentMethod: "mpesa",
        }),
      });

      if (!res.ok) throw new Error("Could not submit payment proof");

      setSubmitted(true);
      // Refresh order
      await fetchOrder();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <>
        <Nav />
        <main style={{ padding: "100px 20px", textAlign: "center" }}>
          Loading order details...
        </main>
        <Footer />
      </>
    );
  }

  if (!order) {
    return (
      <>
        <SeoHead title="Order Not Found | SharonCraft" path="/custom-order" />
        <Nav />
        <main style={{ padding: "100px 20px", maxWidth: "600px", margin: "0 auto", textAlign: "center" }}>
          <h1>Order Not Found</h1>
          <p>Sorry, we couldn't find your custom order.</p>
          <Link href="/custom-order" style={{ color: "#C04D29", textDecoration: "none", fontWeight: "bold" }}>
            ← Back to Custom Orders
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  const depositAmount = order.depositAmount || 0;
  const totalPrice = order.totalPrice || order.customRequest?.budgetRange || "TBD";
  const paymentStatus = order.paymentStatus || "pending-quote";

  return (
    <>
      <SeoHead
        title="Custom Order Payment | SharonCraft"
        description="Submit deposit payment for your custom SharonCraft design"
        path={`/custom-order/pay/${orderId}`}
      />
      <Nav />
      <main className="deposit-page">
        <div className="container">
          <Link href="/" className="deposit-page__back">
            ← Back to Home
          </Link>

          <section className="deposit-card">
            {/* Order Details */}
            <div className="order-summary">
              <h1 className="deposit-page__title">Custom Order Deposit</h1>
              <div className="order-info">
                <div className="info-row">
                  <span className="label">Order ID:</span>
                  <span className="value">{orderId}</span>
                </div>
                <div className="info-row">
                  <span className="label">Item:</span>
                  <span className="value">{order.customRequest?.designType || "Custom Design"}</span>
                </div>
                <div className="info-row">
                  <span className="label">Description:</span>
                  <span className="value">{order.customRequest?.designBrief?.substring(0, 100)}...</span>
                </div>
                <div className="info-row">
                  <span className="label">Colors:</span>
                  <span className="value">{order.customRequest?.colors || "Not specified"}</span>
                </div>
                <div className="info-row">
                  <span className="label">Occasion:</span>
                  <span className="value">{order.customRequest?.occasion || "Not specified"}</span>
                </div>
              </div>
            </div>

            {/* Payment Status */}
            {paymentStatus === "pending-quote" && (
              <div className="status-box status-box--warning">
                <p><strong>Waiting for quote confirmation</strong></p>
                <p>We are preparing your custom design quote. You will receive the final price, deposit amount, and payment instructions on WhatsApp shortly. This typically takes 1-2 hours.</p>
              </div>
            )}

            {paymentStatus === "quote-sent" && depositAmount > 0 && (
              <>
                {/* Price Breakdown */}
                <div className="price-section">
                  <h2>Payment Details</h2>
                  <div className="price-breakdown">
                    <div className="price-row">
                      <span>Total Price:</span>
                      <strong>KES {totalPrice.toLocaleString?.() || totalPrice}</strong>
                    </div>
                    <div className="price-row price-row--highlighted">
                      <span>Deposit Required (50%):</span>
                      <strong className="amount">KES {depositAmount.toLocaleString()}</strong>
                    </div>
                    <p className="price-note">
                      - Your deposit secures your custom order and covers materials and labor costs
                      <br />
                      - The remaining 50% payment is due after we complete your piece and get your final approval
                    </p>
                  </div>
                </div>

                {/* M-Pesa Instructions */}
                <div className="payment-section">
                  <h2>Pay with M-Pesa</h2>
                  <div className="mpesa-instructions">
                    <p className="instruction-title">Follow these steps:</p>
                    <ol className="instruction-list">
                      <li>Open <strong>M-Pesa</strong> on your phone</li>
                      <li>Select <strong>Send Money</strong></li>
                      <li>Enter number: <strong className="highlight">{MPESA_NUMBER}</strong></li>
                      <li>Enter amount: <strong className="highlight">KES {depositAmount.toLocaleString()}</strong></li>
                      <li>Enter reference: <strong className="highlight">{orderId}-{order.name?.split(" ")[0]}</strong></li>
                      <li>Complete the transaction</li>
                    </ol>
                  </div>
                </div>

                {/* Submit Proof */}
                <form onSubmit={handleSubmitProof} className="payment-proof-form">
                  <h3>Payment Submitted</h3>
                  <p className="form-description">
                    Enter your M-Pesa payment reference number below, and we'll verify your payment.
                  </p>
                  
                  <label className="form-field">
                    <span>M-Pesa Reference Number *</span>
                    <input
                      type="text"
                      placeholder="e.g., BG2342X5V8"
                      value={paymentRef}
                      onChange={(e) => setPaymentRef(e.target.value)}
                      required
                      className="payment-input"
                    />
                    <small>You'll see this after paying on M-Pesa</small>
                  </label>

                  {error && <div className="error-message">{error}</div>}

                  <button
                    type="submit"
                    disabled={submitting || !paymentRef.trim()}
                    className="submit-button"
                  >
                    {submitting ? "Verifying..." : "Submit Payment Proof"}
                  </button>
                </form>
              </>
            )}

            {paymentStatus === "deposit-pending" && (
              <div className="status-box status-box--success">
                <p><strong>Payment proof submitted</strong></p>
                <p>Thank you for submitting your payment proof. We will verify your M-Pesa payment and send you a WhatsApp confirmation within 1 hour. Your production will start immediately after verification.</p>
              </div>
            )}

            {paymentStatus === "deposit-paid" && (
              <div className="status-box status-box--confirmed">
                <p><strong>Payment confirmed!</strong></p>
                <p>Your deposit payment has been verified and received. Production has started on your custom piece. You will receive regular progress updates on WhatsApp with photos and timeline details.</p>
              </div>
            )}

            {/* Next Steps */}
            <div className="next-steps">
              <h3>What Happens Next</h3>
              <div className="steps-list">
                <div className="step">
                  <span className="step-number">1</span>
                  <div>
                    <strong>Payment Verification</strong>
                    <p>We verify your M-Pesa payment (usually within 1 hour)</p>
                  </div>
                </div>
                <div className="step">
                  <span className="step-number">2</span>
                  <div>
                    <strong>Production Starts</strong>
                    <p>Your artisan begins crafting your custom piece</p>
                  </div>
                </div>
                <div className="step">
                  <span className="step-number">3</span>
                  <div>
                    <strong>Progress Updates</strong>
                    <p>We send photos & updates via WhatsApp daily</p>
                  </div>
                </div>
                <div className="step">
                  <span className="step-number">4</span>
                  <div>
                    <strong>Final Approval</strong>
                    <p>Approve the finished piece & pay remaining 50%</p>
                  </div>
                </div>
                <div className="step">
                  <span className="step-number">5</span>
                  <div>
                    <strong>Dispatch</strong>
                    <p>Your piece ships to you via courier</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="contact-section">
              <p>
                Questions? Contact us on WhatsApp{" "}
                <a href="https://wa.me/254112222572" target="_blank" rel="noopener noreferrer">
                  +254 112 222 572
                </a>
              </p>
            </div>
          </section>
        </div>
      </main>
      <Footer />

      <style jsx>{`
        .deposit-page {
          min-height: 100vh;
          padding: calc(var(--nav-height) + 40px) var(--gutter) 60px;
          background: #f9f6ee;
        }

        .container {
          max-width: 700px;
          margin: 0 auto;
        }

        .deposit-page__back {
          color: #C04D29;
          text-decoration: none;
          font-weight: 600;
          display: inline-block;
          margin-bottom: 24px;
        }

        .deposit-page__back:hover {
          text-decoration: underline;
        }

        .deposit-card {
          background: white;
          border-radius: 8px;
          padding: 40px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .deposit-page__title {
          font-size: 32px;
          font-weight: 700;
          color: #0f0f0f;
          margin: 0 0 32px 0;
        }

        .order-summary {
          background: #f5f5f5;
          padding: 24px;
          border-radius: 6px;
          margin-bottom: 32px;
        }

        .order-info {
          display: grid;
          gap: 12px;
        }

        .info-row {
          display: grid;
          grid-template-columns: 150px 1fr;
          gap: 16px;
        }

        .info-row .label {
          font-weight: 600;
          color: #666;
          font-size: 13px;
          text-transform: uppercase;
        }

        .info-row .value {
          color: #0f0f0f;
          word-break: break-word;
        }

        .status-box {
          padding: 16px;
          border-radius: 6px;
          margin-bottom: 24px;
          border-left: 4px solid;
        }

        .status-box p {
          margin: 0;
          font-size: 14px;
          line-height: 1.5;
        }

        .status-box strong {
          color: #0f0f0f;
        }

        .status-box--warning {
          background: #fff8e1;
          border-left-color: #fbc02d;
          color: #856404;
        }

        .status-box--success {
          background: #e8f5e9;
          border-left-color: #4caf50;
          color: #2e7d32;
        }

        .status-box--confirmed {
          background: #e3f2fd;
          border-left-color: #2196f3;
          color: #1565c0;
        }

        .price-section {
          margin-bottom: 32px;
        }

        .price-section h2 {
          font-size: 18px;
          font-weight: 600;
          color: #0f0f0f;
          margin: 0 0 16px 0;
        }

        .price-breakdown {
          background: #faf7f2;
          padding: 20px;
          border-radius: 6px;
          border: 1px solid #e0d5c7;
        }

        .price-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #e0d5c7;
          font-size: 14px;
        }

        .price-row:last-of-type {
          border-bottom: none;
        }

        .price-row--highlighted {
          background: white;
          padding: 12px;
          margin: 0 -20px;
          padding-left: 20px;
          padding-right: 20px;
          border-bottom: none;
        }

        .price-row strong {
          font-weight: 700;
          color: #0f0f0f;
        }

        .price-row--highlighted .amount {
          color: #C04D29;
          font-size: 18px;
        }

        .price-note {
          margin-top: 12px;
          font-size: 12px;
          color: #666;
          line-height: 1.6;
        }

        .payment-section {
          margin-bottom: 32px;
        }

        .payment-section h2 {
          font-size: 18px;
          font-weight: 600;
          color: #0f0f0f;
          margin: 0 0 16px 0;
        }

        .mpesa-instructions {
          background: #f5f5f5;
          padding: 20px;
          border-radius: 6px;
        }

        .instruction-title {
          margin: 0 0 12px 0;
          font-weight: 600;
          color: #0f0f0f;
        }

        .instruction-list {
          margin: 0;
          padding-left: 20px;
          color: #333;
          line-height: 1.8;
        }

        .instruction-list li {
          margin-bottom: 8px;
        }

        .highlight {
          background: #fffacd;
          padding: 2px 6px;
          border-radius: 3px;
          font-weight: 600;
          color: #C04D29;
        }

        .payment-proof-form {
          background: #e8f5e9;
          padding: 24px;
          border-radius: 6px;
          margin-bottom: 32px;
          border: 1px solid #4caf50;
        }

        .payment-proof-form h3 {
          margin: 0 0 8px 0;
          color: #2e7d32;
          font-size: 16px;
        }

        .form-description {
          color: #333;
          margin: 0 0 16px 0;
          font-size: 14px;
        }

        .form-field {
          display: block;
          margin-bottom: 16px;
        }

        .form-field span {
          display: block;
          font-weight: 600;
          margin-bottom: 6px;
          color: #0f0f0f;
          font-size: 14px;
        }

        .payment-input {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }

        .payment-input:focus {
          outline: none;
          border-color: #C04D29;
          box-shadow: 0 0 0 2px rgba(192, 77, 41, 0.1);
        }

        .form-field small {
          display: block;
          color: #666;
          font-size: 12px;
          margin-top: 4px;
        }

        .error-message {
          background: #ffebee;
          color: #c62828;
          padding: 12px;
          border-radius: 4px;
          margin-bottom: 16px;
          font-size: 14px;
        }

        .submit-button {
          width: 100%;
          padding: 12px;
          background: #4caf50;
          color: white;
          border: none;
          border-radius: 4px;
          font-weight: 600;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
        }

        .submit-button:hover:not(:disabled) {
          background: #388e3c;
        }

        .submit-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .next-steps {
          margin-top: 40px;
          padding-top: 40px;
          border-top: 1px solid #e0d5c7;
        }

        .next-steps h3 {
          font-size: 18px;
          font-weight: 600;
          color: #0f0f0f;
          margin: 0 0 20px 0;
        }

        .steps-list {
          display: grid;
          gap: 16px;
        }

        .step {
          display: flex;
          gap: 16px;
        }

        .step-number {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          background: #C04D29;
          color: white;
          border-radius: 50%;
          font-weight: 700;
          flex-shrink: 0;
        }

        .step strong {
          display: block;
          color: #0f0f0f;
          margin-bottom: 4px;
          font-size: 14px;
        }

        .step p {
          margin: 0;
          color: #666;
          font-size: 13px;
        }

        .contact-section {
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid #e0d5c7;
          text-align: center;
          color: #666;
          font-size: 14px;
        }

        .contact-section a {
          color: #C04D29;
          text-decoration: none;
          font-weight: 600;
        }

        .contact-section a:hover {
          text-decoration: underline;
        }

        @media (max-width: 600px) {
          .deposit-card {
            padding: 20px;
          }

          .deposit-page__title {
            font-size: 24px;
          }

          .info-row {
            grid-template-columns: 100px 1fr;
          }

          .info-row .label {
            font-size: 12px;
          }

          .price-section h2,
          .payment-section h2,
          .next-steps h3 {
            font-size: 16px;
          }
        }
      `}</style>
    </>
  );
}

export async function getServerSideProps({ params }) {
  return {
    props: {
      orderId: params.orderId,
    },
  };
}
