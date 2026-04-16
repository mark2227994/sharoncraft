import Footer from "../components/Footer";
import Nav from "../components/Nav";
import SeoHead from "../components/SeoHead";
import { defaultAboutStory } from "../data/site";
import { readSiteImages } from "../lib/site-images";

export default function AboutPage({ siteContent }) {
  const aboutStory = String(siteContent.aboutStory || "").trim() || defaultAboutStory;
  const artisanBio = String(siteContent.artisanBio || "").trim();

  return (
    <>
      <SeoHead
        title="About"
        description="Learn about SharonCraft, the craft behind the gallery, and the Kenyan artisan stories that shape each piece."
        path="/about"
        image={siteContent.artisanPortrait || "/favicon.svg"}
      />
      <Nav />
      <main className="about-page">
        <section className="about-page__intro">
          <p className="overline">About SharonCraft</p>
          <h1 className="display-lg">A gallery shaped by craft, memory, and everyday beauty.</h1>
          <p className="body-lg">{aboutStory}</p>
        </section>

        <section className="about-page__grid">
          <div className="about-page__image">
            <img
              src={siteContent.artisanPortrait || "/media/site/placeholder.svg"}
              alt="SharonCraft artisan portrait"
              loading="lazy"
              decoding="async"
            />
          </div>

          <div className="about-page__content">
            <div className="about-page__block">
              <p className="caption">What you will find here</p>
              <p className="body-base">
                Handmade pieces chosen for thoughtful gifting, meaningful personal style, and a stronger connection to
                Kenyan artisan work.
              </p>
            </div>

            {artisanBio ? (
              <div className="about-page__block">
                <p className="caption">The artisan voice</p>
                <p className="body-base">{artisanBio}</p>
              </div>
            ) : null}

            <div className="about-page__block">
              <p className="caption">How the gallery feels</p>
              <p className="body-base">
                Quietly curated, giftable, and made to feel personal rather than mass-produced. The focus stays on
                material, finish, and the story behind the object.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer siteContent={siteContent} />

      <style jsx>{`
        .about-page {
          max-width: var(--max-width);
          margin: 0 auto;
          padding: calc(var(--nav-height) + var(--space-6)) var(--gutter) var(--space-7);
          display: grid;
          gap: var(--space-6);
        }
        .about-page__intro {
          max-width: 64rem;
          display: grid;
          gap: var(--space-3);
        }
        .about-page__grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-5);
          align-items: start;
        }
        .about-page__image img {
          width: 100%;
          min-height: 340px;
          object-fit: cover;
          border-radius: 0;
          background: var(--color-cream-dark);
        }
        .about-page__content {
          display: grid;
          gap: var(--space-4);
        }
        .about-page__block {
          display: grid;
          gap: var(--space-2);
          padding: 0 0 var(--space-4);
          border-bottom: 1px solid var(--border-default);
        }
        .about-page__block:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }
        @media (min-width: 960px) {
          .about-page__grid {
            grid-template-columns: 1.05fr 0.95fr;
          }
        }
      `}</style>
    </>
  );
}

export async function getServerSideProps() {
  const siteContent = await readSiteImages();
  return { props: { siteContent } };
}
