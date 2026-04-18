import Footer from "../components/Footer";
import Nav from "../components/Nav";
import SeoHead from "../components/SeoHead";
import Icon from "../components/icons";
import { defaultAboutStory } from "../data/site";
import { readSiteImages } from "../lib/site-images";

export default function AboutPage({ siteContent }) {
  const aboutStory = String(siteContent.aboutStory || "").trim() || defaultAboutStory;
  const artisanBio = String(siteContent.artisanBio || "").trim();

  return (
    <>
      <SeoHead
        title="About SharonCraft - Handmade Kenyan Beadwork"
        description="Learn about SharonCraft, our mission to celebrate Kenyan artisans, and the story behind our handmade collection."
        path="/about"
        image={siteContent.artisanPortrait || "/favicon.svg"}
      />
      <Nav />
      <main className="about-page">
        {/* Hero Section */}
        <section className="about-page__intro">
          <p className="overline">Our Story</p>
          <h1 className="display-lg">Celebrating Kenyan Craft, One Piece at a Time</h1>
          <p className="body-lg">{aboutStory || "SharonCraft was born from a passion for authentic African artistry and a mission to connect global customers with incredible Kenyan beadwork artists. We believe every handmade piece tells a story of tradition, culture, and the skilled hands that crafted it."}</p>
          <div className="about-ctas">
            <a href="/shop" className="button button--primary">Shop Collection</a>
            <a href="/artisans" className="button button--secondary">Meet Our Artisans</a>
          </div>
        </section>

        {/* Main Grid */}
        <section className="about-page__grid">
          <div className="about-page__image">
            <img
              src={siteContent.artisanPortrait || "/media/site/placeholder.svg"}
              alt="SharonCraft artisan"
              loading="lazy"
              decoding="async"
            />
          </div>

          <div className="about-page__content">
            <div className="about-page__block">
              <p className="caption">Our Mission</p>
              <p className="body-base">
                We're on a mission to celebrate Kenyan artisanship globally. Every handmade piece supports skilled craftspeople and preserves traditional beadwork techniques for future generations while bringing authentic African culture into homes around the world.
              </p>
            </div>

            <div className="about-page__block">
              <p className="caption">What Makes Us Different</p>
              <p className="body-base">
                Handmade means each piece is unique, carries the artisan's personal touch, and supports human creativity. We believe handmade items have a soul that mass-production can never replicate. Every SharonCraft piece celebrates tradition while meeting modern design standards.
              </p>
            </div>

            {artisanBio ? (
              <div className="about-page__block">
                <p className="caption">The Artisan Voice</p>
                <p className="body-base">{artisanBio}</p>
              </div>
            ) : null}

            <div className="about-page__block">
              <p className="caption">Our Values</p>
              <p className="body-base">
                Authentic craft, cultural pride, and fair partnership. We believe in transparent relationships with our artisans, celebrating East African heritage, and creating a global community that values handmade quality and ethical commerce.
              </p>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="about-values">
          <h2 className="display-md" style={{ textAlign: "center", marginBottom: "var(--space-5)" }}>Our Core Principles</h2>
          <div className="values-grid">
            <div className="value-card">
              <Icon name="star" size={28} className="value-icon" />
              <h3>Authentic Craft</h3>
              <p>Every piece is handmade by skilled Kenyan artisans using traditional techniques. We celebrate the imperfections that make handmade items truly unique.</p>
            </div>
            <div className="value-card">
              <Icon name="pin" size={28} className="value-icon" />
              <h3>Cultural Pride</h3>
              <p>We honor East African beadwork traditions while celebrating contemporary design. Our pieces connect you to centuries of craft heritage.</p>
            </div>
            <div className="value-card">
              <Icon name="users" size={28} className="value-icon" />
              <h3>Fair Partnership</h3>
              <p>We believe in transparent, equitable partnerships with our artisans. They're the heart of SharonCraft, and we're committed to supporting their livelihoods.</p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="about-process">
          <h2 className="display-md" style={{ textAlign: "center", marginBottom: "var(--space-5)" }}>How SharonCraft Works</h2>
          <div className="process-grid">
            <div className="process-step">
              <div className="process-number">1</div>
              <h3>Partner with Artisans</h3>
              <p>We collaborate with talented Kenyan beadwork artisans, building relationships based on trust, quality, and shared values.</p>
            </div>
            <div className="process-step">
              <div className="process-number">2</div>
              <h3>Co-Design Pieces</h3>
              <p>We work closely with artisans to create pieces that honor traditional craft while appealing to modern tastes.</p>
            </div>
            <div className="process-step">
              <div className="process-number">3</div>
              <h3>Handcraft with Care</h3>
              <p>Each piece is made entirely by hand using high-quality materials, with artisans investing hours of skill and creativity.</p>
            </div>
            <div className="process-step">
              <div className="process-number">4</div>
              <h3>Tell the Story</h3>
              <p>We document the artisan's story, materials, and inspiration. When you purchase, you're investing in a person and their craft.</p>
            </div>
            <div className="process-step">
              <div className="process-number">5</div>
              <h3>Deliver Carefully</h3>
              <p>Orders ship within 24 hours with eco-friendly packaging. We stand behind every piece with our 30-day guarantee.</p>
            </div>
            <div className="process-step">
              <div className="process-number">6</div>
              <h3>Build Community</h3>
              <p>We create a community of customers who value handmade quality and cultural appreciation.</p>
            </div>
          </div>
        </section>

        {/* Impact Section */}
        <section className="about-impact">
          <h2 className="display-md" style={{ textAlign: "center", marginBottom: "var(--space-5)" }}>Our Cultural Impact</h2>
          <p style={{ textAlign: "center", color: "var(--text-secondary)", marginBottom: "var(--space-5)", fontSize: "16px", maxWidth: "700px", margin: "0 auto var(--space-5) auto" }}>
            Beadwork is more than craft—it's a language of culture, identity, and artistic expression deeply woven into East African heritage.
          </p>
          <div className="impact-list">
            <div className="impact-item">
              <span className="impact-icon">✓</span>
              <div>
                <h4>Supporting Artisans & Families</h4>
                <p>Every purchase provides direct income to skilled craftspeople and their families.</p>
              </div>
            </div>
            <div className="impact-item">
              <span className="impact-icon">✓</span>
              <div>
                <h4>Preserving Craft Traditions</h4>
                <p>We help preserve traditional beadwork techniques for future generations.</p>
              </div>
            </div>
            <div className="impact-item">
              <span className="impact-icon">✓</span>
              <div>
                <h4>Celebrating African Creativity</h4>
                <p>We showcase authentic African artistry on a global platform.</p>
              </div>
            </div>
            <div className="impact-item">
              <span className="impact-icon">✓</span>
              <div>
                <h4>Building Ethical Commerce</h4>
                <p>We're creating a more conscious, transparent marketplace for handmade goods.</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="about-faq">
          <h2 className="display-md" style={{ textAlign: "center", marginBottom: "var(--space-5)" }}>Frequently Asked</h2>
          <div className="faq-grid">
            <div className="faq-item">
              <h3>Who creates SharonCraft products?</h3>
              <p>Talented Kenyan artisans who specialize in beadwork. Each artisan brings unique skills and perspectives to their craft.</p>
            </div>
            <div className="faq-item">
              <h3>Why is everything handmade?</h3>
              <p>Handmade means unique, carries the artisan's personal touch, and supports human creativity. We believe handmade has soul.</p>
            </div>
            <div className="faq-item">
              <h3>How do you ensure quality?</h3>
              <p>Every piece is inspected before shipping. We work closely on design and materials, backed by our 30-day guarantee.</p>
            </div>
            <div className="faq-item">
              <h3>Do you do custom orders?</h3>
              <p>Absolutely! Message us on WhatsApp to discuss your vision—colors, sizes, themes, anything you imagine.</p>
            </div>
            <div className="faq-item">
              <h3>What about sustainability?</h3>
              <p>Eco-friendly packaging, ethical sourcing, fair artisan wages, and supporting traditional craft preservation.</p>
            </div>
            <div className="faq-item">
              <h3>How can I support artisans?</h3>
              <p>Every purchase directly supports them. Follow us, share your photos wearing SharonCraft, and tell others our story.</p>
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

        /* Intro Section */
        .about-page__intro {
          max-width: 64rem;
          display: grid;
          gap: var(--space-3);
          margin-bottom: var(--space-4);
        }

        .about-ctas {
          display: flex;
          gap: var(--space-3);
          flex-wrap: wrap;
          margin-top: var(--space-4);
        }

        .button {
          display: inline-block;
          padding: 14px 28px;
          border-radius: var(--radius-md);
          font-weight: 600;
          text-decoration: none;
          transition: all var(--transition-fast);
          border: none;
          cursor: pointer;
          font-size: 14px;
        }

        .button--primary {
          background: var(--color-accent);
          color: white;
        }

        .button--primary:hover {
          background: rgba(139, 90, 43, 0.9);
        }

        .button--secondary {
          background: transparent;
          color: var(--color-accent);
          border: 2px solid var(--color-accent);
        }

        .button--secondary:hover {
          background: var(--color-accent);
          color: white;
        }

        /* Main Grid */
        .about-page__grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-5);
          align-items: start;
          margin-bottom: var(--space-6);
        }

        .about-page__image img {
          width: 100%;
          min-height: 340px;
          object-fit: cover;
          border-radius: var(--radius-lg);
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

        /* Values Grid */
        .about-values {
          padding: var(--space-6) 0;
          margin: var(--space-5) 0;
        }

        .values-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: var(--space-5);
        }

        .value-card {
          padding: var(--space-5);
          background: white;
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-light);
          transition: all var(--transition-fast);
          text-align: center;
        }

        .value-card:hover {
          border-color: var(--color-accent);
          box-shadow: 0 8px 24px rgba(139, 90, 43, 0.1);
          transform: translateY(-4px);
        }

        .value-icon {
          font-size: 40px;
          margin-bottom: var(--space-3);
        }

        .value-card h3 {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: var(--space-2);
          color: var(--text-primary);
        }

        .value-card p {
          font-size: 14px;
          line-height: 1.6;
          color: var(--text-secondary);
          margin: 0;
        }

        /* Process Section */
        .about-process {
          padding: var(--space-6) 0;
          margin: var(--space-5) 0;
        }

        .process-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: var(--space-5);
        }

        .process-step {
          padding: var(--space-4);
          background: white;
          border: 1px solid var(--border-light);
          border-radius: var(--radius-lg);
          position: relative;
          transition: all var(--transition-fast);
        }

        .process-step:hover {
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
        }

        .process-number {
          position: absolute;
          top: -12px;
          left: var(--space-4);
          width: 40px;
          height: 40px;
          background: var(--color-accent);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 18px;
        }

        .process-step h3 {
          margin-top: var(--space-3);
          margin-bottom: var(--space-2);
          font-size: 16px;
          font-weight: 700;
        }

        .process-step p {
          font-size: 13px;
          line-height: 1.6;
          color: var(--text-secondary);
          margin: 0;
        }

        /* Impact Section */
        .about-impact {
          padding: var(--space-6);
          background: rgba(212, 175, 55, 0.05);
          border-radius: var(--radius-lg);
          margin: var(--space-5) 0;
        }

        .impact-list {
          display: grid;
          gap: var(--space-4);
          max-width: 800px;
          margin: 0 auto;
        }

        .impact-item {
          display: grid;
          grid-template-columns: auto 1fr;
          gap: var(--space-3);
          align-items: start;
        }

        .impact-icon {
          width: 40px;
          height: 40px;
          background: var(--color-accent);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          flex-shrink: 0;
          font-size: 20px;
        }

        .impact-item h4 {
          margin: 0 0 var(--space-1) 0;
          font-size: 16px;
          font-weight: 700;
        }

        .impact-item p {
          margin: 0;
          font-size: 14px;
          color: var(--text-secondary);
          line-height: 1.6;
        }

        /* FAQ Section */
        .about-faq {
          padding: var(--space-6) 0;
          margin: var(--space-5) 0;
        }

        .faq-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: var(--space-5);
        }

        .faq-item {
          padding: var(--space-4);
          background: white;
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-light);
          transition: all var(--transition-fast);
        }

        .faq-item:hover {
          border-color: var(--color-accent);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .faq-item h3 {
          margin: 0 0 var(--space-2) 0;
          font-size: 16px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .faq-item p {
          margin: 0;
          font-size: 13px;
          line-height: 1.6;
          color: var(--text-secondary);
        }

        /* Responsive */
        @media (min-width: 960px) {
          .about-page__grid {
            grid-template-columns: 1.05fr 0.95fr;
          }
        }

        @media (max-width: 768px) {
          .about-ctas {
            flex-direction: column;
          }

          .button {
            width: 100%;
            text-align: center;
          }

          .process-number {
            position: static;
            margin-bottom: var(--space-2);
          }

          .process-step {
            padding-top: var(--space-4);
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
