import Head from "next/head";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import SeoHead from "../components/SeoHead";

export default function PrivacyPage() {
  return (
    <>
      <SeoHead
        title="Privacy Policy - SharonCraft"
        description="SharonCraft privacy policy for protecting your personal information."
        path="/privacy"
      />
      <Nav />

      <div className="legal-page">
        <div className="container">
          <h1 className="heading-xl" style={{ marginBottom: "var(--space-4)" }}>
            Privacy Policy
          </h1>
          <p className="caption" style={{ opacity: 0.7, marginBottom: "var(--space-8)" }}>
            Last updated: April 2026
          </p>

          <div className="legal-content">
            <section>
              <h2 className="heading-md">1. Introduction</h2>
              <p>
                SharonCraft is committed to protecting your privacy. This Privacy Policy explains how we collect, use,
                disclose, and safeguard your information when you visit our website.
              </p>
            </section>

            <section>
              <h2 className="heading-md">2. Information We Collect</h2>
              <p>We may collect information about you in a variety of ways:</p>
              <h3 style={{ marginTop: "var(--space-3)", marginBottom: "8px", fontWeight: 600 }}>Information You Provide Directly:</h3>
              <ul>
                <li>Name and email address</li>
                <li>Phone number and delivery address</li>
                <li>Payment information for M-Pesa transactions</li>
                <li>Messages sent through our contact form</li>
                <li>Information from custom order inquiries</li>
              </ul>
            </section>

            <section>
              <h2 className="heading-md">3. How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul>
                <li>Process your orders and send order confirmations</li>
                <li>Deliver products to your specified address</li>
                <li>Respond to inquiries and customer support requests</li>
                <li>Send updates about your orders via WhatsApp</li>
                <li>Improve our website and services</li>
                <li>Prevent fraudulent transactions</li>
              </ul>
            </section>

            <section>
              <h2 className="heading-md">4. Sharing of Information</h2>
              <p>
                We do not sell, trade, or rent your personal information to third parties. However, we may share
                information with:
              </p>
              <ul>
                <li>Payment processors for M-Pesa transactions</li>
                <li>Delivery partners to facilitate shipping</li>
                <li>Our artisan partners when fulfilling custom orders</li>
              </ul>
              <p>These partners are contractually obligated to keep your information confidential.</p>
            </section>

            <section>
              <h2 className="heading-md">5. Data Security</h2>
              <p>
                We implement appropriate technical and organizational measures to protect your personal information
                against unauthorized access, alteration, disclosure, or destruction.
              </p>
            </section>

            <section>
              <h2 className="heading-md">6. Cookies and Tracking</h2>
              <p>
                Our website may use cookies to enhance your browsing experience. Most web browsers automatically accept
                cookies, but you can modify your browser settings to decline cookies if you prefer.
              </p>
            </section>

            <section>
              <h2 className="heading-md">7. Your Rights</h2>
              <p>You have the right to:</p>
              <ul>
                <li>Access the personal information we hold about you</li>
                <li>Request correction of inaccurate information</li>
                <li>Request deletion of your information</li>
                <li>Opt-out of marketing communications</li>
              </ul>
            </section>

            <section>
              <h2 className="heading-md">8. Contact Us</h2>
              <p>
                If you have questions about this Privacy Policy or our privacy practices, please contact us at{" "}
                <a href="mailto:kelvinmark.services@gmail.com">kelvinmark.services@gmail.com</a> or via WhatsApp at +254
                112 222 572.
              </p>
            </section>

            <section>
              <h2 className="heading-md">9. Changes to This Policy</h2>
              <p>
                SharonCraft may update this Privacy Policy from time to time. We will notify you of any changes by
                posting the new policy on our website.
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
