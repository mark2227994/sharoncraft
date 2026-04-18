import Link from "next/link";

export default function HeroBanner({
  heroImage,
  heroImageAlt = "Kenyan artisan craft",
  title = "Authenticated African Artifacts",
  subtitle = "Handmade by certified Kenyan artisans. Each piece carries a story and certificate of authenticity.",
  trustLine = "Ethically sourced | Artisan direct | Global shipping | Authenticity guaranteed",
  whatsappNumber = "254112222572",
}) {
  const handleContact = () => {
    // Open contact form or page instead of direct WhatsApp
    window.open("/contact", "_self");
  };

  return (
    <section className="hero">
      <div className="hero__image-pane">
        <img src={heroImage} alt={heroImageAlt} loading="eager" decoding="async" />
        <div className="hero__image-fade" />
      </div>
      <div className="hero__text-pane">
        <p className="overline" style={{ letterSpacing: "0.15em", fontWeight: 700 }}>AFRICAN CRAFTSMANSHIP</p>
        <h1 className="display-xl">{title}</h1>
        <p className="body-lg">{subtitle}</p>
        <div className="hero__cta-group">
          <Link href="/shop" className="hero__cta">
            Explore Collection <span aria-hidden="true">→</span>
          </Link>
          <button onClick={handleContact} className="hero__cta hero__cta--secondary">
            Learn About Artisans
          </button>
        </div>
        <p className="hero__trust">{trustLine}</p>
      </div>
    </section>
  );
}
