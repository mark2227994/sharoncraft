import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import Footer from "../components/Footer";
import Nav from "../components/Nav";

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
        }
        .custom-order-page__error {
          color: var(--color-terracotta);
          font-size: 0.875rem;
        }
        @media (max-width: 767px) {
          .custom-order-page__grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}
