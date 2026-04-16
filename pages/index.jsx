import ArtisanCarousel from "../components/ArtisanCarousel";
import CategoryStrip from "../components/CategoryStrip";
import Footer from "../components/Footer";
import HeroBanner from "../components/HeroBanner";
import MasonryGrid from "../components/MasonryGrid";
import Nav from "../components/Nav";
import SeoHead from "../components/SeoHead";
import Icon from "../components/icons";
import { buildCollectionCards, buildFeaturedArtisans, defaultAboutStory, trustItems } from "../data/site";
import { filterPublishedProducts, getCatalogCategories, prioritizeCategories } from "../lib/products";
import { readProducts } from "../lib/store";
import { readSiteImages } from "../lib/site-images";

function SectionHeading({ title, kicker }) {
  return (
    <div className="section-heading">
      <div>
        {kicker ? <p className="overline">{kicker}</p> : null}
        <h2 className="display-md">{title}</h2>
      </div>
      <span className="section-heading__rule" aria-hidden="true" />
    </div>
  );
}

export default function HomePage({
  featuredProducts,
  recentProducts,
  allProducts,
  collectionCards,
  artisans,
  categories,
  siteContent,
}) {
  const aboutStory = String(siteContent.aboutStory || "").trim() || defaultAboutStory;

  return (
    <>
      <SeoHead
        title="Kenya Handmade Jewelry, Gifts And Decor"
        description="Shop SharonCraft for handmade Kenyan jewellery, beaded gifts, home decor, and custom artisan pieces with simple WhatsApp ordering."
        path="/"
      />
      <Nav />
      <HeroBanner
        heroImage={siteContent.heroImage}
        heroImageAlt="Kenyan artisan wearing richly beaded adornment"
        title={siteContent.heroTitle}
        subtitle={siteContent.heroSubtitle}
        trustLine={siteContent.deliveryNote}
      />
      <CategoryStrip categories={categories} activeCategory="All" />

      <main>
        <section>
          <SectionHeading title="Featured This Week" kicker="Curated now" />
          <MasonryGrid products={featuredProducts} />
        </section>

        <ArtisanCarousel artisans={artisans} products={allProducts} />

        <section id="about-story" className="about-section">
          <div className="about-section__panel">
            <div className="about-section__copy">
              <p className="overline">About SharonCraft</p>
              <h2 className="display-md">A gallery shaped by craft, memory, and everyday beauty.</h2>
              <p className="body-lg">{aboutStory}</p>
            </div>
            <div className="about-section__detail">
              <p className="caption">What you will find here</p>
              <p className="body-sm">
                Handmade pieces chosen for thoughtful gifting, meaningful personal style, and a stronger connection to
                Kenyan artisan work.
              </p>
            </div>
          </div>
        </section>

        <section id="about-gallery" className="collections-section">
          <SectionHeading title="Browse All Collections" kicker="Explore by mood" />
          <div className="collections-grid">
            {collectionCards.map((collection) => (
              <a key={collection.title} href={collection.href} className="collection-card">
                <img src={collection.image} alt={collection.title} loading="lazy" decoding="async" />
                <span className="collection-card__overlay" />
                <span className="collection-card__title display-md">{collection.title}</span>
              </a>
            ))}
          </div>
        </section>

        <section>
          <SectionHeading title="Recently Added" kicker="Fresh in the gallery" />
          <MasonryGrid products={recentProducts} />
        </section>

        <section className="trust-bar">
          {trustItems.map((item) => (
            <div key={item.label} className="trust-bar__item">
              <Icon name={item.icon} size={20} />
              <span>{item.label}</span>
            </div>
          ))}
        </section>
      </main>

      <Footer siteContent={siteContent} />

      <style jsx>{`
        main {
          padding-bottom: var(--space-7);
        }
        .section-heading {
          max-width: var(--max-width);
          margin: 0 auto;
          padding: var(--space-6) var(--gutter) 0;
          display: flex;
          align-items: center;
          gap: var(--space-4);
        }
        .section-heading__rule {
          height: 1px;
          flex: 1;
          background: var(--color-terracotta);
          opacity: 0.45;
          margin-top: 18px;
        }
        .about-section {
          max-width: var(--max-width);
          margin: 0 auto;
          padding: 0 var(--gutter);
        }
        .about-section__panel {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-4);
          padding: var(--space-5);
          background: linear-gradient(135deg, rgba(255,255,255,0.9), rgba(237,232,222,0.9));
          border: 1px solid var(--border-default);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-card);
        }
        .about-section__copy {
          display: grid;
          gap: var(--space-3);
        }
        .about-section__detail {
          align-self: end;
          padding: var(--space-4);
          background: rgba(255, 255, 255, 0.72);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-md);
        }
        .collections-section {
          padding: var(--space-3) 0 var(--space-4);
        }
        .collections-grid {
          max-width: var(--max-width);
          margin: 0 auto;
          padding: var(--space-4) var(--gutter);
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: var(--space-3);
        }
        .collections-intro {
          max-width: var(--max-width);
          margin: 0 auto;
          padding: 0 var(--gutter);
        }
        .collection-card {
          position: relative;
          min-height: 220px;
          overflow: hidden;
          border-radius: var(--radius-lg);
        }
        .collection-card img,
        .collection-card__overlay {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
        }
        .collection-card img {
          object-fit: cover;
        }
        .collection-card__overlay {
          background: linear-gradient(to top, rgba(28, 18, 9, 0.7), transparent 70%);
        }
        .collection-card__title {
          position: absolute;
          left: 18px;
          bottom: 18px;
          color: var(--color-cream);
          z-index: 1;
        }
        .trust-bar {
          max-width: var(--max-width);
          margin: 0 auto;
          padding: var(--space-6) var(--gutter) 0;
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-3);
        }
        .trust-bar__item {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          background: var(--color-white);
          padding: 18px;
          border: 1px solid var(--border-default);
          border-radius: var(--radius-md);
        }
        @media (min-width: 900px) {
          .about-section__panel {
            grid-template-columns: 1.2fr 0.8fr;
          }
          .collections-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
          .trust-bar {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }
      `}</style>
    </>
  );
}

export async function getServerSideProps() {
  const [products, siteImages] = await Promise.all([readProducts(), readSiteImages()]);
  const publishedProducts = filterPublishedProducts(products);

  return {
    props: {
      allProducts: prioritizeCategories(publishedProducts),
      featuredProducts: prioritizeCategories(publishedProducts.filter((product) => product.featured)).slice(0, 8),
      recentProducts: prioritizeCategories(publishedProducts.filter((product) => product.recent)).slice(0, 12),
      collectionCards: buildCollectionCards(siteImages),
      categories: getCatalogCategories(publishedProducts),
      artisans: buildFeaturedArtisans(siteImages),
      siteContent: siteImages,
    },
  };
}
