import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import Nav from "../components/Nav";
import Footer from "../components/Footer";

export default function ReviewsPage() {
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    rating: 5,
    quote: "",
    productId: "",
  });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      const response = await fetch("/api/admin/products");
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error("Error loading products:", error);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.quote.trim()) {
      setMessage("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testimonials: [{
            id: Date.now(),
            name: formData.name,
            location: formData.location,
            rating: Number(formData.rating),
            quote: formData.quote,
            productId: formData.productId || "",
            approved: false,
            submittedAt: new Date().toISOString(),
          }],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const result = await response.json();
      setSubmitted(true);
      setMessage("✓ Thank you! Your review has been submitted and is pending approval.");
      setFormData({
        name: "",
        location: "",
        rating: 5,
        quote: "",
        productId: "",
      });

      setTimeout(() => {
        setSubmitted(false);
        setMessage("");
      }, 4000);
    } catch (error) {
      setMessage("Error submitting review. Please try again.");
      console.error("Submission error:", error.message || error);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(field, value) {
    setFormData({ ...formData, [field]: value });
  }

  return (
    <>
      <Head>
        <title>Leave a Review | SharonCraft</title>
        <meta name="description" content="Share your experience with SharonCraft handmade Kenyan jewelry and home decor. Your review helps other customers discover authentic artisan pieces." />
      </Head>

      <Nav />

      <main className="reviews-page">
        <div className="reviews-container">
          {/* Header */}
          <section className="reviews-header">
            <h1 className="display-sm">Share Your Experience</h1>
            <p className="body-lg">
              Your feedback helps us improve and helps other customers discover authentic, handcrafted Kenyan pieces.
            </p>
          </section>

          {/* Form */}
          <section className="reviews-form-section">
            <div className="reviews-form-card">
              <h2 className="heading-md" style={{ marginBottom: "var(--space-5)" }}>
                Leave a Review
              </h2>

              <form onSubmit={handleSubmit}>
                {/* Name */}
                <label className="review-field">
                  <span className="review-field__label">Your Name *</span>
                  <input
                    type="text"
                    className="review-input"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="e.g., Sarah"
                    required
                  />
                </label>

                {/* Location */}
                <label className="review-field">
                  <span className="review-field__label">Your Location *</span>
                  <input
                    type="text"
                    className="review-input"
                    value={formData.location}
                    onChange={(e) => handleChange("location", e.target.value)}
                    placeholder="e.g., London, UK"
                    required
                  />
                </label>

                {/* Rating */}
                <label className="review-field">
                  <span className="review-field__label">Star Rating *</span>
                  <div className="review-rating-select">
                    <select
                      className="review-select"
                      value={formData.rating}
                      onChange={(e) => handleChange("rating", e.target.value)}
                    >
                      <option value="5">⭐⭐⭐⭐⭐ (5 stars)</option>
                      <option value="4">⭐⭐⭐⭐ (4 stars)</option>
                      <option value="3">⭐⭐⭐ (3 stars)</option>
                      <option value="2">⭐⭐ (2 stars)</option>
                      <option value="1">⭐ (1 star)</option>
                    </select>
                  </div>
                </label>

                {/* Product */}
                <label className="review-field">
                  <span className="review-field__label">Product (Optional)</span>
                  <select
                    className="review-select"
                    value={formData.productId}
                    onChange={(e) => handleChange("productId", e.target.value)}
                  >
                    <option value="">-- Select a product you reviewed --</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name || p.title}
                      </option>
                    ))}
                  </select>
                </label>

                {/* Review Text */}
                <label className="review-field">
                  <span className="review-field__label">Your Review *</span>
                  <textarea
                    className="review-textarea"
                    rows={6}
                    value={formData.quote}
                    onChange={(e) => handleChange("quote", e.target.value)}
                    placeholder="Share your honest experience. What did you love about your purchase?"
                    required
                  />
                </label>

                {/* Message */}
                {message && (
                  <div className={`review-message ${submitted ? "review-message--success" : "review-message--error"}`}>
                    {message}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  className="review-button"
                  disabled={loading}
                >
                  {loading ? "Submitting..." : "Submit Review"}
                </button>

                <p className="review-disclaimer">
                  All reviews are moderated before appearing on our site. We appreciate your honest feedback!
                </p>
              </form>
            </div>

            {/* Reviews Stats */}
            <div className="reviews-stats">
              <h3 className="heading-sm" style={{ marginBottom: "var(--space-4)" }}>
                Why Leave a Review?
              </h3>
              <ul className="reviews-benefits">
                <li>✓ Help other customers find the right piece</li>
                <li>✓ Support independent Kenyan artisans</li>
                <li>✓ Share your authentic experience</li>
                <li>✓ Build a trusted community</li>
              </ul>
            </div>
          </section>
        </div>
      </main>

      <Footer />

      <style jsx>{`
        .reviews-page {
          min-height: 100vh;
          background: #fff;
          padding: var(--space-8) var(--gutter);
        }

        .reviews-container {
          max-width: var(--max-width);
          margin: 0 auto;
        }

        .reviews-header {
          text-align: center;
          margin-bottom: var(--space-8);
        }

        .reviews-header h1 {
          margin-bottom: var(--space-3);
        }

        .reviews-header p {
          opacity: 0.8;
          max-width: 600px;
          margin: 0 auto;
        }

        .reviews-form-section {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: var(--space-6);
          margin-bottom: var(--space-8);
        }

        .reviews-form-card {
          background: #f9f6ee;
          padding: var(--space-6);
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .review-field {
          display: flex;
          flex-direction: column;
          margin-bottom: var(--space-5);
        }

        .review-field__label {
          font-weight: 600;
          margin-bottom: var(--space-2);
          font-size: 0.95rem;
          color: #1a1a1a;
        }

        .review-input,
        .review-select,
        .review-textarea {
          padding: 10px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-family: inherit;
          font-size: 0.95rem;
          transition: all 200ms ease;
        }

        .review-input:focus,
        .review-select:focus,
        .review-textarea:focus {
          outline: none;
          border-color: #C04D29;
          box-shadow: 0 0 0 3px rgba(192, 77, 41, 0.1);
        }

        .review-textarea {
          resize: vertical;
          line-height: 1.5;
        }

        .review-rating-select {
          position: relative;
        }

        .review-button {
          width: 100%;
          padding: 12px 24px;
          background: #C04D29;
          color: white;
          border: none;
          border-radius: 4px;
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 200ms ease;
          margin-top: var(--space-4);
        }

        .review-button:hover:not(:disabled) {
          background: #a63d1f;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(192, 77, 41, 0.2);
        }

        .review-button:active:not(:disabled) {
          transform: translateY(0);
        }

        .review-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .review-message {
          padding: 12px 16px;
          border-radius: 4px;
          margin-bottom: var(--space-4);
          font-size: 0.95rem;
          line-height: 1.5;
        }

        .review-message--success {
          background: #d4f4dd;
          color: #0b5d1f;
          border: 1px solid #7fcc8f;
        }

        .review-message--error {
          background: #fdd;
          color: #c00;
          border: 1px solid #faa;
        }

        .review-disclaimer {
          font-size: 0.85rem;
          opacity: 0.7;
          margin-top: var(--space-3);
          font-style: italic;
        }

        .reviews-stats {
          background: #f5f5f5;
          padding: var(--space-5);
          border-radius: 8px;
        }

        .reviews-benefits {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .reviews-benefits li {
          padding: var(--space-2) 0;
          font-size: 0.95rem;
          line-height: 1.6;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .reviews-form-section {
            grid-template-columns: 1fr;
          }

          .reviews-page {
            padding: var(--space-6) var(--gutter);
          }

          .reviews-form-card {
            padding: var(--space-4);
          }
        }
      `}</style>
    </>
  );
}
