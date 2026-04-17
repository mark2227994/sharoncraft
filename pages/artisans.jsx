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
          <h1 className="display-xl">Meet Our Artisans</h1>
          <p className="body-lg">The talented hands and hearts behind every piece.</p>
        </section>

        <section className="artisans-grid">
          {artisans.map((artisan, index) => (
            <article key={index} className="artisan-card">
              <div className="artisan-card__image">
                <img src={artisan.image} alt={artisan.name} loading="lazy" />
              </div>
              <div className="artisan-card__content">
                <p className="caption artisan-card__location">
                  <Icon name="pin" size={14} />
                  {artisan.location}
                </p>
                <h2 className="display-md artisan-card__name">{artisan.name}</h2>
                <p className="artisan-card__craft">{artisan.craft}</p>
                <p className="body-base artisan-card__story">{artisan.story}</p>
                <div className="artisan-card__footer">
                  <Link href={artisan.href || "/shop"} className="artisan-card__cta">
                    Shop their collection
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </section>

        <section className="artisans-cta">
          <h2 className="display-md">Want to work with us?</h2>
          <p className="body-lg">We're always looking for talented artisans to collaborate with.</p>
          <button
            className="whatsapp-btn"
            onClick={() => window.open("https://wa.me/254112222572?text=Hi! I'm interested in collaborating with SharonCraft", "_blank")}
          >
            <Icon name="chevronR" size={18} />
            Chat with us on WhatsApp
          </button>
        </section>
      </main>
      <Footer />

      <style jsx>{`
        .artisans-hero {
          text-align: center;
          padding: var(--space-8) var(--gutter) var(--space-6);
          background: var(--color-cream);
        }
        .artisans-hero h1 {
          margin-bottom: var(--space-3);
        }
        .artisans-hero p {
          max-width: 60ch;
          margin: 0 auto;
          color: var(--text-secondary);
        }
        .artisans-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-6);
          max-width: var(--max-width);
          margin: 0 auto;
          padding: var(--space-7) var(--gutter);
        }
        .artisan-card {
          display: grid;
          gap: var(--space-5);
          background: var(--color-white);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-lg);
          overflow: hidden;
        }
        .artisan-card__image {
          aspect-ratio: 16/9;
          overflow: hidden;
        }
        .artisan-card__image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s;
        }
        .artisan-card:hover .artisan-card__image img {
          transform: scale(1.05);
        }
        .artisan-card__content {
          padding: 0 var(--space-5) var(--space-5);
          display: grid;
          gap: var(--space-3);
        }
        .artisan-card__location {
          display: flex;
          align-items: center;
          gap: var(--space-1);
          color: var(--color-ochre);
        }
        .artisan-card__name {
          line-height: 1.2;
        }
        .artisan-card__craft {
          color: var(--text-secondary);
          font-weight: 500;
        }
        .artisan-card__story {
          color: var(--text-secondary);
          line-height: 1.6;
        }
        .artisan-card__cta {
          display: inline-flex;
          padding: 12px 20px;
          background: var(--color-terracotta);
          color: var(--color-white);
          border-radius: var(--radius-md);
          font-weight: 600;
          text-align: center;
        }
        .artisans-cta {
          text-align: center;
          padding: var(--space-8) var(--gutter);
          background: var(--color-cream);
        }
        .artisans-cta h2 {
          margin-bottom: var(--space-3);
        }
        .artisans-cta p {
          margin-bottom: var(--space-5);
          color: var(--text-secondary);
        }
        .whatsapp-btn {
          display: inline-flex;
          align-items: center;
          gap: var(--space-2);
          padding: 14px 28px;
          background: #25d366;
          color: white;
          border-radius: var(--radius-md);
          font-weight: 600;
          cursor: pointer;
          border: none;
        }
        .whatsapp-btn:hover {
          background: #128c7e;
        }
        @media (min-width: 768px) {
          .artisans-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (min-width: 1024px) {
          .artisans-grid {
            grid-template-columns: repeat(3, 1fr);
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