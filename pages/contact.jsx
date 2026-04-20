import { useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import SeoHead from "../components/SeoHead";

export default function ContactPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");
    setError("");

    // Validate required fields
    if (!formData.name.trim()) {
      setError("Name is required");
      setSubmitting(false);
      return;
    }
    if (!formData.email.trim()) {
      setError("Email is required");
      setSubmitting(false);
      return;
    }
    if (!formData.phone.trim()) {
      setError("Phone number is required");
      setSubmitting(false);
      return;
    }
    if (!formData.subject.trim()) {
      setError("Subject is required");
      setSubmitting(false);
      return;
    }
    if (!formData.message.trim()) {
      setError("Message is required");
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to send message");
      }

      setMessage("Thank you for your message! We will respond within 24 hours.");
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
      setTimeout(() => {
        setMessage("");
      }, 5000);
    } catch (err) {
      setError(err.message || "Could not send message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  return (
    <>
      <SeoHead
        title="Contact SharonCraft - Get in Touch"
        description="Have questions about our handmade Kenyan beadwork? Contact SharonCraft for inquiries about custom orders, shipping, or general support."
        path="/contact"
      />
      <Nav />

      <div className="contact-page">
        <section className="contact-hero">
          <div className="container">
            <h1 className="heading-xl">Get in Touch</h1>
            <p className="body-lg" style={{ marginTop: "var(--space-3)", opacity: 0.8 }}>
              Have questions about our products or need custom design services? We would love to hear from you.
            </p>
          </div>
        </section>

        <section className="contact-content">
          <div className="container">
            <div className="contact-grid">
              {/* Contact Info */}
              <div className="contact-info">
                <h2 className="heading-md" style={{ marginBottom: "var(--space-4)" }}>
                  Contact Information
                </h2>

                <div className="info-item">
                  <p className="overline" style={{ marginBottom: "8px" }}>
                    Email
                  </p>
                  <a href="mailto:kelvinmark.services@gmail.com" className="body-md" style={{ color: "var(--color-accent)", textDecoration: "none" }}>
                    kelvinmark.services@gmail.com
                  </a>
                </div>

                <div className="info-item">
                  <p className="overline" style={{ marginBottom: "8px" }}>
                    WhatsApp
                  </p>
                  <a href="https://wa.me/254112222572?text=Hello%20SharonCraft%2C%20I%20have%20a%20question" className="body-md" style={{ color: "var(--color-accent)", textDecoration: "none" }}>
                    +254 112 222 572
                  </a>
                  <p className="caption" style={{ marginTop: "4px", opacity: 0.7 }}>
                    For fastest response, message us on WhatsApp during business hours: Mon-Sat, 9am-6pm EAT
                  </p>
                </div>

                <div className="info-item">
                  <p className="overline" style={{ marginBottom: "8px" }}>
                    Business Hours
                  </p>
                  <p className="body-md">Monday - Saturday, 9:00 AM - 6:00 PM EAT</p>
                </div>

                <div className="info-item">
                  <p className="overline" style={{ marginBottom: "8px" }}>
                    Location
                  </p>
                  <p className="body-md">Nairobi, Kenya</p>
                </div>

                <div className="info-item" style={{ marginTop: "var(--space-6)" }}>
                  <p className="caption" style={{ opacity: 0.7 }}>
                    For faster assistance with custom orders or urgent inquiries, we recommend contacting us via WhatsApp.
                  </p>
                </div>
              </div>

              {/* Contact Form */}
              <div className="contact-form-section">
                <h2 className="heading-md" style={{ marginBottom: "var(--space-4)" }}>
                  Send us a Message
                </h2>

                <form onSubmit={handleSubmit}>
                  {error && (
                    <div className="form-alert form-alert--error" style={{ marginBottom: "var(--space-4)" }}>
                      {error}
                    </div>
                  )}
                  {message && (
                    <div className="form-alert form-alert--success" style={{ marginBottom: "var(--space-4)" }}>
                      {message}
                    </div>
                  )}

                  <div className="form-group">
                    <label className="form-label">
                      <span>Full Name</span>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Your name"
                        className="form-input"
                        required
                      />
                    </label>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <span>Email Address</span>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="your@email.com"
                        className="form-input"
                        required
                      />
                    </label>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <span>Phone Number</span>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+254 712 345 678"
                        className="form-input"
                        required
                      />
                    </label>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <span>Subject</span>
                      <select
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="form-input"
                        required
                      >
                        <option value="">Select a subject</option>
                        <option value="General Inquiry">General Inquiry</option>
                        <option value="Custom Order">Custom Order</option>
                        <option value="Shipping Question">Shipping Question</option>
                        <option value="Product Question">Product Question</option>
                        <option value="Wholesale">Wholesale Inquiry</option>
                        <option value="Partnership">Partnership Opportunity</option>
                        <option value="Other">Other</option>
                      </select>
                    </label>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <span>Message</span>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Tell us more about your inquiry..."
                        className="form-input"
                        rows={5}
                        required
                      />
                    </label>
                  </div>

                  <button type="submit" className="button button--primary" disabled={submitting}>
                    {submitting ? "Sending..." : "Send Message"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />

      <style jsx>{`
        .contact-page {
          min-height: 100vh;
          padding: var(--space-8) 0;
        }

        .contact-hero {
          background: linear-gradient(135deg, #fafafa 0%, #ffffff 100%);
          padding: var(--space-8) 0;
          margin-bottom: var(--space-8);
          text-align: center;
        }

        .contact-content {
          flex: 1;
        }

        .contact-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-8);
        }

        .contact-info {
          background: #f9f9f9;
          padding: var(--space-6);
          border-radius: 12px;
          border: 1px solid #e0e0e0;
        }

        .info-item {
          margin-bottom: var(--space-6);
        }

        .info-item:last-child {
          margin-bottom: 0;
        }

        .contact-form-section {
          background: white;
          padding: var(--space-6);
          border-radius: 12px;
          border: 1px solid #e0e0e0;
        }

        .form-group {
          margin-bottom: var(--space-4);
        }

        .form-label {
          display: flex;
          flex-direction: column;
          gap: 8px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .form-label span {
          font-size: 0.95rem;
        }

        .form-input {
          padding: var(--space-2) var(--space-3);
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          font-family: inherit;
          font-size: 1rem;
          transition: border-color 0.2s;
        }

        .form-input:focus {
          outline: none;
          border-color: var(--color-accent);
          box-shadow: 0 0 0 3px rgba(212, 165, 116, 0.1);
        }

        textarea.form-input {
          resize: vertical;
          min-height: 120px;
        }

        .button {
          padding: var(--space-3) var(--space-6);
          border: none;
          border-radius: 6px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .button--primary {
          background: var(--color-accent);
          color: white;
        }

        .button--primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(212, 165, 116, 0.3);
        }

        .button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .form-alert {
          padding: var(--space-3) var(--space-4);
          border-radius: 6px;
          margin-bottom: var(--space-4);
        }

        .form-alert--error {
          background: #fee;
          border: 1px solid #fcc;
          color: #c33;
        }

        .form-alert--success {
          background: #efe;
          border: 1px solid #cfc;
          color: #333;
        }

        @media (max-width: 768px) {
          .contact-grid {
            grid-template-columns: 1fr;
            gap: var(--space-6);
          }

          .contact-hero {
            padding: var(--space-6) 0;
            margin-bottom: var(--space-6);
          }
        }
      `}</style>
    </>
  );
}
