import { useState, useRef } from "react";
import Link from "next/link";
import Icon from "./icons";

export default function ArtisanTimeline({ artisans = [] }) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const safeArtisans = Array.isArray(artisans) ? artisans.filter(Boolean) : [];

  function handleScroll() {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  }

  function scroll(direction) {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  }

  if (!safeArtisans.length) return null;

  return (
    <section className="artisan-timeline">
      <div className="artisan-timeline__header">
        <div>
          <p className="overline">Our Artisans</p>
          <h2 className="display-md">Stories from the workshop</h2>
        </div>
        <div className="artisan-timeline__nav">
          <button
            className="timeline-nav-btn"
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            aria-label="Scroll left"
          >
            <Icon name="chevronR" size={18} className="rotate-180" />
          </button>
          <button
            className="timeline-nav-btn"
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            aria-label="Scroll right"
          >
            <Icon name="chevronR" size={18} />
          </button>
        </div>
      </div>

      <div
        className="artisan-timeline__track"
        ref={scrollRef}
        onScroll={handleScroll}
      >
        {safeArtisans.map((artisan, index) => (
          <article key={index} className="timeline-card">
            <div className="timeline-card__image">
              <img src={artisan.image} alt={artisan.name} loading="lazy" />
              <div className="timeline-card__number">{String(index + 1).padStart(2, '0')}</div>
            </div>
            <div className="timeline-card__content">
              <p className="caption timeline-card__location">
                <Icon name="pin" size={12} />
                {artisan.location}
              </p>
              <h3 className="timeline-card__name">{artisan.name}</h3>
              <p className="timeline-card__craft">{artisan.craft}</p>
              <p className="timeline-card__quote">"{artisan.story?.substring(0, 100)}..."</p>
              <Link href="/artisans" className="timeline-card__link">
                Read full story <Icon name="arrowR" size={14} />
              </Link>
            </div>
          </article>
        ))}
      </div>

      <div className="artisan-timeline__footer">
        <Link href="/artisans" className="timeline-cta">
          Meet all our artisans
        </Link>
      </div>

      <style jsx>{`
        .artisan-timeline {
          padding: var(--space-7) 0;
          background: var(--color-cream);
        }
        .artisan-timeline__header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          padding: 0 var(--gutter);
          max-width: var(--max-width);
          margin: 0 auto var(--space-5);
        }
        .artisan-timeline__nav {
          display: flex;
          gap: var(--space-2);
        }
        .timeline-nav-btn {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--border-default);
          border-radius: var(--radius-md);
          background: var(--color-white);
          cursor: pointer;
          transition: all 0.2s;
        }
        .timeline-nav-btn:hover:not(:disabled) {
          border-color: var(--color-terracotta);
          color: var(--color-terracotta);
        }
        .timeline-nav-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .rotate-180 {
          transform: rotate(180deg);
        }
        .artisan-timeline__track {
          display: flex;
          gap: var(--space-4);
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          padding: var(--space-4) var(--gutter);
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .artisan-timeline__track::-webkit-scrollbar {
          display: none;
        }
        .timeline-card {
          flex: 0 0 280px;
          scroll-snap-align: start;
          background: var(--color-white);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-lg);
          overflow: hidden;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .timeline-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-card);
        }
        .timeline-card__image {
          position: relative;
          aspect-ratio: 4/3;
          overflow: hidden;
        }
        .timeline-card__image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .timeline-card__number {
          position: absolute;
          top: var(--space-3);
          left: var(--space-3);
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-terracotta);
          color: var(--color-white);
          font-size: var(--text-xs);
          font-weight: 700;
          border-radius: 50%;
        }
        .timeline-card__content {
          padding: var(--space-4);
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }
        .timeline-card__location {
          display: flex;
          align-items: center;
          gap: 4px;
          color: var(--color-ochre);
        }
        .timeline-card__name {
          font-size: var(--text-lg);
          font-weight: 600;
        }
        .timeline-card__craft {
          font-size: var(--text-sm);
          color: var(--text-secondary);
        }
        .timeline-card__quote {
          font-size: var(--text-sm);
          color: var(--text-secondary);
          font-style: italic;
          line-height: 1.5;
        }
        .timeline-card__link {
          display: flex;
          align-items: center;
          gap: var(--space-1);
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--color-terracotta);
          margin-top: var(--space-2);
        }
        .artisan-timeline__footer {
          text-align: center;
          padding: var(--space-5) var(--gutter) 0;
        }
        .timeline-cta {
          display: inline-block;
          padding: 12px 24px;
          background: var(--color-terracotta);
          color: var(--color-white);
          border-radius: var(--radius-md);
          font-weight: 600;
        }
        @media (max-width: 640px) {
          .artisan-timeline__header {
            flex-direction: column;
            align-items: flex-start;
            gap: var(--space-3);
          }
          .timeline-card {
            flex: 0 0 240px;
          }
        }
      `}</style>
    </section>
  );
}