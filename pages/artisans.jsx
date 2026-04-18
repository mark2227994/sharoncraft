import Link from "next/link";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import SeoHead from "../components/SeoHead";
import Icon from "../components/icons";

export default function ArtisansPage({ artisans = [] }) {
  return (
    <>
      <SeoHead
        title="Meet Our Artisans - SharonCraft"
        description="Discover the talented Kenyan artisans behind our handmade jewelry and home decor. Read their stories and shop their unique creations."
        path="/artisans"
      />
      <Nav />
      <main>
        <section className="artisans-hero">
          <div className="artisans-hero__content">
            <p className="overline">Our Community</p>
            <h1 className="display-lg">Meet Our Artisans</h1>
            <p className="body-lg">The talented hands and hearts behind every handmade piece. Each artisan brings unique skills, creativity, and dedication to their craft.</p>
          </div>
        </section>

        <section className="artisans-intro">
          <div className="artisans-intro__grid">
            <div className="artisans-intro__card">
              <div className="artisans-intro__icon">🎨</div>
              <h3>Skilled Craftspeople</h3>
              <p>Each artisan has years of experience in traditional beadwork techniques, creating unique pieces with authentic heritage.</p>
            </div>
            <div className="artisans-intro__card">
              <div className="artisans-intro__icon">🌍</div>
              <h3>Kenyan Heritage</h3>
              <p>Our artisans are based across Kenya, bringing diverse perspectives and cultural traditions to their work.</p>
            </div>
            <div className="artisans-intro__card">
              <div className="artisans-intro__icon">✨</div>
              <h3>Unique Stories</h3>
              <p>Every artisan has a story to share about their craft, inspiration, and journey with SharonCraft.</p>
            </div>
          </div>
        </section>

        <section className="artisans-grid">
          {artisans.map((artisan, index) => (
            <article key={index} className="artisan-card">
              <div className="artisan-card__image">
                <img src={artisan.image} alt={artisan.name} loading="lazy" />
                <div className="artisan-card__overlay">
                  <Link href={artisan.href || "/shop"} className="artisan-card__view-btn">
                    View Collection
                  </Link>
                </div>
              </div>
              <div className="artisan-card__content">
                <div className="artisan-card__header">
                  <h2 className="artisan-card__name">{artisan.name}</h2>
                  <p className="artisan-card__location">
                    <span className="location-pin">📍</span>
                    {artisan.location}
                  </p>
                </div>
                <p className="artisan-card__craft">{artisan.craft}</p>
                <p className="artisan-card__story">{artisan.story}</p>
                <div className="artisan-card__footer">
                  <div className="artisan-stats">
                    <div className="stat">
                      <span className="stat-value">5★</span>
                      <span className="stat-label">Rating</span>
                    </div>
                    <div className="stat">
                      <span className="stat-value">50+</span>
                      <span className="stat-label">Pieces</span>
                    </div>
                  </div>
                  <Link href={artisan.href || "/shop"} className="artisan-card__cta">
                    Shop Collection
                    <span>→</span>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </section>

        <section className="artisans-story">
          <h2 className="display-md">Why We Partner With Artisans</h2>
          <div className="artisans-story__grid">
            <div className="story-block">
              <h3>Fair Compensation</h3>
              <p>We believe artisans deserve fair wages for their skilled labor. Our partnerships ensure they're compensated generously and consistently.</p>
            </div>
            <div className="story-block">
              <h3>Creative Freedom</h3>
              <p>Each artisan brings their unique vision to the collection. We collaborate on design, but always respect their creative expertise.</p>
            </div>
            <div className="story-block">
              <h3>Sustainable Craft</h3>
              <p>We're committed to preserving traditional techniques and supporting artisans as they grow their craft and businesses.</p>
            </div>
            <div className="story-block">
              <h3>Global Platform</h3>
              <p>Our artisans deserve a global stage for their work. We're proud to connect their creations with customers worldwide.</p>
            </div>
          </div>
        </section>

        <section className="artisans-cta">
          <h2 className="display-md">Want to Collaborate?</h2>
          <p className="body-lg">We're always looking for talented artisans to join the SharonCraft community.</p>
          <p className="artisans-cta__subtitle">If you're a skilled beadwork artist or craftsperson interested in working with us, we'd love to hear from you.</p>
          <button
            className="whatsapp-btn"
            onClick={() => window.open("https://wa.me/254112222572?text=Hi! I'm interested in collaborating with SharonCraft as an artisan", "_blank")}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.162-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Chat with us on WhatsApp
          </button>
        </section>
      </main>
      <Footer />

      <style jsx>{`
        /* Hero Section */
        .artisans-hero {
          padding: calc(var(--nav-height) + var(--space-8)) var(--gutter) var(--space-6);
          background: linear-gradient(135deg, rgba(139, 90, 43, 0.05), rgba(212, 175, 55, 0.05));
          text-align: center;
        }

        .artisans-hero__content {
          max-width: 800px;
          margin: 0 auto;
        }

        .artisans-hero__content p:first-of-type {
          margin-bottom: 12px;
        }

        .artisans-hero__content h1 {
          margin-bottom: var(--space-3);
        }

        .artisans-hero__content > p {
          color: var(--text-secondary);
          line-height: 1.8;
        }

        /* Intro Cards */
        .artisans-intro {
          padding: var(--space-6) var(--gutter);
          background: white;
        }

        .artisans-intro__grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: var(--space-5);
          max-width: 1200px;
          margin: 0 auto;
        }

        .artisans-intro__card {
          padding: var(--space-4);
          text-align: center;
          background: white;
          border: 1px solid var(--border-light);
          border-radius: var(--radius-lg);
          transition: all var(--transition-fast);
        }

        .artisans-intro__card:hover {
          border-color: var(--color-accent);
          box-shadow: 0 8px 24px rgba(139, 90, 43, 0.1);
          transform: translateY(-4px);
        }

        .artisans-intro__icon {
          font-size: 40px;
          margin-bottom: var(--space-3);
        }

        .artisans-intro__card h3 {
          margin-bottom: var(--space-2);
          font-size: 16px;
          font-weight: 700;
        }

        .artisans-intro__card p {
          margin: 0;
          font-size: 13px;
          color: var(--text-secondary);
          line-height: 1.6;
        }

        /* Artisan Grid */
        .artisans-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-6);
          max-width: 1200px;
          margin: 0 auto;
          padding: var(--space-7) var(--gutter);
        }

        .artisan-card {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0;
          background: white;
          border: 1px solid var(--border-default);
          border-radius: var(--radius-lg);
          overflow: hidden;
          transition: all var(--transition-fast);
        }

        .artisan-card:hover {
          border-color: var(--color-accent);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
          transform: translateY(-4px);
        }

        .artisan-card__image {
          position: relative;
          aspect-ratio: 16/9;
          overflow: hidden;
        }

        .artisan-card__image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .artisan-card:hover .artisan-card__image img {
          transform: scale(1.05);
        }

        .artisan-card__overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .artisan-card:hover .artisan-card__overlay {
          opacity: 1;
        }

        .artisan-card__view-btn {
          padding: 12px 28px;
          background: var(--color-accent);
          color: white;
          border-radius: var(--radius-md);
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .artisan-card__view-btn:hover {
          background: rgba(139, 90, 43, 0.9);
        }

        .artisan-card__content {
          padding: var(--space-4);
          display: grid;
          gap: var(--space-3);
        }

        .artisan-card__header {
          display: grid;
          gap: var(--space-1);
        }

        .artisan-card__name {
          margin: 0;
          font-size: 24px;
          font-weight: 700;
          line-height: 1.2;
        }

        .artisan-card__location {
          display: flex;
          align-items: center;
          gap: var(--space-1);
          color: var(--color-accent);
          font-weight: 500;
          font-size: 13px;
          margin: 0;
        }

        .location-pin {
          font-size: 14px;
        }

        .artisan-card__craft {
          margin: 0;
          color: var(--text-secondary);
          font-weight: 600;
          font-size: 14px;
        }

        .artisan-card__story {
          margin: 0;
          color: var(--text-secondary);
          line-height: 1.6;
          font-size: 13px;
        }

        .artisan-card__footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: var(--space-3);
          margin-top: var(--space-2);
          padding-top: var(--space-3);
          border-top: 1px solid var(--border-light);
        }

        .artisan-stats {
          display: flex;
          gap: var(--space-4);
        }

        .stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .stat-value {
          font-weight: 700;
          font-size: 14px;
          color: var(--color-accent);
        }

        .stat-label {
          font-size: 11px;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .artisan-card__cta {
          display: inline-flex;
          align-items: center;
          gap: var(--space-2);
          padding: 10px 16px;
          background: var(--color-accent);
          color: white;
          border-radius: var(--radius-md);
          font-weight: 600;
          text-decoration: none;
          transition: all var(--transition-fast);
          font-size: 13px;
          white-space: nowrap;
        }

        .artisan-card__cta:hover {
          background: rgba(139, 90, 43, 0.9);
          transform: translateX(2px);
        }

        /* Story Section */
        .artisans-story {
          padding: var(--space-8) var(--gutter);
          background: #f9fafb;
        }

        .artisans-story h2 {
          text-align: center;
          margin-bottom: var(--space-6);
        }

        .artisans-story__grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: var(--space-5);
          max-width: 1200px;
          margin: 0 auto;
        }

        .story-block {
          padding: var(--space-5);
          background: white;
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-light);
          transition: all var(--transition-fast);
        }

        .story-block:hover {
          border-color: var(--color-accent);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
        }

        .story-block h3 {
          margin: 0 0 var(--space-2) 0;
          font-size: 16px;
          font-weight: 700;
        }

        .story-block p {
          margin: 0;
          font-size: 13px;
          color: var(--text-secondary);
          line-height: 1.6;
        }

        /* CTA Section */
        .artisans-cta {
          text-align: center;
          padding: var(--space-8) var(--gutter);
          background: linear-gradient(135deg, var(--color-accent) 0%, rgba(139, 90, 43, 0.9) 100%);
          color: white;
        }

        .artisans-cta h2 {
          margin-bottom: var(--space-3);
          color: white;
        }

        .artisans-cta > p {
          margin-bottom: var(--space-2);
          color: rgba(255, 255, 255, 0.95);
        }

        .artisans-cta__subtitle {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.85);
          margin-bottom: var(--space-5);
        }

        .whatsapp-btn {
          display: inline-flex;
          align-items: center;
          gap: var(--space-2);
          padding: 14px 28px;
          background: white;
          color: #25d366;
          border-radius: var(--radius-md);
          font-weight: 600;
          cursor: pointer;
          border: none;
          transition: all var(--transition-fast);
          font-size: 14px;
        }

        .whatsapp-btn:hover {
          background: rgba(255, 255, 255, 0.95);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        }

        /* Responsive */
        @media (min-width: 768px) {
          .artisans-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .artisan-card {
            grid-template-columns: 1fr 1fr;
          }

          .artisan-card__image {
            aspect-ratio: auto;
            min-height: 300px;
          }

          .artisan-card__content {
            justify-content: space-between;
          }
        }

        @media (min-width: 1024px) {
          .artisans-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .artisan-card__footer {
            flex-direction: column;
            align-items: flex-start;
          }

          .artisan-card__cta {
            width: 100%;
            justify-content: center
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .artisan-card:hover .artisan-card__image img {
          transform: scale(1.05);
        }

        .artisan-card__overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .artisan-card:hover .artisan-card__overlay {
          opacity: 1;
        }

        .artisan-card__view-btn {
          padding: 12px 28px;
          background: var(--color-accent);
          color: white;
          border-radius: var(--radius-md);
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .artisan-card__view-btn:hover {
          background: rgba(139, 90, 43, 0.9);
        }

        .artisan-card__content {
          padding: var(--space-4);
          display: grid;
          gap: var(--space-3);
        }

        .artisan-card__header {
          display: grid;
          gap: var(--space-1);
        }

        .artisan-card__name {
          margin: 0;
          font-size: 24px;
          font-weight: 700;
          line-height: 1.2;
        }

        .artisan-card__location {
          display: flex;
          align-items: center;
          gap: var(--space-1);
          color: var(--color-accent);
          font-weight: 500;
          font-size: 13px;
          margin: 0;
        }

        .location-pin {
          font-size: 14px;
        }

        .artisan-card__craft {
          margin: 0;
          color: var(--text-secondary);
          font-weight: 600;
          font-size: 14px;
        }

        .artisan-card__story {
          margin: 0;
          color: var(--text-secondary);
          line-height: 1.6;
          font-size: 13px;
        }

        .artisan-card__footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: var(--space-3);
          margin-top: var(--space-2);
          padding-top: var(--space-3);
          border-top: 1px solid var(--border-light);
        }

        .artisan-stats {
          display: flex;
          gap: var(--space-4);
        }

        .stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .stat-value {
          font-weight: 700;
          font-size: 14px;
          color: var(--color-accent);
        }

        .stat-label {
          font-size: 11px;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .artisan-card__cta {
          display: inline-flex;
          align-items: center;
          gap: var(--space-2);
          padding: 10px 16px;
          background: var(--color-accent);
          color: white;
          border-radius: var(--radius-md);
          font-weight: 600;
          text-decoration: none;
          transition: all var(--transition-fast);
          font-size: 13px;
          white-space: nowrap;
        }

        .artisan-card__cta:hover {
          background: rgba(139, 90, 43, 0.9);
          transform: translateX(2px);
        }

        /* Story Section */
        .artisans-story {
          padding: var(--space-8) var(--gutter);
          background: #f9fafb;
        }

        .artisans-story h2 {
          text-align: center;
          margin-bottom: var(--space-6);
        }

        .artisans-story__grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: var(--space-5);
          max-width: 1200px;
          margin: 0 auto;
        }

        .story-block {
          padding: var(--space-5);
          background: white;
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-light);
          transition: all var(--transition-fast);
        }

        .story-block:hover {
          border-color: var(--color-accent);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
        }

        .story-block h3 {
          margin: 0 0 var(--space-2) 0;
          font-size: 16px;
          font-weight: 700;
        }

        .story-block p {
          margin: 0;
          font-size: 13px;
          color: var(--text-secondary);
          line-height: 1.6;
        }

        /* CTA Section */
        .artisans-cta {
          text-align: center;
          padding: var(--space-8) var(--gutter);
          background: linear-gradient(135deg, var(--color-accent) 0%, rgba(139, 90, 43, 0.9) 100%);
          color: white;
        }

        .artisans-cta h2 {
          margin-bottom: var(--space-3);
          color: white;
        }

        .artisans-cta > p {
          margin-bottom: var(--space-2);
          color: rgba(255, 255, 255, 0.95);
        }

        .artisans-cta__subtitle {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.85);
          margin-bottom: var(--space-5);
        }

        .whatsapp-btn {
          display: inline-flex;
          align-items: center;
          gap: var(--space-2);
          padding: 14px 28px;
          background: white;
          color: #25d366;
          border-radius: var(--radius-md);
          font-weight: 600;
          cursor: pointer;
          border: none;
          transition: all var(--transition-fast);
          font-size: 14px;
        }

        .whatsapp-btn:hover {
          background: rgba(255, 255, 255, 0.95);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        }

        /* Responsive */
        @media (min-width: 768px) {
          .artisans-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .artisan-card {
            grid-template-columns: 1fr 1fr;
          }

          .artisan-card__image {
            aspect-ratio: auto;
            min-height: 300px;
          }

          .artisan-card__content {
            justify-content: space-between;
          }
        }

        @media (min-width: 1024px) {
          .artisans-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .artisan-card__footer {
            flex-direction: column;
            align-items: flex-start;
          }

          .artisan-card__cta {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </>
  );
}

export async function getServerSideProps() {
  const { readSiteImages } = await import("../lib/site-images");
  const { buildFeaturedArtisans } = await import("../data/site");

  let siteImages = {};
  try {
    siteImages = await readSiteImages();
  } catch (e) {
    console.error("Error reading site images:", e);
  }

  const artisans = buildFeaturedArtisans(siteImages);

  return {
    props: {
      artisans: artisans || [],
    },
  };
}