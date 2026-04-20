import { useEffect, useState } from "react";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import SeoHead from "../components/SeoHead";

export default function ShippingReturnsPage() {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/page-content")
      .then((res) => res.json())
      .then((data) => {
        setContent(data.shipping);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load shipping:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!content) return null;

  return (
    <>
      <SeoHead
        title="Shipping & Returns - SharonCraft"
        description="Learn about SharonCraft shipping rates, delivery times, and our hassle-free return policy."
        path="/shipping"
      />
      <Nav />

      <div className="legal-page">
        <div className="container">
          <h1 className="heading-xl" style={{ marginBottom: "var(--space-4)" }}>
            {content.title}
          </h1>
          <p className="caption" style={{ opacity: 0.7, marginBottom: "var(--space-8)" }}>
            Last updated: {new Date(content.lastUpdated).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>

          <div className="legal-content">
            <section>
              <h2 className="heading-md">Domestic Shipping (Within Kenya)</h2>
              <h3 style={{ marginTop: "var(--space-3)", marginBottom: "8px", fontWeight: 600 }}>Shipping Rates:</h3>
              <ul>
                <li>Standard Delivery: KES {content.domestic?.standardRate} ({content.domestic?.standardDelivery})</li>
                <li>Express Delivery: KES {content.domestic?.expressRate} ({content.domestic?.expressDelivery})</li>
                <li>Free shipping on orders over KES {content.domestic?.freeShippingThreshold?.toLocaleString()}</li>
              </ul>
            </section>

            <section>
              <h2 className="heading-md">Order Tracking</h2>
              <p>
                Once your order is dispatched, you will receive a WhatsApp message with tracking details. Visit{" "}
                <a href="/track-order">/track-order</a> to check your order status anytime.
              </p>
            </section>

            <section>
              <h2 className="heading-md">Returns Policy</h2>
              <p>We want you to be completely satisfied with your SharonCraft purchase.</p>
              <h3 style={{ marginTop: "var(--space-3)", marginBottom: "8px", fontWeight: 600 }}>Return Window:</h3>
              <p>{content.returns?.window} days from delivery</p>
              
              <h3 style={{ marginTop: "var(--space-4)", marginBottom: "8px", fontWeight: 600 }}>Conditions:</h3>
              <ul>
                {content.returns?.conditions?.map((cond, idx) => (
                  <li key={idx}>{cond}</li>
                ))}
              </ul>

              <h3 style={{ marginTop: "var(--space-4)", marginBottom: "8px", fontWeight: 600 }}>Refunds:</h3>
              <p>Approved refunds: {content.returns?.refundTime}</p>
              <p>{content.returns?.defectiveReturn}</p>
            </section>

            <section>
              <h2 className="heading-md">Questions?</h2>
              <p>
                Email: <a href="mailto:kelvinmark.services@gmail.com">kelvinmark.services@gmail.com</a>
                <br />
                WhatsApp: +254 112 222 572
              </p>
            </section>
          </div>
        </div>
      </div>

      <Footer />

      <style jsx>{`
        .legal-page {
          min-height: 100vh;
          padding: var(--space-8) 0;
          background: white;
        }

        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 0 var(--gutter);
        }

        .legal-content {
          line-height: 1.8;
        }

        section {
          margin-bottom: var(--space-8);
        }

        section h2,
        section h3 {
          color: var(--text-primary);
        }

        section p {
          margin-bottom: var(--space-3);
          color: var(--text-secondary);
        }

        section ul {
          margin: var(--space-3) 0 var(--space-3) var(--space-4);
          padding-left: var(--space-4);
        }

        section ol {
          margin: var(--space-3) 0 var(--space-3) var(--space-4);
        }

        section li {
          margin-bottom: 8px;
          color: var(--text-secondary);
        }

        a {
          color: var(--color-accent);
          text-decoration: none;
        }

        a:hover {
          text-decoration: underline;
        }

        @media (max-width: 768px) {
          .legal-page {
            padding: var(--space-6) 0;
          }

          section {
            margin-bottom: var(--space-6);
          }
        }
      `}</style>
    </>
  );
}
