import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import Footer from "../components/Footer";
import Nav from "../components/Nav";
import { readSiteImages } from "../lib/site-images";

/** Production SEO base — canonical/OG stay on sharoncraft.co.ke even on preview deploys. */
const SEO_SITE_ORIGIN = "https://sharoncraft.co.ke";
const PAGE_ABSOLUTE_URL = `${SEO_SITE_ORIGIN}/about`;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || SEO_SITE_ORIGIN;
const FALLBACK_HERO_IMAGE = "/media/site/artisans/a24ade36-f8fa-4fb2-9391-f4c5e113f4b8.jpg";
const ORIGIN_IMAGE = "/media/site/artisans/It's Awesome _ Sam D Edits Beadings.jpg";
const FOUNDER_IMAGE = "/media/site/artisans/a24ade36-f8fa-4fb2-9391-f4c5e113f4b8.jpg";

const TOKENS = {
  "--cream": "#fafaf8",
  "--black": "#080808",
  "--dark": "#1c1c1c",
  "--brown": "#8B5E3C",
  "--border": "rgba(0,0,0,0.08)",
  "--card-bg": "#F5F0EB",
};

const WHAT_WE_MAKE = [
  {
    number: "01",
    title: "Beaded Jewellery",
    href: "/shop?category=Jewellery",
    description:
      "Necklaces, earrings, bracelets and bangles — each piece hand-beaded in Nairobi.",
  },
  {
    number: "02",
    title: "Accessories",
    description:
      "Beaded sandals, kiondos, belts and key holders crafted with traditional techniques.",
  },
  {
    number: "03",
    title: "African Wear",
    description:
      "Maasai shuka wraps, embroidered tops and custom printed clothing made to order.",
  },
  {
    number: "04",
    title: "Home & Living",
    description:
      "Beaded mwikos, decorative baskets and handcrafted home pieces for everyday living.",
  },
  {
    number: "05",
    title: "Art & Craft",
    description:
      "Soapstone carvings, wooden artifacts and mixed media pieces by our Nairobi designers.",
  },
  {
    number: "06",
    title: "Custom Orders",
    href: "/custom-order",
    description:
      "Tell us your vision. We work with our artisans to make it exactly as you imagine.",
  },
];

const HOW_IT_WORKS = [
  {
    number: "01",
    title: "Browse or request",
    description:
      "Browse our shop for ready pieces or WhatsApp us your custom request.",
  },
  {
    number: "02",
    title: "We confirm and make",
    description:
      "We check with our artisans, confirm price and timeline, then begin crafting your piece after 50% deposit.",
  },
  {
    number: "03",
    title: "Delivered to you",
    description:
      "Your handmade piece is delivered to your door across Kenya within 5-7 days.",
  },
];

const VALUES = [
  {
    title: "Handmade Quality",
    description:
      "Every SharonCraft piece is made by hand in Nairobi by skilled Kenyan artisans. No mass production, ever.",
  },
  {
    title: "Fair Partnership",
    description:
      "Our artisans are paid fairly for their time and skill. We believe craft deserves proper compensation.",
  },
  {
    title: "Cultural Heritage",
    description:
      "We celebrate Maasai beadwork and East African craft traditions by keeping them alive through every piece we make.",
  },
  {
    title: "Made to Order",
    description:
      "We make pieces specifically for you — reducing waste and ensuring every item has a home before it is created.",
  },
];

function compactText(value) {
  return String(value || "").trim();
}

function absoluteUrl(path) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${SITE_URL.replace(/\/$/, "")}${encodeURI(path.startsWith("/") ? path : `/${path}`)}`;
}

/** Open Graph image should resolve on the public production host for consistent sharing. */
function productionAssetUrl(path) {
  const raw = compactText(path);
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  const normalized = raw.startsWith("/") ? raw : `/${raw}`;
  return `${SEO_SITE_ORIGIN}${encodeURI(normalized)}`;
}

function hasUsablePortrait(value) {
  const raw = compactText(value);
  if (!raw) return false;

  const normalized = raw.toLowerCase();
  return !(
    normalized.includes("placeholder") ||
    normalized.includes("gemini") ||
    normalized.endsWith("/sharon.png")
  );
}

function normalizeWhatsAppNumber(value) {
  const digits = compactText(value).replace(/\D/g, "");
  if (!digits) return "254112222572";
  if (digits.startsWith("254")) return digits;
  if (digits.startsWith("0")) return `254${digits.slice(1)}`;
  return digits;
}

function buildWhatsAppLink(number, message) {
  return `https://wa.me/${normalizeWhatsAppNumber(number)}?text=${encodeURIComponent(message)}`;
}

export default function AboutPage({ siteContent }) {
  const heroImage = hasUsablePortrait(siteContent?.artisanPortrait)
    ? siteContent.artisanPortrait
    : FALLBACK_HERO_IMAGE;
  const whatsappNumber = compactText(siteContent?.contactWhatsApp) || "0112222572";
  const heroOgImage = productionAssetUrl(heroImage);

  const startOrderLink = buildWhatsAppLink(
    whatsappNumber,
    "Hi Sharon, I would love to start a custom order for handmade jewelry or craft from SharonCraft.",
  );
  const requestChatLink = buildWhatsAppLink(
    whatsappNumber,
    "Hi Sharon, I would love to WhatsApp you my custom request for SharonCraft.",
  );
  const founderChatLink = buildWhatsAppLink(
    whatsappNumber,
    "Hi Sharon, I would love to chat with you about a custom SharonCraft piece.",
  );
  const ctaChatLink = buildWhatsAppLink(
    whatsappNumber,
    "Hi Sharon, I am looking for a SharonCraft piece and would love your help choosing one.",
  );

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return undefined;

    const nodes = Array.from(document.querySelectorAll("[data-reveal]"));
    if (!nodes.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const node = entry.target;
          const delay = node.getAttribute("data-delay");
          if (delay) {
            node.style.animationDelay = `${delay}ms`;
          }

          node.classList.add("is-visible");
          observer.unobserve(node);
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -48px 0px" },
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "SharonCraft",
    url: SEO_SITE_ORIGIN,
    logo: `${SEO_SITE_ORIGIN}/logo.png`,
    description: "Handmade jewelry and craft brand based in Nairobi, Kenya",
    foundingDate: "2024",
    foundingLocation: {
      "@type": "Place",
      name: "Nairobi, Kenya",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      availableLanguage: "English",
    },
    sameAs: [
      "https://instagram.com/sharoncraft",
      "https://facebook.com/sharoncraft",
    ],
  };

  return (
    <>
      <Head>
        <title>{"About SharonCraft | Handmade Kenyan Jewelry & Craft \u2014 Nairobi"}</title>
        <meta
          name="description"
          content="SharonCraft is a Nairobi-based handmade jewelry and craft brand founded by Sharon. Every piece is crafted by skilled Kenyan artisans using traditional Maasai beadwork techniques. Made to order. Ships across Kenya and worldwide."
        />
        <meta
          name="keywords"
          content="handmade jewelry Kenya, Maasai beads Nairobi, Kenyan artisan jewelry, beaded jewelry Kenya, SharonCraft, handmade accessories Nairobi, African jewelry online, made in Kenya jewelry"
        />
        <meta property="og:title" content={"About SharonCraft \u2014 Handmade in Nairobi, Kenya"} />
        <meta
          property="og:description"
          content="SharonCraft is a Nairobi-based handmade jewelry and craft brand founded by Sharon. Every piece is crafted by skilled Kenyan artisans using traditional Maasai beadwork techniques. Made to order. Ships across Kenya and worldwide."
        />
        <meta property="og:image" content={heroOgImage} />
        <meta property="og:image:alt" content="Sharon founder of SharonCraft handmade jewelry Nairobi Kenya" />
        <meta property="og:url" content={PAGE_ABSOLUTE_URL} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="SharonCraft" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={"About SharonCraft \u2014 Handmade in Nairobi, Kenya"} />
        <meta
          name="twitter:description"
          content="SharonCraft is a Nairobi-based handmade jewelry and craft brand founded by Sharon. Every piece is crafted by skilled Kenyan artisans using traditional Maasai beadwork techniques. Made to order. Ships across Kenya and worldwide."
        />
        <meta name="twitter:image" content={heroOgImage} />
        <meta name="twitter:url" content={PAGE_ABSOLUTE_URL} />
        <link rel="canonical" href={PAGE_ABSOLUTE_URL} />
        <link rel="icon" href="/favicon.ico" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </Head>

      <Nav />

      <main style={TOKENS} className="about-page">
        <section className="about-hero">
          <div className="about-hero__media">
            <Image
              src={heroImage}
              alt="Sharon founder of SharonCraft handmade jewelry Nairobi Kenya"
              fill
              priority
              sizes="100vw"
              className="about-hero__image"
            />
          </div>
          <div className="about-hero__overlay" aria-hidden="true" />
          <div className="about-hero__content">
            <p className="about-hero__eyebrow">NAIROBI, KENYA &middot; SINCE 2024</p>
            <h1 className="about-hero__title">
              <span>Handmade jewelry.</span>
              <span>Made in Kenya.</span>
            </h1>
            <p className="about-hero__body">
              Every piece begins as an idea, becomes a conversation, and ends as something worn
              close to the skin.
            </p>
          </div>
          <div className="about-hero__scroll" aria-hidden="true">
            <div className="about-hero__scroll-line" />
            <span>SCROLL</span>
          </div>
        </section>

        <section className="about-origin">
          <div className="about-shell about-origin__grid">
            <div className="about-origin__content">
              <div className="about-origin__intro" data-reveal="left">
                <p className="about-section__label">OUR STORY</p>
                <h2>Born in Nairobi. Made by hand.</h2>
              </div>

              <p className="about-origin__paragraph" data-reveal="left" data-delay="0">
                SharonCraft started in Nairobi with a simple belief — that the most beautiful things
                are made slowly, by hand, with intention.
              </p>
              <p className="about-origin__paragraph" data-reveal="left" data-delay="100">
                What began as a love for Maasai beadwork has grown into a brand that celebrates
                Kenya&apos;s rich craft traditions. Every piece we make carries the knowledge of
                artisans who have been perfecting their craft for generations.
              </p>
              <p className="about-origin__paragraph" data-reveal="left" data-delay="200">
                We are not a factory. We are a community of makers in Nairobi who believe that
                handmade has a soul that mass production can never replicate. When you are ready to{" "}
                <Link href="/shop" className="about-inline-link">
                  browse our shop
                </Link>
                , you will find necklaces, earrings, and home pieces that carry the same care as a
                custom order.
              </p>

              <Link href="/shop" className="about-text-link" data-reveal="left" data-delay="280">
                Shop our collection &rarr;
              </Link>
            </div>

            <div className="about-origin__media" data-reveal="right">
              <div className="about-origin__imageFrame">
                <Image
                  src={ORIGIN_IMAGE}
                  alt="Kenyan artisans crafting beaded jewelry in Nairobi workshop"
                  fill
                  loading="lazy"
                  sizes="(max-width: 768px) 100vw, 48vw"
                  className="about-origin__image"
                />
              </div>
              <div className="about-origin__line" aria-hidden="true" />
            </div>
          </div>
        </section>

        <section className="about-make">
          <div className="about-shell">
            <div className="about-make__header" data-reveal="up">
              <h2>What we make</h2>
            </div>

            <div className="about-make__grid">
              {WHAT_WE_MAKE.map((item, index) => (
                <article
                  key={item.title}
                  className="about-make__item"
                  data-reveal="up"
                  data-delay={index * 80}
                >
                  <span className="about-make__number">{item.number}</span>
                  <h3>
                    {item.href ? (
                      <Link href={item.href} className="about-make__link">
                        {item.title}
                      </Link>
                    ) : (
                      item.title
                    )}
                  </h3>
                  <p>{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="about-process">
          <div className="about-shell">
            <div className="about-process__heading" data-reveal="left">
              <h2>How it works</h2>
              <p>From idea to delivery &mdash; made just for you.</p>
            </div>

            <div className="about-process__steps">
              {HOW_IT_WORKS.map((step, index) => (
                <article
                  key={step.number}
                  className="about-process__step"
                  data-reveal="up"
                  data-delay={index * 120}
                >
                  <span className="about-process__number">{step.number}</span>
                  <h3>{step.title}</h3>
                  {index === 0 ? (
                    <p>
                      Browse our shop for ready pieces or{" "}
                      <a
                        href={requestChatLink}
                        target="_blank"
                        rel="noreferrer"
                        className="about-inline-link"
                      >
                        WhatsApp us your custom request
                      </a>
                      .
                    </p>
                  ) : (
                    <p>{step.description}</p>
                  )}
                </article>
              ))}
            </div>

            <div className="about-process__cta" data-reveal="up" data-delay="320">
              <a
                href={startOrderLink}
                target="_blank"
                rel="noreferrer"
                className="about-button about-button--dark about-button--order"
              >
                START YOUR ORDER
              </a>
            </div>
          </div>
        </section>

        <section className="about-values">
          <div className="about-shell about-values__grid">
            <div className="about-values__intro" data-reveal="left">
              <p className="about-values__label">WHAT WE BELIEVE</p>
              <h2>Craft with purpose.</h2>
            </div>

            <div className="about-values__list">
              {VALUES.map((value, index) => (
                <div
                  key={value.title}
                  className="about-values__row"
                  data-reveal="up"
                  data-delay={index * 100}
                >
                  <h3>{value.title}</h3>
                  <p>{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="about-founder">
          <div className="about-shell about-founder__grid">
            <div className="about-founder__media" data-reveal="left">
              <div className="about-founder__imageFrame">
                <Image
                  src={FOUNDER_IMAGE}
                  alt="Sharon founder of SharonCraft handmade jewelry brand Nairobi"
                  fill
                  loading="lazy"
                  sizes="(max-width: 768px) 100vw, 48vw"
                  className="about-founder__image"
                />
              </div>
              <p className="about-founder__caption">Sharon &middot; Founder, SharonCraft</p>
            </div>

            <div className="about-founder__content">
              <p className="about-section__label" data-reveal="right" data-delay="0">
                FROM THE FOUNDER
              </p>
              <h2 data-reveal="right" data-delay="0">
                I started SharonCraft because I believe Kenyan craft deserves to be seen — and
                worn — by the world.
              </h2>
              <p className="about-founder__body" data-reveal="right" data-delay="100">
                Every piece we make starts with a conversation. A customer tells us their vision. We
                bring it to our artisans. And together we create something that did not exist
                before. When you{" "}
                <Link href="/artisans" className="about-inline-link">
                  meet the artisans
                </Link>
                , you meet the hands behind the beads.
              </p>
              <a
                href={founderChatLink}
                target="_blank"
                rel="noreferrer"
                className="about-text-link"
                data-reveal="right"
                data-delay="200"
              >
                Chat with me on WhatsApp &rarr;
              </a>
            </div>
          </div>
        </section>

        <section className="about-cta">
          <div className="about-shell about-cta__inner">
            <p className="about-cta__label" data-reveal="up" data-delay="0">
              START HERE
            </p>
            <h2 data-reveal="up" data-delay="40">Find your piece.</h2>
            <p className="about-cta__body" data-reveal="up" data-delay="100">
              Browse the collection or WhatsApp us for something custom.
            </p>
            <div className="about-cta__actions" data-reveal="up" data-delay="200">
              <Link href="/shop" className="about-button about-button--light">
                SHOP THE COLLECTION
              </Link>
              <a
                href={ctaChatLink}
                target="_blank"
                rel="noreferrer"
                className="about-button about-button--ghost"
              >
                WHATSAPP US
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer siteContent={siteContent} />

      <style jsx>{`
        .about-page {
          background: var(--cream);
          color: var(--dark);
        }

        .about-shell {
          width: min(100%, 1280px);
          margin: 0 auto;
        }

        .about-hero {
          position: relative;
          height: 520px;
          min-height: 520px;
          overflow: hidden;
          background: #1c1c1c;
        }

        .about-hero__media {
          position: absolute;
          inset: 0;
        }

        .about-hero__image {
          object-fit: cover;
          object-position: center;
          opacity: 0.55;
          animation: fadeIn 1s ease both;
          transition: opacity 0.8s ease;
        }

        .about-hero__overlay {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(to right, rgba(8, 8, 8, 0.7) 0%, rgba(8, 8, 8, 0.2) 60%),
            linear-gradient(to top, rgba(8, 8, 8, 0.5) 0%, transparent 50%);
        }

        .about-hero__content {
          position: absolute;
          left: 6%;
          bottom: 10%;
          z-index: 1;
          max-width: 560px;
          animation: fadeUp 0.8s ease 0.2s both;
        }

        .about-hero__eyebrow {
          margin: 0 0 16px;
          font-size: 10px;
          font-weight: 400;
          line-height: 1.4;
          letter-spacing: 5px;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.4);
        }

        .about-hero__title {
          margin: 0 0 16px;
          font-size: 44px;
          font-weight: 300;
          line-height: 1.15;
          letter-spacing: -0.5px;
          color: #ffffff;
        }

        .about-hero__title span {
          display: block;
        }

        .about-hero__body {
          max-width: 420px;
          margin: 0;
          font-size: 13px;
          font-weight: 300;
          line-height: 1.7;
          letter-spacing: 0.5px;
          color: rgba(255, 255, 255, 0.45);
        }

        .about-hero__scroll {
          position: absolute;
          right: 6%;
          bottom: 28px;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }

        .about-hero__scroll-line {
          width: 1px;
          height: 42px;
          background: rgba(255, 255, 255, 0.22);
          transform-origin: top;
          animation: scrollPulse 2s ease infinite;
        }

        .about-hero__scroll span {
          font-size: 8px;
          font-weight: 400;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.3);
        }

        .about-origin {
          padding: 96px 40px;
          background: var(--cream);
        }

        .about-process {
          padding: 88px 40px;
          background: var(--cream);
        }

        .about-founder {
          padding: 88px 40px;
          background: var(--cream);
        }

        .about-origin__grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          gap: 80px;
          align-items: center;
        }

        .about-origin__content {
          max-width: 560px;
        }

        .about-section__label {
          margin: 0 0 20px;
          font-size: 9px;
          font-weight: 400;
          line-height: 1.4;
          letter-spacing: 5px;
          text-transform: uppercase;
          color: var(--brown);
        }

        .about-origin__intro h2 {
          margin: 0 0 24px;
          font-size: 32px;
          font-weight: 300;
          line-height: 1.3;
          letter-spacing: -0.3px;
          color: var(--dark);
        }

        .about-origin__paragraph {
          margin: 0 0 16px;
          font-size: 13px;
          font-weight: 300;
          line-height: 1.9;
          letter-spacing: 0.2px;
          color: #555555;
        }

        .about-inline-link {
          color: var(--brown);
          text-decoration: none;
          transition: opacity 0.2s ease, color 0.2s ease;
        }

        .about-inline-link:hover {
          opacity: 0.72;
        }

        .about-text-link {
          display: inline-block;
          margin-top: 8px;
          padding-bottom: 3px;
          border-bottom: 1px solid var(--dark);
          font-size: 10px;
          font-weight: 400;
          line-height: 1.4;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: var(--dark);
          text-decoration: none;
          transition: opacity 0.2s ease, border-color 0.2s ease, color 0.2s ease;
        }

        .about-text-link:hover {
          opacity: 0.5;
        }

        .about-origin__media {
          position: relative;
          height: 480px;
        }

        .about-origin__imageFrame,
        .about-founder__imageFrame {
          position: relative;
          height: 100%;
          overflow: hidden;
          background: var(--card-bg);
        }

        .about-origin__image,
        .about-founder__image {
          object-fit: cover;
          object-position: center top;
          transition: transform 0.7s ease;
        }

        .about-origin:hover .about-origin__image,
        .about-founder:hover .about-founder__image {
          transform: scale(1.03);
        }

        .about-origin__line {
          position: absolute;
          right: -16px;
          bottom: -16px;
          z-index: -1;
          width: 60%;
          height: 60%;
          border: 1px solid rgba(139, 94, 60, 0.2);
          pointer-events: none;
        }

        .about-make {
          padding: 80px 40px;
          border-top: 0.5px solid var(--border);
          border-bottom: 0.5px solid var(--border);
          background: var(--card-bg);
        }

        .about-make__header {
          margin-bottom: 48px;
          text-align: center;
        }

        .about-make__header h2 {
          margin: 0;
          font-size: 11px;
          font-weight: 400;
          line-height: 1.4;
          letter-spacing: 5px;
          text-transform: uppercase;
          color: #bbbbbb;
        }

        .about-make__grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 1px;
          background: rgba(0, 0, 0, 0.06);
        }

        .about-make__item {
          background: var(--card-bg);
          padding: 32px 24px;
          text-align: left;
          margin-top: 0;
          scroll-margin-top: 0;
          transition: background 0.2s ease;
        }

        .about-make__item:hover {
          background: #ede8e2;
        }

        .about-make__number {
          display: block;
          margin-bottom: 12px;
          font-size: 11px;
          font-weight: 400;
          line-height: 1.4;
          letter-spacing: 2px;
          color: #bbbbbb;
        }

        .about-make__item h3 {
          margin: 0 0 8px;
          font-size: 16px;
          font-weight: 400;
          line-height: 1.4;
          letter-spacing: 0.3px;
          color: var(--dark);
        }

        .about-make__link {
          color: inherit;
          text-decoration: none;
        }

        .about-make__item p {
          margin: 0;
          font-size: 12px;
          font-weight: 300;
          line-height: 1.7;
          color: #888888;
        }


        .about-process__heading {
          margin-bottom: 56px;
        }

        .about-process__heading h2 {
          margin: 0 0 8px;
          font-size: 28px;
          font-weight: 300;
          line-height: 1.2;
          letter-spacing: -0.3px;
          color: var(--dark);
        }

        .about-process__heading p {
          margin: 0;
          font-size: 13px;
          font-weight: 300;
          line-height: 1.7;
          color: #bbbbbb;
        }

        .about-process__steps {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          border: 0.5px solid var(--border);
        }

        .about-process__step {
          padding: 40px 32px;
          border-right: 0.5px solid var(--border);
          background: transparent;
          margin-top: 0;
          scroll-margin-top: 0;
          transition: background 0.2s ease;
        }

        .about-process__step:last-child {
          border-right: 0;
        }

        .about-process__step:hover {
          background: rgba(0, 0, 0, 0.02);
        }

        .about-process__number {
          display: block;
          margin-bottom: 16px;
          font-size: 32px;
          font-weight: 300;
          line-height: 1;
          letter-spacing: -1px;
          color: rgba(0, 0, 0, 0.08);
        }

        .about-process__step h3 {
          margin: 0 0 10px;
          font-size: 14px;
          font-weight: 500;
          line-height: 1.4;
          letter-spacing: 0.3px;
          color: var(--dark);
        }

        .about-process__step p {
          margin: 0;
          font-size: 12px;
          font-weight: 300;
          line-height: 1.7;
          color: #888888;
        }

        .about-process__cta {
          margin-top: 40px;
          text-align: center;
        }

        .about-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 44px;
          padding: 13px 32px;
          border-radius: 2px;
          font-size: 10px;
          font-weight: 400;
          line-height: 1;
          letter-spacing: 4px;
          text-transform: uppercase;
          text-decoration: none;
          transition: background 0.25s ease, color 0.2s ease, border-color 0.2s ease;
        }

        .about-button--dark {
          background: var(--dark);
          color: #ffffff;
        }

        .about-button--dark:hover {
          background: var(--brown);
        }

        .about-button--order {
          padding: 13px 36px;
        }

        .about-values {
          padding: 88px 40px;
          background: var(--dark);
        }

        .about-values__grid {
          display: grid;
          grid-template-columns: minmax(240px, 1fr) minmax(0, 2fr);
          gap: 80px;
          align-items: start;
        }

        .about-values__label {
          margin: 0 0 16px;
          font-size: 9px;
          font-weight: 400;
          line-height: 1.4;
          letter-spacing: 4px;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.3);
        }

        .about-values__intro h2 {
          margin: 0;
          font-size: 28px;
          font-weight: 300;
          line-height: 1.3;
          letter-spacing: -0.3px;
          color: #ffffff;
        }

        .about-values__list {
          border-top: 0.5px solid rgba(255, 255, 255, 0.08);
        }

        .about-values__row {
          display: grid;
          grid-template-columns: 200px 1fr;
          gap: 24px;
          align-items: start;
          padding: 24px 0;
          border-bottom: 0.5px solid rgba(255, 255, 255, 0.08);
        }

        .about-values__row h3 {
          margin: 0;
          font-size: 13px;
          font-weight: 400;
          line-height: 1.5;
          letter-spacing: 0.5px;
          color: rgba(255, 255, 255, 0.7);
        }

        .about-values__row p {
          margin: 0;
          font-size: 12px;
          font-weight: 300;
          line-height: 1.7;
          color: rgba(255, 255, 255, 0.35);
        }

        .about-founder {
          border-top: 0.5px solid var(--border);
        }

        .about-founder__grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          gap: 80px;
          align-items: center;
        }

        .about-founder__media {
          display: flex;
          flex-direction: column;
        }

        .about-founder__imageFrame {
          height: 420px;
        }

        .about-founder__caption {
          margin: 12px 0 0;
          font-size: 10px;
          font-weight: 300;
          line-height: 1.5;
          letter-spacing: 1.5px;
          color: #bbbbbb;
        }

        .about-founder__content h2 {
          margin: 0 0 24px;
          font-size: 22px;
          font-weight: 300;
          font-style: italic;
          line-height: 1.65;
          letter-spacing: 0.2px;
          color: var(--dark);
        }

        .about-founder__body {
          margin: 0 0 28px;
          font-size: 13px;
          font-weight: 300;
          line-height: 1.85;
          color: #666666;
        }

        .about-cta {
          padding: 88px 40px;
          background: var(--black);
          text-align: center;
        }

        .about-cta [data-reveal="up"].is-visible {
          animation: fadeUp 0.6s ease both;
        }

        .about-cta__inner {
          max-width: 760px;
        }

        .about-cta__label {
          margin: 0 0 20px;
          font-size: 9px;
          font-weight: 400;
          line-height: 1.4;
          letter-spacing: 5px;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.25);
        }

        .about-cta h2 {
          margin: 0 0 16px;
          font-size: 40px;
          font-weight: 300;
          line-height: 1.15;
          letter-spacing: -0.5px;
          color: #ffffff;
        }

        .about-cta__body {
          margin: 0 0 40px;
          font-size: 13px;
          font-weight: 300;
          line-height: 1.7;
          letter-spacing: 0.5px;
          color: rgba(255, 255, 255, 0.35);
        }

        .about-cta__actions {
          display: flex;
          justify-content: center;
          gap: 12px;
        }

        .about-button--light {
          background: #ffffff;
          color: var(--dark);
        }

        .about-button--light:hover {
          background: var(--card-bg);
        }

        .about-button--ghost {
          border: 0.5px solid rgba(255, 255, 255, 0.2);
          background: transparent;
          color: rgba(255, 255, 255, 0.5);
        }

        .about-button--ghost:hover {
          border-color: rgba(255, 255, 255, 0.5);
          color: rgba(255, 255, 255, 0.8);
        }

        [data-reveal] {
          opacity: 0;
        }

        [data-reveal="up"].is-visible {
          animation: fadeUp 0.5s ease both;
        }

        [data-reveal="left"].is-visible {
          animation: fadeLeft 0.7s ease both;
        }

        [data-reveal="right"].is-visible {
          animation: fadeRight 0.7s ease both;
        }

        :global(.about-page a:focus-visible) {
          outline: 1px solid var(--brown);
          outline-offset: 4px;
        }

        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeLeft {
          from {
            opacity: 0;
            transform: translateX(-24px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeRight {
          from {
            opacity: 0;
            transform: translateX(24px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 0.55;
          }
        }

        @keyframes scrollPulse {
          0%,
          100% {
            transform: scaleY(1);
            opacity: 0.8;
          }
          50% {
            transform: scaleY(0.55);
            opacity: 0.35;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .about-hero__content,
          .about-hero__image,
          .about-origin__image,
          .about-founder__image,
          [data-reveal="up"].is-visible,
          [data-reveal="left"].is-visible,
          [data-reveal="right"].is-visible {
            animation: none;
            transition: none;
            transform: none;
            opacity: 1;
          }
        }

        @media (max-width: 1120px) {
          .about-origin__grid,
          .about-values__grid,
          .about-founder__grid {
            gap: 56px;
          }
        }

        @media (max-width: 1024px) {
          .about-origin,
          .about-process,
          .about-values,
          .about-founder,
          .about-make,
          .about-cta {
            padding-left: 28px;
            padding-right: 28px;
          }
        }

        @media (max-width: 768px) {
          .about-hero {
            height: 360px;
            min-height: 360px;
          }

          .about-hero__content {
            left: 20px;
            right: 20px;
            bottom: 54px;
          }

          .about-hero__title {
            font-size: 28px;
          }

          .about-hero__scroll {
            right: 20px;
            bottom: 18px;
          }

          .about-origin {
            padding: 56px 20px;
          }

          .about-process {
            padding: 48px 20px;
          }

          .about-make {
            padding: 48px 20px;
          }

          .about-values {
            padding: 56px 20px;
          }

          .about-founder {
            padding: 56px 20px;
          }

          .about-cta {
            padding: 56px 20px;
          }

          .about-origin__grid,
          .about-founder__grid,
          .about-values__grid {
            grid-template-columns: 1fr;
          }

          .about-origin__grid,
          .about-founder__grid {
            gap: 28px;
          }

          .about-origin__media {
            order: -1;
            height: 280px;
          }

          .about-origin__line {
            display: none;
          }

          .about-origin__intro h2 {
            font-size: 24px;
          }

          .about-make__grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .about-process__heading h2,
          .about-values__intro h2 {
            font-size: 22px;
          }

          .about-process__steps {
            grid-template-columns: 1fr;
          }

          .about-process__step {
            border-right: 0;
            border-bottom: 0.5px solid var(--border);
          }

          .about-process__step:last-child {
            border-bottom: 0;
          }

          .about-values__row {
            grid-template-columns: 1fr;
            gap: 10px;
          }

          .about-founder__imageFrame {
            height: 260px;
          }

          .about-founder__content h2 {
            font-size: 18px;
          }

          .about-cta h2 {
            font-size: 28px;
          }

          .about-cta__actions {
            flex-direction: column;
          }

          .about-button {
            width: 100%;
          }
        }
      `}</style>
    </>
  );
}

export async function getServerSideProps() {
  let siteContent = {};

  try {
    siteContent = await readSiteImages();
  } catch (error) {
    console.error("Error reading site images for about page:", error);
  }

  return {
    props: {
      siteContent,
    },
  };
}
