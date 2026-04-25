import { useState, useEffect, useRef } from "react";
import Link from "next/link";

export default function HeroSlideshow({ slides = [] }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [loadedSlides, setLoadedSlides] = useState(Array.isArray(slides) ? slides : []);
  const [isMobile, setIsMobile] = useState(false);
  const heroRef = useRef(null);

  useEffect(() => {
    setLoadedSlides(Array.isArray(slides) ? slides : []);
  }, [slides]);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Intersection Observer: Add nav transparency class when hero exits
  useEffect(() => {
    if (!heroRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const nav = document.querySelector("header.nav");
        if (!nav) return;

        if (!entry.isIntersecting) {
          // Hero is out of view - show nav background
          nav.classList.add("nav--hero-exit");
        } else {
          // Hero is in view - keep nav transparent
          nav.classList.remove("nav--hero-exit");
        }
      },
      { threshold: 0.8 }
    );

    observer.observe(heroRef.current);
    return () => observer.disconnect();
  }, []);

  // Fetch slides from API on mount
  useEffect(() => {
    async function fetchSlides() {
      try {
        const response = await fetch("/api/admin/hero-slides");
        const data = await response.json();
        if (data.slides && data.slides.length > 0) {
          setLoadedSlides(data.slides);
        }
      } catch (error) {
        console.error("Error fetching slides:", error);
      }
    }
    fetchSlides();
  }, []);

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

  const slidesData = loadedSlides.length > 0 ? loadedSlides : defaultSlides;
  const currentSlideData = slidesData[currentSlide];

  // Helper: Get responsive image (fallback to image field for backwards compatibility)
  const getSlideImage = (slide) => {
    if (isMobile) {
      return slide.imageMobile || slide.imageDesktop || slide.image;
    }
    return slide.imageDesktop || slide.image;
  };

  function getSlideHeading(slide) {
    if (slide.type === "discount") {
      return [slide.title, slide.subtitle].filter(Boolean).join(" ");
    }

    return slide.title;
  }

  function getSlideCtaLabel(slide) {
    if (slide.type === "discount") {
      return "Claim Offer";
    }

    return slide.cta;
  }

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
    <section className="hero-slideshow" ref={heroRef}>
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
              src={getSlideImage(slide)}
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
                  <h2 className="hero-slideshow__title">{getSlideHeading(slide)}</h2>
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
                  <h2 className="hero-slideshow__title">{getSlideHeading(slide)}</h2>
                  <p className="hero-slideshow__description">
                    {slide.description}
                  </p>
                </>
              )}

              {slide.type === "product" && (
                <>
                  <h2 className="hero-slideshow__title">{getSlideHeading(slide)}</h2>
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
                  <h2 className="hero-slideshow__title">{getSlideHeading(slide)}</h2>
                  <p className="hero-slideshow__description">
                    {slide.description}
                  </p>
                  <p className="hero-slideshow__savings">{slide.savings}</p>
                </>
              )}

              {slide.type === "brand" && (
                <>
                  <h2 className="hero-slideshow__title">{getSlideHeading(slide)}</h2>
                  <p className="hero-slideshow__description">
                    {slide.description}
                  </p>
                  <p className="hero-slideshow__stats">{slide.stats}</p>
                </>
              )}

              {slide.type === "shipping" && (
                <>
                  <h2 className="hero-slideshow__title">{getSlideHeading(slide)}</h2>
                  <p className="hero-slideshow__description">
                    {slide.description}
                  </p>
                </>
              )}

              {/* CTA Button */}
              <Link 
                href={slide.ctaLink || "/shop"}
                legacyBehavior
              >
                <a className="hero-slideshow__cta">{getSlideCtaLabel(slide)}</a>
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

      {/* Styles managed by hero-slideshow.css */}
    </section>
  );
}
