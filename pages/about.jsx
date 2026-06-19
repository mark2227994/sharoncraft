import SeoHead from '../components/SeoHead'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState, useRef } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import { buildShopHref } from '@/lib/categories'

const CountUp = ({ end, duration = 1500 }) => {
  const [count, setCount] = useState(0)
  const nodeRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        let start = 0
        const step = end / (duration / 16)
        const timer = setInterval(() => {
          start += step
          if (start >= end) {
            setCount(end)
            clearInterval(timer)
          } else {
            setCount(Math.floor(start))
          }
        }, 16)
        observer.disconnect()
      }
    })
    if (nodeRef.current) {
      observer.observe(nodeRef.current)
    }
    return () => observer.disconnect()
  }, [end, duration])

  return <span ref={nodeRef}>{count}</span>
}

const useScrollReveal = (dependencies = []) => {
  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            observer.unobserve(entry.target)
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px',
      }
    )

    const nodes = document.querySelectorAll(
      '.reveal, .reveal-left, .reveal-right, .reveal-slow, .reveal-scale'
    )
    nodes.forEach((node) => observer.observe(node))

    return () => observer.disconnect()
  }, dependencies)
}

export default function AboutPage() {
  const [loading, setLoading] = useState(true)
  const [heroImg, setHeroImg] = useState('')
  const [storyImg, setStoryImg] = useState('')
  const [siteImageMap, setSiteImageMap] = useState({})
  const [founder, setFounder] = useState(null)
  const [artisans, setArtisans] = useState([])
  const [stats, setStats] = useState({ products: 0, artisans: 0 })
  const [progress, setProgress] = useState(0)
  const [isDesktop, setIsDesktop] = useState(true)

  useScrollReveal([loading])

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
      setProgress(pct)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 768)
    checkDesktop()
    window.addEventListener('resize', checkDesktop)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', checkDesktop)
    }
  }, [])

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
    let isMounted = true

    async function fetchData() {
      try {
        const { data: contentData } = await supabase
          .from('homepage_content')
          .select('*')
          .eq('section', 'about')
          .limit(1)

        const { data: founderData } = await supabase
          .from('artisans')
          .select('*')
          .eq('is_featured', true)
          .limit(1)
          .single()

        const { data: artisansData } = await supabase
          .from('artisans')
          .select('*')
          .eq('is_visible', true)
          .order('display_order', { ascending: true })
          .limit(3)

        const { data: siteImagesData } = await supabase
          .from('site_images')
          .select('key, image_url')
          .in('page', ['about', 'homepage'])

        const { count: productCount } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('is_visible', true)

        const { count: artisanCount } = await supabase
          .from('artisans')
          .select('*', { count: 'exact', head: true })

        if (!isMounted) return

        const nextSiteImageMap = (siteImagesData || []).reduce((acc, row) => {
          if (row?.key && row?.image_url) {
            acc[row.key] = row.image_url
          }
          return acc
        }, {})

        setSiteImageMap(nextSiteImageMap)

        setHeroImg(nextSiteImageMap.about_hero || (contentData && contentData.length > 0 && contentData[0].image_url) || '')
        setStoryImg(nextSiteImageMap.about_story_image || (contentData && contentData.length > 0 && contentData[0].secondary_image_url) || '')

        if (founderData) {
          setFounder({
            ...founderData,
            image_url:
              nextSiteImageMap.about_founder_portrait ||
              founderData.image_url ||
              '/media/site/placeholder.svg',
          })
        } else if (nextSiteImageMap.about_founder_portrait) {
          setFounder({
            name: 'Sharon',
            bio: '',
            image_url: nextSiteImageMap.about_founder_portrait,
          })
        }
        if (artisansData) setArtisans(artisansData)
        
        setStats({
          products: productCount || 14,
          artisans: artisanCount || 5
        })
      } catch (err) {
        console.error('Error fetching about data', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchData()
    return () => { isMounted = false }
  }, [])

  const handleParallax = (e) => {
    if (!isDesktop) return
    const rect = e.currentTarget.getBoundingClientRect()
    const scrollPos = window.pageYOffset
    const offset = (rect.top - scrollPos) * 0.2
    const img = e.currentTarget.querySelector('.parallax-img')
    if (img) img.style.transform = `translateY(${offset}px)`
  }

  useEffect(() => {
    if (isDesktop) {
      window.addEventListener('scroll', () => {
        const parallaxContainer = document.querySelector('.origin-right')
        if (parallaxContainer) {
          const rect = parallaxContainer.getBoundingClientRect()
          const visibleOffset = window.innerHeight - rect.top
          const rate = visibleOffset * 0.2
          const img = parallaxContainer.querySelector('.parallax-img')
          if (img) img.style.transform = `translateY(${rate - 100}px)`
        }
      }, { passive: true })
    }
  }, [isDesktop])

  const aboutCategoryCards = [
    {
      name: 'Jewellery',
      img: siteImageMap.homepage_cat_jewellery || '/media/products/Jewellery.jpg',
    },
    {
      name: 'Accessories',
      img:
        siteImageMap.homepage_cat_accessories ||
        '/media/products/1777391299524-Bracelet-damiti-dt-meilleurs-bracelets-ami-par.jpg',
    },
    {
      name: 'African Wear',
      img:
        siteImageMap.homepage_cat_african_wear ||
        '/media/products/1777501795839-pomelli_photoshoot_image_1_1_0430.png',
    },
    {
      name: 'Home & Living',
      img:
        siteImageMap.homepage_cat_home_living ||
        '/media/products/12 Afro-Modern Home Essentials for a Stylish, Culturally Grounded Space.jpg',
    },
    {
      name: 'Art & Craft',
      img:
        siteImageMap.homepage_cat_art_craft ||
        '/media/products/Gemini_Generated_Image_p3e0hup3e0hup3e0.jpg',
    },
    {
      name: 'Gifted Carry',
      img:
        siteImageMap.homepage_cat_gifted_carry ||
        '/media/products/Gemini_Generated_Image_xj81bfxj81bfxj81.png',
    },
  ]

  return (
    <>
      <SeoHead
        title="About SharonCraft - Founded by Kelvin Mark"
        description="SharonCraft was founded in 2024 by Kelvin Mark to connect skilled Kenyan artisans with customers who value authentic handmade craft. Based in Nairobi."
        keywords="about SharonCraft, Kelvin Mark, Sharon Ruth, Nairobi artisans, handmade Kenyan jewelry brand"
        path="/about"
      />

      <div className="progress-bar" style={{ width: `${progress}%` }} />

      <Nav />

      <main className="about-redesign">
        <section className="about-hero">
          <div className="hero-left">
            <div className="hero-content">
              <div className="hero-line" />
              <span className="hero-eyebrow">OUR STORY</span>
              <h1 className="hero-h1-1">Built in Nairobi.</h1>
              <h1 className="hero-h1-2">Made with intention.</h1>
              <p className="hero-desc">
                Sharoncraft is a Nairobi-based handmade jewelry and craft brand. Founded with the belief that African craft deserves a world-class stage.
              </p>
              <div className="hero-facts">
                <div className="fact-box">
                  <span className="fact-num">2024</span>
                  <span className="fact-label">EST.</span>
                </div>
                <div className="fact-box">
                  <span className="fact-num">Nairobi</span>
                  <span className="fact-label">BASED IN</span>
                </div>
              </div>
              <div 
                className="hero-cta" 
                onClick={() => document.getElementById('origin').scrollIntoView({behavior: 'smooth'})}
              >
                DISCOVER THE STORY ↓
              </div>
            </div>
            <div className="hero-scroll-indicator">
              <div className="hero-scroll-line" />
              <div className="hero-scroll-text">SCROLL</div>
            </div>
          </div>
          <div className="hero-right">
            <div className="hero-media-frame">
              {/* Fine-line Frame Accents (Desktop) */}
              <div className="hero-media-frame__corner hero-media-frame__corner--top-left max-md:hidden" aria-hidden="true" />
              <div className="hero-media-frame__corner hero-media-frame__corner--top-right max-md:hidden" aria-hidden="true" />
              <div className="hero-media-frame__corner hero-media-frame__corner--bottom-left max-md:hidden" aria-hidden="true" />
              <div className="hero-media-frame__corner hero-media-frame__corner--bottom-right max-md:hidden" aria-hidden="true" />

              <div className="hero-media">
                {loading ? (
                  <div className="hero-fallback" />
                ) : heroImg ? (
                  <div className="hero-image-wrapper">
                    <Image src={heroImg} fill priority sizes="(max-width: 768px) 100vw, 45vw" className="hero-img" alt="SharonCraft Hero" />
                  </div>
                ) : (
                  <div className="hero-fallback" />
                )}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2 — ORIGIN STORY */}
        <section id="origin" className="about-origin">
          <div className="origin-left">
            <div className="chapter-label reveal">
              <div className="chapter-line" />
              <span>CHAPTER ONE</span>
            </div>
            <h2 className="origin-h2 reveal" style={{ transitionDelay: '80ms' }}>
              <span className="origin-h2-1">It started with</span>
              <span className="origin-h2-2">a single bracelet.</span>
            </h2>
            <div className="origin-text">
              <p className="reveal" style={{ transitionDelay: '160ms' }}>
                SharonCraft was founded in 2024 by Kelvin Mark — a Nairobi-based entrepreneur with a vision to give Kenyan handcraft the world-class platform it deserves.
              </p>
              <p className="reveal" style={{ transitionDelay: '240ms' }}>
                The name honors the craft and the community behind it. Every piece sold on this platform directly supports a maker in Nairobi. Every purchase is a transaction between a buyer who values beauty and an artisan who creates it.
              </p>
            </div>
            <div className="origin-badge reveal" style={{ transitionDelay: '320ms' }}>
              Est. 2024 · Nairobi, Kenya
            </div>
          </div>
          <div className="origin-right reveal-right">
            {loading ? (
              <div className="origin-fallback">
                <div className="bead-dot" style={{ top: '20%', left: '30%' }} />
                <div className="bead-dot" style={{ top: '60%', left: '70%' }} />
                <div className="bead-dot" style={{ top: '80%', left: '40%' }} />
              </div>
            ) : storyImg ? (
              <div className="parallax-wrapper">
                <Image src={storyImg} fill sizes="50vw" className="parallax-img" alt="SharonCraft Story" />
              </div>
            ) : (
              <div className="origin-fallback">
                <div className="bead-dot" style={{ top: '20%', left: '30%' }} />
                <div className="bead-dot" style={{ top: '60%', left: '70%' }} />
                <div className="bead-dot" style={{ top: '80%', left: '40%' }} />
              </div>
            )}
          </div>
        </section>

        {/* SECTION 3 — THE NUMBERS */}
        <section className="about-numbers">
          <h2 className="numbers-header reveal">BY THE NUMBERS</h2>
          <div className="numbers-grid">
            <div className="num-card reveal" style={{ transitionDelay: '0ms' }}>
              <span className="num-val"><CountUp end={stats.products} />+</span>
              <span className="num-label">PIECES AVAILABLE</span>
            </div>
            <div className="num-card reveal" style={{ transitionDelay: '80ms' }}>
              <span className="num-val"><CountUp end={stats.artisans} />+</span>
              <span className="num-label">ARTISANS</span>
            </div>
            <div className="num-card reveal" style={{ transitionDelay: '160ms' }}>
              <span className="num-val"><CountUp end={100} />%</span>
              <span className="num-label">HANDMADE</span>
            </div>
            <div className="num-card reveal" style={{ transitionDelay: '240ms' }}>
              <span className="num-val"><CountUp end={2024} /></span>
              <span className="num-label">YEAR FOUNDED</span>
            </div>
          </div>
        </section>

        {/* SECTION 4 — THE MISSION */}
        <section className="about-mission">
          <div className="mission-wrapper">
            <div className="mission-eyebrow reveal">
              <div className="mission-line" />
              <span>OUR MISSION</span>
              <div className="mission-line" />
            </div>
            <h2 className="mission-h2 reveal-slow" style={{ transitionDelay: '100ms' }}>
              To give <span className="m-highlight">Kenyan handcraft</span> the <span className="m-italic">platform</span> it deserves — and to <span className="m-italic">connect</span> the people who make beautiful things with the people who appreciate them.
            </h2>
            <p className="mission-sub reveal" style={{ transitionDelay: '200ms' }}>
              We believe that when you buy handmade you are not just buying a product. You are choosing a story, a skill, a livelihood. That choice has weight. We take that seriously.
            </p>
            <div className="mission-tags reveal" style={{ transitionDelay: '300ms' }}>
              <span className="m-tag">Made in Kenya</span>
              <span className="m-tag">Ethically Sourced</span>
            </div>
          </div>
        </section>

        {/* SECTION 5 — PRODUCT SHOWCASE */}
        <section className="about-products">
          <div className="products-header">
            <span className="ph-left reveal">WHAT WE MAKE</span>
            <Link href="/shop" className="ph-right">Shop the collection →</Link>
          </div>
          <div className="products-scroll">
            {aboutCategoryCards.map((cat, i) => (
              <Link key={cat.name} href={buildShopHref(cat.name)} className="prod-card reveal-scale" style={{ transitionDelay: `${i * 60}ms` }}>
                <div className="prod-img-wrapper">
                  <Image src={cat.img} fill alt={cat.name} className="prod-img" />
                </div>
                <div className="prod-overlay" />
                <div className="prod-info">
                  <span className="pi-name">{cat.name}</span>
                  <span className="pi-count">COLLECTION</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* SECTION 6 — THE PROCESS */}
        <section className="about-process">
          <div className="process-header reveal">
            <h2 className="proc-h2">HOW IT IS MADE</h2>
            <p className="proc-sub">Every piece follows the same four steps — from raw material to your door.</p>
          </div>
          <div className="process-steps">
            <div className="process-line" />
            <div className="step-card reveal" style={{ transitionDelay: '0ms' }}>
              <div className="step-num">01</div>
              <h3 className="step-title">SOURCING</h3>
              <p className="step-desc">We source seed beads and materials from the Maasai Market in Nairobi every week.</p>
            </div>
            <div className="step-card reveal" style={{ transitionDelay: '100ms' }}>
              <div className="step-num">02</div>
              <h3 className="step-title">CRAFTING</h3>
              <p className="step-desc">Every bead is threaded by hand. Each piece takes between 2 and 8 hours to complete.</p>
            </div>
            <div className="step-card reveal" style={{ transitionDelay: '200ms' }}>
              <div className="step-num">03</div>
              <h3 className="step-title">QUALITY CHECK</h3>
              <p className="step-desc">Every finished piece is checked before leaving the studio. No piece ships with a fault.</p>
            </div>
            <div className="step-card reveal" style={{ transitionDelay: '300ms' }}>
              <div className="step-num">04</div>
              <h3 className="step-title">DELIVERY</h3>
              <p className="step-desc">Pieces are packed carefully and delivered directly to you within 2-3 business days.</p>
            </div>
          </div>
        </section>

        {/* SECTION 7 — THE FACES */}
        <section className="about-faces">
          <div className="faces-header reveal">
            <h2 className="faces-eyebrow">THE PEOPLE</h2>
            <p className="faces-h2">Behind every piece.</p>
          </div>
          
          <div className="founder-feature">
            <div className="founder-left reveal-left">
              {loading ? (
                <div className="founder-fallback" />
              ) : (
                <Image src={founder?.image_url || '/media/site/placeholder.svg'} fill className="founder-img" alt={founder?.name || 'Founder'} />
              )}
              <div className="founder-border" />
            </div>
            <div className="founder-right reveal-right">
              <span className="founder-eyebrow">CEO & Founder</span>
              <h3 className="founder-name">{loading ? 'Loading...' : founder?.name || 'Kelvin Mark'}</h3>
              <p className="founder-bio">
                {loading ? '...' : founder?.bio || 'SharonCraft was founded in 2024 by Kelvin Mark — a Nairobi-based entrepreneur with a vision to give Kenyan handcraft the world-class platform it deserves.'}
              </p>
              <div className="founder-quote">
                "I create not just jewelry, but stories of our people."
              </div>
              <Link href="/artisans" className="founder-link">See their pieces →</Link>
            </div>
          </div>

          <div className="artisan-minis reveal">
            {loading ? (
              [1,2,3].map(i => <div key={i} className="mini-card-skeleton" />)
            ) : artisans.length > 0 ? (
              artisans.map(artisan => (
                <Link key={artisan.id} href="/artisans" className="mini-card">
                  <div className="mini-img-wrapper">
                    <Image src={artisan.image_url || '/media/site/placeholder.svg'} fill className="mini-img" alt={artisan.name} />
                  </div>
                  <div className="mini-info">
                    <span className="mini-name">{artisan.name}</span>
                    <span className="mini-spec">{artisan.craft || 'Artisan'}</span>
                  </div>
                  <span className="mini-arrow">→</span>
                </Link>
              ))
            ) : (
              <div className="mini-empty">No artisans found.</div>
            )}
          </div>
          <div className="all-artisans-link">
            <Link href="/artisans">Meet all artisans →</Link>
          </div>
        </section>

        {/* SECTION 8 — THE COMMITMENT */}
        <section className="about-commitment">
          <div className="commit-header reveal">
            <h2 className="commit-eyebrow">WHAT WE STAND FOR</h2>
            <p className="commit-sub">The things that are not negotiable at SharonCraft.</p>
          </div>
          <div className="commit-grid">
            {[
              { num: '01', title: 'Fair Pay Always', desc: 'Every artisan is paid fairly for their skill and their time. We do not negotiate this downward for the sake of margin.' },
              { num: '02', title: 'No Fast Fashion', desc: 'We do not mass produce. We do not use factories. Every piece is made by a real person one at a time.' },
              { num: '03', title: 'Kenyan Heritage', desc: 'Every technique is rooted in Kenyan craft tradition. We preserve it by practicing it and by paying for it.' },
              { num: '04', title: 'Transparent Pricing', desc: 'You know what you are paying for. Materials, craft, delivery. No inflated markups. No hidden costs.' },
              { num: '05', title: 'Genuine Quality', desc: 'We reject any piece that does not meet our standard. Better no sale than a disappointed customer.' },
              { num: '06', title: 'Real Relationships', desc: 'Every customer is a person, not a transaction. Every order is handled directly by Sharon and the team. We are not a faceless platform.' }
            ].map((c, i) => (
              <div key={c.num} className="commit-card reveal-scale" style={{ transitionDelay: `${i * 80}ms` }}>
                <span className="commit-num">{c.num}</span>
                <h3 className="commit-title">{c.title}</h3>
                <p className="commit-desc">{c.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 9 — PRESS AND TRUST */}
        <section className="about-press">
          <h2 className="press-eyebrow reveal">AS SEEN IN</h2>
          <div className="press-row reveal" style={{ transitionDelay: '80ms' }}>
            <span className="press-item">Nairobi Fashion Week</span>
            <div className="press-sep" />
            <span className="press-item">Kenya Craft Council</span>
            <div className="press-sep" />
            <span className="press-item">Made in Africa</span>
            <div className="press-sep" />
            <span className="press-item">Artisan Collective</span>
            <div className="press-sep" />
            <span className="press-item">Kenya Tourism Board</span>
          </div>
          <div className="press-quote reveal" style={{ transitionDelay: '160ms' }}>
            <span className="quote-mark">"</span>
            <p className="quote-text">
              A brand that represents the best of what Kenyan craft can be when given the right platform.
            </p>
            <p className="quote-source">VOGUE AFRICA FEATURE</p>
          </div>
        </section>

        {/* SECTION 10 — FINAL CTA */}
        <section className="about-cta">
          <div className="cta-eyebrow reveal">
            <div className="cta-line" />
            <span>READY TO SHOP</span>
            <div className="cta-line" />
          </div>
          <h2 className="cta-h2 reveal-slow" style={{ transitionDelay: '80ms' }}>Discover the collection.</h2>
          <p className="cta-sub reveal" style={{ transitionDelay: '160ms' }}>
            Every piece handmade in Nairobi. Ready to order. Delivered to you.
          </p>
          <div className="cta-buttons reveal" style={{ transitionDelay: '240ms' }}>
            <Link href="/shop" className="btn-primary">SHOP THE COLLECTION →</Link>
            <Link href="/custom-order" className="btn-secondary">CUSTOM ORDER</Link>
          </div>
          <div className="cta-trust reveal" style={{ transitionDelay: '320ms' }}>
            <div className="trust-badge"><span className="dot" />Free delivery in Nairobi</div>
            <div className="trust-badge"><span className="dot" />Made to order</div>
            <div className="trust-badge"><span className="dot" />WhatsApp support</div>
          </div>
        </section>
      </main>

      <Footer />

      <style jsx global>{`
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

        .about-redesign {
          width: 100%;
          overflow-x: hidden;
          font-family: var(--font-sans), sans-serif;
        }

        .progress-bar {
          position: fixed;
          top: 0;
          left: 0;
          height: 2px;
          background: var(--brown);
          z-index: 1001;
          pointer-events: none;
          transition: width 0.1s linear;
        }

        .reveal { opacity: 0; transform: translateY(24px); transition: opacity 0.65s ease, transform 0.65s ease; }
        .reveal.visible { opacity: 1; transform: translateY(0); }
        .reveal-left { opacity: 0; transform: translateX(-32px); transition: opacity 0.7s ease, transform 0.7s ease; }
        .reveal-left.visible { opacity: 1; transform: translateX(0); }
        .reveal-right { opacity: 0; transform: translateX(32px); transition: opacity 0.7s ease, transform 0.7s ease; }
        .reveal-right.visible { opacity: 1; transform: translateX(0); }
        .reveal-slow { opacity: 0; transform: translateY(16px); transition: opacity 1s ease, transform 1s ease; }
        .reveal-slow.visible { opacity: 1; transform: translateY(0); }
        .reveal-scale { opacity: 0; transform: scale(0.97); transition: opacity 0.6s ease, transform 0.6s ease; }
        .reveal-scale.visible { opacity: 1; transform: scale(1); }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes lineGrow {
          from { width: 0; opacity: 0; }
          to { width: 32px; opacity: 1; }
        }
        @keyframes scrollDown {
          0% { top: -100%; }
          100% { top: 100%; }
        }

        /* SECTION 1 — HERO */
        .about-hero {
          display: grid;
          grid-template-columns: 45% 55%;
          height: 100vh;
          min-height: 700px;
          position: relative;
          overflow: visible; /* Allow copy block overlap */
          background: #faf9f6;
        }
        .hero-left {
          position: relative;
          width: 100%;
          background: #faf9f6;
          display: flex;
          align-items: center;
          padding-left: 8%;
          padding-right: 0;
          box-sizing: border-box;
          z-index: 5;
        }
        .hero-content {
          position: relative;
          max-width: 520px;
          width: 115%; /* Overlap into the media column */
          z-index: 10;
        }
        .hero-line {
          width: 32px;
          height: 0.5px;
          background: var(--brown);
          margin-bottom: 24px;
          animation: lineGrow 0.8s ease 0.2s both;
        }
        .hero-eyebrow {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: var(--brown);
          display: block;
          margin-bottom: 18px;
          animation: fadeUp 0.6s 0.3s both;
        }
        .hero-h1-1 {
          font-family: var(--font-serif), 'Playfair Display', Georgia, serif;
          font-size: clamp(38px, 4.2vw, 56px);
          font-weight: 400;
          color: var(--dark);
          line-height: 1.1;
          letter-spacing: -0.5px;
          display: block;
          animation: fadeUp 0.7s 0.4s both;
        }
        .hero-h1-2 {
          font-family: var(--font-display), 'Cormorant Garamond', Georgia, serif;
          font-size: clamp(38px, 4.2vw, 56px);
          font-weight: 300;
          font-style: italic;
          color: var(--brown);
          line-height: 1.1;
          letter-spacing: -0.5px;
          display: block;
          margin-bottom: 24px;
          animation: fadeUp 0.7s 0.5s both;
        }
        .hero-desc {
          font-size: 15px;
          line-height: 1.8;
          color: #5c554e;
          max-width: 440px;
          margin-bottom: 36px;
          animation: fadeUp 0.7s 0.6s both;
        }
        .hero-facts {
          display: flex;
          gap: 40px;
          margin-bottom: 36px;
          animation: fadeUp 0.6s 0.7s both;
        }
        .fact-box {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .fact-num {
          font-family: var(--font-serif), 'Playfair Display', Georgia, serif;
          font-size: 22px;
          font-weight: 300;
          color: var(--brown);
        }
        .fact-label {
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: #777;
        }
        .hero-cta {
          animation: fadeUp 0.6s 0.8s both;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 3.5px;
          text-transform: uppercase;
          color: var(--dark);
          border-bottom: 1px solid rgba(28, 28, 28, 0.15);
          padding-bottom: 4px;
          cursor: pointer;
          display: inline-block;
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .hero-cta:hover {
          color: var(--brown);
          border-color: var(--brown);
          transform: translateY(-1px);
        }
        .hero-scroll-indicator {
          position: absolute;
          bottom: 40px;
          right: 48px;
          z-index: 2;
          animation: fadeUp 0.5s 1.2s both;
        }
        .hero-scroll-line {
          width: 1px;
          height: 48px;
          background: rgba(28, 28, 28, 0.15);
          position: relative;
          overflow: hidden;
          margin: 0 auto;
        }
        .hero-scroll-line::after {
          content: "";
          position: absolute;
          top: -100%;
          width: 100%;
          height: 100%;
          background: var(--brown);
          animation: scrollDown 1.8s ease 1.5s infinite;
        }
        .hero-scroll-text {
          font-size: 8px;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: #999;
          writing-mode: vertical-rl;
          margin-top: 8px;
        }
        .hero-right {
          position: relative;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #faf9f6;
          padding: 64px 80px 64px 48px;
          box-sizing: border-box;
        }
        .hero-media-frame {
          position: relative;
          width: 100%;
          height: 100%;
          aspect-ratio: 4/5;
          max-height: 72vh;
          overflow: hidden;
          border-radius: 4px;
          border: 1px solid rgba(139, 94, 60, 0.08);
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.04);
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Frame Corner Accents */
        .hero-media-frame__corner {
          position: absolute;
          width: 0;
          height: 0;
          border: 0.5px solid rgba(139, 94, 60, 0.2);
          pointer-events: none;
          z-index: 5;
          animation: drawHeroCorners 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          animation-delay: 0.5s;
        }
        .hero-media-frame__corner--top-left {
          top: 16px;
          left: 16px;
          border-right: none;
          border-bottom: none;
        }
        .hero-media-frame__corner--top-right {
          top: 16px;
          right: 16px;
          border-left: none;
          border-bottom: none;
        }
        .hero-media-frame__corner--bottom-left {
          bottom: 16px;
          left: 16px;
          border-right: none;
          border-top: none;
        }
        .hero-media-frame__corner--bottom-right {
          bottom: 16px;
          right: 16px;
          border-left: none;
          border-top: none;
        }

        @keyframes drawHeroCorners {
          to {
            width: 16px;
            height: 16px;
          }
        }
        @keyframes kenBurnsZoom {
          0% { transform: scale(1.08); }
          100% { transform: scale(1); }
        }

        .hero-media {
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }
        .hero-image-wrapper {
          position: relative;
          width: 100%;
          height: 100%;
          animation: kenBurnsZoom 2.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .hero-img {
          object-fit: cover;
          object-position: center top;
          transition: transform 1.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .hero-media:hover .hero-img {
          transform: scale(1.03);
        }
        .hero-fallback {
          width: 100%;
          height: 100%;
          background: linear-gradient(145deg, #f5ebe6 0%, #ecdcd4 60%, #dfc3b5 100%);
        }

        /* SECTION 2 — ORIGIN STORY */
        .about-origin {
          background: var(--cream);
          padding: 0;
          min-height: 600px;
          display: grid;
          grid-template-columns: 1fr 1fr;
        }
        .origin-left {
          padding: 96px 72px 96px 80px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .chapter-label {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 28px;
        }
        .chapter-line {
          width: 24px;
          height: 1px;
          background: var(--brown);
        }
        .chapter-label span {
          font-size: 9px;
          letter-spacing: 4px;
          text-transform: uppercase;
          color: var(--brown);
        }
        .origin-h2 {
          font-size: 36px;
          font-weight: 300;
          line-height: 1.15;
          letter-spacing: -0.3px;
          margin-bottom: 28px;
        }
        .origin-h2-1 { color: var(--dark); display: block; }
        .origin-h2-2 { color: #888; font-style: italic; display: block; }
        .origin-text p {
          font-size: 14px;
          color: var(--text);
          line-height: 1.95;
          letter-spacing: 0.2px;
          margin-bottom: 18px;
          max-width: 480px;
        }
        .origin-badge {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          margin-top: 8px;
          font-size: 10px;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: var(--muted);
          padding: 8px 0;
          border-top: 0.5px solid var(--border);
          width: fit-content;
        }
        .origin-right {
          position: relative;
          overflow: hidden;
          background: var(--card-bg);
          min-height: 600px;
        }
        .parallax-wrapper {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 120%;
          top: -10%;
        }
        .parallax-img {
          object-fit: cover;
          object-position: center top;
        }
        .origin-fallback {
          width: 100%;
          height: 100%;
          background: linear-gradient(145deg, var(--card-bg) 0%, #E8E0D4 60%, #C8A882 100%);
          position: relative;
        }
        .bead-dot {
          position: absolute;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--brown);
          opacity: 0.2;
        }

        /* SECTION 3 — THE NUMBERS */
        .about-numbers {
          background: var(--dark);
          padding: 80px;
        }
        .numbers-header {
          text-align: center;
          margin-bottom: 64px;
          font-size: 9px;
          letter-spacing: 6px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.2);
        }
        .numbers-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0;
        }
        .num-card {
          padding: 0 40px;
          border-right: 0.5px solid rgba(255,255,255,0.06);
          text-align: center;
        }
        .num-card:last-child {
          border-right: none;
        }
        .num-val {
          font-size: 56px;
          font-weight: 300;
          color: rgba(255,255,255,0.85);
          display: block;
          letter-spacing: -2px;
          margin-bottom: 8px;
        }
        .num-label {
          font-size: 10px;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.25);
        }

        /* SECTION 4 — THE MISSION */
        .about-mission {
          background: var(--cream);
          padding: 120px 80px;
        }
        .mission-wrapper {
          max-width: 900px;
          margin: 0 auto;
          text-align: center;
        }
        .mission-eyebrow {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          margin-bottom: 32px;
        }
        .mission-line {
          width: 24px;
          height: 1px;
          background: var(--brown);
        }
        .mission-eyebrow span {
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 5px;
          color: var(--brown);
        }
        .mission-h2 {
          font-size: clamp(24px, 3.5vw, 42px);
          font-weight: 300;
          color: var(--dark);
          line-height: 1.5;
          letter-spacing: -0.3px;
          margin-bottom: 40px;
        }
        .m-highlight { color: var(--brown); }
        .m-italic { font-style: italic; }
        .mission-sub {
          font-size: 14px;
          color: #888;
          line-height: 1.85;
          max-width: 560px;
          margin: 0 auto;
        }
        .mission-tags {
          display: flex;
          justify-content: center;
          gap: 12px;
          margin-top: 36px;
        }
        .m-tag {
          font-size: 10px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #888;
          border: 0.5px solid rgba(0,0,0,0.12);
          padding: 8px 18px;
          border-radius: 2px;
        }

        /* SECTION 5 — PRODUCT SHOWCASE */
        .about-products {
          background: #ffffff;
          padding: 80px 0;
          border-top: 0.5px solid var(--border);
        }
        .products-header {
          padding: 0 80px;
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 40px;
        }
        .ph-left {
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 5px;
          color: var(--muted);
        }
        .ph-right {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: #999;
          border-bottom: 1px solid #e0e0e0;
          cursor: pointer;
          text-decoration: none;
          transition: color 0.2s;
        }
        .ph-right:hover {
          color: var(--dark);
        }
        .products-scroll {
          display: flex;
          gap: 2px;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .products-scroll::-webkit-scrollbar {
          display: none;
        }
        .prod-card {
          width: 240px;
          flex-shrink: 0;
          height: 320px;
          position: relative;
          overflow: hidden;
          scroll-snap-align: start;
          cursor: pointer;
          display: block;
        }
        .prod-img-wrapper {
          position: absolute;
          inset: 0;
          transition: transform 0.65s ease;
        }
        .prod-img {
          object-fit: cover;
        }
        .prod-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.78) 0%, transparent 55%);
          pointer-events: none;
          opacity: 0.8;
          transition: opacity 0.4s ease;
        }
        .prod-card:hover .prod-img-wrapper {
          transform: scale(1.06);
        }
        .prod-card:hover .prod-overlay {
          opacity: 1;
        }
        .prod-info {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 18px 20px 22px;
          z-index: 2;
          pointer-events: none;
          display: flex;
          flex-direction: column;
        }
        .pi-name {
          font-size: 16px;
          font-weight: 300;
          color: white;
          margin-bottom: 4px;
        }
        .pi-count {
          font-size: 9px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.4);
        }

        /* SECTION 6 — THE PROCESS */
        .about-process {
          background: var(--card-bg);
          padding: 96px 80px;
        }
        .process-header {
          margin-bottom: 64px;
        }
        .proc-h2 {
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 5px;
          color: var(--muted);
          margin-bottom: 12px;
        }
        .proc-sub {
          font-size: 14px;
          color: #888;
          line-height: 1.7;
        }
        .process-steps {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0;
          position: relative;
        }
        .process-line {
          position: absolute;
          top: 20px;
          left: 12%;
          right: 12%;
          height: 0.5px;
          background: linear-gradient(to right, transparent 0%, rgba(0,0,0,0.1) 15%, rgba(0,0,0,0.1) 85%, transparent 100%);
          pointer-events: none;
          z-index: 0;
        }
        .step-card {
          padding: 0 32px;
          text-align: center;
          position: relative;
          z-index: 1;
        }
        .step-num {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #ffffff;
          border: 0.5px solid rgba(0,0,0,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          font-size: 14px;
          font-weight: 300;
          color: var(--dark);
        }
        .step-title {
          font-size: 13px;
          font-weight: 500;
          color: var(--dark);
          margin-bottom: 10px;
        }
        .step-desc {
          font-size: 12px;
          color: #888;
          line-height: 1.7;
          max-width: 180px;
          margin: 0 auto;
        }

        /* SECTION 7 — THE FACES */
        .about-faces {
          background: var(--dark);
          padding: 96px 80px;
        }
        .faces-header {
          text-align: center;
          margin-bottom: 64px;
        }
        .faces-eyebrow {
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 6px;
          color: rgba(255,255,255,0.2);
          margin-bottom: 12px;
        }
        .faces-h2 {
          font-size: 32px;
          font-weight: 300;
          color: rgba(255,255,255,0.7);
          letter-spacing: -0.3px;
        }
        .founder-feature {
          display: grid;
          grid-template-columns: 400px 1fr;
          gap: 64px;
          align-items: center;
          margin-bottom: 64px;
          padding-bottom: 64px;
          border-bottom: 0.5px solid rgba(255,255,255,0.06);
        }
        .founder-left {
          width: 400px;
          height: 500px;
          position: relative;
          overflow: hidden;
        }
        .founder-img {
          object-fit: cover;
          object-position: center top;
        }
        .founder-fallback {
          width: 100%;
          height: 100%;
          background: linear-gradient(145deg, #1a0e08, var(--dark-brown));
        }
        .founder-border {
          position: absolute;
          inset: 0;
          border: 1px solid rgba(255,255,255,0.04);
          pointer-events: none;
        }
        .founder-eyebrow {
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 5px;
          color: var(--brown);
          display: block;
          margin-bottom: 16px;
        }
        .founder-name {
          font-size: 36px;
          font-weight: 300;
          color: rgba(255,255,255,0.85);
          letter-spacing: -0.3px;
          margin-bottom: 20px;
        }
        .founder-bio {
          font-size: 14px;
          color: rgba(255,255,255,0.35);
          line-height: 1.9;
          max-width: 460px;
          margin-bottom: 28px;
        }
        .founder-quote {
          font-style: italic;
          font-size: 18px;
          font-weight: 300;
          color: rgba(255,255,255,0.55);
          line-height: 1.6;
          border-left: 2px solid var(--brown);
          padding-left: 20px;
          margin-bottom: 28px;
        }
        .founder-link {
          font-size: 10px;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.3);
          border-bottom: 1px solid rgba(255,255,255,0.15);
          padding-bottom: 2px;
          cursor: pointer;
          text-decoration: none;
          transition: color 0.2s;
        }
        .founder-link:hover {
          color: rgba(255,255,255,0.7);
        }
        .artisan-minis {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2px;
        }
        .mini-card {
          background: #111;
          padding: 28px 24px;
          display: flex;
          align-items: center;
          gap: 16px;
          cursor: pointer;
          transition: background 0.2s;
          text-decoration: none;
        }
        .mini-card:hover {
          background: #161616;
        }
        .mini-card:hover .mini-arrow {
          color: rgba(255,255,255,0.4);
        }
        .mini-card-skeleton {
          background: #111;
          height: 108px;
        }
        .mini-img-wrapper {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          position: relative;
          overflow: hidden;
          flex-shrink: 0;
          background: #1a0e08;
        }
        .mini-img {
          object-fit: cover;
          object-position: center top;
        }
        .mini-info {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }
        .mini-name {
          font-size: 12px;
          font-weight: 400;
          color: rgba(255,255,255,0.7);
        }
        .mini-spec {
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: rgba(255,255,255,0.25);
        }
        .mini-arrow {
          margin-left: auto;
          font-size: 14px;
          color: rgba(255,255,255,0.1);
          transition: color 0.2s;
        }
        .mini-empty {
          color: rgba(255,255,255,0.3);
          font-size: 12px;
          grid-column: span 3;
          text-align: center;
          padding: 24px;
        }
        .all-artisans-link {
          text-align: center;
          margin-top: 24px;
        }
        .all-artisans-link a {
          font-size: 10px;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.2);
          cursor: pointer;
          text-decoration: none;
          transition: color 0.2s;
        }
        .all-artisans-link a:hover {
          color: rgba(255,255,255,0.5);
        }

        /* SECTION 8 — THE COMMITMENT */
        .about-commitment {
          background: var(--cream);
          padding: 96px 80px;
          border-top: 0.5px solid var(--border);
        }
        .commit-header {
          text-align: center;
          max-width: 600px;
          margin: 0 auto 64px;
        }
        .commit-eyebrow {
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 5px;
          color: var(--muted);
          margin-bottom: 12px;
        }
        .commit-sub {
          font-size: 14px;
          color: #888;
        }
        .commit-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2px;
        }
        .commit-card {
          background: #ffffff;
          padding: 40px 36px;
          transition: background 0.2s ease;
        }
        .commit-card:hover {
          background: var(--cream);
        }
        .commit-num {
          font-size: 48px;
          font-weight: 300;
          color: rgba(0,0,0,0.05);
          display: block;
          margin-bottom: 16px;
          letter-spacing: -2px;
        }
        .commit-title {
          font-size: 14px;
          font-weight: 500;
          color: var(--dark);
          margin-bottom: 12px;
        }
        .commit-desc {
          font-size: 12px;
          color: #888;
          line-height: 1.75;
        }

        /* SECTION 9 — PRESS AND TRUST */
        .about-press {
          background: var(--black);
          padding: 64px 80px;
          border-top: 0.5px solid rgba(255,255,255,0.04);
        }
        .press-eyebrow {
          text-align: center;
          margin-bottom: 48px;
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 5px;
          color: rgba(255,255,255,0.15);
        }
        .press-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 48px;
          flex-wrap: wrap;
        }
        .press-item {
          font-size: 13px;
          font-weight: 300;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.15);
          cursor: default;
          transition: color 0.2s;
          white-space: nowrap;
        }
        .press-item:hover {
          color: rgba(255,255,255,0.3);
        }
        .press-sep {
          width: 1px;
          height: 16px;
          background: rgba(255,255,255,0.06);
          align-self: center;
        }
        .press-quote {
          max-width: 600px;
          margin: 48px auto 0;
          text-align: center;
        }
        .quote-mark {
          font-size: 48px;
          line-height: 0;
          color: rgba(255,255,255,0.06);
          display: block;
          margin-bottom: 16px;
        }
        .quote-text {
          font-size: 17px;
          font-weight: 300;
          font-style: italic;
          color: rgba(255,255,255,0.35);
          line-height: 1.7;
        }
        .quote-source {
          margin-top: 16px;
          font-size: 10px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.15);
        }

        /* SECTION 10 — FINAL CTA */
        .about-cta {
          background: var(--cream);
          padding: 120px 80px;
          text-align: center;
          border-top: 0.5px solid var(--border);
        }
        .cta-eyebrow {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          margin-bottom: 24px;
        }
        .cta-line {
          width: 24px;
          height: 1px;
          background: var(--brown);
        }
        .cta-eyebrow span {
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 5px;
          color: var(--brown);
        }
        .cta-h2 {
          font-size: clamp(32px, 4vw, 52px);
          font-weight: 300;
          color: var(--dark);
          letter-spacing: -0.5px;
          margin-bottom: 16px;
        }
        .cta-sub {
          font-size: 14px;
          color: #888;
          line-height: 1.7;
          max-width: 400px;
          margin: 0 auto 48px;
        }
        .cta-buttons {
          display: flex;
          justify-content: center;
          gap: 14px;
        }
        .btn-primary, .btn-secondary {
          height: 56px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          letter-spacing: 4px;
          text-transform: uppercase;
          border-radius: 2px;
          text-decoration: none;
          transition: all 0.25s;
        }
        .btn-primary {
          padding: 0 44px;
          background: var(--dark);
          color: white;
        }
        .btn-primary:hover {
          background: var(--brown);
        }
        .btn-secondary {
          padding: 0 32px;
          background: transparent;
          border: 0.5px solid var(--dark);
          color: var(--dark);
        }
        .btn-secondary:hover {
          background: rgba(0,0,0,0.04);
        }
        .cta-trust {
          display: flex;
          justify-content: center;
          gap: 32px;
          margin-top: 32px;
        }
        .trust-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 10px;
          color: var(--muted);
          letter-spacing: 1px;
        }
        .dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: var(--muted);
        }

        /* RESPONSIVE DESIGN */
        @media (max-width: 1280px) {
          .founder-feature {
            grid-template-columns: 320px 1fr;
            gap: 48px;
          }
        }
        
        @media (max-width: 768px) {
          .about-hero {
            grid-template-columns: 1fr;
            height: auto;
            min-height: auto;
            margin-top: 52px; /* Push hero below mobile nav */
            display: flex;
            flex-direction: column;
            background: #faf9f6 !important;
            overflow: visible !important;
          }
          .hero-left {
            width: 100%;
            padding: 36px 24px 56px 24px;
            background: #faf9f6;
            order: 2;
            display: block;
          }
          .hero-right {
            display: block;
            position: relative;
            width: 100vw;
            order: 1;
            padding: 0 !important;
            background: #faf9f6;
          }
          .hero-media-frame {
            aspect-ratio: 4/5;
            height: auto;
            max-height: 52vh;
            border-radius: 0px !important;
            border: none !important;
            box-shadow: none !important;
            width: 100vw;
          }
          .hero-media {
            border-radius: 0 !important;
          }
          .hero-content {
            position: relative;
            bottom: auto;
            left: auto;
            max-width: 100%;
            width: 100% !important;
            margin: 0 !important;
          }
          .hero-line {
            display: none !important;
          }
          .hero-scroll-indicator {
            display: none !important;
          }
          .hero-eyebrow {
            font-size: 8px;
            letter-spacing: 4px;
            color: #8b5e3c;
            margin-bottom: 12px;
          }
          .hero-h1-1, .hero-h1-2 {
            font-size: clamp(32px, 8vw, 44px);
            line-height: 1.1;
          }
          .hero-desc {
            max-width: 100%;
            font-size: 14.5px;
            line-height: 1.75;
            margin-bottom: 28px;
          }
          .hero-facts {
            margin-bottom: 28px;
            gap: 24px;
          }
          .fact-num {
            font-size: 18px;
          }
          .about-origin { grid-template-columns: 1fr; }
          .origin-left { padding: 64px 32px; }
          .origin-right { min-height: 400px; }
          .numbers-grid { grid-template-columns: 1fr 1fr; }
          .num-card { padding: 32px 20px; border-bottom: 0.5px solid rgba(255,255,255,0.06); }
          .num-card:nth-child(2) { border-right: none; }
          .about-mission { padding: 80px 32px; }
          .process-steps { grid-template-columns: 1fr; gap: 40px; }
          .process-line { width: 1px; height: 100%; top: 0; left: 50%; background: linear-gradient(to bottom, transparent, rgba(0,0,0,0.1) 15%, rgba(0,0,0,0.1) 85%, transparent); }
          .founder-feature { grid-template-columns: 1fr; }
          .founder-left { width: 100%; height: 400px; }
          .artisan-minis { grid-template-columns: 1fr; }
          .commit-grid { grid-template-columns: 1fr; }
          .cta-buttons { flex-direction: column; }
          .cta-trust { flex-direction: column; gap: 16px; align-items: center; }
          .press-row { gap: 24px; flex-direction: column; }
          .press-sep { width: 32px; height: 1px; }
          .about-process, .about-faces, .about-commitment, .about-press, .about-cta { padding: 64px 32px; }
        }

        /* REDUCED MOTION */
        @media (prefers-reduced-motion: reduce) {
          *, ::before, ::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>
    </>
  )
}
