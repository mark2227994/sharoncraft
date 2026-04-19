export default function BrandStory() {
  return (
    <>
      <section className="brand-story-section">
        <div className="brand-story-container">
          {/* Content Side */}
          <div className="brand-story-content">
            <div className="brand-story-header">
              <p className="overline">Our Heritage</p>
              <h2 className="display-md">The SharonCraft Story</h2>
            </div>

            <div className="brand-story-body">
              <p className="brand-story-paragraph">
                SharonCraft began with a simple belief: that the hands of Kenyan artisans deserve to tell their story through every bead, every thread, every handcrafted piece.
              </p>

              <p className="brand-story-paragraph">
                In the workshops of Nairobi, Kisumu, and the Maasai heartland, master craftspeople have perfected techniques passed down through generations. Their work isn't just jewelry or home décor—it's a tangible connection to heritage, culture, and the pride of creating something lasting.
              </p>

              <p className="brand-story-paragraph">
                We believe fair trade should be the default, not the exception. Every piece from SharonCraft supports artisans directly, ensuring they earn what their craft deserves. We're not just selling products; we're building relationships with the makers behind them.
              </p>

              <div className="brand-story-values">
                <div className="value-item">
                  <div className="value-icon">🤝</div>
                  <h4>Direct Partnership</h4>
                  <p>Work directly with artisans, cutting out middlemen</p>
                </div>

                <div className="value-item">
                  <div className="value-icon">🌍</div>
                  <h4>Cultural Pride</h4>
                  <p>Celebrate Kenyan heritage through authentic craftsmanship</p>
                </div>

                <div className="value-item">
                  <div className="value-icon">💚</div>
                  <h4>Fair Wages</h4>
                  <p>Artisans earn 3x+ market rate for their exceptional work</p>
                </div>

                <div className="value-item">
                  <div className="value-icon">♻️</div>
                  <h4>Sustainable</h4>
                  <p>Ethical sourcing and responsible production practices</p>
                </div>
              </div>

              <a href="/about" className="brand-story-cta">
                Learn More About Our Mission →
              </a>
            </div>
          </div>

          {/* Image Side */}
          <div className="brand-story-visual">
            <div className="brand-story-image-wrapper">
              <div className="brand-story-image-placeholder">
                <div className="placeholder-icon">🧵</div>
                <p>Workshop Heritage</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .brand-story-section {
          padding: var(--space-8) 0;
          background: linear-gradient(135deg, rgba(212, 165, 116, 0.03) 0%, rgba(212, 165, 116, 0.01) 100%);
        }

        .brand-story-container {
          max-width: var(--max-width);
          margin: 0 auto;
          padding: 0 var(--gutter);
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-8);
          align-items: center;
        }

        .brand-story-header {
          margin-bottom: var(--space-6);
        }

        .brand-story-header .overline {
          margin: 0;
          color: var(--text-secondary);
        }

        .brand-story-header .display-md {
          margin: var(--space-2) 0 0;
          color: var(--text-primary);
        }

        .brand-story-body {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .brand-story-paragraph {
          font-size: 1rem;
          line-height: 1.8;
          color: var(--text-primary);
          margin: 0;
        }

        .brand-story-values {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--space-4);
          margin: var(--space-2) 0;
          padding: var(--space-4) 0;
        }

        .value-item {
          padding: var(--space-3);
          background: white;
          border-radius: 8px;
          border: 1px solid var(--border-default);
          text-align: center;
        }

        .value-icon {
          font-size: 2rem;
          margin-bottom: var(--space-2);
        }

        .value-item h4 {
          font-size: 0.95rem;
          font-weight: 700;
          margin: var(--space-1) 0;
          color: var(--text-primary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .value-item p {
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin: 0;
          line-height: 1.5;
        }

        .brand-story-cta {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 28px;
          background: linear-gradient(135deg, #C04D29 0%, #A03D1F 100%);
          color: white;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.95rem;
          transition: all 0.3s ease;
          border: none;
          cursor: pointer;
          align-self: flex-start;
          margin-top: var(--space-2);
        }

        .brand-story-cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(192, 77, 41, 0.3);
        }

        .brand-story-visual {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .brand-story-image-wrapper {
          position: relative;
          width: 100%;
          aspect-ratio: 1;
          border-radius: 12px;
          overflow: hidden;
          border: 2px solid rgba(192, 77, 41, 0.2);
        }

        .brand-story-image-placeholder {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, rgba(192, 77, 41, 0.1) 0%, rgba(192, 77, 41, 0.05) 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: var(--space-3);
        }

        .placeholder-icon {
          font-size: 4rem;
          opacity: 0.6;
        }

        .brand-story-image-placeholder p {
          font-size: 1.1rem;
          color: #C04D29;
          font-weight: 600;
          margin: 0;
        }

        @media (max-width: 899px) {
          .brand-story-container {
            grid-template-columns: 1fr;
            gap: var(--space-6);
          }

          .brand-story-image-wrapper {
            aspect-ratio: auto;
            min-height: 300px;
          }

          .brand-story-values {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 599px) {
          .brand-story-section {
            padding: var(--space-6) 0;
          }

          .brand-story-container {
            padding: 0 var(--gutter);
            gap: var(--space-4);
          }

          .brand-story-paragraph {
            font-size: 0.95rem;
            line-height: 1.7;
          }

          .brand-story-values {
            grid-template-columns: 1fr;
            gap: var(--space-3);
          }

          .value-item {
            padding: var(--space-2);
          }

          .value-icon {
            font-size: 1.5rem;
          }

          .brand-story-cta {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </>
  );
}
