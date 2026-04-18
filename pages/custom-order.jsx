import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import Footer from "../components/Footer";
import Nav from "../components/Nav";
import SeoHead from "../components/SeoHead";

const WHATSAPP_NUMBER = "254112222572";

function buildCustomWhatsAppMessage({ orderReference, name, phone, designType, colors, occasion, budgetRange, neededBy, designBrief, referenceImage }) {
  const lines = [
    "Hello SharonCraft.",
    "",
    "I would like to request a custom design:",
    "",
  ];

  if (orderReference) {
    lines.push(`Request Ref: ${orderReference}`);
    lines.push("");
  }

  lines.push(`Name: ${name}`);
  lines.push(`Phone: ${phone}`);
  lines.push(`Design type: ${designType}`);
  if (colors) lines.push(`Preferred colors: ${colors}`);
  if (occasion) lines.push(`Occasion: ${occasion}`);
  if (budgetRange) lines.push(`Budget range: ${budgetRange}`);
  if (neededBy) lines.push(`Needed by: ${neededBy}`);
  lines.push("");
  lines.push("Design idea:");
  lines.push(designBrief);
  if (referenceImage) {
    lines.push("");
    lines.push(`Reference image or link: ${referenceImage}`);
  }
  lines.push("");
  lines.push("Please advise on design options, timing, and next steps. Thank you.");
  return lines.join("\n");
}

export default function CustomOrderPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);

  async function onSubmit(values) {
    setSubmitError("");
    setSubmitting(true);

    try {
      const response = await fetch("/api/orders/custom-design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(body?.error || "We could not save your custom design request.");
      }

      const message = buildCustomWhatsAppMessage({
        ...values,
        orderReference: body.orderReference,
      });
      const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
      setCompleted(true);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (error) {
      setSubmitError(error.message || "We could not save your custom design request.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <SeoHead
        title="Custom Design Request"
        description="Request a custom SharonCraft piece for bridal, gifting, personal style, or special occasions."
        path="/custom-order"
      />
      <Nav />
      <main className="custom-order-page">
        <div className="custom-order-page__intro">
          <p className="overline">Custom Design</p>
          <h1 className="display-lg">Tell SharonCraft what you want made.</h1>
          <p className="body-base">
            Share your idea, preferred colors, and occasion. We will save the request for admin follow-up and open
            WhatsApp so you can continue the conversation right away.
          </p>
        </div>

        {!completed && (
          <>
            <section className="custom-order-page__how-it-works">
              <h2 className="custom-order-page__section-title">How Custom Orders Work</h2>
              <div className="custom-order-page__process-steps">
                <div className="process-step">
                  <div className="process-step__number">1</div>
                  <div className="process-step__content">
                    <h3>Submit Request</h3>
                    <p>Fill out the form below with your design idea, colors, and budget.</p>
                  </div>
                </div>
                <div className="process-step">
                  <div className="process-step__number">2</div>
                  <div className="process-step__content">
                    <h3>Get Quoted</h3>
                    <p>We'll review your request and send you a detailed quote via WhatsApp (24 hours).</p>
                  </div>
                </div>
                <div className="process-step">
                  <div className="process-step__number">3</div>
                  <div className="process-step__content">
                    <h3>Pay Deposit</h3>
                    <p>Confirm the design and pay 50% deposit. We'll start production.</p>
                  </div>
                </div>
                <div className="process-step">
                  <div className="process-step__number">4</div>
                  <div className="process-step__content">
                    <h3>We Create</h3>
                    <p>Our artisans handcraft your piece (5-10 business days). You'll receive photos for approval.</p>
                  </div>
                </div>
                <div className="process-step">
                  <div className="process-step__number">5</div>
                  <div className="process-step__content">
                    <h3>Final Payment</h3>
                    <p>Pay the remaining 50% + shipping. We dispatch your custom piece.</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="custom-order-page__pricing">
              <h2 className="custom-order-page__section-title">Pricing Guide</h2>
              <div className="custom-order-page__pricing-table">
                <div className="pricing-row pricing-row--header">
                  <div>Item Type</div>
                  <div>Typical Price</div>
                  <div>Notes</div>
                </div>
                <div className="pricing-row">
                  <div><strong>Single Necklace</strong></div>
                  <div>KES 2,500 - 4,500</div>
                  <div>1-2 days production</div>
                </div>
                <div className="pricing-row">
                  <div><strong>Single Bracelet</strong></div>
                  <div>KES 1,500 - 3,000</div>
                  <div>1 day production</div>
                </div>
                <div className="pricing-row">
                  <div><strong>Pair of Earrings</strong></div>
                  <div>KES 1,800 - 3,500</div>
                  <div>1 day production</div>
                </div>
                <div className="pricing-row">
                  <div><strong>Full Jewelry Set</strong></div>
                  <div>KES 5,000 - 10,000</div>
                  <div>3-5 days production</div>
                </div>
                <div className="pricing-row">
                  <div><strong>Home Decor Item</strong></div>
                  <div>KES 3,000 - 8,000</div>
                  <div>Depends on size</div>
                </div>
                <div className="pricing-row">
                  <div><strong>Bulk Order (50+)</strong></div>
                  <div>Custom quote</div>
                  <div>Special pricing available</div>
                </div>
              </div>
              <p className="custom-order-page__pricing-note">
                ⓘ Prices above are estimates. Final quote will depend on specific design, materials, and quantity.
                <br />
                All prices include materials. Shipping costs added at final payment.
              </p>
            </section>

            <section className="custom-order-page__important">
              <h3>Important Details</h3>
              <ul className="custom-order-page__details-list">
                <li>All items are 100% handmade - perfect for unique, one-of-a-kind pieces</li>
                <li>Deposit (50%) is non-refundable unless we cannot fulfill the design</li>
                <li>Production timeline starts after deposit is received and confirmed</li>
                <li>Reference images help us understand your style - upload links below</li>
                <li>Most orders complete on time. For rush orders, contact us first</li>
              </ul>
            </section>
          </>
        )}

        {completed ? (
          <section className="custom-order-page__card">
            <h2 className="display-md">Your request is ready in WhatsApp.</h2>
            <p className="body-base">
              If WhatsApp did not open automatically,{" "}
              <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer">
                open it here
              </a>
              .
            </p>
            <Link href="/" className="custom-order-page__cta">
              Back to homepage
            </Link>
          </section>
        ) : (
          <form className="custom-order-page__card" onSubmit={handleSubmit(onSubmit)}>
            <div className="custom-order-page__grid">
              <label className="custom-order-page__field">
                <span>Full name *</span>
                <input className="admin-input" {...register("name", { required: "Name is required" })} />
                {errors.name ? <span className="custom-order-page__error">{errors.name.message}</span> : null}
              </label>
              <label className="custom-order-page__field">
                <span>Phone / WhatsApp *</span>
                <input className="admin-input" type="tel" {...register("phone", { required: "Phone is required" })} />
                {errors.phone ? <span className="custom-order-page__error">{errors.phone.message}</span> : null}
              </label>
            </div>

            <div className="custom-order-page__grid">
              <label className="custom-order-page__field">
                <span>What would you like made? *</span>
                <select className="admin-select" {...register("designType", { required: "Design type is required" })}>
                  <option value="">Choose one</option>
                  <option value="Necklace">Necklace</option>
                  <option value="Bracelet">Bracelet</option>
                  <option value="Earrings">Earrings</option>
                  <option value="Full set">Full set</option>
                  <option value="Home decor">Home decor</option>
                  <option value="Other">Other</option>
                </select>
                {errors.designType ? <span className="custom-order-page__error">{errors.designType.message}</span> : null}
              </label>
              <label className="custom-order-page__field">
                <span>Occasion</span>
                <input className="admin-input" placeholder="Bridal, gifting, event, everyday..." {...register("occasion")} />
              </label>
            </div>

            <div className="custom-order-page__grid">
              <label className="custom-order-page__field">
                <span>Preferred colors</span>
                <input className="admin-input" placeholder="Blue, white, gold..." {...register("colors")} />
              </label>
              <label className="custom-order-page__field">
                <span>Budget range</span>
                <input className="admin-input" placeholder="e.g. KES 2,500 - 4,000" {...register("budgetRange")} />
              </label>
            </div>

            <div className="custom-order-page__grid">
              <label className="custom-order-page__field">
                <span>Needed by date</span>
                <input type="date" className="admin-input" {...register("neededBy")} />
              </label>
              <label className="custom-order-page__field">
                <span>Reference image link</span>
                <input className="admin-input" placeholder="Paste a Pinterest, Instagram, or image link" {...register("referenceImage")} />
              </label>
            </div>

            <label className="custom-order-page__field">
              <span>Tell us the design idea *</span>
              <textarea
                className="admin-textarea"
                rows={6}
                placeholder="Describe the look, style, colors, shape, or meaning you want."
                {...register("designBrief", { required: "Please describe the custom design" })}
              />
              {errors.designBrief ? <span className="custom-order-page__error">{errors.designBrief.message}</span> : null}
            </label>

            <button type="submit" className="custom-order-page__cta" disabled={submitting}>
              {submitting ? "Saving request..." : "Send Custom Request via WhatsApp"}
            </button>
            {submitError ? <p className="custom-order-page__error">{submitError}</p> : null}
          </form>
        )}
      </main>
      <Footer />

      <style jsx>{`
        .custom-order-page {
          max-width: var(--max-width);
          margin: 0 auto;
          padding: calc(var(--nav-height) + var(--space-6)) var(--gutter) var(--space-7);
          display: grid;
          gap: var(--space-5);
        }
        .custom-order-page__intro {
          display: grid;
          gap: var(--space-3);
          max-width: 60ch;
        }
        .custom-order-page__section-title {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0;
          color: var(--text-primary);
        }
        .custom-order-page__how-it-works {
          background: var(--color-white);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-lg);
          padding: var(--space-6);
        }
        .custom-order-page__process-steps {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--space-4);
          margin-top: var(--space-4);
        }
        .process-step {
          display: flex;
          gap: var(--space-3);
        }
        .process-step__number {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: var(--color-terracotta);
          color: white;
          font-weight: 600;
          font-size: 1.25rem;
          flex-shrink: 0;
        }
        .process-step__content h3 {
          margin: 0 0 var(--space-2) 0;
          font-size: 1rem;
          font-weight: 600;
        }
        .process-step__content p {
          margin: 0;
          font-size: 0.9rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }
        .custom-order-page__pricing {
          background: var(--color-white);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-lg);
          padding: var(--space-6);
        }
        .custom-order-page__pricing-table {
          margin-top: var(--space-4);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-md);
          overflow: hidden;
        }
        .pricing-row {
          display: grid;
          grid-template-columns: 2fr 1.5fr 1.5fr;
          gap: var(--space-4);
          padding: var(--space-4);
          border-bottom: 1px solid var(--border-default);
          align-items: center;
        }
        .pricing-row:last-child {
          border-bottom: none;
        }
        .pricing-row--header {
          background: var(--bg-secondary);
          font-weight: 600;
          border-bottom: 2px solid var(--border-default);
        }
        .pricing-row div {
          font-size: 0.95rem;
        }
        .pricing-row--header div {
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-secondary);
        }
        .custom-order-page__pricing-note {
          margin-top: var(--space-4);
          padding: var(--space-3);
          background: var(--bg-secondary);
          border-radius: var(--radius-md);
          font-size: 0.9rem;
          color: var(--text-secondary);
          line-height: 1.6;
        }
        .custom-order-page__important {
          background: var(--color-white);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-lg);
          padding: var(--space-6);
        }
        .custom-order-page__important h3 {
          margin: 0 0 var(--space-3) 0;
          font-size: 1.1rem;
          font-weight: 600;
        }
        .custom-order-page__details-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: grid;
          gap: var(--space-2);
        }
        .custom-order-page__details-list li {
          padding-left: var(--space-4);
          position: relative;
          font-size: 0.95rem;
          color: var(--text-secondary);
          line-height: 1.6;
        }
        .custom-order-page__details-list li:before {
          content: "✓";
          position: absolute;
          left: 0;
          color: var(--color-moss);
          font-weight: bold;
        }
        .custom-order-page__card {
          background: var(--color-white);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-lg);
          padding: var(--space-5);
          display: grid;
          gap: var(--space-4);
        }
        .custom-order-page__grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: var(--space-4);
        }
        .custom-order-page__field {
          display: grid;
          gap: var(--space-2);
        }
        .custom-order-page__cta {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 14px 20px;
          border-radius: var(--radius-md);
          background: var(--color-moss);
          color: var(--color-white);
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .custom-order-page__cta:hover:not(:disabled) {
          background: var(--color-moss-dark);
          transform: translateY(-2px);
        }
        .custom-order-page__cta:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .custom-order-page__error {
          color: var(--color-terracotta);
          font-size: 0.875rem;
        }
        @media (max-width: 767px) {
          .custom-order-page {
            padding: calc(var(--nav-height) + var(--space-4)) var(--gutter) var(--space-5);
            gap: var(--space-4);
          }
          .custom-order-page__grid {
            grid-template-columns: 1fr;
          }
          .custom-order-page__process-steps {
            grid-template-columns: 1fr;
          }
          .pricing-row {
            grid-template-columns: 1fr;
            gap: var(--space-2);
          }
          .pricing-row div {
            font-size: 0.9rem;
          }
        }
      `}</style>
    </>
  );
}
