import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Footer from "../components/Footer";
import SeoHead from "../components/SeoHead";

const BEAD_DOTS = [
  { top: "16%", left: "12%", size: 8, color: "#8B5E3C", opacity: 0.09 },
  { top: "22%", left: "28%", size: 6, color: "#1c1c1c", opacity: 0.07 },
  { top: "18%", left: "74%", size: 7, color: "#8B5E3C", opacity: 0.08 },
  { top: "30%", left: "88%", size: 5, color: "#1c1c1c", opacity: 0.08 },
  { top: "42%", left: "8%", size: 7, color: "#8B5E3C", opacity: 0.06 },
  { top: "48%", left: "22%", size: 5, color: "#1c1c1c", opacity: 0.09 },
  { top: "54%", left: "70%", size: 8, color: "#8B5E3C", opacity: 0.07 },
  { top: "58%", left: "90%", size: 6, color: "#1c1c1c", opacity: 0.06 },
  { top: "70%", left: "18%", size: 8, color: "#8B5E3C", opacity: 0.1 },
  { top: "74%", left: "42%", size: 5, color: "#1c1c1c", opacity: 0.08 },
  { top: "78%", left: "62%", size: 7, color: "#8B5E3C", opacity: 0.07 },
  { top: "82%", left: "84%", size: 6, color: "#1c1c1c", opacity: 0.07 },
];

function formatKes(value) {
  const amount = Number(value || 0);
  if (!Number.isFinite(amount) || amount <= 0) return "KES 0";
  return `KES ${amount.toLocaleString("en-KE")}`;
}

function relativeDateLabel(value) {
  if (!value) return "Not recently updated";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently updated";

  const diff = Date.now() - date.getTime();
  const day = 24 * 60 * 60 * 1000;
  const days = Math.max(0, Math.floor(diff / day));

  if (days === 0) return "Updated today";
  if (days === 1) return "Updated yesterday";
  if (days < 7) return `Updated ${days} days ago`;
  if (days < 30) return `Updated ${Math.floor(days / 7)} weeks ago`;
  return `Updated ${date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })}`;
}

function ShippingIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 7.5h12v9H3z" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <path d="M15 10h3.7l2.3 2.7v3.8H15z" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="8" cy="18" r="1.8" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="18" cy="18" r="1.8" fill="none" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <path d="M12 7.5v5l3.4 1.9" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3.5 18.5 6v5.4c0 4.2-2.7 7.8-6.5 9.1-3.8-1.3-6.5-4.9-6.5-9.1V6z" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <path d="m9.3 11.8 1.8 1.8 3.8-4" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19 7v4h-4" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.8 16.5A7 7 0 0 0 18.4 13M18.2 7.5A7 7 0 0 0 5.6 11" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function PackageIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m12 3.8 7 3.6v9.2l-7 3.6-7-3.6V7.4z" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <path d="m12 3.8 7 3.6-7 3.5-7-3.5zM12 10.9v9.3" fill="none" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function MessageIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 6.5h14v9H9.7L5 18.5z" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M8 10.2h8M8 13h5.4" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <path d="m8.6 12 2.2 2.2 4.6-4.8" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LoadingState() {
  return (
    <div className="shipping-page shipping-page--loading">
      <div className="shipping-hero shipping-hero--loading" />
      <div className="shipping-loading__body">
        <div className="shipping-loading__block" />
        <div className="shipping-loading__grid">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="shipping-loading__card" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ShippingReturnsPage() {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/page-content")
      .then((res) => res.json())
      .then((data) => {
        setContent(data.shipping || null);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load shipping:", err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (loading) return undefined;

    const elements = Array.from(
      document.querySelectorAll(".reveal, .reveal-left, .reveal-right"),
    );

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px",
      },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [loading]);

  const shippingData = useMemo(() => {
    const domestic = content?.domestic || {};
    const returns = content?.returns || {};

    const keyFacts = [
      {
        value: domestic.standardDelivery || "2–4 days",
        label: "Standard Delivery",
        helper: "Within Kenya",
      },
      {
        value: domestic.expressDelivery || "Same day",
        label: "Express Option",
        helper: "For urgent orders",
      },
      {
        value: formatKes(domestic.freeShippingThreshold || 0),
        label: "Free Delivery From",
        helper: "On qualifying orders",
      },
      {
        value: `${returns.window || 7} days`,
        label: "Returns Window",
        helper: "If something is wrong",
      },
    ];

    const shippingCards = [
      {
        title: "Standard Delivery",
        value: formatKes(domestic.standardRate || 0),
        meta: domestic.standardDelivery || "2–4 business days",
        note: "Reliable delivery for most orders across Kenya.",
        icon: <ShippingIcon />,
      },
      {
        title: "Express Delivery",
        value: formatKes(domestic.expressRate || 0),
        meta: domestic.expressDelivery || "Same day in Nairobi",
        note: "For last-minute gifting and urgent deliveries.",
        icon: <ClockIcon />,
      },
      {
        title: "Free Delivery",
        value: formatKes(domestic.freeShippingThreshold || 0),
        meta: "Order threshold",
        note: "Spend above this amount and delivery is on us.",
        icon: <CheckIcon />,
      },
    ];

    const processCards = [
      {
        title: "We confirm your order",
        body: "You receive an order confirmation and payment acknowledgement right away.",
        icon: <PackageIcon />,
      },
      {
        title: "We prepare and dispatch",
        body: "Ready pieces ship fast. Made-to-order items are communicated clearly before dispatch.",
        icon: <ShippingIcon />,
      },
      {
        title: "We keep you updated",
        body: "Tracking and delivery updates come through WhatsApp so you are never guessing.",
        icon: <MessageIcon />,
      },
    ];

    const returnCards = [
      {
        title: `${returns.window || 7}-day return window`,
        body: "If your order arrives damaged, incorrect, or not as expected, contact us quickly and we will help.",
        icon: <RefreshIcon />,
      },
      {
        title: "Clear return conditions",
        body:
          Array.isArray(returns.conditions) && returns.conditions.length > 0
            ? returns.conditions.slice(0, 3).join(" • ")
            : "Items should be unused, in original condition, and returned with any included packaging.",
        icon: <ShieldIcon />,
      },
      {
        title: "Refunds handled promptly",
        body:
          returns.refundTime ||
          "Approved refunds are processed as quickly as possible once the return is reviewed.",
        icon: <CheckIcon />,
      },
    ];

    return {
      keyFacts,
      shippingCards,
      processCards,
      returnCards,
      lastUpdatedLabel: relativeDateLabel(content?.lastUpdated),
      defectiveSupport:
        returns.defectiveReturn ||
        "If your piece arrives damaged or defective, we will guide you through the next step quickly.",
    };
  }, [content]);

  if (loading) {
    return (
      <>
        <SeoHead
          title="Shipping & Returns Kenya"
          description="Free delivery in Nairobi. Ships Kenya-wide in 5-7 days. 30-day returns. Secure M-Pesa checkout."
          keywords="shipping Kenya, Nairobi delivery, SharonCraft returns, M-Pesa checkout Kenya"
          path="/shipping"
        />
        <LoadingState />
        <Footer />
        <PageStyles />
      </>
    );
  }

  if (!content) return null;

  return (
    <>
      <SeoHead
        title="Shipping & Returns Kenya"
        description="Free delivery in Nairobi. Ships Kenya-wide in 5-7 days. 30-day returns. Secure M-Pesa checkout."
        keywords="shipping Kenya, Nairobi delivery, SharonCraft returns, M-Pesa checkout Kenya"
        path="/shipping"
      />

      <main className="shipping-page">
        <section className="shipping-hero">
          <div className="shipping-hero__texture" aria-hidden="true" />
          <div className="shipping-hero__beads" aria-hidden="true">
            {BEAD_DOTS.map((dot, index) => (
              <span
                key={index}
                className="shipping-hero__bead"
                style={{
                  top: dot.top,
                  left: dot.left,
                  width: `${dot.size}px`,
                  height: `${dot.size}px`,
                  background: dot.color,
                  opacity: dot.opacity,
                }}
              />
            ))}
          </div>

          <div className="shipping-hero__content">
            <span className="shipping-hero__breadcrumb">Home › Shipping & Returns</span>
            <div className="shipping-hero__eyebrow">
              <span />
              <strong>Shipping & Returns</strong>
              <span />
            </div>
            <h1>We take care of the rest.</h1>
            <p>Order with confidence. Here is everything you need to know.</p>
          </div>
        </section>

        <section className="shipping-glance">
          <div className="shipping-section__intro reveal">
            <span className="shipping-section__label shipping-section__label--light">
              Delivery At A Glance
            </span>
          </div>

          <div className="shipping-glance__grid">
            {shippingData.keyFacts.map((fact, index) => (
              <article
                key={fact.label}
                className="shipping-glance__item reveal"
                style={{ transitionDelay: `${index * 80}ms` }}
              >
                <strong>{fact.value}</strong>
                <h2>{fact.label}</h2>
                <p>{fact.helper}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="shipping-options">
          <div className="shipping-options__header reveal">
            <span className="shipping-section__label">Shipping Options</span>
            <h2>Choose the pace that suits you.</h2>
            <p>
              No vague timelines. No hidden surprises. Just clear delivery options before you
              place your order.
            </p>
          </div>

          <div className="shipping-options__grid">
            {shippingData.shippingCards.map((card, index) => (
              <article
                key={card.title}
                className="shipping-card reveal"
                style={{ transitionDelay: `${index * 80}ms` }}
              >
                <div className="shipping-card__icon">{card.icon}</div>
                <span className="shipping-card__label">{card.title}</span>
                <strong className="shipping-card__value">{card.value}</strong>
                <span className="shipping-card__meta">{card.meta}</span>
                <p>{card.note}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="shipping-process">
          <div className="shipping-process__copy reveal-left">
            <span className="shipping-section__label">What Happens Next</span>
            <h2>From payment to doorstep, you stay informed.</h2>
            <p>
              We do not leave you wondering whether your order was received, packed, or dispatched.
              You will know what is happening and when.
            </p>
            <div className="shipping-process__assurance">
              <span className="shipping-process__assurance-icon">
                <ShieldIcon />
              </span>
              <div>
                <strong>{shippingData.lastUpdatedLabel}</strong>
                <p>These timelines are reviewed regularly so expectations stay realistic.</p>
              </div>
            </div>
          </div>

          <div className="shipping-process__steps">
            {shippingData.processCards.map((step, index) => (
              <article
                key={step.title}
                className="shipping-process__step reveal-right"
                style={{ transitionDelay: `${index * 80}ms` }}
              >
                <div className="shipping-process__step-icon">{step.icon}</div>
                <span className="shipping-process__step-number">0{index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="shipping-returns">
          <div className="shipping-returns__header reveal">
            <span className="shipping-section__label">Returns, Handled Calmly</span>
            <h2>If something goes wrong, we make it right.</h2>
            <p>{shippingData.defectiveSupport}</p>
          </div>

          <div className="shipping-returns__grid">
            {shippingData.returnCards.map((card, index) => (
              <article
                key={card.title}
                className="shipping-returns__card reveal"
                style={{ transitionDelay: `${index * 80}ms` }}
              >
                <div className="shipping-returns__icon">{card.icon}</div>
                <h3>{card.title}</h3>
                <p>{card.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="shipping-contact reveal">
          <div className="shipping-contact__panel">
            <div>
              <span className="shipping-section__label">Still Unsure?</span>
              <h2>Ask us before you place the order.</h2>
              <p>
                If you need help with delivery timing, a return question, or a special request, we
                are happy to guide you before checkout.
              </p>
            </div>

            <div className="shipping-contact__actions">
              <a
                href="https://wa.me/254112222572"
                target="_blank"
                rel="noreferrer"
                className="shipping-contact__action"
              >
                WhatsApp Us
              </a>
              <a
                href="mailto:kelvinmark.services@gmail.com"
                className="shipping-contact__action shipping-contact__action--secondary"
              >
                Email Support
              </a>
              <Link href="/track-order" className="shipping-contact__link">
                Track an existing order
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <PageStyles />
    </>
  );
}

function PageStyles() {
  return (
    <style jsx global>{`
      .shipping-page {
        --cream: #fafaf8;
        --card-bg: #f5f0eb;
        --dark: #1c1c1c;
        --black: #080808;
        --brown: #8b5e3c;
        --border: rgba(0, 0, 0, 0.08);
        --muted: #bbb;
        --text: #666;
        background: var(--cream);
        color: var(--dark);
      }

      .shipping-page--loading {
        min-height: 70vh;
      }

      .shipping-loading__body {
        max-width: 1180px;
        margin: 0 auto;
        padding: 40px 24px 80px;
      }

      .shipping-loading__block,
      .shipping-loading__card,
      .shipping-hero--loading {
        background: linear-gradient(
          90deg,
          rgba(245, 240, 235, 0.9) 0%,
          rgba(255, 255, 255, 0.95) 50%,
          rgba(245, 240, 235, 0.9) 100%
        );
        background-size: 200% 100%;
        animation: shippingShimmer 1.4s ease infinite;
      }

      .shipping-loading__block {
        height: 180px;
        margin-bottom: 18px;
      }

      .shipping-loading__grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 16px;
      }

      .shipping-loading__card {
        height: 220px;
      }

      @keyframes shippingShimmer {
        from {
          background-position: 200% 0;
        }
        to {
          background-position: -200% 0;
        }
      }

      .reveal {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.6s ease, transform 0.6s ease;
      }

      .reveal.visible {
        opacity: 1;
        transform: translateY(0);
      }

      .reveal-left {
        opacity: 0;
        transform: translateX(-24px);
        transition: opacity 0.6s ease, transform 0.6s ease;
      }

      .reveal-left.visible {
        opacity: 1;
        transform: translateX(0);
      }

      .reveal-right {
        opacity: 0;
        transform: translateX(24px);
        transition: opacity 0.6s ease, transform 0.6s ease;
      }

      .reveal-right.visible {
        opacity: 1;
        transform: translateX(0);
      }

      @keyframes heroUp {
        from {
          opacity: 0;
          transform: translateY(18px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .shipping-hero {
        position: relative;
        height: 280px;
        overflow: hidden;
        background: var(--card-bg);
      }

      .shipping-hero__texture,
      .shipping-hero__beads {
        position: absolute;
        inset: 0;
        pointer-events: none;
      }

      .shipping-hero__texture {
        background-image:
          radial-gradient(circle at 10% 50%, rgba(139, 94, 60, 0.07) 0%, transparent 50%),
          radial-gradient(circle at 90% 50%, rgba(139, 94, 60, 0.05) 0%, transparent 50%);
      }

      .shipping-hero__bead {
        position: absolute;
        border-radius: 50%;
      }

      .shipping-hero__content {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        padding: 40px;
        text-align: center;
      }

      .shipping-hero__breadcrumb {
        display: block;
        margin-bottom: 16px;
        color: rgba(28, 28, 28, 0.3);
        font-size: 10px;
        letter-spacing: 1.5px;
        animation: heroUp 0.5s ease 0.2s both;
      }

      .shipping-hero__eyebrow {
        display: flex;
        align-items: center;
        gap: 14px;
        animation: heroUp 0.5s ease 0.3s both;
      }

      .shipping-hero__eyebrow span {
        width: 20px;
        height: 1px;
        background: var(--brown);
      }

      .shipping-hero__eyebrow strong {
        color: var(--brown);
        font-size: 9px;
        font-weight: 400;
        letter-spacing: 5px;
        text-transform: uppercase;
      }

      .shipping-hero h1 {
        margin: 14px 0 12px;
        color: var(--dark);
        font-size: 36px;
        font-weight: 300;
        letter-spacing: -0.3px;
        animation: heroUp 0.6s ease 0.4s both;
      }

      .shipping-hero p {
        margin: 0;
        color: #888;
        font-size: 13px;
        line-height: 1.7;
        animation: heroUp 0.5s ease 0.5s both;
      }

      .shipping-section__intro,
      .shipping-options,
      .shipping-process,
      .shipping-returns,
      .shipping-contact {
        max-width: 1180px;
        margin: 0 auto;
      }

      .shipping-section__label {
        display: inline-block;
        color: var(--muted);
        font-size: 9px;
        font-weight: 400;
        letter-spacing: 5px;
        text-transform: uppercase;
      }

      .shipping-section__label--light {
        color: rgba(255, 255, 255, 0.2);
      }

      .shipping-glance {
        background: var(--dark);
        padding: 64px 80px;
      }

      .shipping-glance .shipping-section__intro {
        margin-bottom: 48px;
        text-align: center;
      }

      .shipping-glance__grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
      }

      .shipping-glance__item {
        padding: 0 40px;
        text-align: center;
        border-right: 0.5px solid rgba(255, 255, 255, 0.06);
      }

      .shipping-glance__item:last-child {
        border-right: none;
      }

      .shipping-glance__item strong {
        display: block;
        margin-bottom: 10px;
        color: #fff;
        font-size: 30px;
        font-weight: 300;
        letter-spacing: -0.4px;
      }

      .shipping-glance__item h2 {
        margin: 0 0 8px;
        color: rgba(255, 255, 255, 0.8);
        font-size: 12px;
        font-weight: 500;
        letter-spacing: 0.5px;
      }

      .shipping-glance__item p {
        margin: 0;
        color: rgba(255, 255, 255, 0.36);
        font-size: 11px;
        line-height: 1.7;
      }

      .shipping-options {
        padding: 72px 40px;
      }

      .shipping-options__header,
      .shipping-returns__header {
        max-width: 640px;
        margin-bottom: 36px;
      }

      .shipping-options__header h2,
      .shipping-process__copy h2,
      .shipping-returns__header h2,
      .shipping-contact__panel h2 {
        margin: 14px 0 12px;
        color: var(--dark);
        font-size: 34px;
        font-weight: 300;
        letter-spacing: -0.4px;
        line-height: 1.1;
      }

      .shipping-options__header p,
      .shipping-process__copy p,
      .shipping-returns__header p,
      .shipping-contact__panel p {
        margin: 0;
        color: var(--text);
        font-size: 13px;
        line-height: 1.8;
      }

      .shipping-options__grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 16px;
      }

      .shipping-card,
      .shipping-returns__card,
      .shipping-process__step {
        background: #fff;
        border: 0.5px solid var(--border);
      }

      .shipping-card {
        padding: 22px 22px 24px;
      }

      .shipping-card__icon,
      .shipping-returns__icon,
      .shipping-process__step-icon,
      .shipping-process__assurance-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 34px;
        height: 34px;
        color: var(--brown);
      }

      .shipping-card__icon svg,
      .shipping-returns__icon svg,
      .shipping-process__step-icon svg,
      .shipping-process__assurance-icon svg {
        width: 22px;
        height: 22px;
      }

      .shipping-card__label,
      .shipping-card__meta {
        display: block;
      }

      .shipping-card__label {
        margin-top: 26px;
        color: var(--muted);
        font-size: 9px;
        font-weight: 400;
        letter-spacing: 3px;
        text-transform: uppercase;
      }

      .shipping-card__value {
        display: block;
        margin: 8px 0 6px;
        color: var(--dark);
        font-size: 26px;
        font-weight: 300;
      }

      .shipping-card__meta {
        color: var(--brown);
        font-size: 11px;
        font-weight: 400;
        letter-spacing: 0.2px;
      }

      .shipping-card p {
        margin: 16px 0 0;
        color: var(--text);
        font-size: 12px;
        line-height: 1.8;
      }

      .shipping-process {
        display: grid;
        grid-template-columns: 0.88fr 1.12fr;
        gap: 20px;
        padding: 0 40px 72px;
      }

      .shipping-process__copy {
        background: var(--card-bg);
        border: 0.5px solid var(--border);
        padding: 28px 28px 30px;
      }

      .shipping-process__assurance {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 14px;
        align-items: start;
        margin-top: 28px;
        padding-top: 20px;
        border-top: 0.5px solid var(--border);
      }

      .shipping-process__assurance strong {
        display: block;
        margin-bottom: 5px;
        color: var(--dark);
        font-size: 12px;
        font-weight: 500;
        letter-spacing: 0.4px;
      }

      .shipping-process__assurance p {
        margin: 0;
        color: #888;
        font-size: 11px;
        line-height: 1.8;
      }

      .shipping-process__steps {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 16px;
      }

      .shipping-process__step {
        padding: 24px 20px 22px;
      }

      .shipping-process__step-number {
        display: block;
        margin: 24px 0 8px;
        color: var(--muted);
        font-size: 9px;
        font-weight: 400;
        letter-spacing: 3px;
      }

      .shipping-process__step h3,
      .shipping-returns__card h3 {
        margin: 0 0 10px;
        color: var(--dark);
        font-size: 16px;
        font-weight: 400;
        letter-spacing: -0.1px;
      }

      .shipping-process__step p,
      .shipping-returns__card p {
        margin: 0;
        color: var(--text);
        font-size: 12px;
        line-height: 1.8;
      }

      .shipping-returns {
        padding: 0 40px 72px;
      }

      .shipping-returns__grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 16px;
      }

      .shipping-returns__card {
        padding: 24px 22px;
      }

      .shipping-returns__icon {
        margin-bottom: 22px;
      }

      .shipping-contact {
        padding: 0 40px 80px;
      }

      .shipping-contact__panel {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 28px;
        align-items: center;
        padding: 30px;
        background: var(--card-bg);
        border: 0.5px solid var(--border);
      }

      .shipping-contact__actions {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
      }

      .shipping-contact__action {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 220px;
        height: 44px;
        padding: 0 20px;
        border: 1px solid var(--dark);
        background: var(--dark);
        color: #fff;
        font-size: 10px;
        font-weight: 400;
        letter-spacing: 3px;
        text-transform: uppercase;
        text-decoration: none;
        transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease;
      }

      .shipping-contact__action:hover {
        background: var(--brown);
        border-color: var(--brown);
      }

      .shipping-contact__action--secondary {
        background: transparent;
        color: var(--dark);
      }

      .shipping-contact__action--secondary:hover {
        background: rgba(139, 94, 60, 0.05);
        color: var(--brown);
      }

      .shipping-contact__link {
        color: #888;
        font-size: 11px;
        font-weight: 400;
        letter-spacing: 0.2px;
        text-decoration: none;
      }

      .shipping-contact__link:hover {
        color: var(--dark);
      }

      @media (max-width: 1024px) {
        .shipping-glance {
          padding: 56px 28px;
        }

        .shipping-glance__item {
          padding: 0 20px;
        }

        .shipping-options,
        .shipping-process,
        .shipping-returns,
        .shipping-contact {
          padding-left: 24px;
          padding-right: 24px;
        }

        .shipping-process {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 767px) {
        .shipping-hero {
          height: 200px;
        }

        .shipping-hero__content {
          padding: 24px 20px;
        }

        .shipping-hero h1 {
          font-size: 24px;
        }

        .shipping-glance {
          padding: 48px 24px;
        }

        .shipping-glance .shipping-section__intro {
          margin-bottom: 28px;
        }

        .shipping-glance__grid,
        .shipping-options__grid,
        .shipping-process__steps,
        .shipping-returns__grid,
        .shipping-contact__panel {
          grid-template-columns: 1fr;
        }

        .shipping-glance__item {
          padding: 18px 0;
          border-right: none;
          border-bottom: 0.5px solid rgba(255, 255, 255, 0.06);
        }

        .shipping-glance__item:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .shipping-glance__item:first-child {
          padding-top: 0;
        }

        .shipping-options {
          padding: 48px 20px;
        }

        .shipping-options__header h2,
        .shipping-process__copy h2,
        .shipping-returns__header h2,
        .shipping-contact__panel h2 {
          font-size: 24px;
        }

        .shipping-process,
        .shipping-returns,
        .shipping-contact {
          padding: 0 20px 48px;
        }

        .shipping-process__copy,
        .shipping-card,
        .shipping-process__step,
        .shipping-returns__card,
        .shipping-contact__panel {
          padding: 22px 18px;
        }

        .shipping-contact__panel {
          gap: 20px;
        }

        .shipping-contact__action {
          width: 100%;
          min-width: 0;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .reveal,
        .reveal-left,
        .reveal-right,
        .shipping-hero__breadcrumb,
        .shipping-hero__eyebrow,
        .shipping-hero h1,
        .shipping-hero p,
        .shipping-loading__block,
        .shipping-loading__card {
          opacity: 1 !important;
          transform: none !important;
          transition: 0.01s !important;
          animation: none !important;
        }
      }
    `}</style>
  );
}
