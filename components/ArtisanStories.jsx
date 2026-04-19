import { useState } from "react";

export default function ArtisanStories({ artisans }) {
  const [expandedIndex, setExpandedIndex] = useState(null);

  if (!artisans || artisans.length === 0) return null;

  return (
    <>
      <div className="artisan-stories-grid">
        {artisans.map((artisan, index) => (
          <div
            key={index}
            className={`artisan-story-card ${expandedIndex === index ? "expanded" : ""}`}
            onMouseEnter={() => setExpandedIndex(index)}
            onMouseLeave={() => setExpandedIndex(null)}
            onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
          >
            {/* Portrait Section */}
            <div className="story-card-portrait">
              {artisan.image && (
                <img src={artisan.image} alt={artisan.name} className="story-card-image" />
              )}
              <div className="story-card-overlay" />
            </div>

            {/* Content Section */}
            <div className="story-card-content">
              <div className="story-card-header">
                <h3 className="story-card-name">{artisan.name}</h3>
                <span className="story-card-location">📍 {artisan.location}</span>
              </div>

              <div className="story-card-craft-badge">
                <span className="craft-icon">✨</span>
                <span className="craft-label">{artisan.craft}</span>
              </div>

              {/* Philosophy/Story Quote */}
              <blockquote className="story-card-quote">
                "{artisan.story}"
              </blockquote>

              {/* Expanded Content */}
              {expandedIndex === index && (
                <div className="story-card-expanded">
                  <a href={artisan.href} className="story-card-link">
                    Shop {artisan.name}'s Work →
                  </a>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .artisan-stories-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--space-5);
          margin-top: var(--space-6);
        }

        .artisan-story-card {
          display: flex;
          flex-direction: column;
          background: white;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid var(--border-default);
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          cursor: pointer;
          height: 100%;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .artisan-story-card:hover,
        .artisan-story-card.expanded {
          box-shadow: 0 12px 32px rgba(212, 165, 116, 0.15);
          border-color: rgba(212, 165, 116, 0.5);
          transform: translateY(-8px);
        }

        /* Portrait Section */
        .story-card-portrait {
          position: relative;
          width: 100%;
          padding-top: 100%;
          background: linear-gradient(135deg, rgba(212, 165, 116, 0.1) 0%, rgba(212, 165, 116, 0.05) 100%);
          overflow: hidden;
        }

        .story-card-image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }

        .artisan-story-card:hover .story-card-image,
        .artisan-story-card.expanded .story-card-image {
          transform: scale(1.08);
        }

        .story-card-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.1) 100%);
          pointer-events: none;
        }

        /* Content Section */
        .story-card-content {
          flex: 1;
          padding: var(--space-4);
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .story-card-header {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
        }

        .story-card-name {
          font-size: 1.1rem;
          font-weight: 700;
          margin: 0;
          color: var(--text-primary);
          letter-spacing: -0.3px;
        }

        .story-card-location {
          font-size: 0.85rem;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .story-card-craft-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          width: fit-content;
          padding: 6px 12px;
          background: linear-gradient(135deg, rgba(212, 165, 116, 0.15) 0%, rgba(212, 165, 116, 0.08) 100%);
          border-radius: 20px;
          border: 1px solid rgba(212, 165, 116, 0.3);
        }

        .craft-icon {
          font-size: 1rem;
        }

        .craft-label {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-primary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .story-card-quote {
          flex: 1;
          font-size: 0.95rem;
          font-style: italic;
          line-height: 1.6;
          color: var(--text-secondary);
          margin: 0;
          padding: var(--space-3);
          background: rgba(212, 165, 116, 0.04);
          border-left: 3px solid var(--color-terracotta);
          border-radius: 4px;
        }

        .story-card-expanded {
          animation: slideDown 0.3s ease forwards;
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
          padding-top: var(--space-2);
          border-top: 1px solid var(--border-default);
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            max-height: 0;
          }
          to {
            opacity: 1;
            max-height: 100px;
          }
        }

        .story-card-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: linear-gradient(135deg, #d4a574 0%, #c49464 100%);
          color: white;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          font-size: 0.9rem;
          transition: all 0.3s ease;
          border: none;
          cursor: pointer;
        }

        .story-card-link:hover {
          transform: translateX(4px);
          box-shadow: 0 6px 16px rgba(212, 165, 116, 0.35);
        }

        /* Responsive */
        @media (max-width: 899px) {
          .artisan-stories-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: var(--space-4);
          }
        }

        @media (max-width: 599px) {
          .artisan-stories-grid {
            grid-template-columns: 1fr;
            gap: var(--space-4);
          }

          .artisan-story-card:hover,
          .artisan-story-card.expanded {
            transform: none;
          }

          .story-card-content {
            padding: var(--space-3);
            gap: var(--space-2);
          }

          .story-card-quote {
            font-size: 0.9rem;
            padding: var(--space-2);
          }
        }
      `}</style>
    </>
  );
}
