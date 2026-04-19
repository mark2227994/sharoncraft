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
      <div className="hero__container">
        {/* LEFT SIDE: IMAGE */}
        <div className="hero__image-side">
          <div className="hero__image-wrapper">
            <img 
              src={heroImage} 
              alt={heroImageAlt} 
              loading="eager" 
              decoding="async"
              className="hero__image"
            />
            <div className="hero__image-overlay" />
          </div>
        </div>

        {/* RIGHT SIDE: TEXT & CTA */}
        <div className="hero__content-side">
          <div className="hero__content">
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
      </div>

      <style jsx>{`
        .hero {
          position: relative;
          width: 100%;
          background: white;
        }

        .hero__container {
          display: grid;
          grid-template-columns: 60% 40%;
          min-height: 600px;
          max-width: 1400px;
          margin: 0 auto;
        }

        /* LEFT SIDE: IMAGE */
        .hero__image-side {
          position: relative;
          overflow: hidden;
          background: #f9f6ee;
        }

        .hero__image-wrapper {
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }

        .hero__image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .hero__image-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            135deg,
            rgba(0, 0, 0, 0.1) 0%,
            rgba(0, 0, 0, 0) 50%
          );
          pointer-events: none;
        }

        /* RIGHT SIDE: CONTENT */
        .hero__content-side {
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #C04D29 0%, #B83D1F 100%);
          color: white;
          padding: var(--space-6);
        }

        .hero__content {
          max-width: 100%;
          animation: slideInRight 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .hero__overline {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          margin: 0 0 var(--space-2) 0;
          opacity: 0.85;
        }

        .hero__title {
          font-size: 2.5rem;
          font-weight: 700;
          margin: 0 0 var(--space-3) 0;
          line-height: 1.2;
          color: white;
          font-family: Georgia, serif;
        }

        .hero__subtitle {
          font-size: 1.125rem;
          line-height: 1.6;
          margin: 0 0 var(--space-5) 0;
          opacity: 0.95;
          max-width: 90%;
        }

        /* Benefits List */
        .hero__benefits {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
          margin-bottom: var(--space-5);
        }

        .hero__benefit-item {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: 0.9375rem;
          font-weight: 500;
        }

        .hero__benefit-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          font-size: 14px;
          font-weight: 700;
        }

        /* CTAs */
        .hero__cta-group {
          display: flex;
          gap: var(--space-3);
          margin-bottom: var(--space-5);
        }

        .hero__cta {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 28px;
          border-radius: 6px;
          font-weight: 600;
          font-size: 0.9375rem;
          text-decoration: none;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          border: 2px solid transparent;
          cursor: pointer;
        }

        .hero__cta--primary {
          background: white;
          color: #C04D29;
          border-color: white;
        }

        .hero__cta--primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
        }

        .hero__cta--secondary {
          background: transparent;
          color: white;
          border-color: white;
        }

        .hero__cta--secondary:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: translateY(-2px);
        }

        .hero__cta span {
          transition: transform 0.3s ease;
        }

        .hero__cta:hover span {
          transform: translateX(2px);
        }

        /* Trust Line */
        .hero__trust-line {
          font-size: 0.8125rem;
          opacity: 0.8;
          margin: 0;
          line-height: 1.5;
          max-width: 85%;
        }

        /* Animations */
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(40px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        /* TABLET */
        @media (max-width: 1024px) {
          .hero__container {
            grid-template-columns: 55% 45%;
            min-height: 500px;
          }

          .hero__title {
            font-size: 2rem;
          }

          .hero__subtitle {
            font-size: 1rem;
          }

          .hero__content-side {
            padding: var(--space-5);
          }
        }

        /* MOBILE */
        @media (max-width: 768px) {
          .hero__container {
            grid-template-columns: 1fr;
            min-height: 650px;
          }

          .hero__image-side {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 45%;
            z-index: 0;
          }

          .hero__content-side {
            position: relative;
            z-index: 1;
            min-height: 55%;
            margin-top: auto;
            padding: var(--space-5) var(--gutter);
            border-radius: 20px 20px 0 0;
          }

          .hero__title {
            font-size: 1.75rem;
            margin-bottom: var(--space-2);
          }

          .hero__subtitle {
            font-size: 0.95rem;
            margin-bottom: var(--space-4);
          }

          .hero__cta-group {
            flex-direction: column;
          }

          .hero__cta {
            width: 100%;
            justify-content: center;
            padding: 12px 20px;
          }

          .hero__benefits {
            margin-bottom: var(--space-4);
          }

          .hero__trust-line {
            font-size: 0.75rem;
          }
        }

        @media (max-width: 480px) {
          .hero__container {
            min-height: 700px;
          }

          .hero__title {
            font-size: 1.5rem;
          }

          .hero__content-side {
            min-height: 60%;
            padding: var(--space-4) var(--gutter);
          }
        }
      `}</style>
    </section>
  );
}
