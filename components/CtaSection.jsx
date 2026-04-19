import Icon from "./icons";
import Link from "next/link";
import { useScrollAnimation } from "../hooks/useScrollAnimation";

export default function CtaSection() {
  const { elementRef, isVisible } = useScrollAnimation({ threshold: 0.2 });

  return (
    <section ref={elementRef} className={`cta-section ${isVisible ? 'cta-section--visible' : ''}`}>
      <div className="cta-container">
        <div className="cta-content">
          <p className="cta-overline">Premium Collections</p>
          <h2 className="cta-title">Discover Your Perfect Piece</h2>
          <p className="cta-description">
            Every item in our curated collection tells a story. From heirloom-quality jewelry to distinctive home décor, 
            find the piece that speaks to you.
          </p>
        </div>

        <div className="cta-buttons">
          <Link href="/shop">
            <a className="cta-button cta-button--primary">
              <span>Shop Collection</span>
              <Icon name="arrow-right" size={20} />
            </a>
          </Link>
          <Link href="/about">
            <a className="cta-button cta-button--secondary">
              <span>Learn Our Story</span>
              <Icon name="arrow-right" size={20} />
            </a>
          </Link>
        </div>
      </div>

      <style jsx>{`
        .cta-section {
          padding: var(--space-8) var(--gutter);
          background: linear-gradient(
            135deg,
            rgba(192, 77, 41, 0.95) 0%,
            rgba(212, 165, 116, 0.95) 100%
          );
          position: relative;
          overflow: hidden;
        }

        .cta-section::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -10%;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }

        .cta-section::after {
          content: '';
          position: absolute;
          bottom: -30%;
          left: -5%;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.08) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }

        .cta-container {
          max-width: var(--max-width);
          margin: 0 auto;
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--space-6);
        }

        .cta-content {
          flex: 1;
          color: white;
        }

        .cta-overline {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          margin: 0 0 var(--space-2) 0;
          color: rgba(255, 255, 255, 0.85);
        }

        .cta-title {
          font-size: 2.5rem;
          font-weight: 700;
          margin: 0 0 var(--space-3) 0;
          line-height: 1.2;
          color: white;
        }

        .cta-description {
          font-size: 1.0625rem;
          line-height: 1.6;
          margin: 0;
          max-width: 500px;
          color: rgba(255, 255, 255, 0.9);
        }

        .cta-buttons {
          display: flex;
          gap: var(--space-4);
          flex-wrap: wrap;
          align-items: center;
          flex: 0 1 auto;
        }

        .cta-button {
          display: inline-flex;
          align-items: center;
          gap: var(--space-2);
          padding: 14px 32px;
          font-size: 0.9375rem;
          font-weight: 600;
          text-decoration: none;
          border-radius: 6px;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          position: relative;
          overflow: hidden;
          white-space: nowrap;
          cursor: pointer;
          border: none;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .cta-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: rgba(255, 255, 255, 0.1);
          transition: left 0.3s ease;
          z-index: 0;
        }

        .cta-button:hover::before {
          left: 0;
        }

        .cta-button span {
          position: relative;
          z-index: 1;
        }

        .cta-button svg {
          position: relative;
          z-index: 1;
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .cta-button:hover svg {
          transform: translateX(4px);
        }

        .cta-button--primary {
          background: white;
          color: #C04D29;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        }

        .cta-button--primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
        }

        .cta-button--secondary {
          background: transparent;
          color: white;
          border: 2px solid white;
        }

        .cta-button--secondary:hover {
          background: rgba(255, 255, 255, 0.15);
          transform: translateY(-2px);
        }

        /* Animations */
        .cta-section--visible .cta-content {
          animation: slideInLeft 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        .cta-section--visible .cta-buttons {
          animation: slideInRight 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s forwards;
        }

        .cta-buttons {
          opacity: 0;
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-40px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
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

        @media (max-width: 768px) {
          .cta-container {
            flex-direction: column;
            text-align: center;
            gap: var(--space-5);
          }

          .cta-title {
            font-size: 1.875rem;
          }

          .cta-description {
            font-size: 1rem;
            max-width: 100%;
          }

          .cta-buttons {
            flex-direction: column;
            width: 100%;
            justify-content: center;
          }

          .cta-button {
            width: 100%;
            justify-content: center;
          }

          .cta-section {
            padding: var(--space-6) var(--gutter);
          }
        }
      `}</style>
    </section>
  );
}
