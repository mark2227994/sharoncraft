'use client';

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import SeoHead from "../components/SeoHead";
import { SITE_URL } from "../lib/constants";
import {
  CONTACT_EMAIL,
  CONTACT_LOCATION,
  CONTACT_WHATSAPP,
  buildWhatsAppUrl,
} from "../lib/contact";

const LAST_UPDATED = "May 2026";

const shortPromises = [
  {
    title: "We never sell your data",
    description:
      "Your personal information stays with SharonCraft. We do not sell, share or rent your data to anyone. Ever.",
    icon: (
      <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#8B5E3C" strokeWidth="1.2">
        <rect x="3" y="11" width="18" height="11" rx="0" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
  },
  {
    title: "We only collect what we need",
    description:
      "We only ask for your name and WhatsApp number to process your order and keep you updated. Nothing more.",
    icon: (
      <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#8B5E3C" strokeWidth="1.2">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </svg>
    ),
  },
  {
    title: "Your data is secure",
    description:
      "All data is stored securely in our encrypted database. We use industry-standard security for customer information and transactions.",
    icon: (
      <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#8B5E3C" strokeWidth="1.2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
];

const contents = [
  { id: "what-we-collect", number: "01", title: "What we collect" },
  { id: "how-we-use", number: "02", title: "How we use your data" },
  { id: "whatsapp", number: "03", title: "WhatsApp communication" },
  { id: "payments", number: "04", title: "M-Pesa and payments" },
  { id: "cookies", number: "05", title: "Cookies" },
  { id: "third-parties", number: "06", title: "Third party services" },
  { id: "data-storage", number: "07", title: "Data storage and security" },
  { id: "your-rights", number: "08", title: "Your rights" },
  { id: "childrens-privacy", number: "09", title: "Children's privacy" },
  { id: "contact-us", number: "10", title: "Contact us" },
  { id: "updates", number: "11", title: "Changes to this policy" },
];

const dataTableRows = [
  ["Contact info", "To send your order and reply to your messages", "Name, WhatsApp number, email"],
  ["Order details", "To fulfil your purchase", "Products ordered, delivery address, payment method"],
  ["Communication history", "To keep your order records", "WhatsApp messages about your order"],
  ["Website usage", "To improve the website", "Pages visited, browser type (anonymous)"],
];

const cookieRows = [
  ["session", "Keeps you logged in to your account", "Session"],
  ["cart", "Saves your shopping cart between visits", "30 days"],
  ["preferences", "Remembers your settings like view preferences", "1 year"],
  ["analytics", "Anonymous page view counting to improve the site", "1 year"],
];

const services = [
  {
    name: "Supabase",
    description: "Stores your order information and account data securely.",
    href: "https://supabase.com/privacy",
  },
  {
    name: "Vercel",
    description: "Hosts the SharonCraft website and serves web pages.",
    href: "https://vercel.com/legal/privacy-policy",
  },
  {
    name: "WhatsApp (Meta)",
    description: "Used for order communication and customer support.",
    href: "https://www.whatsapp.com/legal/privacy-policy",
  },
  {
    name: "M-Pesa (Safaricom)",
    description: "Processes mobile payments for Kenyan orders.",
    href: "https://www.safaricom.co.ke/privacy",
  },
];

const rights = [
  {
    title: "Access your data",
    description: "Ask us to send you a copy of all the data we hold about you.",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#8B5E3C" strokeWidth="1.3">
        <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
        <path d="M14 3v6h6" />
      </svg>
    ),
  },
  {
    title: "Correct your data",
    description: "Ask us to fix any incorrect information we hold about you.",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#8B5E3C" strokeWidth="1.3">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
      </svg>
    ),
  },
  {
    title: "Delete your data",
    description: "Ask us to delete your personal data unless we are required by law to keep it.",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#8B5E3C" strokeWidth="1.3">
        <path d="M3 6h18" />
        <path d="M8 6V4h8v2" />
        <path d="M19 6l-1 14H6L5 6" />
      </svg>
    ),
  },
  {
    title: "Stop marketing",
    description: "Unsubscribe from our newsletter or ask us to stop promotional messages.",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#8B5E3C" strokeWidth="1.3">
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M10 21a2 2 0 0 0 4 0" />
        <line x1="3" y1="3" x2="21" y2="21" />
      </svg>
    ),
  },
  {
    title: "Data portability",
    description: "Ask us to send your data in a format you can use elsewhere.",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#8B5E3C" strokeWidth="1.3">
        <path d="M12 3v12" />
        <path d="M7 10l5 5 5-5" />
        <path d="M5 21h14" />
      </svg>
    ),
  },
  {
    title: "Complain",
    description: "If you believe we have misused your data you can contact the Kenya Data Protection Commissioner.",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#8B5E3C" strokeWidth="1.3">
        <path d="M4 4h16v11H7l-3 3V4z" />
        <path d="M12 8v3" />
        <circle cx="12" cy="13.5" r="0.8" fill="#8B5E3C" stroke="none" />
      </svg>
    ),
  },
];

const contactCards = [
  {
    title: "Data Controller",
    detail: "Kelvin Mark\nFounder, SharonCraft",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#8B5E3C" strokeWidth="1.3">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </svg>
    ),
  },
  {
    title: "WhatsApp",
    detail: "Available via website\nResponse within 24 hours",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#8B5E3C" strokeWidth="1.3">
        <path d="M21 11.5A8.5 8.5 0 0 1 8.6 19l-4.1 1 1.1-4A8.5 8.5 0 1 1 21 11.5z" />
      </svg>
    ),
  },
  {
    title: "Contact Form",
    detail: "sharoncraft.co.ke/contact\nOr use the form there",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#8B5E3C" strokeWidth="1.3">
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18" />
        <path d="M12 3a15 15 0 0 1 0 18" />
        <path d="M12 3a15 15 0 0 0 0 18" />
      </svg>
    ),
  },
  {
    title: "Based in",
    detail: "Nairobi, Kenya\nEst. 2024",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#8B5E3C" strokeWidth="1.3">
        <path d="M12 21s7-5.3 7-11a7 7 0 1 0-14 0c0 5.7 7 11 7 11z" />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
    ),
  },
];

function SectionBlock({ number, id, title, children, delay = "0ms" }) {
  return (
    <section id={id} className="policy-section reveal" style={{ transitionDelay: delay }}>
      <div className="policy-section__header">
        <div className="policy-section__number">{number}</div>
        <h2>{title}</h2>
      </div>
      <div className="policy-section__content">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  const pageRef = useRef(null);
  const [activeSection, setActiveSection] = useState(contents[0].id);

  const whatsappLink = useMemo(
    () =>
      buildWhatsAppUrl(
        process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || CONTACT_WHATSAPP,
        "Hi Sharon, I have a question about your privacy policy.",
      ),
    [],
  );

  useEffect(() => {
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
        threshold: 0.1,
        rootMargin: "0px 0px -40px 0px",
      },
    );

    pageRef.current
      ?.querySelectorAll(".reveal, .reveal-left")
      .forEach((node) => observer.observe(node));

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const sections = contents
      .map((item) => document.getElementById(item.id))
      .filter(Boolean);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        threshold: 0.3,
      },
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id) => {
    document.querySelector(`#${id}`)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Privacy Policy | SharonCraft",
    url: `${SITE_URL}/privacy`,
    description: "Privacy policy for SharonCraft — handmade Kenyan jewelry by Kelvin Mark.",
    author: {
      "@type": "Person",
      name: "Kelvin Mark",
    },
    publisher: {
      "@type": "Organization",
      name: "SharonCraft",
    },
    dateModified: "2026-05",
  };

  return (
    <>
      <SeoHead
        title="Privacy Policy"
        description="SharonCraft privacy policy. We never sell your data. Simple, clear and honest. Founded by Kelvin Mark, Nairobi Kenya."
        path="/privacy"
      />
      <Nav />

      <div ref={pageRef} className="privacy-page">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
        />

        <aside className="sticky-nav" aria-label="Privacy sections">
          {contents.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`sticky-nav__item ${activeSection === item.id ? "is-active" : ""}`}
              onClick={() => scrollToSection(item.id)}
            >
              <span className="sticky-nav__dot" />
              <span className="sticky-nav__label">{item.title}</span>
            </button>
          ))}
        </aside>

        <section className="hero">
          <div className="hero__glow" />
          <div className="hero__rules" />
          <span className="hero__dot hero__dot--one" />
          <span className="hero__dot hero__dot--two" />
          <span className="hero__dot hero__dot--three" />
          <span className="hero__dot hero__dot--four" />
          <span className="hero__dot hero__dot--five" />

          <div className="hero__content">
            <div className="hero__breadcrumb">Home · Privacy Policy</div>
            <div className="hero__eyebrow">
              <span />
              <span>PRIVACY POLICY</span>
              <span />
            </div>
            <h1>Your privacy matters.</h1>
            <p className="hero__sub">Simple. Clear. Honest.</p>
            <p className="hero__updated">Last updated: {LAST_UPDATED}</p>
          </div>
        </section>

        <section className="short-version">
          <div className="page-shell">
            <div className="section-label reveal">THE SHORT VERSION</div>
            <div className="short-version__grid">
              {shortPromises.map((item, index) => (
                <article
                  key={item.title}
                  className="short-card reveal"
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className="short-card__icon">{item.icon}</div>
                  <h2>{item.title}</h2>
                  <p>{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="toc">
          <div className="page-shell">
            <div className="section-label reveal">IN THIS POLICY</div>
            <div className="toc__grid">
              {contents.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  className="toc__item reveal"
                  style={{ transitionDelay: `${index * 40}ms` }}
                  onClick={() => scrollToSection(item.id)}
                >
                  <span className="toc__number">{item.number}</span>
                  <span className="toc__title">{item.title}</span>
                  <span className="toc__arrow">→</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="policy-wrap">
          <div className="policy-shell">
            <SectionBlock number="01" id="what-we-collect" title="What we collect">
              <p>
                When you place an order or contact us we collect only what we need to complete your order and communicate with you.
              </p>

              <table className="policy-table">
                <thead>
                  <tr>
                    <th>Type of Data</th>
                    <th>Why We Need It</th>
                    <th>Examples</th>
                  </tr>
                </thead>
                <tbody>
                  {dataTableRows.map((row) => (
                    <tr key={row[0]}>
                      <td>{row[0]}</td>
                      <td>{row[1]}</td>
                      <td>{row[2]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="highlight-box">
                We never collect your M-Pesa PIN, full bank account numbers or any financial login credentials.
              </div>
            </SectionBlock>

            <SectionBlock number="02" id="how-we-use" title="How we use your data" delay="80ms">
              <p>
                Your information is used for one purpose: to give you the best possible SharonCraft experience.
              </p>
              <ul className="policy-list">
                <li>Process and deliver your orders</li>
                <li>Send order updates and delivery notifications via WhatsApp</li>
                <li>Respond to your questions and requests</li>
                <li>Send you new arrival updates if you subscribed to our newsletter</li>
                <li>Improve our website and service based on how it is used</li>
                <li>Comply with Kenyan law and financial regulations</li>
              </ul>
              <div className="highlight-box">
                We will never use your data to send unsolicited marketing messages. If you receive a message from us, you either ordered from us or asked to hear from us.
              </div>
            </SectionBlock>

            <SectionBlock number="03" id="whatsapp" title="WhatsApp communication" delay="120ms">
              <p>
                SharonCraft uses WhatsApp as our primary customer communication channel. When you place an order or contact us:
              </p>
              <ul className="policy-list">
                <li>Sharon personally reads and replies to every message</li>
                <li>We save your order history to provide better service</li>
                <li>We never add you to broadcast lists without your permission</li>
                <li>You can message us to remove your number from our contacts at any time</li>
              </ul>
              <div className="highlight-box">
                Our WhatsApp number is used only for SharonCraft business. We never share it with third parties for marketing purposes.
              </div>
            </SectionBlock>

            <SectionBlock number="04" id="payments" title="M-Pesa and payments" delay="160ms">
              <p>
                All payment transactions are handled directly through M-Pesa, bank transfer or cash. We do not store full payment details on our servers.
              </p>
              <p>What we record:</p>
              <ul className="policy-list">
                <li>Amount paid</li>
                <li>Payment method used</li>
                <li>Date of payment</li>
                <li>M-Pesa confirmation code for order verification only</li>
              </ul>
              <div className="highlight-box highlight-box--danger">
                We never store your M-Pesa PIN, SIM card serial number, ID number or bank account login details. Never share these with anyone.
              </div>
            </SectionBlock>

            <SectionBlock number="05" id="cookies" title="Cookies" delay="200ms">
              <p>
                Our website uses a small number of cookies to make it work correctly.
              </p>
              <table className="policy-table">
                <thead>
                  <tr>
                    <th>Cookie name</th>
                    <th>Purpose</th>
                    <th>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {cookieRows.map((row) => (
                    <tr key={row[0]}>
                      <td>{row[0]}</td>
                      <td>{row[1]}</td>
                      <td>{row[2]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p>We do not use advertising cookies or tracking cookies that follow you across other websites.</p>
              <p>
                You can disable cookies in your browser settings. Some features like your cart may not work without cookies.
              </p>
            </SectionBlock>

            <SectionBlock number="06" id="third-parties" title="Third party services" delay="240ms">
              <p>
                To operate SharonCraft we use a small number of trusted third party services. Each handles your data according to their own privacy policies.
              </p>
              <div className="service-grid">
                {services.map((service) => (
                  <article key={service.name} className="service-card">
                    <h3>{service.name}</h3>
                    <p>{service.description}</p>
                    <a href={service.href} target="_blank" rel="noopener noreferrer">
                      View their privacy policy →
                    </a>
                  </article>
                ))}
              </div>
              <p>
                We do not share your data with any other third parties. We do not use Facebook Pixel, Google Ads tracking or any advertising networks.
              </p>
            </SectionBlock>

            <SectionBlock number="07" id="data-storage" title="Data storage and security" delay="280ms">
              <p>
                Your data is stored on secure servers provided by Supabase. We take the following measures to protect your information:
              </p>
              <ul className="policy-list">
                <li>All data is encrypted at rest and in transit</li>
                <li>Access to customer data is restricted to Kelvin Mark, Founder</li>
                <li>Passwords are never stored in plain text</li>
                <li>We use HTTPS encryption on all pages</li>
                <li>Regular security reviews are conducted</li>
              </ul>
              <h3 className="mini-heading">How long we keep your data</h3>
              <ul className="policy-list">
                <li>Order records: 7 years, required by Kenyan tax law</li>
                <li>Account data: as long as your account is active</li>
                <li>Marketing preferences: until you unsubscribe</li>
                <li>Communication history: 2 years</li>
              </ul>
              <p>You may request deletion of your data at any time. See Your Rights below.</p>
            </SectionBlock>

            <SectionBlock number="08" id="your-rights" title="Your rights" delay="320ms">
              <p>
                You have rights over your personal data. Here is what you can ask us to do and how to ask.
              </p>
              <div className="rights-grid">
                {rights.map((right, index) => (
                  <article
                    key={right.title}
                    className="right-card reveal-left"
                    style={{ transitionDelay: `${index * 60}ms` }}
                  >
                    <div className="right-card__top">
                      <span className="right-card__icon">{right.icon}</span>
                      <h3>{right.title}</h3>
                    </div>
                    <p>{right.description}</p>
                  </article>
                ))}
              </div>
              <h3 className="mini-heading">How to exercise your rights</h3>
              <p>
                Message Sharon directly on WhatsApp or use our contact form. We will respond within 30 days.
              </p>
              <div className="inline-actions">
                <a href={whatsappLink} className="action-button action-button--primary">
                  WhatsApp Sharon →
                </a>
                <Link href="/contact" className="action-button action-button--secondary">
                  Contact Form →
                </Link>
              </div>
            </SectionBlock>

            <SectionBlock number="09" id="childrens-privacy" title="Children's privacy" delay="360ms">
              <p>
                SharonCraft does not knowingly collect personal data from anyone under the age of 13.
              </p>
              <p>
                If you are a parent or guardian and believe your child has provided us with personal data, please contact us immediately and we will delete it.
              </p>
              <p>
                Our products are intended for adults and are not marketed to children.
              </p>
            </SectionBlock>

            <SectionBlock number="10" id="contact-us" title="Contact us about privacy" delay="400ms">
              <p>
                If you have any questions about this privacy policy or how we handle your data, contact us:
              </p>
              <div className="contact-grid">
                {contactCards.map((card) => (
                  <article key={card.title} className="contact-card">
                    <div className="contact-card__icon">{card.icon}</div>
                    <h3>{card.title}</h3>
                    <p>{card.detail}</p>
                  </article>
                ))}
              </div>
              <p className="contact-note">
                We respond to all privacy-related enquiries within 30 days in accordance with Kenyan data protection requirements.
              </p>
            </SectionBlock>

            <SectionBlock number="11" id="updates" title="Changes to this policy" delay="440ms">
              <p>
                We may update this privacy policy from time to time. When we make significant changes we will:
              </p>
              <ul className="policy-list">
                <li>Update the last updated date at the top of this page</li>
                <li>Send a notification to active customers via WhatsApp</li>
                <li>Post an announcement on our website and social media</li>
              </ul>
              <p>
                Continued use of SharonCraft after changes means you accept the updated policy. If you do not agree, please stop using the website and contact us to remove your data.
              </p>
            </SectionBlock>
          </div>
        </section>

        <section className="final-cta reveal">
          <div className="page-shell page-shell--narrow">
            <h2>Questions about your privacy?</h2>
            <p>
              We are real people and we take this seriously. Ask us anything.
            </p>
            <div className="final-cta__actions">
              <a href={whatsappLink} className="action-button action-button--cta-primary">
                WHATSAPP SHARON →
              </a>
              <Link href="/contact" className="action-button action-button--cta-secondary">
                CONTACT FORM →
              </Link>
            </div>
          </div>
        </section>
      </div>

      <Footer />

      <style jsx>{`
        .privacy-page {
          background: #fafaf8;
          color: #1c1c1c;
          scroll-behavior: smooth;
        }

        .page-shell {
          max-width: 1200px;
          margin: 0 auto;
          padding: 56px 80px;
        }

        .page-shell--narrow {
          max-width: 820px;
        }

        .section-label {
          margin-bottom: 24px;
          font-size: 9px;
          letter-spacing: 5px;
          color: #bbb;
          text-transform: uppercase;
        }

        .hero {
          position: relative;
          overflow: hidden;
          height: 260px;
          background: #f5f0eb;
        }

        .hero__glow,
        .hero__rules {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .hero__glow {
          background: radial-gradient(ellipse 60% 80% at 75% 50%, rgba(139, 94, 60, 0.08) 0%, transparent 65%);
        }

        .hero__rules {
          background-image: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 28px,
            rgba(0, 0, 0, 0.025) 28px,
            rgba(0, 0, 0, 0.025) 29px
          );
        }

        .hero__dot {
          position: absolute;
          width: 6px;
          height: 6px;
          background: rgba(139, 94, 60, 0.08);
          pointer-events: none;
        }

        .hero__dot--one { top: 18%; left: 11%; }
        .hero__dot--two { top: 26%; right: 18%; }
        .hero__dot--three { top: 63%; left: 22%; width: 7px; height: 7px; }
        .hero__dot--four { top: 74%; right: 27%; }
        .hero__dot--five { top: 44%; left: 58%; width: 5px; height: 5px; }

        .hero__content {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 0 40px;
        }

        .hero__breadcrumb,
        .hero__eyebrow,
        .hero h1,
        .hero__sub,
        .hero__updated {
          animation: heroIn 0.65s ease both;
        }

        .hero__breadcrumb {
          font-size: 10px;
          letter-spacing: 1.5px;
          color: rgba(28, 28, 28, 0.35);
          margin-bottom: 14px;
          animation-delay: 0.2s;
        }

        .hero__eyebrow {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 14px;
          animation-delay: 0.3s;
        }

        .hero__eyebrow span:first-child,
        .hero__eyebrow span:last-child {
          width: 24px;
          height: 1px;
          background: #8b5e3c;
        }

        .hero__eyebrow span:nth-child(2) {
          font-size: 9px;
          letter-spacing: 6px;
          color: #8b5e3c;
          text-transform: uppercase;
        }

        .hero h1 {
          margin: 0;
          font-size: 36px;
          font-weight: 300;
          color: #1c1c1c;
          letter-spacing: -0.3px;
          animation-delay: 0.4s;
        }

        .hero__sub {
          margin: 8px 0 0;
          font-size: 13px;
          color: #888;
          animation-delay: 0.55s;
        }

        .hero__updated {
          margin: 6px 0 0;
          font-size: 11px;
          letter-spacing: 1px;
          color: #bbb;
          animation-delay: 0.65s;
        }

        .short-version {
          background: #1c1c1c;
        }

        .short-version :global(.section-label) {
          color: rgba(255, 255, 255, 0.2);
          text-align: center;
          margin-bottom: 40px;
        }

        .short-version__grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 2px;
        }

        .short-card {
          background: #111111;
          padding: 32px 28px;
        }

        .short-card__icon {
          margin-bottom: 20px;
        }

        .short-card h2 {
          margin: 0 0 10px;
          font-size: 16px;
          font-weight: 400;
          color: rgba(255, 255, 255, 0.82);
          line-height: 1.3;
        }

        .short-card p {
          margin: 0;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.34);
          line-height: 1.8;
        }

        .toc {
          background: #fafaf8;
          border-bottom: 0.5px solid rgba(0, 0, 0, 0.08);
        }

        .toc__grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 8px;
        }

        .toc__item {
          border: 0.5px solid rgba(0, 0, 0, 0.08);
          background: #ffffff;
          padding: 12px 16px;
          display: flex;
          align-items: center;
          gap: 10px;
          text-align: left;
          cursor: pointer;
          transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease;
        }

        .toc__item:hover {
          background: #f5f0eb;
          border-color: rgba(0, 0, 0, 0.12);
        }

        .toc__number {
          width: 20px;
          flex-shrink: 0;
          font-size: 11px;
          font-weight: 500;
          color: #8b5e3c;
        }

        .toc__title {
          flex: 1;
          font-size: 13px;
          color: #666;
        }

        .toc__item:hover .toc__title {
          color: #1c1c1c;
        }

        .toc__arrow {
          font-size: 12px;
          color: #bbb;
          transition: transform 0.2s ease;
        }

        .toc__item:hover .toc__arrow {
          transform: translateX(4px);
        }

        .policy-wrap {
          background: #fafaf8;
        }

        .policy-shell {
          max-width: 820px;
          margin: 0 auto;
          padding: 64px 80px;
        }

        .policy-section {
          padding-bottom: 56px;
          margin-bottom: 56px;
          border-bottom: 0.5px solid rgba(0, 0, 0, 0.08);
          scroll-margin-top: 120px;
        }

        .policy-section:last-child {
          margin-bottom: 0;
          padding-bottom: 0;
          border-bottom: none;
        }

        .policy-section__header {
          display: flex;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 24px;
        }

        .policy-section__number {
          width: 32px;
          height: 32px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f5f0eb;
          font-size: 11px;
          font-weight: 500;
          color: #8b5e3c;
        }

        .policy-section__header h2 {
          margin: 4px 0 0;
          font-size: 22px;
          font-weight: 300;
          color: #1c1c1c;
          letter-spacing: -0.2px;
          line-height: 1.2;
        }

        .policy-section__content {
          padding-left: 52px;
        }

        .policy-section__content p {
          margin: 0 0 16px;
          font-size: 14px;
          color: #666;
          line-height: 1.9;
          letter-spacing: 0.1px;
        }

        .policy-list {
          margin: 12px 0 16px 0;
          padding: 0;
          list-style: none;
        }

        .policy-list li {
          position: relative;
          margin-bottom: 6px;
          padding-left: 16px;
          font-size: 14px;
          color: #666;
          line-height: 1.8;
        }

        .policy-list li::before {
          content: "—";
          position: absolute;
          left: 0;
          color: #8b5e3c;
        }

        .highlight-box {
          margin: 16px 0;
          padding: 14px 18px;
          background: rgba(139, 94, 60, 0.05);
          border-left: 2px solid #8b5e3c;
          font-size: 13px;
          color: #555;
          line-height: 1.75;
          font-style: italic;
        }

        .highlight-box--danger {
          background: rgba(192, 57, 43, 0.04);
          border-left-color: #c0392b;
        }

        .policy-table {
          width: 100%;
          margin: 16px 0;
          border-collapse: collapse;
        }

        .policy-table th {
          padding: 10px 16px;
          background: #f5f0eb;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 2px;
          text-transform: uppercase;
          text-align: left;
          color: #888;
        }

        .policy-table td {
          padding: 12px 16px;
          font-size: 13px;
          color: #666;
          line-height: 1.6;
          border-bottom: 0.5px solid rgba(0, 0, 0, 0.06);
          vertical-align: top;
        }

        .policy-table tbody tr:nth-child(even) td {
          background: rgba(0, 0, 0, 0.015);
        }

        .service-grid,
        .rights-grid,
        .contact-grid {
          display: grid;
          gap: 8px;
          margin: 16px 0;
        }

        .service-grid,
        .rights-grid {
          grid-template-columns: 1fr 1fr;
        }

        .contact-grid {
          grid-template-columns: 1fr 1fr;
          gap: 2px;
          margin-top: 20px;
        }

        .service-card,
        .right-card,
        .contact-card {
          background: #ffffff;
          border: 0.5px solid rgba(0, 0, 0, 0.08);
          padding: 16px;
        }

        .service-card h3,
        .right-card h3,
        .contact-card h3 {
          margin: 0 0 6px;
          font-size: 13px;
          font-weight: 500;
          color: #1c1c1c;
        }

        .service-card p,
        .right-card p,
        .contact-card p,
        .contact-note {
          margin: 0;
          font-size: 12px;
          color: #888;
          line-height: 1.7;
          white-space: pre-line;
        }

        .service-card a {
          display: inline-block;
          margin-top: 8px;
          font-size: 11px;
          color: #8b5e3c;
          text-decoration: none;
        }

        .mini-heading {
          margin: 20px 0 12px;
          font-size: 16px;
          font-weight: 400;
          color: #1c1c1c;
        }

        .right-card__top {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
        }

        .right-card__icon,
        .contact-card__icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .inline-actions,
        .final-cta__actions {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .action-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 48px;
          padding: 0 28px;
          border: 0.5px solid transparent;
          font-size: 11px;
          letter-spacing: 3px;
          text-transform: uppercase;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .action-button--primary {
          background: #1c1c1c;
          color: #ffffff;
          border-color: #1c1c1c;
        }

        .action-button--primary:hover {
          background: #8b5e3c;
          border-color: #8b5e3c;
        }

        .action-button--secondary {
          background: transparent;
          color: #1c1c1c;
          border-color: rgba(0, 0, 0, 0.15);
        }

        .action-button--secondary:hover {
          background: rgba(0, 0, 0, 0.04);
        }

        .contact-note {
          margin-top: 16px;
          color: #bbb;
        }

        .sticky-nav {
          position: fixed;
          left: 24px;
          top: 50%;
          transform: translateY(-50%);
          z-index: 100;
          display: none;
          flex-direction: column;
          gap: 6px;
        }

        .sticky-nav__item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 3px 0;
          cursor: pointer;
          background: transparent;
        }

        .sticky-nav__dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #ddd;
          flex-shrink: 0;
          transition: all 0.2s ease;
        }

        .sticky-nav__label {
          font-size: 10px;
          letter-spacing: 1px;
          color: rgba(0, 0, 0, 0);
          white-space: nowrap;
          transition: color 0.2s ease;
        }

        .sticky-nav__item.is-active .sticky-nav__dot {
          width: 20px;
          border-radius: 3px;
          background: #8b5e3c;
        }

        .sticky-nav__item.is-active .sticky-nav__label {
          color: rgba(0, 0, 0, 0.5);
        }

        .sticky-nav__item:hover .sticky-nav__dot {
          background: #8b5e3c;
        }

        .sticky-nav__item:hover .sticky-nav__label {
          color: rgba(0, 0, 0, 0.7);
        }

        .final-cta {
          background: #080808;
          text-align: center;
        }

        .final-cta :global(.page-shell) {
          padding-top: 64px;
          padding-bottom: 64px;
        }

        .final-cta h2 {
          margin: 0 0 10px;
          font-size: 26px;
          font-weight: 300;
          color: rgba(255, 255, 255, 0.75);
        }

        .final-cta p {
          margin: 0 0 32px;
          font-size: 13px;
          color: rgba(255, 255, 255, 0.3);
          line-height: 1.8;
        }

        .final-cta__actions {
          justify-content: center;
        }

        .action-button--cta-primary {
          background: #8b5e3c;
          color: #ffffff;
        }

        .action-button--cta-primary:hover {
          background: #6b4a2e;
        }

        .action-button--cta-secondary {
          background: transparent;
          color: rgba(255, 255, 255, 0.45);
          border-color: rgba(255, 255, 255, 0.15);
        }

        .action-button--cta-secondary:hover {
          color: rgba(255, 255, 255, 0.75);
          border-color: rgba(255, 255, 255, 0.4);
        }

        .reveal {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.65s ease, transform 0.65s ease;
        }

        .reveal-left {
          opacity: 0;
          transform: translateX(-20px);
          transition: opacity 0.65s ease, transform 0.65s ease;
        }

        .reveal.visible,
        .reveal-left.visible {
          opacity: 1;
          transform: translateY(0) translateX(0);
        }

        @keyframes heroIn {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (min-width: 1201px) {
          .sticky-nav {
            display: flex;
          }
        }

        @media (max-width: 1024px) {
          .page-shell,
          .policy-shell {
            padding-left: 48px;
            padding-right: 48px;
          }

          .toc__grid,
          .short-version__grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 768px) {
          .hero {
            height: 200px;
          }

          .hero h1 {
            font-size: 24px;
          }

          .page-shell,
          .policy-shell {
            padding: 40px 24px;
          }

          .short-version__grid,
          .service-grid,
          .rights-grid,
          .contact-grid {
            grid-template-columns: 1fr;
          }

          .toc__grid {
            grid-template-columns: 1fr 1fr;
          }

          .policy-section {
            padding-bottom: 44px;
            margin-bottom: 44px;
          }

          .policy-section__content {
            padding-left: 0;
          }

          .policy-section__header {
            gap: 14px;
          }

          .policy-section__header h2 {
            font-size: 20px;
          }

          .policy-table {
            display: block;
            overflow-x: auto;
          }

          .final-cta :global(.page-shell) {
            padding-top: 48px;
            padding-bottom: 48px;
          }

          .final-cta__actions,
          .inline-actions {
            flex-direction: column;
          }

          .action-button {
            width: 100%;
          }
        }

        @media (max-width: 480px) {
          .toc__grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}
