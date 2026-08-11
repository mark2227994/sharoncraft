import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import SeoHead from '../components/SeoHead';
import { supabase } from '../lib/supabase-client';

const FALLBACK_SHARON = {
  id: 'fallback-sharon',
  name: 'Sharon',
  specialty: 'Maasai Beadwork & Design',
  bio: 'SharonCraft brings together handmade Kenyan beadwork, jewellery, and home pieces chosen for craft, warmth, and cultural memory. Each piece is meant to feel personal, giftable, and grounded in the story of the hands that made it.',
  location: 'Nairobi, Kenya',
  image_url: '/images/hero-fallback.jpg',
  years_experience: 5,
  products_made: 120,
  signature_technique: 'Traditional Weaving',
  is_featured: true,
};

const safeName = (name) =>
  name?.trim()?.replace(/[^a-zA-Z\s\-\']/g, '') || 'Sharon';

function useScrollReveal(artisans) {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    const elements = document.querySelectorAll(
      '.reveal, .reveal-left, .reveal-right, .reveal-scale'
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [artisans]);
}

export default function ArtisansPage() {
  const [artisans, setArtisans] = useState([]);
  const [featuredArtisan, setFeaturedArtisan] = useState(null);
  const [siteImageMap, setSiteImageMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [expandedBios, setExpandedBios] = useState({});
  const [activePanel, setActivePanel] = useState(0);

  const scrollRef = useRef(null);
  const router = useRouter();

  useScrollReveal(artisans);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: artisanData, error } = await supabase
          .from('artisans')
          .select('*')
          .eq('is_visible', true)
          .order('created_at', { ascending: true });

        const { data: siteImagesData } = await supabase
          .from('site_images')
          .select('key, image_url')
          .eq('page', 'artisans');

        if (error) throw error;

        const nextSiteImageMap = (siteImagesData || []).reduce((acc, row) => {
          if (row?.key && row?.image_url) {
            acc[row.key] = row.image_url;
          }
          return acc;
        }, {});

        setSiteImageMap(nextSiteImageMap);

        let allArtisans = artisanData && artisanData.length > 0 ? artisanData : [FALLBACK_SHARON];

        const artisansWithProducts = await Promise.all(
          allArtisans.map(async (artisan) => {
            if (artisan.id === 'fallback-sharon') return { ...artisan, products: [] };
            const { data: products } = await supabase
              .from('products')
              .select('id, image_url')
              .eq('artisan', artisan.name)
              .eq('is_visible', true)
              .limit(4);
            return { ...artisan, products: products || [] };
          })
        );

        const featured = artisansWithProducts.find((a) => a.is_featured) || artisansWithProducts[0];
        const rest = artisansWithProducts.filter((a) => a.id !== featured.id);

        setFeaturedArtisan({
          ...featured,
          image_url:
            nextSiteImageMap.artisans_featured_image ||
            featured.image_url ||
            FALLBACK_SHARON.image_url,
        });
        setArtisans(rest);
        setTotalProducts(artisansWithProducts.reduce((acc, a) => acc + (a.products_made || 0), 0) || 500);
      } catch (err) {
        console.error('Error fetching artisans:', err);
        setFeaturedArtisan({
          ...FALLBACK_SHARON,
          image_url: siteImageMap.artisans_featured_image || FALLBACK_SHARON.image_url,
        });
        setArtisans([]);
        setTotalProducts(120);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!scrollRef.current) return;
    const handleScroll = () => {
      const scrollLeft = scrollRef.current.scrollLeft;
      const panelWidth = 380 + 3;
      const index = Math.round(scrollLeft / panelWidth);
      setActivePanel(index);
    };
    const ref = scrollRef.current;
    ref.addEventListener('scroll', handleScroll, { passive: true });
    return () => ref.removeEventListener('scroll', handleScroll);
  }, [loading]);

  const toggleBio = (id) => setExpandedBios((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <>
      <SeoHead
        title="Our Artisans - Kenyan Craft Makers"
        description="Meet the skilled Kenyan artisans behind every SharonCraft piece. Led creatively by Sharon Ruth and founded by Kelvin Mark in Nairobi, Kenya."
        keywords="Kenyan artisans, Sharon Ruth, Nairobi jewelry makers, Maasai beadwork artisans, SharonCraft artisans"
        path="/artisans"
      />
      <Nav />
      <main className="artisans-page">
        {/* SECTION 1 - PAGE HERO */}
        <section className="hero-section">
          <div className="hero-bg">
            <Image
              src={siteImageMap.artisans_hero || '/images/hero-fallback.jpg'}
              alt="Artisan Hands"
              fill
              priority
              sizes="100vw"
              style={{ objectFit: 'cover', objectPosition: 'center top' }}
            />
            <div className="hero-overlay" />
            <div className="hero-texture" />
          </div>
          <div className="hero-content">
            <span className="hero-breadcrumb">Home › Our Artisans</span>
            <span className="hero-eyebrow" style={{ animationDelay: '0.3s' }}>THE MAKERS</span>
            <h1 className="hero-h1">
              <span className="line1" style={{ animationDelay: '0.4s' }}>The hands behind</span><br />
              <span className="line2" style={{ animationDelay: '0.5s' }}>every piece.</span>
            </h1>
            <p className="hero-sub" style={{ animationDelay: '0.65s' }}>
              {loading ? '...' : artisans.length + 1} artisans · Nairobi, Kenya
            </p>
          </div>
        </section>

        {/* SECTION 2 - INTRO STRIP */}
        <section className="intro-strip">
          <div className="intro-left reveal-left">
            <blockquote className="intro-quote">
              "Every bead is placed with intention. This is not a product — it is a piece of Kenya."
            </blockquote>
            <span className="intro-attr">— Sharon · Founder</span>
          </div>
          <div className="intro-divider" />
          <div className="intro-right reveal-right">
            <div className="stat-row reveal" style={{ transitionDelay: '0ms' }}>
              <span className="stat-num">{totalProducts}+</span>
              <span className="stat-label">Pieces created</span>
            </div>
            <div className="stat-row reveal" style={{ transitionDelay: '80ms' }}>
              <span className="stat-num">5+</span>
              <span className="stat-label">Years experience avg</span>
            </div>
            <div className="stat-row reveal" style={{ transitionDelay: '160ms' }}>
              <span className="stat-num">100%</span>
              <span className="stat-label">Handmade in Kenya</span>
            </div>
          </div>
        </section>

        {/* SECTION 3 - FEATURED ARTISAN */}
        {featuredArtisan && (
          <section className="featured-section">
            <div className="featured-left">
              <div className="featured-img-wrapper">
                <Image
                  src={featuredArtisan.image_url || siteImageMap.artisans_featured_image || '/images/hero-fallback.jpg'}
                  alt={safeName(featuredArtisan.name)}
                  fill
                  sizes="50vw"
                  style={{ objectFit: 'cover', objectPosition: 'center top' }}
                />
              </div>
              <div className="featured-overlay" />
              <div className="floating-label">
                <span className="fl-name">{safeName(featuredArtisan.name).toUpperCase()}</span>
                <span className="fl-title">FOUNDER & CREATIVE DIRECTOR</span>
              </div>
            </div>
            <div className="featured-right">
              <div className="accent-line reveal-right" style={{ transitionDelay: '0ms' }} />
              <span className="fs-eyebrow reveal-right" style={{ transitionDelay: '60ms' }}>
                {featuredArtisan.specialty || 'MAASAI BEADWORK & DESIGN'}
              </span>
              <h2 className="fs-name reveal-right" style={{ transitionDelay: '120ms' }}>
                {safeName(featuredArtisan.name)}
              </h2>
              <p className="fs-bio reveal-right" style={{ transitionDelay: '180ms' }}>
                {featuredArtisan.bio || 'Founder of SharonCraft. Based in Nairobi, Kenya. Specializing in traditional Maasai beadwork and handcrafted jewelry.'}
              </p>

              {featuredArtisan.signature_technique && (
                <div className="fs-technique reveal-right" style={{ transitionDelay: '240ms' }}>
                  <span className="tech-star">✦</span>
                  <span className="tech-text">{featuredArtisan.signature_technique}</span>
                </div>
              )}

              <div className="fs-stats reveal-right" style={{ transitionDelay: '300ms' }}>
                <div className="fs-stat">
                  <span className="fs-stat-num">{featuredArtisan.products_made || 0}</span>
                  <span className="fs-stat-lbl">Pieces</span>
                </div>
                <div className="fs-stat">
                  <span className="fs-stat-num">{featuredArtisan.years_experience || 5}</span>
                  <span className="fs-stat-lbl">Years</span>
                </div>
                <div className="fs-stat">
                  <span className="fs-stat-num">{featuredArtisan.location || 'Nairobi'}</span>
                  <span className="fs-stat-lbl">Location</span>
                </div>
              </div>
              <div className="fs-cta-row reveal-right" style={{ transitionDelay: '360ms' }}>
                <span className="inline-btn" onClick={() => router.push(`/shop?artisan=${featuredArtisan.id}`)}>
                  SEE ALL PIECES →
                </span>
              </div>
            </div>
          </section>
        )}

        {/* SECTION 4 - ALL ARTISANS */}
        {artisans.length > 0 && (
          <section className="all-artisans-section">
            <span className="section-label reveal">OUR MAKERS</span>
            <div className="editorial-grid">
              {artisans.map((artisan, index) => {
                const isEven = index % 2 === 0;
                const isExpanded = expandedBios[artisan.id];
                const bioExcerpt = artisan.bio
                  ? artisan.bio.slice(0, 120) + (artisan.bio.length > 120 ? '...' : '')
                  : 'Based in Nairobi, Kenya.';
                const hasMoreBio = artisan.bio?.length > 120;
                const artisanNum = String(index + 1).padStart(2, '0');
                const cleanName = safeName(artisan.name);

                const ImagePanel = () => (
                  <div className={`ac-image-panel ${isEven ? 'reveal-left' : 'reveal-right'}`}>
                    <div className="image-inner">
                      <Image
                        src={artisan.image_url || '/images/hero-fallback.jpg'}
                        alt={cleanName}
                        fill
                        sizes="50vw"
                        style={{ objectFit: 'cover', objectPosition: 'center top' }}
                      />
                    </div>
                    <div className="ac-image-overlay" />
                    <div className="ac-number">{artisanNum}</div>
                  </div>
                );

                const ContentPanel = () => (
                  <div
                    className={`ac-content-panel ${isEven ? 'reveal-right' : 'reveal-left'}`}
                    style={{ transitionDelay: `${(index % 3) * 80}ms` }}
                  >
                    <span className="ac-specialty">{artisan.specialty || 'ARTISAN'}</span>
                    <h3 className="ac-name">{cleanName}</h3>

                    <p className="ac-bio">
                      {isExpanded ? artisan.bio : bioExcerpt}
                    </p>
                    {hasMoreBio && (
                      <button className="read-more-btn" onClick={() => toggleBio(artisan.id)}>
                        <span className="rm-icon" style={{ transform: isExpanded ? 'rotate(45deg)' : 'none' }}>+</span>
                        {isExpanded ? 'READ LESS' : 'READ MORE'}
                      </button>
                    )}

                    {artisan.signature_technique && (
                      <div className="ac-technique">
                        <span className="tech-star">✦</span>
                        <span className="tech-text">{artisan.signature_technique}</span>
                      </div>
                    )}

                    {artisan.products?.length > 0 && (
                      <div className="ac-mini-products">
                        <span className="mp-label">THEIR WORK</span>
                        <div className="mp-row">
                          {artisan.products.slice(0, 4).map((p) => (
                            <div key={p.id} className="mp-thumb" onClick={() => router.push(`/product/${p.slug}`)}>
                              <Image src={p.image_url || '/images/product-fallback.jpg'} alt="Product" fill sizes="52px" style={{ objectFit: 'contain' }} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="ac-cta-row">
                      <span className="inline-btn" onClick={() => router.push(`/shop?artisan=${artisan.id}`)}>
                        SEE ALL PIECES →
                      </span>
                    </div>
                  </div>
                );

                return (
                  <div
                    key={artisan.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: isEven ? '1.2fr 1fr' : '1fr 1.2fr',
                      minHeight: '420px',
                      borderBottom: '0.5px solid rgba(0,0,0,0.06)',
                      overflow: 'hidden',
                    }}
                  >
                    {isEven ? (
                      <>
                        <ImagePanel />
                        <ContentPanel />
                      </>
                    ) : (
                      <>
                        <ContentPanel />
                        <ImagePanel />
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* SECTION 5 - PROCESS DOCUMENTARY */}
        <section className="process-section">
          <div className="process-header">
            <span className="ph-eyebrow reveal">THE CRAFT</span>
            <h2 className="ph-h2 reveal" style={{ transitionDelay: '80ms' }}>
              How each piece<br />
              <span className="ph-italic">comes to life.</span>
            </h2>
          </div>
          <div className="process-scroll" ref={scrollRef}>
            <div className="process-panel img-panel">
              {siteImageMap.artisans_process_1 ? (
                <Image
                  src={siteImageMap.artisans_process_1}
                  alt="Artisans process panel 1"
                  fill
                  sizes="380px"
                  className="pp-image"
                  style={{ objectFit: 'cover', objectPosition: 'center top' }}
                />
              ) : null}
              <div className="pp-gradient" />
              <div className="pp-pattern" />
              <span className="pp-num">01</span>
            </div>
            <div className="process-panel txt-panel">
              <span className="pt-num">01</span>
              <h3 className="pt-title">Sourcing the beads</h3>
              <p className="pt-desc">Every piece begins with the beads. Sharon visits the Maasai Market every week to hand-select seed beads in exact colors needed for each design.</p>
            </div>
            <div className="process-panel img-panel">
              {siteImageMap.artisans_process_2 ? (
                <Image
                  src={siteImageMap.artisans_process_2}
                  alt="Artisans process panel 2"
                  fill
                  sizes="380px"
                  className="pp-image"
                  style={{ objectFit: 'cover', objectPosition: 'center top' }}
                />
              ) : null}
              <div className="pp-gradient" />
              <div className="pp-pattern" />
              <span className="pp-num">02</span>
            </div>
            <div className="process-panel txt-panel">
              <span className="pt-num">02</span>
              <h3 className="pt-title">The making</h3>
              <p className="pt-desc">Each bracelet takes between 2 and 8 hours to complete. There are no shortcuts. The artisan threads every single bead by hand — one at a time.</p>
            </div>
          </div>
          <div className="process-dots">
            {[0, 1, 2, 3].map((idx) => (
              <div
                key={idx}
                className={`dot ${activePanel === idx ? 'active' : ''}`}
                onClick={() => {
                  if (scrollRef.current) {
                    scrollRef.current.scrollTo({
                      left: idx * (380 + 3),
                      behavior: 'smooth',
                    });
                  }
                }}
              />
            ))}
          </div>
        </section>

        {/* SECTION 6 - VALUES STRIP */}
        <section className="values-strip">
          <div className="val-col reveal" style={{ transitionDelay: '0ms' }}>
            <div className="val-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="#8B5E3C" strokeWidth="1">
                <line x1="12" y1="3" x2="12" y2="21" />
                <path d="M5 8l7-5 7 5" />
                <path d="M5 8c0 3 3 5 7 5s7-2 7-5" />
                <path d="M3 21h18" />
              </svg>
            </div>
            <h3 className="val-title">Fair Compensation</h3>
            <p className="val-desc">Every artisan is paid fairly for their skill and time. We never compromise on that.</p>
          </div>
          <div className="val-col reveal" style={{ transitionDelay: '120ms' }}>
            <div className="val-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="#8B5E3C" strokeWidth="1">
                <circle cx="12" cy="12" r="9" />
                <path d="M3.6 9h16.8" />
                <path d="M3.6 15h16.8" />
                <path d="M12 3a9 9 0 0 1 3 6 3 6 0 0 1-3 6 9 9 0 0 1-3-6 3 6 0 0 1 3-6z" />
              </svg>
            </div>
            <h3 className="val-title">Kenyan Heritage</h3>
            <p className="val-desc">Every technique used has roots in Kenyan craft tradition. Passed down. Preserved.</p>
          </div>
          <div className="val-col reveal" style={{ transitionDelay: '240ms' }}>
            <div className="val-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="#8B5E3C" strokeWidth="1">
                <circle cx="12" cy="12" r="9" />
                <polyline points="12 7 12 12 15 15" />
              </svg>
            </div>
            <h3 className="val-title">Made to Last</h3>
            <p className="val-desc">We reject fast fashion. Every piece is made to be worn for years — not one season.</p>
          </div>
        </section>

        {/* SECTION 7 - JOIN THE COLLECTIVE */}
        <section className="join-cta">
          <span className="jc-eyebrow reveal">JOIN THE COLLECTIVE</span>
          <h2 className="jc-h2 reveal" style={{ transitionDelay: '80ms' }}>Are you a Kenyan artisan?</h2>
          <p className="jc-sub reveal" style={{ transitionDelay: '160ms' }}>
            We are always looking for skilled makers to collaborate with. If you create handmade jewelry or crafts in Nairobi — we would love to hear from you.
          </p>
          <div className="jc-btns reveal" style={{ transitionDelay: '240ms' }}>
            <button className="jc-btn-primary" onClick={() => router.push('/contact')}>GET IN TOUCH →</button>
            <button className="jc-btn-secondary" onClick={() => router.push('/about')}>LEARN MORE</button>
          </div>
        </section>

      </main>
      <Footer />

      <style jsx global>{`
        /* DESIGN TOKENS */
        :root {
          --cream: #fafaf8;
          --card-bg: #F5F0EB;
          --dark: #1c1c1c;
          --black: #080808;
          --brown: #8B5E3C;
          --dark-brown: #3D1F0D;
          --border: rgba(0,0,0,0.08);
          --muted: #bbb;
          --text: #666;
        }

        .artisans-page { background: var(--cream); color: var(--dark); }

        /* ANIMATION SYSTEM */
        .reveal { opacity: 0; transform: translateY(24px); transition: opacity 0.65s ease, transform 0.65s ease; }
        .reveal.visible { opacity: 1; transform: translateY(0); }
        .reveal-left { opacity: 0; transform: translateX(-28px); transition: opacity 0.65s ease, transform 0.65s ease; }
        .reveal-left.visible { opacity: 1; transform: translateX(0); }
        .reveal-right { opacity: 0; transform: translateX(28px); transition: opacity 0.65s ease, transform 0.65s ease; }
        .reveal-right.visible { opacity: 1; transform: translateX(0); }
        .reveal-scale { opacity: 0; transform: scale(0.96); transition: opacity 0.65s ease, transform 0.65s ease; }
        .reveal-scale.visible { opacity: 1; transform: scale(1); }

        @keyframes heroFadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (prefers-reduced-motion) { 
          *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; scroll-behavior: auto !important; } 
        }

        /* SECTION 1 - PAGE HERO */
        .hero-section { position: relative; width: 100%; height: 380px; overflow: hidden; background: #1a0e08; }
        .hero-bg { position: absolute; inset: 0; width: 100%; height: 100%; }
        .hero-overlay { position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(8,8,8,0.78) 100%); pointer-events: none; z-index: 1; }
        .hero-texture { position: absolute; inset: 0; background-image: repeating-linear-gradient(45deg, transparent, transparent 60px, rgba(255,255,255,0.018) 60px, rgba(255,255,255,0.018) 61px); pointer-events: none; z-index: 1; }
        .hero-content { position: absolute; bottom: 0; left: 0; right: 0; padding: 48px 56px; z-index: 2; }
        .hero-breadcrumb { font-size: 10px; color: rgba(255,255,255,0.3); letter-spacing: 1.5px; margin-bottom: 12px; display: block; text-transform: uppercase; }
        .hero-eyebrow { font-size: 9px; letter-spacing: 6px; text-transform: uppercase; color: var(--brown); display: block; margin-bottom: 10px; animation: heroFadeUp 0.6s ease both; }
        .hero-h1 { margin: 0; }
        .hero-h1 .line1 { font-size: 42px; font-weight: 300; color: #fff; display: block; line-height: 1.1; letter-spacing: -0.5px; animation: heroFadeUp 0.7s ease both; }
        .hero-h1 .line2 { font-size: 42px; font-weight: 300; font-style: italic; color: rgba(255,255,255,0.5); display: block; line-height: 1.1; letter-spacing: -0.5px; animation: heroFadeUp 0.7s ease both; }
        .hero-sub { font-size: 11px; color: rgba(255,255,255,0.3); letter-spacing: 1.5px; margin-top: 12px; display: block; text-transform: uppercase; animation: heroFadeUp 0.6s ease both; }
        @media (max-width: 768px) { .hero-section { height: 260px; } .hero-content { padding: 32px 24px; } .hero-h1 .line1, .hero-h1 .line2 { font-size: 26px; } }

        /* SECTION 2 - INTRO STRIP */
        .intro-strip { background: #fff; border-bottom: 0.5px solid var(--border); padding: 56px 80px; display: grid; grid-template-columns: 1fr 1px 1fr; gap: 64px; align-items: center; }
        .intro-quote { font-size: 18px; font-weight: 300; font-style: italic; color: var(--dark); line-height: 1.75; letter-spacing: 0.2px; margin: 0 0 16px; }
        .intro-attr { font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: var(--muted); display: block; }
        .intro-divider { width: 1px; height: 80px; background: rgba(0,0,0,0.1); margin: 0 auto; align-self: center; }
        .intro-right { display: flex; flex-direction: column; gap: 0; }
        .stat-row { display: flex; align-items: baseline; gap: 12px; padding: 12px 0; border-bottom: 0.5px solid rgba(0,0,0,0.06); }
        .stat-row:last-child { border-bottom: none; }
        .stat-num { font-size: 26px; font-weight: 300; color: var(--dark); letter-spacing: -0.5px; min-width: 80px; }
        .stat-label { font-size: 10px; letter-spacing: 2.5px; text-transform: uppercase; color: var(--muted); }
        @media (max-width: 768px) { .intro-strip { padding: 40px 24px; grid-template-columns: 1fr; gap: 40px; } .intro-divider { width: 100%; height: 1px; margin: 0; } }

        /* SECTION 3 - FEATURED ARTISAN */
        .featured-section { position: relative; width: 100%; overflow: hidden; background: var(--cream); display: grid; grid-template-columns: 1fr 1fr; min-height: 560px; }
        .featured-left { position: relative; overflow: hidden; background: #1a0e08; min-height: 560px; }
        .featured-img-wrapper { position: absolute; inset: 0; transition: transform 0.7s cubic-bezier(0.4,0,0.2,1); }
        .featured-left:hover .featured-img-wrapper { transform: scale(1.04); }
        .featured-overlay { position: absolute; inset: 0; background: linear-gradient(to right, transparent 50%, rgba(250,250,248,0.1) 100%); pointer-events: none; z-index: 1; }
        .floating-label { position: absolute; bottom: 32px; left: 32px; z-index: 2; background: rgba(8,8,8,0.75); backdrop-filter: blur(8px); padding: 12px 18px; border-left: 2px solid var(--brown); }
        .fl-name { font-size: 14px; font-weight: 400; color: #fff; display: block; letter-spacing: 2px; text-transform: uppercase; }
        .fl-title { font-size: 9px; letter-spacing: 2px; text-transform: uppercase; color: rgba(255,255,255,0.4); display: block; margin-top: 3px; }
        .featured-right { padding: 72px 64px; display: flex; flex-direction: column; justify-content: center; background: var(--cream); min-height: 560px; }
        .accent-line { width: 32px; height: 1px; background: var(--brown); margin-bottom: 20px; }
        .fs-eyebrow { font-size: 9px; letter-spacing: 5px; text-transform: uppercase; color: var(--brown); display: block; margin-bottom: 14px; }
        .fs-name { font-size: 36px; font-weight: 300; color: var(--dark); letter-spacing: -0.3px; margin: 0 0 20px; line-height: 1.1; }
        .fs-bio { font-size: 13px; color: var(--text); line-height: 1.9; margin-bottom: 24px; max-width: 420px; }
        .fs-technique { display: flex; align-items: center; gap: 8px; padding: 10px 0; border-top: 0.5px solid rgba(0,0,0,0.06); border-bottom: 0.5px solid rgba(0,0,0,0.06); margin-bottom: 24px; }
        .fs-stats { display: flex; gap: 32px; margin-bottom: 28px; }
        .fs-stat { display: flex; flex-direction: column; }
        .fs-stat-num { font-size: 20px; font-weight: 300; color: var(--dark); }
        .fs-stat-lbl { font-size: 9px; text-transform: uppercase; color: var(--muted); }
        .fs-cta-row { margin-top: 0; }
        .inline-btn { display: inline-block; font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: var(--dark); border-bottom: 1px solid var(--dark); padding-bottom: 2px; cursor: pointer; transition: opacity 0.2s; }
        .inline-btn:hover { opacity: 0.5; }
        @media (max-width: 768px) { .featured-section { grid-template-columns: 1fr; } .featured-left { min-height: 380px; } .featured-right { padding: 48px 24px; min-height: 0; } }

        /* SECTION 4 - ALL ARTISANS */
        .all-artisans-section { padding: 72px 40px; background: var(--cream); }
        .section-label { font-size: 9px; letter-spacing: 5px; text-transform: uppercase; color: var(--muted); margin-bottom: 40px; display: block; }
        .ac-image-panel { position: relative; overflow: hidden; background: #1a0e08; min-height: 420px; cursor: pointer; }
        .image-inner { position: absolute; inset: 0; transition: transform 0.7s cubic-bezier(0.4,0,0.2,1); }
        .ac-image-panel:hover .image-inner { transform: scale(1.05); }
        .ac-image-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 60%); pointer-events: none; z-index: 1; }
        .ac-number { position: absolute; top: 20px; left: 20px; z-index: 2; font-size: 11px; font-weight: 300; color: rgba(255,255,255,0.25); letter-spacing: 2px; }
        .ac-content-panel { padding: 48px 40px; display: flex; flex-direction: column; justify-content: center; background: #fff; min-height: 420px; }
        .ac-specialty { font-size: 9px; letter-spacing: 4px; text-transform: uppercase; color: var(--brown); display: block; margin-bottom: 14px; }
        .ac-name { font-size: 28px; font-weight: 300; color: var(--dark); letter-spacing: -0.3px; margin: 0 0 16px; line-height: 1.1; }
        .ac-bio { font-size: 13px; color: var(--text); line-height: 1.9; margin: 0 0 16px; max-width: 380px; }
        .read-more-btn { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: var(--muted); cursor: pointer; display: flex; align-items: center; gap: 6px; margin-bottom: 20px; border: none; background: none; padding: 0; }
        .rm-icon { transition: transform 0.3s ease; }
        .ac-technique { display: flex; align-items: center; gap: 8px; padding: 10px 0; border-top: 0.5px solid rgba(0,0,0,0.06); border-bottom: 0.5px solid rgba(0,0,0,0.06); margin-bottom: 20px; }
        .tech-star { font-size: 10px; color: var(--brown); }
        .tech-text { font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: #888; }
        .ac-mini-products { margin-bottom: 20px; }
        .mp-label { font-size: 9px; letter-spacing: 3px; text-transform: uppercase; color: var(--muted); margin-bottom: 10px; display: block; }
        .mp-row { display: flex; gap: 6px; }
        .mp-thumb { width: 52px; height: 52px; background: var(--card-bg); position: relative; overflow: hidden; padding: 4px; border: 0.5px solid rgba(0,0,0,0.06); cursor: pointer; flex-shrink: 0; transition: opacity 0.2s; }
        .mp-thumb:hover { opacity: 0.75; }
        .ac-cta-row { margin-top: 20px; display: flex; align-items: center; gap: 20px; }
        @media (max-width: 768px) { .all-artisans-section { padding: 48px 20px; } .ac-image-panel { min-height: 320px; } .ac-content-panel { padding: 32px 24px; min-height: 0; } }

        /* SECTION 5 - PROCESS DOCUMENTARY */
        .process-section { background: var(--black); padding: 80px 0; overflow: hidden; }
        .process-header { padding: 0 56px; margin-bottom: 56px; }
        .ph-eyebrow { font-size: 9px; letter-spacing: 6px; text-transform: uppercase; color: rgba(255,255,255,0.2); margin-bottom: 14px; display: block; }
        .ph-h2 { font-size: 36px; font-weight: 300; color: rgba(255,255,255,0.75); line-height: 1.15; margin: 0; }
        .ph-italic { color: rgba(255,255,255,0.3); font-style: italic; }
        .process-scroll { display: flex; overflow-x: auto; scroll-snap-type: x mandatory; padding: 0 56px; gap: 3px; scrollbar-width: none; -webkit-overflow-scrolling: touch; }
        .process-scroll::-webkit-scrollbar { display: none; }
        .process-panel { width: 380px; min-height: 440px; flex-shrink: 0; scroll-snap-align: start; }
        .txt-panel { background: #111111; padding: 48px 36px; display: flex; flex-direction: column; justify-content: flex-end; }
        .pt-num { font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: var(--brown); margin-bottom: 16px; display: block; }
        .pt-title { font-size: 20px; font-weight: 300; color: rgba(255,255,255,0.8); margin: 0 0 12px; line-height: 1.3; }
        .pt-desc { font-size: 12px; color: rgba(255,255,255,0.35); line-height: 1.8; margin: 0; }
        .img-panel { position: relative; overflow: hidden; background: linear-gradient(145deg, #1a0e08 0%, #3D1F0D 50%, #8B5E3C 100%); }
        .pp-image { z-index: 0; }
        .pp-pattern { position: absolute; inset: 0; background-image: repeating-linear-gradient(45deg, transparent, transparent 30px, rgba(255,255,255,0.02) 30px, rgba(255,255,255,0.02) 31px); pointer-events: none; z-index: 1; }
        .pp-num { position: absolute; bottom: 16px; left: 20px; font-size: 72px; font-weight: 300; color: rgba(255,255,255,0.06); line-height: 1; letter-spacing: -4px; user-select: none; z-index: 2; pointer-events: none; }
        .process-dots { display: flex; justify-content: center; gap: 8px; padding: 24px 0 0; }
        .dot { cursor: pointer; transition: all 0.3s ease; width: 4px; height: 4px; border-radius: 50%; background: rgba(255,255,255,0.15); }
        .dot.active { width: 20px; height: 4px; border-radius: 2px; background: rgba(255,255,255,0.6); }

        /* SECTION 6 - VALUES STRIP */
        .values-strip { background: var(--card-bg); border-top: 0.5px solid var(--border); border-bottom: 0.5px solid var(--border); padding: 56px 80px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 0; }
        .val-col { padding: 0 48px; text-align: center; border-right: 0.5px solid var(--border); }
        .val-col:last-child { border-right: none; }
        .val-icon { width: 40px; height: 40px; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center; }
        .val-title { font-size: 13px; font-weight: 500; color: var(--dark); margin: 0 0 8px; letter-spacing: 0.3px; }
        .val-desc { font-size: 12px; color: #888; line-height: 1.75; max-width: 240px; margin: 0 auto; }
        @media (max-width: 768px) { .values-strip { grid-template-columns: 1fr; padding: 48px 24px; gap: 40px; } .val-col { padding: 0; border-right: none; } }

        /* SECTION 7 - JOIN THE COLLECTIVE */
        .join-cta { background: var(--dark); padding: 80px 40px; text-align: center; overflow: hidden; }
        .jc-eyebrow { font-size: 9px; letter-spacing: 6px; text-transform: uppercase; color: var(--brown); margin-bottom: 16px; display: block; }
        .jc-h2 { font-size: 34px; font-weight: 300; color: rgba(255,255,255,0.85); letter-spacing: -0.3px; margin: 0 0 16px; }
        .jc-sub { max-width: 480px; margin: 0 auto 40px; font-size: 13px; color: rgba(255,255,255,0.35); line-height: 1.85; }
        .jc-btns { display: flex; justify-content: center; gap: 14px; }
        .jc-btn-primary { height: 52px; padding: 0 36px; background: #fff; color: var(--dark); font-size: 10px; letter-spacing: 4px; text-transform: uppercase; border-radius: 2px; cursor: pointer; transition: all 0.25s ease; border: none; }
        .jc-btn-primary:hover { background: var(--brown); color: #fff; }
        .jc-btn-secondary { height: 52px; padding: 0 28px; background: transparent; border: 0.5px solid rgba(255,255,255,0.2); color: rgba(255,255,255,0.4); font-size: 10px; letter-spacing: 4px; text-transform: uppercase; border-radius: 2px; cursor: pointer; transition: all 0.2s ease; }
        .jc-btn-secondary:hover { border-color: rgba(255,255,255,0.5); color: rgba(255,255,255,0.7); }
        @media (max-width: 768px) { .jc-btns { flex-direction: column; } }
      `}</style>
    </>
  );
}
