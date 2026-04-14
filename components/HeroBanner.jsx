import Link from "next/link";

export default function HeroBanner({
  heroImage,
  heroImageAlt = "Kenyan artisan craft",
  title = "Where Every Object Carries a Story",
  subtitle = "Authentic artifacts made by Kenyan artisans. Each piece is one-of-a-kind.",
  trustLine = "Free delivery within Nairobi | M-Pesa accepted",
}) {
  return (
    <section className="hero">
      <div className="hero__image-pane">
        <img src={heroImage} alt={heroImageAlt} loading="eager" decoding="async" />
        <div className="hero__image-fade" />
      </div>
      <div className="hero__text-pane">
        <p className="overline">Handcrafted in Kenya</p>
        <h1 className="display-xl">{title}</h1>
        <p className="body-lg">{subtitle}</p>
        <Link href="/shop" className="hero__cta">
          Explore the Collection <span aria-hidden="true">-&gt;</span>
        </Link>
        <p className="hero__trust">{trustLine}</p>
      </div>
    </section>
  );
}
