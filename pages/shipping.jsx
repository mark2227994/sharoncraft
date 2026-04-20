import Head from "next/head";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import SeoHead from "../components/SeoHead";

export default function ShippingReturnsPage() {
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
            Shipping & Returns Policy
          </h1>
          <p className="caption" style={{ opacity: 0.7, marginBottom: "var(--space-8)" }}>
            Last updated: April 2026
          </p>

          <div className="legal-content">
            <section>
              <h2 className="heading-md">Shipping Information</h2>
              <p>
                We are committed to delivering your handmade beadwork items safely and promptly. Below is information
                about our shipping practices.
              </p>
            </section>

            <section>
              <h2 className="heading-md">Domestic Shipping (Within Kenya)</h2>
              <h3 style={{ marginTop: "var(--space-3)", marginBottom: "8px", fontWeight: 600 }}>Processing Time:</h3>
              <ul>
                <li>Ready-to-ship items: 1-2 business days</li>
                <li>Custom orders: 2-4 weeks plus 1-2 business days for processing</li>
              </ul>

              <h3 style={{ marginTop: "var(--space-4)", marginBottom: "8px", fontWeight: 600 }}>Shipping Rates:</h3>
              <ul>
                <li>Standard Delivery: KES 300 (3-5 business days)</li>
                <li>Express Delivery: KES 500 (1-2 business days)</li>
                <li>Free shipping on orders over KES 5,000</li>
              </ul>

              <h3 style={{ marginTop: "var(--space-4)", marginBottom: "8px", fontWeight: 600 }}>Delivery Areas:</h3>
              <p>
                We deliver to all locations within Nairobi and nationwide across Kenya. Rural areas may experience
                longer delivery times due to distance.
              </p>
            </section>

            <section>
              <h2 className="heading-md">International Shipping</h2>
              <p>
                We currently ship to select countries. International orders are subject to customs duties and taxes.
                Shipping costs will be calculated based on weight and destination. Please contact us at{" "}
                <a href="mailto:kelvinmark.services@gmail.com">kelvinmark.services@gmail.com</a> for international
                shipping inquiries.
              </p>
            </section>

            <section>
              <h2 className="heading-md">Order Tracking</h2>
              <p>
                Once your order is dispatched, you will receive a WhatsApp message with tracking details and delivery
                timeline. You can also reach out via WhatsApp at +254 112 222 572 to check your order status at any time.
              </p>
            </section>

            <section>
              <h2 className="heading-md">Returns Policy</h2>
              <p>
                We want you to be completely satisfied with your SharonCraft purchase. If you are not satisfied, we
                offer returns within 14 days of delivery.
              </p>
            </section>

            <section>
              <h2 className="heading-md">Conditions for Returns</h2>
              <p>Items are eligible for return if they meet the following conditions:</p>
              <ul>
                <li>Items must be returned within 14 days of delivery</li>
                <li>Items must be in original condition with no signs of wear</li>
                <li>Items must include all original packaging and documentation</li>
                <li>Items must not be custom-made or personalized (unless there is a defect)</li>
              </ul>
            </section>

            <section>
              <h2 className="heading-md">Return Process</h2>
              <ol style={{ paddingLeft: "var(--space-4)" }}>
                <li style={{ marginBottom: "8px" }}>
                  Contact us via WhatsApp at +254 112 222 572 with photos of the item and reason for return
                </li>
                <li style={{ marginBottom: "8px" }}>We will review your request and provide return instructions</li>
                <li style={{ marginBottom: "8px" }}>Ship the item back to us (return shipping cost is customer responsibility unless item is defective)</li>
                <li style={{ marginBottom: "8px" }}>Once received and inspected, we will process your refund within 5-7 business days</li>
              </ol>
            </section>

            <section>
              <h2 className="heading-md">Defective Items</h2>
              <p>
                If you receive a defective or damaged item, please contact us immediately with photos. We will arrange
                either a replacement or full refund. Return shipping for defective items is free.
              </p>
            </section>

            <section>
              <h2 className="heading-md">Custom Orders</h2>
              <p>
                Custom orders are generally non-returnable as they are made specifically to your specifications. However,
                if there is a significant error on our part or the item is defective, we will work with you to find a
                solution.
              </p>
            </section>

            <section>
              <h2 className="heading-md">Refunds</h2>
              <p>
                Approved refunds will be processed back to your original payment method (M-Pesa account) within 5-7
                business days. Please note that mobile network operators may take an additional 1-2 days to display the
                refund in your account.
              </p>
            </section>

            <section>
              <h2 className="heading-md">Questions?</h2>
              <p>
                If you have any questions about our shipping or returns policy, please contact us at{" "}
                <a href="mailto:kelvinmark.services@gmail.com">kelvinmark.services@gmail.com</a> or via WhatsApp at +254
                112 222 572. We are available Mon-Sat, 9am-6pm EAT.
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
