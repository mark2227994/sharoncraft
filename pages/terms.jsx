import { useEffect, useState } from "react";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import SeoHead from "../components/SeoHead";

export default function TermsPage() {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/page-content")
      .then((res) => res.json())
      .then((data) => {
        setContent(data.terms);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load terms:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!content) return null;

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
            {content.sections?.map((section, idx) => (
              <section key={idx}>
                <h2 className="heading-md">{section.title}</h2>
                <p>{section.content}</p>
              </section>
            ))}
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
