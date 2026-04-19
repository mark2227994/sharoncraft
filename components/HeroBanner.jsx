import Link from "next/link";

export default function HeroBanner({
  heroImage,
  heroImageAlt = "Kenyan artisan craft",
  heroDetailImage = null,
  title = "Made by 47 Kenyan Artisans",
  subtitle = "No machines. No shortcuts. Just dedication.",
  trustLine = "40+ hours per piece | Ethically sourced | Direct from workshops",
  whatsappNumber = "254112222572",
}) {
  return (
    <section className="hero">
      {/* FULL-WIDTH CONTENT TOP */}
      <div className="hero__content-section">
        <div className="hero__content-wrapper">
          <p className="hero__overline">Handcrafted Heritage</p>
          
          <h1 className="hero__title">{title}</h1>
          
          <p className="hero__subtitle">{subtitle}</p>

          {/* Key Benefits */}
          <div className="hero__benefits">
            <div className="hero__benefit-item">
              <span className="hero__benefit-icon">✓</span>
              <span>100% Handmade</span>
            </div>
            <div className="hero__benefit-item">
              <span className="hero__benefit-icon">✓</span>
              <span>Artisan Direct</span>
            </div>
            <div className="hero__benefit-item">
              <span className="hero__benefit-icon">✓</span>
              <span>Limited Edition</span>
            </div>
          </div>

          {/* CTAs */}
          <div className="hero__cta-group">
            <Link href="/shop">
              <a className="hero__cta hero__cta--primary">
                Shop Now
                <span>→</span>
              </a>
            </Link>
            <Link href="/about">
              <a className="hero__cta hero__cta--secondary">
                Learn Our Story
              </a>
            </Link>
          </div>

          {/* Trust Line */}
          <p className="hero__trust-line">{trustLine}</p>
        </div>
      </div>

      {/* FULL-WIDTH IMAGE BELOW */}
      <div className="hero__image-section">
        <div className="hero__image-wrapper">
          <img 
            src={heroImage} 
            alt={heroImageAlt} 
            loading="eager" 
            decoding="async"
            className="hero__image"
          />
          <div className="hero__image-fade" />
        </div>
      </div>

      <style jsx>{`
        .hero {
          position: relative;
          width: 100%;
          background: white;
        }

        /* ========== CONTENT SECTION (TOP) ========== */
        .hero__content-section {
          width: 100%;
          background: white;
          padding: 100px var(--gutter) 120px;
        }

        .hero__content-wrapper {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          animation: fadeInUp 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .hero__overline {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          margin: 0 0 var(--space-3) 0;
          opacity: 0.6;
          color: #C04D29;
        }

        .hero__title {
          font-size: 4rem;
          font-weight: 700;
          margin: 0 0 var(--space-5) 0;
          line-height: 1.1;
          color: #0f0f0f;
          font-family: Georgia, serif;
        }

        .hero__subtitle {
          font-size: 1.375rem;
          line-height: 1.7;
          margin: 0 0 var(--space-7) 0;
          color: #333;
          max-width: 100%;
          font-weight: 400;
        }

        /* Benefits List */
        .hero__benefits {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
          margin-bottom: var(--space-8);
        }

        .hero__benefit-item {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          font-size: 1.0625rem;
          font-weight: 500;
          color: #0f0f0f;
        }

        .hero__benefit-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          min-width: 28px;
          border-radius: 50%;
          background: #C04D29;
          color: white;
          font-size: 16px;
          font-weight: 700;
        }

        /* CTAs */
        .hero__cta-group {
          display: flex;
          gap: var(--space-4);
          margin-bottom: var(--space-8);
        }

        .hero__cta {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 16px 40px;
          border-radius: 6px;
          font-weight: 600;
          font-size: 1rem;
          text-decoration: none;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          border: 2px solid transparent;
          cursor: pointer;
        }

        .hero__cta--primary {
          background: #C04D29;
          color: white;
          border-color: #C04D29;
        }

        .hero__cta--primary:hover {
          background: #B83D1F;
          border-color: #B83D1F;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(192, 77, 41, 0.25);
        }

        .hero__cta--secondary {
          background: transparent;
          color: #C04D29;
          border-color: #C04D29;
        }

        .hero__cta--secondary:hover {
          background: rgba(192, 77, 41, 0.08);
          transform: translateY(-2px);
        }

        .hero__cta span {
          transition: transform 0.3s ease;
        }

        .hero__cta:hover span {
          transform: translateX(3px);
        }

        /* Trust Line */
        .hero__trust-line {
          font-size: 0.9375rem;
          opacity: 0.7;
          margin: 0;
          line-height: 1.8;
          max-width: 600px;
          color: #333;
        }

        /* ========== IMAGE SECTION (BOTTOM) ========== */
        .hero__image-section {
          width: 100%;
          background: #f9f6ee;
          overflow: hidden;
          min-height: 600px;
        }

        .hero__image-wrapper {
          position: relative;
          width: 100%;
          height: 100%;
          min-height: 600px;
          overflow: hidden;
        }

        .hero__image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          animation: zoomIn 1s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .hero__image-fade {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            180deg,
            rgba(0, 0, 0, 0) 0%,
            rgba(0, 0, 0, 0.1) 100%
          );
          pointer-events: none;
        }

        /* Animations */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes zoomIn {
          from {
            opacity: 0;
            transform: scale(1.05);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        /* TABLET */
        @media (max-width: 1024px) {
          .hero__content-section {
            padding: 70px var(--gutter) 90px;
          }

          .hero__content-wrapper {
            max-width: 1200px;
          }

          .hero__title {
            font-size: 3.2rem;
          }

          .hero__subtitle {
            font-size: 1.1875rem;
          }

          .hero__image-section {
            min-height: 450px;
          }

          .hero__image-wrapper {
            min-height: 450px;
          }
        }

        /* MOBILE */
        @media (max-width: 768px) {
          .hero__content-section {
            padding: 60px var(--gutter) 70px;
          }

          .hero__content-wrapper {
            max-width: 100%;
          }

          .hero__title {
            font-size: 2.25rem;
            margin-bottom: var(--space-4);
          }

          .hero__subtitle {
            font-size: 1.0625rem;
            margin-bottom: var(--space-6);
          }

          .hero__overline {
            margin-bottom: var(--space-3);
          }

          .hero__benefits {
            gap: var(--space-3);
            margin-bottom: var(--space-6);
          }

          .hero__benefit-item {
            font-size: 1rem;
          }

          .hero__cta-group {
            flex-direction: column;
            margin-bottom: var(--space-6);
          }

          .hero__cta {
            width: 100%;
            justify-content: center;
            padding: 14px 20px;
          }

          .hero__trust-line {
            font-size: 0.875rem;
          }

          .hero__image-section {
            min-height: 400px;
          }

          .hero__image-wrapper {
            min-height: 400px;
          }
        }

        @media (max-width: 480px) {
          .hero__content-section {
            padding: 50px var(--gutter) 60px;
          }

          .hero__title {
            font-size: 2rem;
            line-height: 1.2;
          }

          .hero__subtitle {
            font-size: 1rem;
            margin-bottom: var(--space-5);
          }

          .hero__image-section {
            min-height: 350px;
          }

          .hero__image-wrapper {
            min-height: 350px;
          }
        }
      `}</style>
    </section>
  );
}
