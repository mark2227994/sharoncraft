import Link from "next/link";

export default function HeroBanner({
  heroImage,
  heroImageAlt = "Kenyan artisan craft",
  heroDetailImage = null,
  title = "Signed by Kenyan Artisans",
  subtitle = "Handmade. Authentic. Direct.",
  trustLine = "Ethically sourced | Artisan direct | Global shipping | Authenticity guaranteed",
  whatsappNumber = "254112222572",
}) {
  const handleContact = () => {
    window.open("/contact", "_self");
  };

  return (
    <section className="hero">
      {heroDetailImage ? (
        <>
          <div className="hero__detail-pane">
            <img src={heroDetailImage} alt="Beadwork detail" loading="eager" decoding="async" />
            <div className="hero__image-fade" />
          </div>
          <div className="hero__image-pane">
            <img src={heroImage} alt={heroImageAlt} loading="eager" decoding="async" />
            <div className="hero__image-fade" />
          </div>
        </>
      ) : (
        <div className="hero__image-pane">
          <img src={heroImage} alt={heroImageAlt} loading="eager" decoding="async" />
          <div className="hero__image-fade" />
        </div>
      )}
      <div className="hero__text-pane">
        <p className="overline" style={{ letterSpacing: "0.15em", fontWeight: 700 }}>SIGNED BY KENYAN ARTISANS</p>
        <h1 className="display-xl">{title}</h1>
        <p className="body-lg" style={{ fontSize: "18px", fontWeight: 500 }}>{subtitle}</p>
        <div className="hero__cta-group">
          <Link href="/shop" className="hero__cta">
            Explore Now <span aria-hidden="true">→</span>
          </Link>
          <button onClick={handleContact} className="hero__cta hero__cta--secondary">
            Meet Artisans
          </button>
        </div>
        <p className="hero__trust">{trustLine}</p>
      </div>
    </section>
  );
}
