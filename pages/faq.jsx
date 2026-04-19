import { useState, useEffect } from "react";
import Footer from "../components/Footer";
import Nav from "../components/Nav";
import SeoHead from "../components/SeoHead";
import Link from "next/link";

export default function FAQPage() {
  const [expandedItem, setExpandedItem] = useState(null);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFAQs();
  }, []);

  async function fetchFAQs() {
    try {
      const res = await fetch("/api/admin/faqs");
      const data = await res.json();
      
      // Group FAQs by category
      const grouped = {};
      if (Array.isArray(data)) {
        data.forEach(faq => {
          if (!grouped[faq.category]) {
            grouped[faq.category] = [];
          }
          grouped[faq.category].push({
            q: faq.question,
            a: faq.answer,
            keywords: faq.keywords,
            views: faq.views || 0
          });
        });
      }
      
      const sections = Object.entries(grouped).map(([title, items]) => ({
        title,
        items
      }));
      
      setFaqs(sections);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch FAQs:", err);
      setError(err.message);
      setLoading(false);
      // Fallback to empty FAQs
      setFaqs([]);
    }
  }

  if (loading) {
    return (
      <>
        <SeoHead
          title="FAQ - Frequently Asked Questions"
          description="Find answers to common questions about SharonCraft orders, shipping, custom designs, and more."
          path="/faq"
        />
        <Nav />
        <main className="faq-page">
          <div className="faq-header">
            <p className="overline">Help & Support</p>
            <h1 className="display-lg">Frequently Asked Questions</h1>
          </div>
          <p style={{ textAlign: 'center', padding: '2rem' }}>Loading FAQs...</p>
        </main>
        <Footer />
      </>
    );
  }

  const sections = faqs.length > 0 ? faqs : [];

  return (
    <>
      <SeoHead
        title="FAQ - Frequently Asked Questions"
        description="Find answers to common questions about SharonCraft orders, shipping, custom designs, and more."
        path="/faq"
      />
      <Nav />
      <main className="faq-page">
        <div className="faq-header">
          <p className="overline">Help & Support</p>
          <h1 className="display-lg">Frequently Asked Questions</h1>
          <p className="body-base">
            Can't find the answer you're looking for?{" "}
            <a href="https://wa.me/254112222572" target="_blank" rel="noopener noreferrer">
              Contact us on WhatsApp
            </a>
          </p>
        </div>

        <div className="faq-sections">
          {sections.map((section, sectionIdx) => (
            <section key={sectionIdx} className="faq-section">
              <h2 className="faq-section-title">{section.title}</h2>
              <div className="faq-items">
                {section.items.map((item, itemIdx) => {
                  const itemId = `${sectionIdx}-${itemIdx}`;
                  const isExpanded = expandedItem === itemId;
                  return (
                    <div key={itemIdx} className="faq-item">
                      <button
                        className={`faq-item-trigger ${isExpanded ? "faq-item-trigger--expanded" : ""}`}
                        onClick={() => setExpandedItem(isExpanded ? null : itemId)}
                        aria-expanded={isExpanded}
                      >
                        <span className="faq-item-question">{item.q}</span>
                        <span className="faq-item-icon">{isExpanded ? "−" : "+"}</span>
                      </button>
                      {isExpanded && (
                        <div className="faq-item-answer">
                          {typeof item.a === "string" ? (
                            <p>{item.a}</p>
                          ) : (
                            item.a
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        <section className="faq-cta-section">
          <div className="faq-cta-card">
            <h3>Ready to shop?</h3>
            <p>Browse our collection of handmade Kenyan jewelry and home decor.</p>
            <Link href="/shop" className="faq-cta-button">
              Start shopping
            </Link>
          </div>

          <div className="faq-cta-card">
            <h3>Have a custom idea?</h3>
            <p>Tell us what you're dreaming of and we'll bring it to life.</p>
            <Link href="/custom-order" className="faq-cta-button">
              Request custom design
            </Link>
          </div>

          <div className="faq-cta-card">
            <h3>Need more help?</h3>
            <p>Our team is here to assist. Chat with us on WhatsApp.</p>
            <a href="https://wa.me/254112222572" target="_blank" rel="noopener noreferrer" className="faq-cta-button">
              Contact us
            </a>
          </div>
        </section>
      </main>
      <Footer />

      <style jsx>{`
        .faq-page {
          max-width: var(--max-width);
          margin: 0 auto;
          padding: calc(var(--nav-height) + var(--space-6)) var(--gutter) var(--space-7);
        }

        .faq-header {
          text-align: center;
          margin-bottom: var(--space-7);
        }

        .faq-header p.overline {
          margin-bottom: var(--space-3);
        }

        .faq-header h1 {
          margin-bottom: var(--space-4);
        }

        .faq-header a {
          color: var(--color-terracotta);
          text-decoration: underline;
        }

        .faq-sections {
          display: grid;
          gap: var(--space-7);
          margin-bottom: var(--space-7);
        }

        .faq-section {
          border-radius: var(--radius-lg);
          background: var(--color-white);
          padding: var(--space-6);
        }

        .faq-section-title {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: var(--space-4);
          color: var(--text-primary);
        }

        .faq-items {
          display: grid;
          gap: var(--space-2);
        }

        .faq-item {
          border-bottom: 1px solid var(--border-default);
        }

        .faq-item:last-child {
          border-bottom: none;
        }

        .faq-item-trigger {
          width: 100%;
          padding: var(--space-4);
          background: none;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--space-3);
          text-align: left;
          font-size: 1rem;
          font-weight: 500;
          color: var(--text-primary);
          transition: all 0.2s ease;
        }

        .faq-item-trigger:hover {
          background: var(--bg-secondary);
          border-radius: var(--radius-md);
        }

        .faq-item-question {
          flex: 1;
        }

        .faq-item-icon {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--color-terracotta);
          flex-shrink: 0;
        }

        .faq-item-answer {
          padding: 0 var(--space-4) var(--space-4);
          color: var(--text-secondary);
          line-height: 1.6;
        }

        .faq-item-answer p {
          margin: 0;
          margin-bottom: var(--space-3);
        }

        .faq-item-answer p:last-child {
          margin-bottom: 0;
        }

        .faq-cta-section {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: var(--space-4);
          margin-top: var(--space-7);
        }

        .faq-cta-card {
          background: var(--color-white);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-lg);
          padding: var(--space-6);
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .faq-cta-card h3 {
          font-size: 1.1rem;
          font-weight: 600;
          margin: 0;
        }

        .faq-cta-card p {
          margin: 0;
          color: var(--text-secondary);
          font-size: 0.95rem;
        }

        .faq-cta-button {
          background: var(--color-terracotta);
          color: white;
          padding: var(--space-3) var(--space-4);
          border-radius: var(--radius-md);
          text-decoration: none;
          font-weight: 500;
          display: inline-block;
          transition: all 0.2s ease;
          border: none;
          cursor: pointer;
        }

        .faq-cta-button:hover {
          background: var(--color-terracotta-dark);
          transform: translateY(-2px);
        }

        @media (max-width: 768px) {
          .faq-page {
            padding: calc(var(--nav-height) + var(--space-4)) var(--gutter) var(--space-5);
          }

          .faq-section {
            padding: var(--space-4);
          }

          .faq-header h1 {
            font-size: 1.5rem;
          }

          .faq-section-title {
            font-size: 1.1rem;
          }
        }
      `}</style>
    </>
  );
}
