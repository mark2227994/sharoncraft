import { useState } from "react";
import Footer from "../components/Footer";
import Nav from "../components/Nav";
import SeoHead from "../components/SeoHead";
import Link from "next/link";

export default function FAQPage() {
  const [expandedItem, setExpandedItem] = useState(null);

  const sections = [
    {
      title: "Ordering & Shopping",
      items: [
        {
          q: "How do I place an order?",
          a: "Browse our shop, add items to your cart, and proceed to checkout. You'll fill in your delivery details and confirm the order through WhatsApp.",
        },
        {
          q: "What payment methods do you accept?",
          a: "We accept M-Pesa, bank transfers, and cash on delivery (Nairobi only). Payment options are shown at checkout.",
        },
        {
          q: "Can I pay on delivery?",
          a: "Yes, cash on delivery is available for Nairobi orders. Other areas require payment before delivery.",
        },
      ],
    },
    {
      title: "Shipping & Delivery",
      items: [
        {
          q: "How much is shipping?",
          a: "Nairobi: KES 300 | Rest of Kenya: KES 600. Shipping costs are calculated at checkout.",
        },
        {
          q: "How long does delivery take?",
          a: "Nairobi: 2-3 business days | Rest of Kenya: 3-5 business days. Rush delivery available upon request.",
        },
        {
          q: "Do you deliver countrywide?",
          a: "Yes! We deliver across Kenya. Choose your location at checkout and shipping cost will update automatically.",
        },
        {
          q: "Can I change my delivery address?",
          a: "Yes, contact us on WhatsApp before we dispatch. Once shipped, address changes may incur additional fees.",
        },
      ],
    },
    {
      title: "Custom Orders",
      items: [
        {
          q: "How do custom orders work?",
          a: (
            <>
              Custom orders let you design your own piece. Here's the process:
              <br />
              1. <strong>Request</strong> - Fill out the custom order form
              <br />
              2. <strong>Quote</strong> - We send pricing (usually KES 2,000-10,000)
              <br />
              3. <strong>Confirm</strong> - Pay 50% deposit
              <br />
              4. <strong>Create</strong> - We make your piece (5-10 business days)
              <br />
              5. <strong>Deliver</strong> - Pay final 50% + shipping
            </>
          ),
        },
        {
          q: "How much do custom orders cost?",
          a: "Custom order prices depend on design complexity, materials, and quantity. Typical range: KES 2,000-10,000 per piece. We send a detailed quote after you submit your request.",
        },
        {
          q: "How long does a custom order take?",
          a: "Most custom orders take 5-10 business days after you confirm the design. Bulk orders may take longer.",
        },
        {
          q: "Can I order in bulk?",
          a: "Yes! We love bulk orders. For quantities over 50 pieces, we offer special pricing. Contact us on WhatsApp to discuss.",
        },
      ],
    },
    {
      title: "Products & Quality",
      items: [
        {
          q: "Are all items handmade?",
          a: "Yes, every piece is handmade by our skilled artisans in Nairobi. No factory production.",
        },
        {
          q: "How do I know the product quality?",
          a: "Each product page shows detailed photos, artisan name, and materials used. Our customer reviews also reflect quality. All items come with our satisfaction guarantee.",
        },
        {
          q: "What materials do you use?",
          a: "We use high-quality beads, metals, and natural materials. Each product page lists specific materials.",
        },
        {
          q: "Do prices include VAT?",
          a: "Prices shown are inclusive of VAT. No additional taxes at checkout.",
        },
      ],
    },
    {
      title: "Returns & Exchanges",
      items: [
        {
          q: "What's your return policy?",
          a: "We offer returns within 7 days if the item is unworn and in original condition. Shipping costs are non-refundable.",
        },
        {
          q: "How do I return an item?",
          a: "Contact us on WhatsApp with your order details and reason for return. We'll provide shipping instructions.",
        },
        {
          q: "What if my item arrives damaged?",
          a: "Contact us immediately on WhatsApp with photos. We'll either replace it free or refund the product cost.",
        },
      ],
    },
    {
      title: "Account & Orders",
      items: [
        {
          q: "Do I need to create an account?",
          a: "You can shop without an account. Creating one lets you track orders and save favorites.",
        },
        {
          q: "How do I track my order?",
          a: "After checkout, Sharon will send you WhatsApp updates with tracking information and delivery date.",
        },
        {
          q: "Can I modify my order?",
          a: "Contact us on WhatsApp immediately after ordering. Changes are possible before production starts.",
        },
      ],
    },
    {
      title: "About SharonCraft",
      items: [
        {
          q: "Who makes SharonCraft products?",
          a: "We work with 5-10 skilled artisans in Nairobi. Each product shows the artisan's name who created it.",
        },
        {
          q: "Is SharonCraft ethical?",
          a: "Yes. We pay fair wages, support local artisans, and use sustainable materials wherever possible.",
        },
        {
          q: "Can I visit the shop?",
          a: "Yes! We have a physical shop in Nairobi. Contact us on WhatsApp for address and opening hours.",
        },
      ],
    },
  ];

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
