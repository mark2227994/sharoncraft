import Head from "next/head";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import SeoHead from "../components/SeoHead";

export default function TermsPage() {
  return (
    <>
      <SeoHead
        title="Terms of Service - SharonCraft"
        description="SharonCraft terms of service for purchasing handmade Kenyan beadwork."
        path="/terms"
      />
      <Nav />

      <div className="legal-page">
        <div className="container">
          <h1 className="heading-xl" style={{ marginBottom: "var(--space-4)" }}>
            Terms of Service
          </h1>
          <p className="caption" style={{ opacity: 0.7, marginBottom: "var(--space-8)" }}>
            Last updated: April 2026
          </p>

          <div className="legal-content">
            <section>
              <h2 className="heading-md">1. Agreement to Terms</h2>
              <p>
                By accessing and using the SharonCraft website and purchasing our products, you accept and agree to be
                bound by and comply with these terms and conditions. If you do not agree to abide by these terms, please
                do not use this service.
              </p>
            </section>

            <section>
              <h2 className="heading-md">2. Use License</h2>
              <p>
                Permission is granted to temporarily download one copy of the materials (information or software) on
                SharonCraft for personal, non-commercial transitory viewing only. This is the grant of a license, not a
                transfer of title, and under this license you may not:
              </p>
              <ul>
                <li>Modifying or copying the materials</li>
                <li>Using the materials for any commercial purpose or for any public display</li>
                <li>Attempting to decompile or reverse engineer any software contained on the website</li>
                <li>Removing any copyright or other proprietary notations from the materials</li>
                <li>Transferring the materials to another person or "mirroring" the materials on any other server</li>
              </ul>
            </section>

            <section>
              <h2 className="heading-md">3. Product Information</h2>
              <p>
                SharonCraft strives to provide accurate product descriptions, images, and pricing. However, SharonCraft
                does not warrant that product descriptions, pricing, or other content on this website is accurate,
                complete, reliable, current, or error-free. If a product offered by SharonCraft is not as described,
                you may return it in accordance with our Return Policy.
              </p>
            </section>

            <section>
              <h2 className="heading-md">4. Pricing and Availability</h2>
              <p>
                All prices are subject to change without notice. SharonCraft reserves the right to limit quantities and
                discontinue any product. Products are subject to availability, and we reserve the right to refuse or
                cancel any order.
              </p>
            </section>

            <section>
              <h2 className="heading-md">5. Custom Orders</h2>
              <p>
                Custom orders may take 2-4 weeks to complete depending on complexity. A 50% deposit is required to begin
                work on custom orders. The remaining balance is due upon completion. Custom orders are non-refundable
                unless SharonCraft fails to meet specifications discussed.
              </p>
            </section>

            <section>
              <h2 className="heading-md">6. Payments</h2>
              <p>
                We accept M-Pesa payments for orders in Kenya. Payment must be received before items are dispatched. You
                are responsible for all currency conversion fees if paying from outside Kenya.
              </p>
            </section>

            <section>
              <h2 className="heading-md">7. Limitation of Liability</h2>
              <p>
                In no event shall SharonCraft or its suppliers be liable for any damages (including, without limitation,
                damages for loss of data or profit, or due to business interruption) arising out of the use or inability
                to use the materials on SharonCraft's website.
              </p>
            </section>

            <section>
              <h2 className="heading-md">8. Governing Law</h2>
              <p>
                These terms and conditions are governed by and construed in accordance with the laws of Kenya, and you
                irrevocably submit to the exclusive jurisdiction of the courts located in Kenya.
              </p>
            </section>

            <section>
              <h2 className="heading-md">9. Changes to Terms</h2>
              <p>
                SharonCraft may revise these terms of service for its website at any time without notice. By using this
                website, you are agreeing to be bound by the then current version of these terms of service.
              </p>
            </section>

            <section>
              <h2 className="heading-md">10. Contact Information</h2>
              <p>
                If you have any questions about these Terms of Service, please contact us at{" "}
                <a href="mailto:kelvinmark.services@gmail.com">kelvinmark.services@gmail.com</a> or via WhatsApp at +254
                112 222 572.
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

        section h2 {
          margin-bottom: var(--space-3);
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
