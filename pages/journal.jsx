import Footer from "../components/Footer";
import Nav from "../components/Nav";
import SeoHead from "../components/SeoHead";
import Link from "next/link";

export default function JournalPage() {
  const articles = [
    {
      id: 1,
      kicker: "Heritage Series",
      title: "The History of Maasai Beadwork and Modern Revival",
      description: "Dive deep into the color theory, cultural significance, and centuries-old tradition behind the intricate Maasai beadwork styles that inspire our collections today.",
      href: "/journal/history-of-maasai-beadwork",
    },
    {
      id: 2,
      kicker: "Buying Guide",
      title: "Where to buy Kenyan artifacts without ending up with generic souvenir pieces.",
      description: "Learn what to look for in authentic handmade artifact pages, what makes gifting easier, and how to compare decor-led options more confidently.",
      href: "/journal/where-to-buy-kenyan-artifacts",
    },
    {
      id: 3,
      kicker: "Style Guide",
      title: "How to choose Maasai jewelry for events, gifts, and everyday wear.",
      description: "Use occasion, outfit balance, and gift intent to narrow your choice much faster before you start comparing individual pieces.",
      href: "/journal/how-to-choose-maasai-jewelry",
    },
    {
      id: 4,
      kicker: "Gift Guide",
      title: "Best handmade Kenyan gifts for weddings, birthdays, and housewarming moments.",
      description: "Understand when to choose jewelry, decor, or occasion sets depending on who the gift is for and how personal it should feel.",
      href: "/journal/best-handmade-kenyan-gifts",
    },
    {
      id: 5,
      kicker: "Decor Guide",
      title: "How to style beaded home decor in a modern room without making it feel crowded.",
      description: "Use beaded decor as one strong room moment, then build around it with balance instead of visual noise.",
      href: "/journal/how-to-style-beaded-home-decor",
    },
  ];

  return (
    <>
      <SeoHead
        title="Kenyan Beadwork Journal | SharonCraft Guides On Maasai Jewelry, Gifts And Decor"
        description="Read SharonCraft guides on Maasai jewelry, Kenyan artifacts, handmade gifts, and beaded home decor to help buyers shop with confidence."
        path="/journal"
        image="/apple-touch-icon.png"
      />
      <Nav />
      <main className="journal-page">
        {/* Hero Section */}
        <section className="journal-page__hero">
          <div className="container">
            <p className="overline">SharonCraft Journal</p>
            <h1 className="display-lg">Buyer guides, culture, and search-friendly knowledge around Kenyan beadwork.</h1>
            <p className="body-lg">Use these articles to understand Maasai jewelry, handmade Kenyan gifts, artifact buying, and how to style beaded decor before you shop.</p>
          </div>
        </section>

        {/* Guides Section */}
        <section className="journal-page__guides">
          <div className="container">
            <div className="section-heading">
              <p className="overline">Latest Guides</p>
              <h2 className="display-md">Start with the topic closest to your search.</h2>
              <p className="body-lg">Each guide supports a different buying intent, from cultural research to gift decisions and decor styling.</p>
            </div>

            <div className="journal-page__grid">
              {articles.map((article) => (
                <article key={article.id} className="story-card">
                  <p className="overline">{article.kicker}</p>
                  <h3 className="display-sm">{article.title}</h3>
                  <p className="body-base">{article.description}</p>
                  <div className="cta-row" style={{ marginTop: "1rem" }}>
                    <a href={article.href} className="button button--primary">
                      Read Guide
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />

      <style jsx>{`
        .journal-page {
          min-height: 100vh;
        }

        .journal-page__hero {
          background: linear-gradient(135deg, #f9f6ee 0%, #faf7f2 100%);
          padding: var(--space-8) 0;
          text-align: center;
        }

        .journal-page__hero .container {
          max-width: 800px;
          margin: 0 auto;
        }

        .journal-page__hero h1 {
          margin: var(--space-3) 0 var(--space-4) 0;
          color: #0f0f0f;
        }

        .journal-page__hero .body-lg {
          color: #666;
          font-size: 18px;
          line-height: 1.6;
        }

        .section-heading {
          text-align: center;
          margin-bottom: var(--space-7);
        }

        .section-heading h2 {
          color: #0f0f0f;
          margin: var(--space-3) 0 var(--space-2) 0;
        }

        .section-heading .body-lg {
          color: #666;
          font-size: 16px;
        }

        .journal-page__guides {
          padding: var(--space-8) 0;
        }

        .journal-page__grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: var(--space-5);
        }

        .story-card {
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: var(--space-5);
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
        }

        .story-card:hover {
          border-color: #C04D29;
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
        }

        .story-card .overline {
          color: #C04D29;
          font-weight: 600;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: var(--space-2);
        }

        .story-card h3 {
          color: #0f0f0f;
          font-size: 20px;
          line-height: 1.4;
          margin-bottom: var(--space-3);
          flex-grow: 1;
        }

        .story-card .body-base {
          color: #666;
          font-size: 14px;
          line-height: 1.6;
          margin-bottom: var(--space-4);
          flex-grow: 1;
        }

        .cta-row {
          display: flex;
          gap: var(--space-2);
        }

        .button {
          display: inline-block;
          padding: 10px 20px;
          border-radius: 4px;
          text-decoration: none;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          border: none;
          transition: all 0.2s ease;
        }

        .button--primary {
          background: #C04D29;
          color: white;
        }

        .button--primary:hover {
          background: #a63f1f;
        }

        @media (max-width: 768px) {
          .journal-page__hero {
            padding: var(--space-6) 0;
          }

          .journal-page__hero h1 {
            font-size: 28px;
          }

          .journal-page__guides {
            padding: var(--space-6) 0;
          }

          .journal-page__grid {
            grid-template-columns: 1fr;
          }

          .story-card {
            padding: var(--space-4);
          }
        }
      `}</style>
    </>
  );
}
