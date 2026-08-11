import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { createClient } from "@supabase/supabase-js";
import Footer from "../components/Footer";
import Nav from "../components/Nav";
import SeoHead from "../components/SeoHead";

const WHATSAPP_NUMBER = "254112222572";
const PHONE_PATTERN = /^(\+?254|0)(7\d{8}|1\d{8})$/;

const PROCESS_STEPS = [
  {
    title: "Share Your Vision",
    description: "Describe what you want — style, colors, occasion, budget. Any detail helps.",
  },
  {
    title: "We Confirm & Quote",
    description: "Sharon reviews your request and sends you a quote within 2 hours on WhatsApp.",
  },
  {
    title: "50% Deposit",
    description: "Confirm your order with a 50% deposit via M-Pesa. Production begins immediately.",
  },
  {
    title: "Delivered to You",
    description: "Your piece is crafted and delivered in 5–7 days. Balance paid on delivery.",
  },
];

const CATEGORY_OPTIONS = [
  { value: "Jewellery", label: "Jewellery", icon: "jewellery" },
  { value: "Accessories", label: "Accessories", icon: "accessories" },
  { value: "African Wear", label: "African Wear", icon: "wear" },
  { value: "Home & Living", label: "Home & Living", icon: "home" },
  { value: "Art & Craft", label: "Art & Craft", icon: "art" },
  { value: "Gift Set", label: "Gift Set", icon: "gift" },
];

const WHAT_HAPPENS_NEXT = [
  {
    step: "01",
    title: "You get a WhatsApp reply, not silence.",
    description: "We send your quote and confirm the details within 2 hours so you know exactly what is possible.",
  },
  {
    step: "02",
    title: "Nothing is made before you approve it.",
    description: "You review the quote, ask questions, and only pay a 50% deposit once the direction feels right.",
  },
  {
    step: "03",
    title: "Your piece is crafted in Nairobi.",
    description: "Production starts after deposit, then we arrange delivery in 5–7 days and collect the balance on delivery.",
  },
];

const EXAMPLES = [
  {
    label: "Bridal Set",
    title: "A coordinated look for one important day.",
    description: "Perfect when you want a necklace, earrings, or full set built around a dress, event colors, or a wedding moodboard.",
  },
  {
    label: "Gifted Piece",
    title: "A meaningful request with personal details.",
    description: "Ideal for birthdays, anniversaries, and thoughtful gifts where color, symbolism, or cultural references matter.",
  },
  {
    label: "Statement Decor",
    title: "Custom work for a home, office, or event space.",
    description: "Useful when you need scale, palette, or placement considered before Sharon starts building the final piece.",
  },
];

function buildCustomWhatsAppMessage({
  orderReference,
  name,
  phone,
  email,
  designType,
  colors,
  occasion,
  budgetRange,
  neededBy,
  designBrief,
  referenceImage,
}) {
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
  if (email) lines.push(`Email: ${email}`);
  lines.push(`Category: ${designType}`);
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

function normalizePhone(value = "") {
  return String(value).replace(/[\s()-]/g, "");
}

function formatNeededBy(value) {
  if (!value) return "Flexible";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function CategoryIcon({ type }) {
  if (type === "jewellery") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="8" r="3.5" />
        <path d="M6.5 17.5c1.7-2.6 4-3.9 5.5-3.9s3.8 1.3 5.5 3.9" />
      </svg>
    );
  }

  if (type === "accessories") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 9.5h12v8H6z" />
        <path d="M8.5 9.5c0-2.4 1.4-4 3.5-4s3.5 1.6 3.5 4" />
      </svg>
    );
  }

  if (type === "wear") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M8 6.5 5 9l2 3v6h10v-6l2-3-3-2.5-2 2H10z" />
      </svg>
    );
  }

  if (type === "home") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4.5 11.5 12 5l7.5 6.5" />
        <path d="M7.5 10.5v8h9v-8" />
      </svg>
    );
  }

  if (type === "art") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7 16.5c-1.7 0-3-1.2-3-3 0-4.7 3.6-8 8-8 4.8 0 8 3.2 8 7.2 0 1.9-1.2 3.3-3 3.3h-1.2c-.6 0-1.1-.5-1.1-1.1 0-.7.3-1.4.3-2.2 0-1.9-1.5-3.5-3.6-3.5-2.7 0-4.4 1.7-4.4 4.3 0 .4 0 .7.1 1H7Z" />
        <circle cx="9" cy="10" r="1" />
        <circle cx="12" cy="8.5" r="1" />
        <circle cx="15" cy="10" r="1" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 5.5 14 9l3.9.6-2.8 2.8.7 4.1-3.8-2-3.8 2 .7-4.1L6.1 9.6 10 9z" />
    </svg>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="custom-order-page__summary-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default function CustomOrderPage({ heroImage }) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    clearErrors,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      designType: "",
      occasion: "",
      colors: "",
      budgetRange: "",
      neededBy: "",
      referenceImage: "",
      designBrief: "",
    },
  });

  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);

  const selectedCategory = watch("designType");
  const brief = watch("designBrief") || "";
  const summary = watch();

  const summaryItems = useMemo(
    () => [
      { label: "Category", value: summary.designType || "Choose the piece you want made" },
      { label: "Occasion", value: summary.occasion || "No special occasion yet" },
      { label: "Budget", value: summary.budgetRange || "Share a comfortable range" },
      { label: "Deadline", value: formatNeededBy(summary.neededBy) },
    ],
    [summary],
  );

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll(".reveal"));
    if (!elements.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12 },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  async function onSubmit(values) {
    setSubmitError("");
    setSubmitting(true);

    try {
      const payload = {
        ...values,
        phone: normalizePhone(values.phone),
        neededBy: values.neededBy || "",
      };

      const response = await fetch("/api/orders/custom-design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(body?.error || "We could not save your custom design request.");
      }

      const message = buildCustomWhatsAppMessage({
        ...payload,
        orderReference: body.orderReference,
      });
      const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
      const popup = window.open(url, "_blank", "noopener,noreferrer");

      if (!popup) {
        window.location.href = url;
      }

      setCompleted(true);
      reset();
    } catch (error) {
      setSubmitError(error.message || "We could not save your custom design request.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <SeoHead
        title="Custom Orders"
        description="Describe your custom SharonCraft piece, get a WhatsApp quote, and move from idea to handcrafted delivery with clarity."
        path="/custom-order"
      />
      <Nav />

      <main className="custom-order-page">
        <section className="custom-order-page__hero">
          {heroImage?.src ? (
            <div className="custom-order-page__hero-media" aria-hidden="true">
              <Image
                src={heroImage.src}
                alt={heroImage.alt || "SharonCraft artisan custom order inspiration"}
                fill
                priority
                sizes="100vw"
                className="custom-order-page__hero-image"
              />
            </div>
          ) : null}
          <span className="custom-order-page__hero-overlay" aria-hidden="true" />
          <span className="custom-order-page__hero-texture" aria-hidden="true" />

          <div className="custom-order-page__hero-content">
            <span className="custom-order-page__breadcrumb">
              <Link href="/">Home</Link>
              <span aria-hidden="true">›</span>
              <span>Custom Orders</span>
            </span>
            <span className="custom-order-page__eyebrow">MADE FOR YOU</span>
            <h1>
              <span>Your Vision.</span>
              <em>Our Craft.</em>
            </h1>
            <p>
              Tell us what you have in mind and we will bring it to life — handcrafted in Nairobi.
            </p>
          </div>
        </section>

        <section className="custom-order-page__process">
          <div className="custom-order-page__section-shell">
            <p className="custom-order-page__section-label reveal">THE PROCESS</p>
            <div className="custom-order-page__process-grid">
              <span className="custom-order-page__process-line" aria-hidden="true" />
              {PROCESS_STEPS.map((step, index) => (
                <article
                  key={step.title}
                  className="custom-order-page__process-step reveal"
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className="custom-order-page__process-circle">
                    <span>{index + 1}</span>
                  </div>
                  <h2>{step.title}</h2>
                  <p>{step.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="custom-order-page__form-section">
          <div className="custom-order-page__form-layout">
            {completed ? (
              <section className="custom-order-page__confirmation reveal visible">
                <p className="custom-order-page__section-label">REQUEST SENT</p>
                <h2>Your request is saved and ready in WhatsApp.</h2>
                <p>
                  If WhatsApp did not open automatically,{" "}
                  <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer">
                    continue here
                  </a>
                  . Sharon will review your brief and reply with the next steps.
                </p>
                <div className="custom-order-page__confirmation-actions">
                  <button
                    type="button"
                    className="custom-order-page__submit"
                    onClick={() => setCompleted(false)}
                  >
                    Send Another Request
                  </button>
                  <Link href="/" className="custom-order-page__text-link">
                    Back to home
                  </Link>
                </div>
              </section>
            ) : (
              <>
                <section className="custom-order-page__form-column">
                  <p className="custom-order-page__section-label reveal">YOUR REQUEST</p>

                  <form className="custom-order-page__form reveal" onSubmit={handleSubmit(onSubmit)}>
                    <label className="custom-order-page__field-group">
                      <span className="custom-order-page__label">
                        Your Name <em>*</em>
                      </span>
                      <input
                        type="text"
                        placeholder="Your full name"
                        aria-invalid={Boolean(errors.name)}
                        {...register("name", {
                          required: "Please enter your full name.",
                          minLength: {
                            value: 2,
                            message: "Your name should be at least 2 characters.",
                          },
                        })}
                      />
                      {errors.name ? <span className="custom-order-page__error">{errors.name.message}</span> : null}
                    </label>

                    <div className="custom-order-page__field-row">
                      <label className="custom-order-page__field-group">
                        <span className="custom-order-page__label">
                          WhatsApp Number <em>*</em>
                        </span>
                        <input
                          type="tel"
                          placeholder="+254 7XX XXX XXX"
                          aria-invalid={Boolean(errors.phone)}
                          {...register("phone", {
                            required: "Please enter the WhatsApp number for your quote.",
                            validate: (value) =>
                              PHONE_PATTERN.test(normalizePhone(value))
                                ? true
                                : "Use a Kenyan number starting with +254, 07, or 01.",
                          })}
                        />
                        <span className="custom-order-page__helper">We will send your quote here.</span>
                        {errors.phone ? <span className="custom-order-page__error">{errors.phone.message}</span> : null}
                      </label>

                      <label className="custom-order-page__field-group">
                        <span className="custom-order-page__label">Email Address</span>
                        <input
                          type="email"
                          placeholder="Optional backup contact"
                          aria-invalid={Boolean(errors.email)}
                          {...register("email")}
                        />
                      </label>
                    </div>

                    <div className="custom-order-page__field-group">
                      <span className="custom-order-page__label">
                        Product Category <em>*</em>
                      </span>
                      <input
                        type="hidden"
                        {...register("designType", {
                          required: "Choose the kind of piece you want made.",
                        })}
                      />
                      <div className="custom-order-page__category-grid" role="radiogroup" aria-label="Product category">
                        {CATEGORY_OPTIONS.map((option) => {
                          const isSelected = selectedCategory === option.value;
                          return (
                            <button
                              key={option.value}
                              type="button"
                              role="radio"
                              aria-checked={isSelected}
                              className={`custom-order-page__category-card ${isSelected ? "custom-order-page__category-card--selected" : ""}`}
                              onClick={() => {
                                setValue("designType", option.value, { shouldDirty: true, shouldValidate: true });
                                clearErrors("designType");
                              }}
                            >
                              <CategoryIcon type={option.icon} />
                              <span>{option.label}</span>
                            </button>
                          );
                        })}
                      </div>
                      {errors.designType ? <span className="custom-order-page__error">{errors.designType.message}</span> : null}
                    </div>

                    <div className="custom-order-page__field-row">
                      <label className="custom-order-page__field-group">
                        <span className="custom-order-page__label">Occasion</span>
                        <input
                          type="text"
                          placeholder="Wedding, gift, event, everyday..."
                          aria-invalid={Boolean(errors.occasion)}
                          {...register("occasion")}
                        />
                      </label>

                      <label className="custom-order-page__field-group">
                        <span className="custom-order-page__label">Preferred Colors</span>
                        <input
                          type="text"
                          placeholder="Gold, ivory, black, terracotta..."
                          aria-invalid={Boolean(errors.colors)}
                          {...register("colors")}
                        />
                      </label>
                    </div>

                    <div className="custom-order-page__field-row">
                      <label className="custom-order-page__field-group">
                        <span className="custom-order-page__label">Budget Range</span>
                        <input
                          type="text"
                          placeholder="e.g. KES 4,000 - 7,500"
                          aria-invalid={Boolean(errors.budgetRange)}
                          {...register("budgetRange")}
                        />
                      </label>

                      <label className="custom-order-page__field-group">
                        <span className="custom-order-page__label">Needed By</span>
                        <input type="date" aria-invalid={Boolean(errors.neededBy)} {...register("neededBy")} />
                      </label>
                    </div>

                    <label className="custom-order-page__field-group">
                      <span className="custom-order-page__label">Reference Link</span>
                        <input
                          type="url"
                          placeholder="Pinterest, Instagram, or any image link"
                          aria-invalid={Boolean(errors.referenceImage)}
                          {...register("referenceImage")}
                        />
                    </label>

                    <label className="custom-order-page__field-group">
                      <span className="custom-order-page__label">
                        Describe Your Piece <em>*</em>
                      </span>
                      <textarea
                        rows={6}
                        placeholder="Describe what you have in mind. Include colors, style, size, materials if you know them, or just describe the vibe..."
                        aria-invalid={Boolean(errors.designBrief)}
                        {...register("designBrief", {
                          required: "Please describe what you want made.",
                          minLength: {
                            value: 20,
                            message: "Please give a little more detail so we can quote accurately.",
                          },
                        })}
                      />
                      <div className="custom-order-page__field-footer">
                        {errors.designBrief ? (
                          <span className="custom-order-page__error">{errors.designBrief.message}</span>
                        ) : (
                          <span className="custom-order-page__helper">The clearer the brief, the faster the quote.</span>
                        )}
                        <span className="custom-order-page__counter">{brief.length} characters</span>
                      </div>
                    </label>

                    <button type="submit" className="custom-order-page__submit" disabled={submitting}>
                      {submitting ? "Saving Your Request..." : "Send Custom Request"}
                    </button>
                    {submitError ? <p className="custom-order-page__error custom-order-page__submit-error">{submitError}</p> : null}
                  </form>
                </section>

                <aside className="custom-order-page__side-column reveal">
                  <div className="custom-order-page__summary-card">
                    <p className="custom-order-page__panel-label">REQUEST SUMMARY</p>
                    <h2>Everything Sharon needs, in one place.</h2>
                    <div className="custom-order-page__summary-table">
                      {summaryItems.map((item) => (
                        <SummaryRow key={item.label} label={item.label} value={item.value} />
                      ))}
                    </div>
                  </div>

                  <div className="custom-order-page__tips-card">
                    <p className="custom-order-page__panel-label">TO HELP US QUOTE FASTER</p>
                    <ul>
                      <li>Mention where you plan to wear or use the piece.</li>
                      <li>Tell us the colors or materials you already know you want.</li>
                      <li>Share a budget range so we can suggest realistic options.</li>
                      <li>Add a link if you have a reference image or inspiration board.</li>
                    </ul>
                  </div>

                  <div className="custom-order-page__assurance-card">
                    <p className="custom-order-page__panel-label">WHAT MAKES THIS SAFE</p>
                    <div className="custom-order-page__assurance-grid">
                      <div>
                        <strong>2 hours</strong>
                        <span>Quote reply on WhatsApp</span>
                      </div>
                      <div>
                        <strong>50%</strong>
                        <span>Deposit only after approval</span>
                      </div>
                      <div>
                        <strong>5–7 days</strong>
                        <span>Typical production window</span>
                      </div>
                    </div>
                  </div>
                </aside>
              </>
            )}
          </div>
        </section>

        <section className="custom-order-page__next">
          <div className="custom-order-page__section-shell custom-order-page__next-layout">
            <div className="custom-order-page__next-copy reveal">
              <p className="custom-order-page__section-label">WHAT HAPPENS NEXT</p>
              <h2>No guesswork after you press send.</h2>
              <p>
                The process stays human, simple, and visible. You know when Sharon replies, when the quote is confirmed,
                and when production begins.
              </p>
            </div>

            <div className="custom-order-page__next-list">
              {WHAT_HAPPENS_NEXT.map((item, index) => (
                <article
                  key={item.step}
                  className="custom-order-page__next-item reveal"
                  style={{ transitionDelay: `${index * 120}ms` }}
                >
                  <span>{item.step}</span>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="custom-order-page__examples">
          <div className="custom-order-page__section-shell">
            <p className="custom-order-page__section-label reveal">EXAMPLES</p>
            <div className="custom-order-page__examples-heading reveal">
              <h2>Some requests start with a full brief. Others start with a feeling.</h2>
              <p>
                Either works. The page is built to help Sharon understand both.
              </p>
            </div>

            <div className="custom-order-page__examples-grid">
              {EXAMPLES.map((example, index) => (
                <article
                  key={example.label}
                  className="custom-order-page__example-card reveal"
                  style={{ transitionDelay: `${index * 120}ms` }}
                >
                  <span>{example.label}</span>
                  <h3>{example.title}</h3>
                  <p>{example.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <style jsx>{`
        .custom-order-page {
          --cream: #fafaf8;
          --card-bg: #f5f0eb;
          --dark: #1c1c1c;
          --black: #080808;
          --brown: #8b5e3c;
          --dark-brown: #3d1f0d;
          --border: rgba(0, 0, 0, 0.08);
          --muted: #bbb;
          --text: #666;
          background: var(--cream);
          color: var(--dark);
          overflow: hidden;
        }

        .custom-order-page :global(*) {
          box-sizing: border-box;
        }

        .custom-order-page :global(.reveal) {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }

        .custom-order-page :global(.reveal.visible) {
          opacity: 1;
          transform: translateY(0);
        }

        .custom-order-page__section-shell,
        .custom-order-page__form-layout {
          width: min(1280px, calc(100% - 40px));
          margin: 0 auto;
        }

        .custom-order-page__hero {
          position: relative;
          min-height: 380px;
          background: linear-gradient(135deg, #0e0a08 0%, #1a0e08 40%, #3d1f0d 75%, #8b5e3c 100%);
          overflow: hidden;
        }

        .custom-order-page__hero-media {
          position: absolute;
          inset: 0;
        }

        .custom-order-page__hero-image {
          object-fit: cover;
          object-position: center top;
        }

        .custom-order-page__hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to right, rgba(0, 0, 0, 0.75) 0%, rgba(0, 0, 0, 0.3) 60%, rgba(0, 0, 0, 0.1) 100%);
          pointer-events: none;
        }

        .custom-order-page__hero-texture {
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            45deg,
            transparent,
            transparent 60px,
            rgba(255, 255, 255, 0.015) 60px,
            rgba(255, 255, 255, 0.015) 61px
          );
          pointer-events: none;
        }

        .custom-order-page__hero-content {
          position: absolute;
          left: 6%;
          bottom: 10%;
          z-index: 2;
          max-width: 560px;
          animation: heroIn 0.8s ease 0.2s both;
        }

        .custom-order-page__breadcrumb {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 14px;
          font-size: 10px;
          letter-spacing: 1.5px;
          color: rgba(255, 255, 255, 0.35);
          text-transform: uppercase;
        }

        .custom-order-page__breadcrumb a {
          transition: color 0.2s ease;
        }

        .custom-order-page__breadcrumb a:hover {
          color: rgba(255, 255, 255, 0.7);
        }

        .custom-order-page__eyebrow {
          display: block;
          margin-bottom: 12px;
          font-size: 10px;
          letter-spacing: 6px;
          color: var(--brown);
        }

        .custom-order-page__hero-content h1 {
          margin: 0 0 14px;
          display: grid;
          gap: 2px;
          font-size: 44px;
          line-height: 1.1;
          letter-spacing: -0.5px;
          color: #fff;
          font-weight: 300;
          font-family: var(--font-body);
        }

        .custom-order-page__hero-content h1 em {
          font-style: italic;
          color: rgba(255, 255, 255, 0.6);
        }

        .custom-order-page__hero-content p {
          max-width: 380px;
          margin: 0;
          font-size: 13px;
          line-height: 1.7;
          color: rgba(255, 255, 255, 0.4);
        }

        .custom-order-page__process,
        .custom-order-page__next {
          background: #fff;
          border-bottom: 0.5px solid var(--border);
        }

        .custom-order-page__process {
          padding: 72px 0;
        }

        .custom-order-page__section-label,
        .custom-order-page__panel-label {
          margin: 0;
          font-size: 9px;
          letter-spacing: 5px;
          text-transform: uppercase;
          color: var(--muted);
        }

        .custom-order-page__process > .custom-order-page__section-shell > .custom-order-page__section-label {
          margin-bottom: 40px;
          text-align: center;
        }

        .custom-order-page__process-grid {
          position: relative;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0;
        }

        .custom-order-page__process-line {
          position: absolute;
          top: 24px;
          left: 12%;
          right: 12%;
          height: 0.5px;
          background: linear-gradient(
            to right,
            transparent 0%,
            rgba(0, 0, 0, 0.1) 20%,
            rgba(0, 0, 0, 0.1) 80%,
            transparent 100%
          );
          pointer-events: none;
          z-index: 0;
        }

        .custom-order-page__process-step {
          position: relative;
          z-index: 1;
          padding: 0 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .custom-order-page__process-circle {
          width: 48px;
          height: 48px;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 0.5px solid rgba(0, 0, 0, 0.12);
          border-radius: 50%;
          background: #fff;
        }

        .custom-order-page__process-circle span {
          font-size: 15px;
          font-weight: 300;
          color: var(--dark);
        }

        .custom-order-page__process-step h2 {
          margin: 0 0 8px;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.5px;
          color: var(--dark);
        }

        .custom-order-page__process-step p {
          max-width: 160px;
          margin: 0;
          font-size: 11px;
          line-height: 1.7;
          color: #999;
        }

        .custom-order-page__form-section {
          padding: 72px 0;
          background: var(--cream);
        }

        .custom-order-page__form-layout {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(320px, 380px);
          gap: 80px;
          align-items: start;
        }

        .custom-order-page__form-column,
        .custom-order-page__side-column {
          min-width: 0;
        }

        .custom-order-page__form-column > .custom-order-page__section-label {
          margin-bottom: 28px;
        }

        .custom-order-page__form {
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .custom-order-page__field-row {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 20px;
        }

        .custom-order-page__field-group {
          display: block;
          margin-bottom: 28px;
        }

        .custom-order-page__label {
          display: block;
          margin-bottom: 8px;
          font-size: 9px;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: var(--muted);
        }

        .custom-order-page__label em {
          font-style: normal;
          color: var(--brown);
          font-size: 10px;
        }

        .custom-order-page__field-group input,
        .custom-order-page__field-group textarea {
          width: 100%;
          border: 0.5px solid rgba(0, 0, 0, 0.15);
          border-radius: 0;
          background: #fff;
          color: var(--dark);
          outline: none;
          font-size: 13px;
          letter-spacing: 0.3px;
          font-family: inherit;
          transition: border-color 0.2s ease, background 0.2s ease;
        }

        .custom-order-page__field-group input {
          height: 44px;
          padding: 0 14px;
        }

        .custom-order-page__field-group textarea {
          min-height: 120px;
          padding: 12px 14px;
          resize: vertical;
        }

        .custom-order-page__field-group input:focus,
        .custom-order-page__field-group textarea:focus {
          border-color: var(--brown);
          background: #fff;
        }

        .custom-order-page__field-group input[aria-invalid="true"],
        .custom-order-page__field-group textarea[aria-invalid="true"] {
          border-color: #c0392b;
        }

        .custom-order-page__field-group input::placeholder,
        .custom-order-page__field-group textarea::placeholder {
          color: rgba(0, 0, 0, 0.2);
          font-size: 12px;
        }

        .custom-order-page__helper {
          display: block;
          margin-top: 5px;
          font-size: 10px;
          color: var(--muted);
        }

        .custom-order-page__error {
          display: block;
          margin-top: 5px;
          color: #c0392b;
          font-size: 10px;
          letter-spacing: 0.5px;
        }

        .custom-order-page__field-footer {
          margin-top: 5px;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
        }

        .custom-order-page__counter {
          flex-shrink: 0;
          font-size: 10px;
          letter-spacing: 0.5px;
          color: var(--muted);
        }

        .custom-order-page__category-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 8px;
        }

        .custom-order-page__category-card {
          min-height: 92px;
          padding: 12px 10px;
          border: 0.5px solid rgba(0, 0, 0, 0.12);
          border-radius: 2px;
          background: #fff;
          text-align: center;
          transition: border-color 0.2s ease, background 0.2s ease;
          color: #999;
        }

        .custom-order-page__category-card:hover,
        .custom-order-page__category-card:focus-visible {
          border-color: rgba(0, 0, 0, 0.3);
          background: var(--cream);
        }

        .custom-order-page__category-card--selected {
          border-width: 1.5px;
          border-color: var(--dark);
          background: var(--cream);
          color: var(--dark);
        }

        .custom-order-page__category-card :global(svg) {
          width: 20px;
          height: 20px;
          margin: 0 auto;
          fill: none;
          stroke: currentColor;
          stroke-width: 1.35;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .custom-order-page__category-card span {
          display: block;
          margin-top: 6px;
          font-size: 10px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
        }

        .custom-order-page__submit {
          width: 100%;
          height: 48px;
          border: 0.5px solid var(--black);
          border-radius: 2px;
          background: var(--black);
          color: #fff;
          font-size: 11px;
          font-weight: 400;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
        }

        .custom-order-page__submit:hover:not(:disabled),
        .custom-order-page__submit:focus-visible {
          background: var(--brown);
          border-color: var(--brown);
          transform: translateY(-1px);
        }

        .custom-order-page__submit:disabled {
          opacity: 0.6;
          transform: none;
          cursor: not-allowed;
        }

        .custom-order-page__submit-error {
          margin-top: 12px;
        }

        .custom-order-page__side-column {
          position: sticky;
          top: calc(var(--announcement-height) + var(--nav-height) + 32px);
          display: grid;
          gap: 16px;
        }

        .custom-order-page__summary-card,
        .custom-order-page__tips-card,
        .custom-order-page__assurance-card,
        .custom-order-page__example-card,
        .custom-order-page__confirmation {
          border: 0.5px solid var(--border);
          border-radius: 2px;
          background: var(--card-bg);
        }

        .custom-order-page__summary-card,
        .custom-order-page__tips-card,
        .custom-order-page__assurance-card {
          padding: 24px;
        }

        .custom-order-page__summary-card h2,
        .custom-order-page__confirmation h2 {
          margin: 12px 0 0;
          font-size: 26px;
          line-height: 1.25;
          font-weight: 300;
          letter-spacing: -0.3px;
          font-family: var(--font-body);
          color: var(--dark);
        }

        .custom-order-page__summary-table {
          margin-top: 24px;
          border-top: 0.5px solid rgba(0, 0, 0, 0.08);
        }

        .custom-order-page__summary-row {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          padding: 12px 0;
          border-bottom: 0.5px solid rgba(0, 0, 0, 0.08);
        }

        .custom-order-page__summary-row span,
        .custom-order-page__summary-row strong {
          font-size: 11px;
          line-height: 1.6;
        }

        .custom-order-page__summary-row span {
          letter-spacing: 1.2px;
          text-transform: uppercase;
          color: #999;
          font-weight: 400;
        }

        .custom-order-page__summary-row strong {
          max-width: 60%;
          text-align: right;
          color: var(--dark);
          font-weight: 400;
        }

        .custom-order-page__tips-card ul {
          margin: 14px 0 0;
          padding: 0;
          display: grid;
          gap: 10px;
        }

        .custom-order-page__tips-card li {
          position: relative;
          padding-left: 16px;
          font-size: 12px;
          line-height: 1.7;
          color: var(--text);
        }

        .custom-order-page__tips-card li::before {
          content: "";
          position: absolute;
          left: 0;
          top: 8px;
          width: 5px;
          height: 5px;
          background: var(--brown);
        }

        .custom-order-page__assurance-grid {
          margin-top: 16px;
          display: grid;
          gap: 14px;
        }

        .custom-order-page__assurance-grid div {
          display: grid;
          gap: 3px;
          padding-top: 12px;
          border-top: 0.5px solid rgba(0, 0, 0, 0.08);
        }

        .custom-order-page__assurance-grid strong {
          font-size: 18px;
          font-weight: 300;
          color: var(--dark-brown);
        }

        .custom-order-page__assurance-grid span {
          font-size: 11px;
          line-height: 1.7;
          color: var(--text);
        }

        .custom-order-page__confirmation {
          grid-column: 1 / -1;
          padding: 32px;
        }

        .custom-order-page__confirmation p {
          max-width: 720px;
          margin: 14px 0 0;
          font-size: 14px;
          line-height: 1.8;
          color: var(--text);
        }

        .custom-order-page__confirmation a,
        .custom-order-page__text-link {
          color: var(--dark);
          text-decoration: underline;
          text-underline-offset: 3px;
        }

        .custom-order-page__confirmation-actions {
          margin-top: 24px;
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .custom-order-page__confirmation-actions .custom-order-page__submit {
          width: auto;
          padding: 0 24px;
        }

        .custom-order-page__next {
          padding: 72px 0;
        }

        .custom-order-page__next-layout {
          display: grid;
          grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr);
          gap: 60px;
          align-items: start;
        }

        .custom-order-page__next-copy h2,
        .custom-order-page__examples-heading h2 {
          margin: 18px 0 14px;
          font-size: 34px;
          line-height: 1.15;
          letter-spacing: -0.4px;
          font-weight: 300;
          font-family: var(--font-body);
        }

        .custom-order-page__next-copy p:last-child,
        .custom-order-page__examples-heading p {
          margin: 0;
          max-width: 460px;
          font-size: 13px;
          line-height: 1.9;
          color: var(--text);
        }

        .custom-order-page__next-list {
          display: grid;
          gap: 16px;
        }

        .custom-order-page__next-item {
          display: grid;
          grid-template-columns: 48px minmax(0, 1fr);
          gap: 18px;
          padding: 18px 0;
          border-top: 0.5px solid rgba(0, 0, 0, 0.1);
        }

        .custom-order-page__next-item:first-child {
          padding-top: 0;
          border-top: none;
        }

        .custom-order-page__next-item > span {
          font-size: 11px;
          letter-spacing: 2px;
          color: var(--brown);
        }

        .custom-order-page__next-item h3 {
          margin: 0 0 6px;
          font-size: 15px;
          line-height: 1.5;
          font-weight: 400;
          color: var(--dark);
        }

        .custom-order-page__next-item p {
          margin: 0;
          font-size: 12px;
          line-height: 1.8;
          color: var(--text);
        }

        .custom-order-page__examples {
          padding: 72px 0 88px;
          background: var(--cream);
        }

        .custom-order-page__examples-heading {
          display: grid;
          gap: 0;
          margin-bottom: 36px;
        }

        .custom-order-page__examples-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
        }

        .custom-order-page__example-card {
          padding: 24px;
          background: #fff;
        }

        .custom-order-page__example-card > span {
          display: block;
          margin-bottom: 24px;
          font-size: 10px;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: var(--brown);
        }

        .custom-order-page__example-card h3 {
          margin: 0 0 12px;
          font-size: 20px;
          line-height: 1.35;
          font-weight: 300;
          color: var(--dark);
          font-family: var(--font-body);
        }

        .custom-order-page__example-card p {
          margin: 0;
          font-size: 12px;
          line-height: 1.9;
          color: var(--text);
        }

        @keyframes heroIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 1024px) {
          .custom-order-page__form-layout,
          .custom-order-page__next-layout {
            grid-template-columns: 1fr;
            gap: 40px;
          }

          .custom-order-page__side-column {
            position: static;
          }

          .custom-order-page__examples-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 767px) {
          .custom-order-page__section-shell,
          .custom-order-page__form-layout {
            width: min(100%, calc(100% - 40px));
          }

          .custom-order-page__hero {
            min-height: 280px;
          }

          .custom-order-page__hero-content {
            left: 20px;
            right: 20px;
            bottom: 24px;
            max-width: none;
          }

          .custom-order-page__hero-content h1 {
            font-size: 26px;
          }

          .custom-order-page__hero-content p {
            display: none;
          }

          .custom-order-page__process,
          .custom-order-page__form-section,
          .custom-order-page__next,
          .custom-order-page__examples {
            padding: 48px 0;
          }

          .custom-order-page__process-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 20px 10px;
          }

          .custom-order-page__process-line {
            display: none;
          }

          .custom-order-page__process-step {
            padding: 20px 0;
          }

          .custom-order-page__field-row {
            grid-template-columns: 1fr;
          }

          .custom-order-page__category-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .custom-order-page__summary-row {
            flex-direction: column;
            align-items: flex-start;
          }

          .custom-order-page__summary-row strong {
            max-width: none;
            text-align: left;
          }

          .custom-order-page__next-copy h2,
          .custom-order-page__examples-heading h2,
          .custom-order-page__summary-card h2,
          .custom-order-page__confirmation h2 {
            font-size: 24px;
          }

          .custom-order-page__confirmation {
            padding: 24px;
          }

          .custom-order-page__confirmation-actions {
            flex-direction: column;
            align-items: flex-start;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .custom-order-page :global(.reveal),
          .custom-order-page :global(.reveal.visible),
          .custom-order-page__hero-content,
          .custom-order-page__submit,
          .custom-order-page__category-card {
            transition: none;
            animation: none;
            transform: none;
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}

export async function getServerSideProps() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return {
      props: {
        heroImage: null,
      },
    };
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data } = await supabase
      .from("hero_slides")
      .select("*")
      .eq("is_visible", true)
      .order("display_order", { ascending: true });

    const slides = Array.isArray(data) ? data : [];
    const matchingSlide = slides.find((slide) => {
      const values = [
        slide?.section,
        slide?.page,
        slide?.slug,
        slide?.headline,
        slide?.title,
      ]
        .filter(Boolean)
        .map((value) => String(value).toLowerCase());

      return values.some((value) => value === "custom-order" || value.includes("custom order") || value.includes("custom-order"));
    });

    const heroSrc =
      matchingSlide?.image_url ||
      matchingSlide?.image ||
      matchingSlide?.imageDesktop ||
      matchingSlide?.imageMobile ||
      null;

    return {
      props: {
        heroImage: heroSrc
          ? {
              src: heroSrc,
              alt: matchingSlide?.headline || matchingSlide?.title || "Custom SharonCraft artisan work",
            }
          : null,
      },
    };
  } catch (_error) {
    return {
      props: {
        heroImage: null,
      },
    };
  }
}
