import Link from "next/link";

export default function HeroBanner({
  heroImage,
  heroImageAlt = "Kenyan artisan craft",
  title = "47",
  subtitle = "Kenyan Artisans",
  description = "Made by Kenyan Artisans",
  details = "No shortcuts. Just hands. Just heart.",
  trustLine = "40+ hours per piece | Ethically made",
}) {
  return (
    <section className="hero">
      <div className="hero__background" />
      
      <div className="hero__container">
        {/* LEFT COLUMN: TEXT */}
        <div className="hero__left">
          <div className="hero__content">
            <div className="hero__number">{title}</div>
            <h1 className="hero__subtitle">{subtitle}</h1>
            
            <div className="hero__divider" />
            
            <p className="hero__details">{details}</p>
          </div>

          {/* BOTTOM BADGES */}
          <div className="hero__badges">
            <div className="hero__badge">
              <span className="hero__badge-check">✓</span>
              <span>Handcrafted</span>
            </div>
            <div className="hero__badge">
              <span className="hero__badge-check">✓</span>
              <span>Direct</span>
            </div>
            <div className="hero__badge">
              <span className="hero__badge-check">✓</span>
              <span>Limited</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: TERRACOTTA BLOCK WITH CTA */}
        <div className="hero__right">
          <div className="hero__block">
            <p className="hero__block-label">Made By</p>
            <h2 className="hero__block-title">Kenyan Artisans</h2>
            
            <p className="hero__block-text">
              No shortcuts.<br />
              Just hands.<br />
              Just heart.
            </p>

            <div className="hero__cta-group">
              <Link href="/shop">
                <a className="hero__cta hero__cta--primary">
                  Discover Now
                </a>
              </Link>
              <Link href="/about">
                <a className="hero__cta hero__cta--secondary">
                  Our Story
                </a>
              </Link>
            </div>

            <div className="hero__block-footer">
              <p className="hero__trust-line">{trustLine}</p>
            </div>
          </div>

          {/* BACKGROUND IMAGE */}
          <div className="hero__block-image">
            <img 
              src={heroImage} 
              alt={heroImageAlt}
              className="hero__image"
              loading="eager"
            />
            <div className="hero__image-overlay" />
          </div>
        </div>
      </div>

      <style jsx>{`
        .hero {
          position: relative;
          width: 100%;
          background: white;
          overflow: hidden;
          min-height: 700px;
        }

        /* Textured background pattern */
        .hero__background {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: repeating-linear-gradient(
            45deg,
            transparent,
            transparent 2px,
            rgba(192, 77, 41, 0.03) 2px,
            rgba(192, 77, 41, 0.03) 4px
          );
          pointer-events: none;
          z-index: 0;
        }

        .hero__container {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: 1fr 1fr;
          max-width: 1400px;
          margin: 0 auto;
          min-height: 700px;
          height: 100%;
        }

        /* ========== LEFT COLUMN ========== */
        .hero__left {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 100px var(--gutter);
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.95),
            rgba(249, 246, 238, 0.98)
          );
        }

        .hero__content {
          animation: fadeInUp 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        /* Large number "47" */
        .hero__number {
          font-size: 7rem;
          font-weight: 700;
          line-height: 0.9;
          margin: 0 0 var(--space-2) 0;
          color: #C04D29;
          font-family: Georgia, serif;
          letter-spacing: -2px;
        }

        /* "Kenyan Artisans" */
        .hero__subtitle {
          font-size: 2.25rem;
          font-weight: 700;
          margin: 0 0 var(--space-4) 0;
          line-height: 1.1;
          color: #0f0f0f;
          font-family: Georgia, serif;
          text-transform: none;
        }

        .hero__divider {
          width: 60px;
          height: 3px;
          background: #D4A574;
          margin: var(--space-4) 0;
        }

        /* "No shortcuts..." */
        .hero__details {
          font-size: 1.25rem;
          line-height: 1.8;
          color: #333;
          margin: 0;
          font-style: italic;
          font-weight: 400;
          font-family: Georgia, serif;
          max-width: 400px;
        }

        /* BADGES AT BOTTOM */
        .hero__badges {
          display: flex;
          gap: var(--space-3);
          margin-top: auto;
          padding-top: var(--space-6);
          border-top: 1px solid rgba(192, 77, 41, 0.1);
        }

        .hero__badge {
          display: flex;
          align-items: center;
          gap: var(--space-1);
          padding: 8px 12px;
          background: rgba(212, 165, 116, 0.15);
          border-radius: 4px;
          font-size: 0.875rem;
          font-weight: 600;
          color: #C04D29;
        }

        .hero__badge-check {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #D4A574;
          color: white;
          font-size: 12px;
          font-weight: 700;
        }

        /* ========== RIGHT COLUMN ========== */
        .hero__right {
          position: relative;
          background: #C04D29;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Terracotta block with content */
        .hero__block {
          position: relative;
          z-index: 2;
          background: #C04D29;
          padding: 60px;
          max-width: 500px;
          width: 100%;
          animation: slideInRight 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .hero__block-label {
          font-size: 0.9rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: rgba(255, 255, 255, 0.7);
          margin: 0 0 var(--space-2) 0;
        }

        .hero__block-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: white;
          margin: 0 0 var(--space-4) 0;
          line-height: 1.1;
          font-family: Georgia, serif;
        }

        .hero__block-text {
          font-size: 1.1rem;
          line-height: 1.8;
          color: rgba(255, 255, 255, 0.95);
          margin: 0 0 var(--space-5) 0;
          font-style: italic;
          font-weight: 400;
        }

        /* CTA Group */
        .hero__cta-group {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          margin-bottom: var(--space-5);
        }

        .hero__cta {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 14px 28px;
          border-radius: 4px;
          font-weight: 600;
          font-size: 0.95rem;
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
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
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

        /* Block footer */
        .hero__block-footer {
          padding-top: var(--space-4);
          border-top: 1px solid rgba(255, 255, 255, 0.2);
        }

        .hero__trust-line {
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.75);
          margin: 0;
          line-height: 1.6;
        }

        /* BACKGROUND IMAGE (behind block) */
        .hero__block-image {
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          overflow: hidden;
          opacity: 0.15;
          z-index: 1;
        }

        .hero__image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .hero__image-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            90deg,
            rgba(192, 77, 41, 1) 0%,
            rgba(192, 77, 41, 0.8) 50%,
            rgba(192, 77, 41, 0) 100%
          );
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
            grid-template-columns: 1fr;
            min-height: auto;
          }

          .hero__left {
            padding: 80px var(--gutter);
            min-height: 500px;
          }

          .hero__right {
            min-height: 500px;
          }

          .hero__number {
            font-size: 5rem;
          }

          .hero__subtitle {
            font-size: 2rem;
          }

          .hero__block {
            padding: 50px;
            max-width: 100%;
          }

          .hero__block-title {
            font-size: 2rem;
          }
        }

        /* MOBILE */
        @media (max-width: 768px) {
          .hero {
            min-height: auto;
          }

          .hero__container {
            grid-template-columns: 1fr;
          }

          .hero__left {
            padding: 60px var(--gutter);
            min-height: auto;
          }

          .hero__number {
            font-size: 4rem;
            margin-bottom: var(--space-1);
          }

          .hero__subtitle {
            font-size: 1.75rem;
            margin-bottom: var(--space-3);
          }

          .hero__details {
            font-size: 1rem;
          }

          .hero__divider {
            margin: var(--space-3) 0;
          }

          .hero__right {
            min-height: 450px;
          }

          .hero__block {
            padding: 40px;
          }

          .hero__block-title {
            font-size: 1.75rem;
          }

          .hero__block-text {
            font-size: 1rem;
          }

          .hero__badges {
            flex-wrap: wrap;
            gap: var(--space-2);
          }

          .hero__badge {
            font-size: 0.8rem;
            padding: 6px 10px;
          }
        }

        @media (max-width: 480px) {
          .hero__left {
            padding: 50px var(--gutter);
          }

          .hero__number {
            font-size: 3.5rem;
          }

          .hero__subtitle {
            font-size: 1.5rem;
          }

          .hero__block {
            padding: 30px;
          }

          .hero__block-title {
            font-size: 1.5rem;
          }

          .hero__cta-group {
            gap: var(--space-2);
          }

          .hero__cta {
            padding: 12px 20px;
            font-size: 0.875rem

          .hero__subtitle {
            font-size: 2rem;
          }

          .hero__block {
            padding: 50px;
            max-width: 100%;
          }

          .hero__block-title {
            font-size: 2rem;
          }
        }

        /* MOBILE */
        @media (max-width: 768px) {
          .hero {
            min-height: auto;
          }

          .hero__container {
            grid-template-columns: 1fr;
          }

          .hero__left {
            padding: 60px var(--gutter);
            min-height: auto;
          }

          .hero__number {
            font-size: 4rem;
            margin-bottom: var(--space-1);
          }

          .hero__subtitle {
            font-size: 1.75rem;
            margin-bottom: var(--space-3);
          }

          .hero__details {
            font-size: 1rem;
          }

          .hero__divider {
            margin: var(--space-3) 0;
          }

          .hero__right {
            min-height: 450px;
          }

          .hero__block {
            padding: 40px;
          }

          .hero__block-title {
            font-size: 1.75rem;
          }

          .hero__block-text {
            font-size: 1rem;
          }

          .hero__badges {
            flex-wrap: wrap;
            gap: var(--space-2);
          }

          .hero__badge {
            font-size: 0.8rem;
            padding: 6px 10px;
          }
        }

        @media (max-width: 480px) {
          .hero__left {
            padding: 50px var(--gutter);
          }

          .hero__number {
            font-size: 3.5rem;
          }

          .hero__subtitle {
            font-size: 1.5rem;
          }

          .hero__block {
            padding: 30px;
          }

          .hero__block-title {
            font-size: 1.5rem;
          }

          .hero__cta-group {
            gap: var(--space-2);
          }

          .hero__cta {
            padding: 12px 20px;
            font-size: 0.875rem;
          }
        }
      `}</style>
    </section>
  );
}
