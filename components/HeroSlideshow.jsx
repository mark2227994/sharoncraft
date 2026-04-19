import { useState, useEffect } from "react";
import Link from "next/link";

export default function HeroSlideshow({ slides = [] }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  // Default slides if none provided
  const defaultSlides = [
    {
      id: 1,
      type: "artisan",
      image: "/media/site/homepage/Wedding Jewelry Around the World - Kenya.webp",
      title: "Nafula Wambui",
      subtitle: "Karatina, Nyeri County",
      description: "15+ years of ceremonial beadwork",
      quote: '"Every bead must feel like it belongs to the hand that wears it"',
      cta: "Shop Her Collection",
      ctaLink: "/shop?artisan=nafula",
      duration: 6,
    },
    {
      id: 2,
      type: "discount",
      image: "/media/site/homepage/ai-home-hero-decor-card--favorite-240.webp",
      badge: "⚡ FLASH SALE - 24 HOURS ONLY",
      title: "20% OFF GIFT COLLECTIONS",
      subtitle: "",
      description: "Code: GIFT20",
      cta: "Shop Now",
      ctaLink: "/shop?category=Gift%20Sets",
      duration: 5,
    },
    {
      id: 3,
      type: "product",
      image: "/media/site/homepage/design.jpg",
      title: "Maasai Beaded Bracelet",
      subtitle: "Made by Achieng Atieno",
      description: "40+ hours • Limited pieces",
      rating: 5,
      reviews: 89,
      price: "$68",
      cta: "Add to Cart",
      ctaLink: "/shop",
      duration: 7,
    },
    {
      id: 4,
      type: "testimonial",
      image: "/media/site/homepage/ai-home-hero-decor-card--favorite-240.webp",
      rating: 5,
      quote: '"This bracelet made my wedding absolutely perfect. The craftsmanship is unreal."',
      author: "Sarah, London",
      badge: "Verified Purchase",
      cta: "Read 1,200+ Reviews",
      ctaLink: "/shop?sort=reviews",
      duration: 6,
    },
    {
      id: 5,
      type: "bundle",
      image: "/media/site/homepage/design.jpg",
      badge: "🎁 BUNDLE DEAL",
      title: "3-Piece Artisan Collection",
      description: "Normally $184 → Now $129",
      savings: "(Save $55)",
      cta: "Get Bundle",
      ctaLink: "/shop?collection=bundle",
      duration: 5,
    },
    {
      id: 6,
      type: "brand",
      image: "/media/site/homepage/ai-home-hero-decor-card--favorite-240.webp",
      badge: "🌍 HANDMADE IN KENYA",
      title: "Made by 47 Kenyan Artisans",
      description: "40+ hours per piece • Direct from Nairobi to your door",
      stats: "1,247+ Happy Customers",
      cta: "Meet All Artisans",
      ctaLink: "/artisans",
      duration: 6,
    },
    {
      id: 7,
      type: "artisan",
      image: "/media/site/homepage/ai-home-hero-decor-card--favorite-240.webp",
      title: "Muthoni Wairimu",
      subtitle: "Nairobi, Kenya",
      description: "Master of Home Decor",
      quote: '"I never want a piece to look repeated, only remembered"',
      cta: "Explore Her Work",
      ctaLink: "/shop?artisan=muthoni",
      duration: 7,
    },
    {
      id: 8,
      type: "shipping",
      image: "/media/site/homepage/design.jpg",
      badge: "📦 FREE SHIPPING",
      title: "On Orders $50+",
      description: "Code: SHIP50",
      cta: "Start Shopping",
      ctaLink: "/shop",
      duration: 5,
    },
  ];

  const slidesData = slides.length > 0 ? slides : defaultSlides;
  const currentSlideData = slidesData[currentSlide];

  // Auto-advance slides
  useEffect(() => {
    if (!isAutoPlay) return;

    const duration = (currentSlideData?.duration || 6) * 1000;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slidesData.length);
    }, duration);

    return () => clearInterval(timer);
  }, [currentSlide, isAutoPlay, slidesData.length, currentSlideData?.duration]);

  // Manual navigation
  const goToSlide = (index) => {
    setCurrentSlide(index);
    setIsAutoPlay(false);
    setTimeout(() => setIsAutoPlay(true), 2000);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slidesData.length);
    setIsAutoPlay(false);
    setTimeout(() => setIsAutoPlay(true), 2000);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slidesData.length) % slidesData.length);
    setIsAutoPlay(false);
    setTimeout(() => setIsAutoPlay(true), 2000);
  };

  return (
    <section className="hero-slideshow">
      <div className="hero-slideshow__container">
        {/* Slides */}
        {slidesData.map((slide, index) => (
          <div
            key={slide.id}
            className={`hero-slideshow__slide hero-slideshow__slide--${slide.type} ${
              index === currentSlide ? "hero-slideshow__slide--active" : ""
            }`}
          >
            {/* Background Image */}
            <img
              src={slide.image}
              alt={slide.title}
              className="hero-slideshow__image"
            />

            {/* Dark Gradient Overlay */}
            <div
              className={`hero-slideshow__overlay hero-slideshow__overlay--${slide.type}`}
            />

            {/* Content */}
            <div className="hero-slideshow__content">
              {slide.badge && (
                <p className="hero-slideshow__badge">{slide.badge}</p>
              )}

              {slide.type === "artisan" && (
                <>
                  <h2 className="hero-slideshow__title">{slide.title}</h2>
                  <p className="hero-slideshow__subtitle">{slide.subtitle}</p>
                  <p className="hero-slideshow__description">
                    {slide.description}
                  </p>
                  {slide.quote && (
                    <p className="hero-slideshow__quote">{slide.quote}</p>
                  )}
                </>
              )}

              {slide.type === "discount" && (
                <>
                  <h2 className="hero-slideshow__title">{slide.title}</h2>
                  <p className="hero-slideshow__description">
                    {slide.description}
                  </p>
                </>
              )}

              {slide.type === "product" && (
                <>
                  <h2 className="hero-slideshow__title">{slide.title}</h2>
                  <p className="hero-slideshow__description">
                    {slide.subtitle}
                  </p>
                  <p className="hero-slideshow__details">{slide.description}</p>
                  {slide.rating && (
                    <div className="hero-slideshow__rating">
                      {"⭐".repeat(slide.rating)} ({slide.reviews} reviews)
                    </div>
                  )}
                  <p className="hero-slideshow__price">{slide.price}</p>
                </>
              )}

              {slide.type === "testimonial" && (
                <>
                  {slide.rating && (
                    <div className="hero-slideshow__rating">
                      {"⭐".repeat(slide.rating)}
                    </div>
                  )}
                  {slide.quote && (
                    <p className="hero-slideshow__quote-large">{slide.quote}</p>
                  )}
                  <p className="hero-slideshow__author">{slide.author}</p>
                  <p className="hero-slideshow__badge-small">
                    {slide.badge}
                  </p>
                </>
              )}

              {slide.type === "bundle" && (
                <>
                  <h2 className="hero-slideshow__title">{slide.title}</h2>
                  <p className="hero-slideshow__description">
                    {slide.description}
                  </p>
                  <p className="hero-slideshow__savings">{slide.savings}</p>
                </>
              )}

              {slide.type === "brand" && (
                <>
                  <h2 className="hero-slideshow__title">{slide.title}</h2>
                  <p className="hero-slideshow__description">
                    {slide.description}
                  </p>
                  <p className="hero-slideshow__stats">{slide.stats}</p>
                </>
              )}

              {slide.type === "shipping" && (
                <>
                  <h2 className="hero-slideshow__title">{slide.title}</h2>
                  <p className="hero-slideshow__description">
                    {slide.description}
                  </p>
                </>
              )}

              {/* CTA Button */}
              <Link href={slide.ctaLink || "/shop"}>
                <a className="hero-slideshow__cta">► {slide.cta}</a>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Controls */}
      <button
        className="hero-slideshow__nav hero-slideshow__nav--prev"
        onClick={prevSlide}
        aria-label="Previous slide"
      >
        ‹
      </button>

      <button
        className="hero-slideshow__nav hero-slideshow__nav--next"
        onClick={nextSlide}
        aria-label="Next slide"
      >
        ›
      </button>

      {/* Dot Navigation */}
      <div className="hero-slideshow__dots">
        {slidesData.map((_, index) => (
          <button
            key={index}
            className={`hero-slideshow__dot ${
              index === currentSlide ? "hero-slideshow__dot--active" : ""
            }`}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      <style jsx>{`
        .hero-slideshow {
          position: relative;
          width: 100%;
          background: #000;
          overflow: hidden;
          min-height: 600px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .hero-slideshow__container {
          position: relative;
          width: 100%;
          height: 100%;
          min-height: 600px;
        }

        /* ========== SLIDES ========== */
        .hero-slideshow__slide {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          transition: opacity 0.8s ease-in-out;
        }

        .hero-slideshow__slide--active {
          opacity: 1;
          z-index: 10;
        }

        /* ========== BACKGROUND IMAGE ========== */
        .hero-slideshow__image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
        }

        /* ========== GRADIENT OVERLAYS ========== */
        .hero-slideshow__overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 1;
        }

        /* Bottom gradient - for Artisan/Product/Quote */
        .hero-slideshow__overlay--artisan,
        .hero-slideshow__overlay--product,
        .hero-slideshow__overlay--brand {
          background: linear-gradient(
            to top,
            rgba(0, 0, 0, 0.85) 0%,
            rgba(0, 0, 0, 0.5) 40%,
            rgba(0, 0, 0, 0) 100%
          );
        }

        /* Center radial gradient - for Discount/Bundle/Shipping */
        .hero-slideshow__overlay--discount,
        .hero-slideshow__overlay--bundle,
        .hero-slideshow__overlay--shipping {
          background: radial-gradient(
            ellipse at center,
            rgba(0, 0, 0, 0.8) 0%,
            rgba(0, 0, 0, 0.4) 60%,
            rgba(0, 0, 0, 0) 100%
          );
        }

        /* Sandwich gradient - for Testimonials */
        .hero-slideshow__overlay--testimonial {
          background: linear-gradient(
            180deg,
            rgba(0, 0, 0, 0.6) 0%,
            rgba(0, 0, 0, 0) 25%,
            rgba(0, 0, 0, 0) 75%,
            rgba(0, 0, 0, 0.8) 100%
          );
        }

        /* ========== CONTENT ========== */
        .hero-slideshow__content {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 2;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 60px var(--gutter);
          max-width: 1400px;
          margin: 0 auto;
          color: white;
          animation: slideInUp 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .hero-slideshow__badge {
          font-size: 0.9rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          margin: 0 0 var(--space-2) 0;
          opacity: 0.9;
        }

        .hero-slideshow__title {
          font-size: 2.75rem;
          font-weight: 700;
          margin: 0 0 var(--space-2) 0;
          line-height: 1.15;
          font-family: Georgia, serif;
        }

        .hero-slideshow__subtitle {
          font-size: 1.25rem;
          font-weight: 400;
          margin: 0 0 var(--space-1) 0;
          opacity: 0.95;
        }

        .hero-slideshow__description {
          font-size: 1.125rem;
          margin: 0 0 var(--space-3) 0;
          line-height: 1.6;
          opacity: 0.9;
          max-width: 500px;
        }

        .hero-slideshow__quote {
          font-size: 1.15rem;
          font-style: italic;
          margin: var(--space-3) 0;
          opacity: 0.95;
          max-width: 450px;
          line-height: 1.7;
        }

        .hero-slideshow__quote-large {
          font-size: 1.5rem;
          font-style: italic;
          margin: var(--space-4) 0;
          line-height: 1.8;
          max-width: 600px;
        }

        .hero-slideshow__author {
          font-size: 1rem;
          font-weight: 600;
          margin: var(--space-2) 0;
          opacity: 0.9;
        }

        .hero-slideshow__details {
          font-size: 1rem;
          opacity: 0.9;
          margin: 0 0 var(--space-2) 0;
        }

        .hero-slideshow__rating {
          font-size: 1.1rem;
          margin: var(--space-2) 0;
          letter-spacing: 2px;
        }

        .hero-slideshow__price {
          font-size: 1.75rem;
          font-weight: 700;
          margin: var(--space-3) 0;
        }

        .hero-slideshow__savings {
          font-size: 0.95rem;
          opacity: 0.85;
          margin: var(--space-1) 0;
        }

        .hero-slideshow__stats {
          font-size: 1.1rem;
          font-weight: 600;
          margin: var(--space-3) 0;
          opacity: 0.95;
        }

        .hero-slideshow__badge-small {
          font-size: 0.85rem;
          opacity: 0.8;
          margin: var(--space-1) 0;
        }

        /* CTA Button */
        .hero-slideshow__cta {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 32px;
          background: white;
          color: #C04D29;
          border: none;
          border-radius: 4px;
          font-weight: 700;
          font-size: 0.95rem;
          text-decoration: none;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          margin-top: var(--space-4);
          width: fit-content;
        }

        .hero-slideshow__cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(255, 255, 255, 0.2);
          background: #f5f5f5;
        }

        /* ========== NAVIGATION ========== */
        .hero-slideshow__nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 20;
          background: rgba(255, 255, 255, 0.15);
          border: 2px solid white;
          color: white;
          font-size: 2rem;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
        }

        .hero-slideshow:hover .hero-slideshow__nav {
          opacity: 0.8;
        }

        .hero-slideshow__nav:hover {
          background: rgba(255, 255, 255, 0.25);
          transform: translateY(-50%) scale(1.1);
        }

        .hero-slideshow__nav--prev {
          left: 30px;
        }

        .hero-slideshow__nav--next {
          right: 30px;
        }

        /* Dot Navigation */
        .hero-slideshow__dots {
          position: absolute;
          bottom: 30px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 20;
          display: flex;
          gap: var(--space-2);
          align-items: center;
        }

        .hero-slideshow__dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.4);
          border: 2px solid white;
          cursor: pointer;
          transition: all 0.3s ease;
          padding: 0;
        }

        .hero-slideshow__dot:hover {
          background: rgba(255, 255, 255, 0.6);
        }

        .hero-slideshow__dot--active {
          background: white;
          box-shadow: 0 0 12px rgba(255, 255, 255, 0.5);
        }

        /* Animations */
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* ========== RESPONSIVE ========== */
        @media (max-width: 1024px) {
          .hero-slideshow {
            min-height: 500px;
          }

          .hero-slideshow__container {
            min-height: 500px;
          }

          .hero-slideshow__content {
            padding: 50px var(--gutter);
          }

          .hero-slideshow__title {
            font-size: 2.25rem;
          }

          .hero-slideshow__description {
            font-size: 1rem;
          }
        }

        @media (max-width: 768px) {
          .hero-slideshow {
            min-height: 450px;
          }

          .hero-slideshow__container {
            min-height: 450px;
          }

          .hero-slideshow__content {
            padding: 40px var(--gutter);
            justify-content: center;
            text-align: center;
          }

          .hero-slideshow__title {
            font-size: 1.875rem;
          }

          .hero-slideshow__subtitle {
            font-size: 1.1rem;
          }

          .hero-slideshow__description {
            font-size: 0.95rem;
            margin: 0 auto var(--space-2);
          }

          .hero-slideshow__quote {
            font-size: 1rem;
            margin: var(--space-2) auto;
          }

          .hero-slideshow__quote-large {
            font-size: 1.25rem;
            margin: var(--space-3) auto;
          }

          .hero-slideshow__cta {
            margin: var(--space-3) auto 0;
          }

          .hero-slideshow__nav {
            width: 40px;
            height: 40px;
            font-size: 1.5rem;
            opacity: 0.6;
          }

          .hero-slideshow__nav--prev {
            left: 15px;
          }

          .hero-slideshow__nav--next {
            right: 15px;
          }

          .hero-slideshow__dots {
            bottom: 20px;
          }

          .hero-slideshow__dot {
            width: 10px;
            height: 10px;
          }
        }

        @media (max-width: 480px) {
          .hero-slideshow {
            min-height: 380px;
          }

          .hero-slideshow__container {
            min-height: 380px;
          }

          .hero-slideshow__content {
            padding: 30px var(--gutter);
          }

          .hero-slideshow__title {
            font-size: 1.5rem;
          }

          .hero-slideshow__description {
            font-size: 0.9rem;
          }

          .hero-slideshow__quote-large {
            font-size: 1.1rem;
          }

          .hero-slideshow__cta {
            padding: 12px 24px;
            font-size: 0.85rem;
          }

          .hero-slideshow__nav {
            display: none;
          }

          .hero-slideshow__dots {
            bottom: 15px;
            gap: 6px;
          }

          .hero-slideshow__dot {
            width: 8px;
            height: 8px;
          }
        }
      `}</style>
    </section>
  );
}
