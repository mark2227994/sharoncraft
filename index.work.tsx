'use client'

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// SHARONCRAFT HOMEPAGE
// pages/index.tsx
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'
import {
  type CSSProperties,
  type FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import Footer from '../components/Footer'

interface Product {
  id: string
  name: string
  slug?: string | null
  description?: string | null
  price: number
  sale_price?: number | null
  images: string[]
  artisan?: string | null
  is_visible?: boolean
  is_featured?: boolean
  created_at?: string | null
}

interface Category {
  id: string
  name: string
  subcategories: string[]
  image_url?: string | null
  is_visible?: boolean
  display_order?: number | null
}

interface HeroSlide {
  image_url?: string | null
  headline?: string | null
  subtitle?: string | null
  description?: string | null
  button_text?: string | null
  button_link?: string | null
}

interface ArtisanContent {
  image_url?: string | null
  quote?: string | null
  author?: string | null
  link_text?: string | null
  link_href?: string | null
}

interface CategoryBlueprint {
  key: string
  title: string
  href: string
  aliases: string[]
  subcategories: string[]
  gradient: string
  cardClass: string
  mobileHeight: string
}

interface HomePageProps {
  initialProducts: Product[]
  initialCategories: Partial<Category>[]
  initialHeroSlide: HeroSlide | null
  initialArtisanData: ArtisanContent | null
}

const PAGE_TOKENS = {
  background: '#fafaf8',
  dark: '#1c1c1c',
  black: '#080808',
  brown: '#8B5E3C',
  darkBrown: '#3D1F0D',
  card: '#F5F0EB',
  border: 'rgba(0,0,0,0.08)',
  text: '#1c1c1c',
  secondary: '#888',
  muted: '#bbb',
}

const TRUST_ITEMS = [
  'Nairobi Fashion Week',
  'Kenya Craft Council',
  'Made in Africa',
  'Artisan Collective',
  'Kenya Tourism Board',
]

const STATS = [
  { value: '500+', label: 'Handmade Pieces' },
  { value: '5-10', label: 'Day Delivery' },
  { value: '100%', label: 'Authentic' },
  { value: 'Made', label: 'To Order' },
]

const HERO_STATS = [
  { value: '14+', label: 'Pieces' },
  { value: '5', label: 'Artisans' },
  { value: '100%', label: 'Handmade' },
]

const CATEGORY_BLUEPRINTS: CategoryBlueprint[] = [
  {
    key: 'jewellery',
    title: 'Jewellery',
    href: '/shop?category=Jewellery',
    aliases: ['jewellery', 'jewelry'],
    subcategories: ['Necklaces', 'Earrings', 'Bracelets'],
    gradient: 'linear-gradient(160deg, #C0392B, #5D1F0D)',
    cardClass: 'md:col-[1] md:row-[1/3]',
    mobileHeight: '72vw',
  },
  {
    key: 'accessories',
    title: 'Accessories',
    href: '/shop?category=Accessories',
    aliases: ['accessories'],
    subcategories: ['Bags', 'Belts', 'Key Holders'],
    gradient: 'linear-gradient(160deg, #2C1810, #8B5E3C)',
    cardClass: 'md:col-[2] md:row-[1]',
    mobileHeight: '56vw',
  },
  {
    key: 'african-wear',
    title: 'African Wear',
    href: '/shop?category=African%20Wear',
    aliases: ['african wear', 'bridal & occasion', 'bridal and occasion'],
    subcategories: ['Wraps', 'Tops', 'Occasion'],
    gradient: 'linear-gradient(160deg, #0e0e0e, #3D1F0D)',
    cardClass: 'md:col-[3] md:row-[1]',
    mobileHeight: '64vw',
  },
  {
    key: 'home-living',
    title: 'Home & Living',
    href: '/shop?category=Home%20%26%20Living',
    aliases: ['home & living', 'home and living', 'home decor', 'home decor & living'],
    subcategories: ['Baskets', 'Decor', 'Kitchen'],
    gradient: 'linear-gradient(160deg, #8B5E3C, #3D1F0D)',
    cardClass: 'md:col-[2/4] md:row-[2]',
    mobileHeight: '52vw',
  },
]

const FALLBACK_HERO: HeroSlide = {
  image_url: '/media/products/Gemini_Generated_Image_p3e0hup3e0hup3e0.jpg',
  headline: 'Handmade',
  subtitle: 'in Kenya',
  description: 'Beaded jewelry crafted by Nairobi artisans',
  button_text: 'SHOP THE COLLECTION',
  button_link: '/shop',
}

const FALLBACK_ARTISAN: ArtisanContent = {
  image_url: '/media/site/artisans/Gemini_Generated_Image_35m6ig35m6ig35m6.png',
  quote:
    'Every bead is placed with intention. This is not a product â€” it is a piece of Kenya.',
  author: 'Sharon Â· Lead Designer, Nairobi',
  link_text: 'MEET OUR MAKERS â†’',
  link_href: '/artisans',
}

const useParallax = (speed = 0.3) => {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    const el = ref.current
    if (!el) return undefined

    const isMobile = window.innerWidth < 768
    if (isMobile) {
      el.style.transform = 'translateY(0px)'
      return undefined
    }

    let ticking = false

    const handleScroll = () => {
      if (ticking) return
      ticking = true

      window.requestAnimationFrame(() => {
        const node = ref.current
        if (!node) {
          ticking = false
          return
        }

        const rect = node.getBoundingClientRect()
        const visibleOffset = window.innerHeight - rect.top
        const rate = Math.max(Math.min(visibleOffset * speed * 0.16, 64), -64)
        node.style.transform = `translateY(${rate}px)`
        ticking = false
      })
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [speed])

  return ref
}

const useHeroImageParallax = () => {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    let frameId = 0

    const update = () => {
      const node = ref.current
      if (!node) {
        frameId = 0
        return
      }

      if (window.innerWidth <= 768) {
        node.style.transform = 'translateY(0px)'
        frameId = 0
        return
      }

      node.style.transform = `translateY(${window.pageYOffset * 0.25}px)`
      frameId = 0
    }

    const onScroll = () => {
      if (frameId) return
      frameId = window.requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)

    return () => {
      if (frameId) window.cancelAnimationFrame(frameId)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return ref
}

const useScrollReveal = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed')
            entry.target.classList.add('visible')
            observer.unobserve(entry.target)
          }
        })
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px',
      },
    )

    const nodes = document.querySelectorAll('.reveal, .reveal-left, .reveal-right')
    nodes.forEach((node) => observer.observe(node))

    return () => observer.disconnect()
  }, [])
}

const compact = (value: unknown) => String(value || '').trim()

const slugify = (value: string) =>
  compact(value)
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

const normalizeImage = (value: unknown) => {
  const rawValue =
    typeof value === 'string'
      ? value
      : typeof value === 'object' && value !== null
        ? (
            (value as { src?: unknown; url?: unknown; image?: unknown }).src ??
            (value as { src?: unknown; url?: unknown; image?: unknown }).url ??
            (value as { src?: unknown; url?: unknown; image?: unknown }).image ??
            ''
          )
        : ''

  const source = compact(rawValue).replace(/\\/g, '/')
  if (!source) return ''
  if (/^(https?:|data:|blob:)/i.test(source)) return source
  if (source.startsWith('//')) return `https:${source}`
  const normalized = source.startsWith('/') ? source : `/${source.replace(/^public\//i, '')}`
  return normalized.replace(/\/{2,}/g, '/')
}

const formatKES = (value: number) => `KES ${Number(value || 0).toLocaleString('en-KE')}`

const normalizeProduct = (row: Partial<Product>): Product => {
  const images = Array.isArray(row.images)
    ? row.images.map((image) => normalizeImage(image)).filter(Boolean)
    : []

  return {
    id: compact(row.id) || `${compact(row.name)}-product`,
    name: compact(row.name) || 'SharonCraft Piece',
    slug: compact(row.slug) || slugify(compact(row.name) || 'piece'),
    description: compact(row.description) || null,
    price: Number(row.price || 0),
    sale_price: Number.isFinite(Number(row.sale_price)) && Number(row.sale_price) > 0
      ? Number(row.sale_price)
      : null,
    images,
    artisan: compact(row.artisan) || 'Sharon',
    is_visible: row.is_visible !== false,
    is_featured: Boolean(row.is_featured),
    created_at: compact(row.created_at) || null,
  }
}

const normalizeCategories = (rows: Partial<Category>[]) => {
  return CATEGORY_BLUEPRINTS.map((blueprint) => {
    const match =
      rows.find((row) => blueprint.aliases.includes(compact(row.name).toLowerCase())) || null

    return {
      ...blueprint,
      id: compact(match?.id) || blueprint.key,
      name: compact(match?.name) || blueprint.title,
      image_url: normalizeImage(match?.image_url),
      subcategories:
        Array.isArray(match?.subcategories) && match?.subcategories.length > 0
          ? match.subcategories.map((item) => compact(item)).filter(Boolean)
          : blueprint.subcategories,
      href:
        match?.name
          ? `/shop?category=${encodeURIComponent(compact(match.name))}`
          : blueprint.href,
    }
  })
}

const findCategoryForBlueprint = (
  rows: Partial<Category>[],
  blueprint: CategoryBlueprint,
) => {
  return (
    rows.find((row) => {
      const normalizedName = compact(row.name).toLowerCase()
      return blueprint.aliases.includes(normalizedName)
    }) || null
  )
}

const mergeCategoryData = (
  incoming: Partial<Category>[],
  fallback: Partial<Category>[],
) => {
  return CATEGORY_BLUEPRINTS.map((blueprint) => {
    const incomingMatch = findCategoryForBlueprint(incoming, blueprint)
    const fallbackMatch = findCategoryForBlueprint(fallback, blueprint)

    return {
      ...fallbackMatch,
      ...incomingMatch,
      id: compact(incomingMatch?.id) || compact(fallbackMatch?.id) || blueprint.key,
      name: compact(incomingMatch?.name) || compact(fallbackMatch?.name) || blueprint.title,
      image_url:
        normalizeImage(incomingMatch?.image_url) || normalizeImage(fallbackMatch?.image_url),
      subcategories:
        Array.isArray(incomingMatch?.subcategories) && incomingMatch.subcategories.length > 0
          ? incomingMatch.subcategories
          : Array.isArray(fallbackMatch?.subcategories) && fallbackMatch.subcategories.length > 0
            ? fallbackMatch.subcategories
            : blueprint.subcategories,
      is_visible: incomingMatch?.is_visible ?? fallbackMatch?.is_visible ?? true,
      display_order:
        incomingMatch?.display_order ?? fallbackMatch?.display_order ?? undefined,
    }
  })
}

function CategoryCard({
  category,
  index,
}: {
  category: ReturnType<typeof normalizeCategories>[number]
  index: number
}) {
  const parallaxRef = useParallax(0.15)
  const imageAlt = `${category.name} SharonCraft collection`
  const transitionDelay = `${index * 80}ms`

  return (
    <Link
      href={category.href}
      className={[
        'group reveal relative block overflow-hidden text-inherit no-underline',
        'h-full min-h-0',
        category.cardClass,
        'md:[&:first-child]:min-h-[523px]',
      ].join(' ')}
      style={
        {
          transitionDelay,
          height: category.key === 'jewellery' ? '100%' : undefined,
          minHeight: category.key === 'jewellery' ? '523px' : undefined,
        } as CSSProperties
      }
    >
      <div className="absolute inset-0 h-full w-full">
        <div
          ref={parallaxRef}
          className="absolute inset-x-0 -top-[8%] h-[116%] will-change-transform md:h-[118%]"
        >
          {category.image_url ? (
            <Image
              src={category.image_url}
              alt={imageAlt}
              fill
              sizes="(max-width:768px) 100vw, (max-width:1200px) 50vw, 33vw"
              className="object-cover object-top transition-transform duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full" style={{ background: category.gradient }} />
          )}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(to_top,rgba(8,8,8,0.75)_0%,rgba(8,8,8,0.1)_45%,transparent_65%)] transition-opacity duration-500 ease-out group-hover:opacity-90" />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] px-[22px] pb-6 pt-5">
        <span
          className={[
            'block text-white',
            category.key === 'jewellery' ? 'text-[22px]' : 'text-[18px]',
            'font-light leading-[1.2]',
          ].join(' ')}
        >
          {category.name}
        </span>
        <span className="mt-[3px] block text-[9px] uppercase tracking-[2.5px] text-white/40">
          {category.subcategories.join(' / ')}
        </span>
        <span className="mt-2 inline-block border-b border-transparent pb-[2px] text-[9px] uppercase tracking-[2px] text-white/0 transition-all duration-300 ease-out group-hover:border-white/30 group-hover:text-white/60">
          Explore â†’
        </span>
      </div>
    </Link>
  )
}

function ProductCard({
  product,
  index,
  hideOnDesktop,
}: {
  product: Product
  index: number
  hideOnDesktop?: boolean
}) {
  const parallaxRef = useParallax(0.08)
  const productUrl = product.slug ? `/product/${product.slug}` : '/shop'
  const primaryImage = normalizeImage(product.images[0]) || '/media/site/placeholder.svg'
  const secondaryImage = normalizeImage(product.images[1])
  const onSale =
    typeof product.sale_price === 'number' && product.sale_price > 0 && product.sale_price < product.price

  return (
    <article
      className={[
        'reveal group',
        hideOnDesktop ? 'md:hidden' : '',
      ].join(' ')}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      <Link href={productUrl} className="block text-inherit no-underline">
        <div className="relative aspect-[1/1.25] overflow-hidden bg-[#F5F0EB]">
          <div
            ref={parallaxRef}
            className="absolute inset-x-0 -top-[6%] h-[112%] will-change-transform"
          >
            <div className="relative h-full w-full p-4">
              <Image
                src={primaryImage}
                alt={product.name}
                fill
                sizes="(max-width:768px) 50vw, (max-width:1280px) 33vw, 360px"
                className={[
                  'object-contain object-center transition-all duration-500 ease-out',
                  secondaryImage ? 'group-hover:opacity-0' : 'group-hover:brightness-[0.87]',
                ].join(' ')}
              />
              {secondaryImage ? (
                <Image
                  src={secondaryImage}
                  alt={`${product.name} alternate view`}
                  fill
                  sizes="(max-width:768px) 50vw, (max-width:1280px) 33vw, 360px"
                  className="object-contain object-center opacity-0 transition-all duration-500 ease-out group-hover:scale-100 group-hover:opacity-100 scale-[1.04]"
                />
              ) : null}
            </div>
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] translate-y-full bg-[rgba(28,28,28,0.88)] px-4 py-3 text-center text-[10px] uppercase tracking-[3px] text-white transition-transform duration-300 ease-out group-hover:translate-y-0">
            View Piece
          </div>

          <div className="pointer-events-none absolute inset-0 transition-[filter] duration-500 ease-out group-hover:brightness-[0.87]" />

          <span className="absolute left-[10px] top-[10px] z-[3] bg-[#1c1c1c] px-[7px] py-[3px] text-[8px] uppercase tracking-[1.5px] text-white">
            New
          </span>
        </div>

        <div className="pt-3">
          <span className="mb-[6px] block text-[9px] uppercase tracking-[2.5px] text-[#bbb]">
            {compact(product.artisan) || 'Sharon'}
          </span>
          <h3 className="mb-2 text-[12px] font-light leading-[1.7] text-[#1c1c1c]">
            {product.name}
          </h3>
          <p className="text-[12px] font-medium text-[#1c1c1c]">
            {formatKES(onSale ? Number(product.sale_price) : product.price)}
          </p>
        </div>
      </Link>
    </article>
  )
}

export default function HomePage({
  initialProducts,
  initialCategories,
  initialHeroSlide,
  initialArtisanData,
}: HomePageProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [categories, setCategories] = useState<Partial<Category>[]>(initialCategories)
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(
    initialHeroSlide ? [initialHeroSlide] : [FALLBACK_HERO],
  )
  const [activeHeroIndex, setActiveHeroIndex] = useState(0)
  const [featuredHeroProduct, setFeaturedHeroProduct] = useState<Product | null>(
    initialProducts[0] || null,
  )
  const [artisanData, setArtisanData] = useState<ArtisanContent | null>(initialArtisanData)
  const [loading, setLoading] = useState(
    initialProducts.length === 0 && initialCategories.length === 0,
  )
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterState, setNewsletterState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const heroParallaxRef = useHeroImageParallax()
  const artisanParallaxRef = useParallax(0.25)

  useScrollReveal()

  useEffect(() => {
    document.body.classList.add('homepage-refactor')
    return () => document.body.classList.remove('homepage-refactor')
  }, [])

  const supabase = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !key) return null
    return createBrowserClient(url, key)
  }, [])

  useEffect(() => {
    let cancelled = false

    const fetchAllData = async () => {
      if (!supabase) {
        if (!cancelled) setLoading(false)
        return
      }

      try {
        const featuredPromise = supabase
          .from('products')
          .select('id, name, slug, description, price, sale_price, images, artisan, is_visible, is_featured, created_at')
          .eq('is_visible', true)
          .eq('is_featured', true)
          .limit(4)

        const categoriesPromise = supabase
          .from('categories')
          .select('id, name, subcategories, image_url, is_visible, display_order')
          .eq('is_visible', true)
          .order('display_order')
          .limit(8)

        const heroSlidesPromise = supabase
          .from('hero_slides')
          .select('image_url, headline, subtitle, description, button_text, button_link')
          .eq('is_visible', true)
          .order('display_order')
          .limit(3)

        const heroFeaturedPromise = supabase
          .from('products')
          .select('id, name, slug, description, price, sale_price, images, artisan, is_visible, is_featured, created_at')
          .eq('is_visible', true)
          .eq('is_featured', true)
          .limit(1)
          .single()

        const artisanPromise = supabase
          .from('homepage_content')
          .select('image_url, quote, author, link_text, link_href')
          .eq('section', 'artisan')
          .single()

        const [featuredRes, categoriesRes, heroSlidesRes, heroFeaturedRes, artisanRes] = await Promise.all([
          featuredPromise,
          categoriesPromise,
          heroSlidesPromise,
          heroFeaturedPromise,
          artisanPromise,
        ])

        let nextProducts =
          (featuredRes.data || []).map((row) => normalizeProduct(row as Partial<Product>))

        if (nextProducts.length < 4) {
          const fallbackRes = await supabase
            .from('products')
            .select('id, name, slug, description, price, sale_price, images, artisan, is_visible, is_featured, created_at')
            .eq('is_visible', true)
            .order('created_at', { ascending: false })
            .limit(4)

          nextProducts = (fallbackRes.data || []).map((row) => normalizeProduct(row as Partial<Product>))
        }

        if (!cancelled) {
          if (nextProducts.length > 0) {
            setProducts(nextProducts)
          }

          const fetchedCategories = (categoriesRes.data || []) as Partial<Category>[]
          if (fetchedCategories.length > 0) {
            setCategories((current) => mergeCategoryData(fetchedCategories, current))
          }

          if (Array.isArray(heroSlidesRes.data) && heroSlidesRes.data.length > 0) {
            setHeroSlides(heroSlidesRes.data as HeroSlide[])
          }

          if (heroFeaturedRes.data) {
            setFeaturedHeroProduct(normalizeProduct(heroFeaturedRes.data as Partial<Product>))
          } else if (nextProducts[0]) {
            setFeaturedHeroProduct(nextProducts[0])
          }

          if (artisanRes.data) {
            setArtisanData(artisanRes.data as ArtisanContent)
          }
        }
      } catch {
        // Keep the server-rendered homepage content instead of clearing sections
        // when the client-side refresh is empty or unavailable.
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void fetchAllData()

    return () => {
      cancelled = true
    }
  }, [supabase])

  useEffect(() => {
    if (heroSlides.length <= 1) return undefined

    const intervalId = window.setInterval(() => {
      setActiveHeroIndex((current) => (current + 1) % heroSlides.length)
    }, 6000)

    return () => window.clearInterval(intervalId)
  }, [heroSlides])

  useEffect(() => {
    if (activeHeroIndex < heroSlides.length) return
    setActiveHeroIndex(0)
  }, [activeHeroIndex, heroSlides.length])

  const categoryCards = useMemo(() => normalizeCategories(categories), [categories])
  const desktopProducts = useMemo(() => products.slice(0, 3), [products])
  const mobileOnlyProduct = useMemo(() => products[3] || null, [products])
  const activeHeroSlide = heroSlides[activeHeroIndex] || heroSlides[0] || FALLBACK_HERO

  const heroHeadline = compact(activeHeroSlide?.headline) || compact(FALLBACK_HERO.headline)
  const heroSubtitle = compact(activeHeroSlide?.subtitle) || compact(FALLBACK_HERO.subtitle)
  const heroDescription =
    compact(activeHeroSlide?.description) || compact(FALLBACK_HERO.description)
  const heroButtonText =
    compact(activeHeroSlide?.button_text) || compact(FALLBACK_HERO.button_text)
  const heroButtonLink =
    compact(activeHeroSlide?.button_link) || compact(FALLBACK_HERO.button_link)
  const heroImage =
    normalizeImage(activeHeroSlide?.image_url) || normalizeImage(FALLBACK_HERO.image_url)

  const artisanImage =
    normalizeImage(artisanData?.image_url) || normalizeImage(FALLBACK_ARTISAN.image_url)
  const artisanQuote = compact(artisanData?.quote) || compact(FALLBACK_ARTISAN.quote)
  const artisanAuthor = compact(artisanData?.author) || compact(FALLBACK_ARTISAN.author)
  const artisanLinkText =
    compact(artisanData?.link_text) || compact(FALLBACK_ARTISAN.link_text)
  const artisanLinkHref =
    compact(artisanData?.link_href) || compact(FALLBACK_ARTISAN.link_href)

  const whatsappNumber = compact(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER) || '254112222572'

  const handleNewsletterSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!newsletterEmail.trim()) return

    setNewsletterState('loading')

    try {
      const response = await fetch('/api/newsletter-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: newsletterEmail.trim() }),
      })

      if (!response.ok) throw new Error('Newsletter signup failed')

      setNewsletterEmail('')
      setNewsletterState('success')
    } catch {
      setNewsletterState('error')
    }
  }

  const openWhatsApp = () => {
    const message = encodeURIComponent(
      `Hi Sharon \u{1F44B} I visited sharoncraft.co.ke and would love to know more about your pieces \u{1F48E}`,
    )
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank')
  }

  return (
    <>
      <Head>
        <title>Quiet Luxury Kenyan Jewelry | SharonCraft</title>
        <meta
          name="description"
          content="Handmade jewelry, accessories, and artisan lifestyle pieces crafted in Nairobi by SharonCraft."
        />
      </Head>

      <div className="min-h-screen bg-[#fafaf8] text-[#1c1c1c]">
        <main className="relative z-0 isolate">
          {/* Section 1 â€” Hero */}
          <section className="home-hero">
            <div className="home-hero__desktop">
              <div className="home-hero__copy">
                <div className="home-hero__texture" />
                <span className="home-hero__meta">NAIROBI · 2024</span>

                <div className="home-hero__copy-inner">
                  <div className="home-hero__eyebrow">
                    <span className="home-hero__eyebrow-line" />
                    <span className="home-hero__eyebrow-text">HANDCRAFTED IN NAIROBI</span>
                  </div>

                  <h1 className="home-hero__title">
                    <span className="home-hero__title-line">{heroHeadline || 'Handmade'}</span>
                    <span className="home-hero__title-line home-hero__title-line--italic">
                      {heroSubtitle || 'in Kenya.'}
                    </span>
                    <span className="home-hero__title-caption">Since 2024.</span>
                  </h1>

                  <p className="home-hero__description">
                    {heroDescription ||
                      'Beaded jewelry and handmade accessories crafted by Nairobi artisans. Made to order. Delivered to you.'}
                  </p>

                  <div className="home-hero__actions">
                    <Link href={heroButtonLink} className="home-hero__primary">
                      {heroButtonText}
                    </Link>
                    <Link href="/about" className="home-hero__secondary">
                      Our Story
                    </Link>
                  </div>
                </div>

                <div className="home-hero__scroll">
                  <span className="home-hero__scroll-line" />
                  <span className="home-hero__scroll-text">SCROLL</span>
                </div>

                <div className="home-hero__stats">
                  {HERO_STATS.map((stat) => (
                    <div key={stat.label} className="home-hero__stat">
                      <span className="home-hero__stat-value">{stat.value}</span>
                      <span className="home-hero__stat-label">{stat.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="home-hero__media">
                <div ref={heroParallaxRef} className="home-hero__media-track">
                  {heroSlides.map((slide, index) => {
                    const slideImage =
                      normalizeImage(slide?.image_url) || normalizeImage(FALLBACK_HERO.image_url)

                    return (
                      <div
                        key={`${slideImage || 'fallback'}-${index}`}
                        className={`home-hero__image-layer${index === activeHeroIndex ? ' is-active' : ''}`}
                      >
                        {slideImage ? (
                          <Image
                            src={slideImage}
                            alt="Editorial SharonCraft hero image featuring handmade pieces in Nairobi"
                            fill
                            priority={index === 0}
                            sizes="55vw"
                            className="object-cover object-top"
                          />
                        ) : (
                          <div className="home-hero__image-fallback" />
                        )}
                      </div>
                    )
                  })}
                </div>

                <div className="home-hero__edge-gradient" />
                <div className="home-hero__bottom-gradient" />

                {featuredHeroProduct ? (
                  <Link
                    href={featuredHeroProduct.slug ? `/product/${featuredHeroProduct.slug}` : '/shop'}
                    className="home-hero__tag"
                  >
                    <span className="home-hero__tag-thumb">
                      {normalizeImage(featuredHeroProduct.images?.[0]) ? (
                        <Image
                          src={normalizeImage(featuredHeroProduct.images?.[0])}
                          alt={featuredHeroProduct.name}
                          fill
                          sizes="40px"
                          className="object-contain object-center"
                        />
                      ) : null}
                    </span>
                    <span className="home-hero__tag-copy">
                      <span className="home-hero__tag-kicker">Featured Piece</span>
                      <span className="home-hero__tag-title">{featuredHeroProduct.name}</span>
                      <span className="home-hero__tag-price">
                        {formatKES(
                          featuredHeroProduct.sale_price && featuredHeroProduct.sale_price > 0
                            ? featuredHeroProduct.sale_price
                            : featuredHeroProduct.price,
                        )}
                      </span>
                    </span>
                  </Link>
                ) : null}

                {heroSlides.length > 1 ? (
                  <div className="home-hero__dots" aria-hidden="true">
                    {heroSlides.map((_, index) => (
                      <span
                        key={`hero-dot-${index}`}
                        className={`home-hero__dot${index === activeHeroIndex ? ' is-active' : ''}`}
                      />
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="home-hero__mobile">
              <div className="home-hero__mobile-media">
                {heroImage ? (
                  <Image
                    src={heroImage}
                    alt="SharonCraft handmade jewelry by Nairobi artisans"
                    fill
                    priority
                    sizes="100vw"
                    className="object-cover object-top"
                  />
                ) : (
                  <div className="home-hero__image-fallback" />
                )}
              </div>
              <div className="home-hero__mobile-overlay" />
              <div className="home-hero__mobile-content">
                <span className="home-hero__mobile-eyebrow">HANDCRAFTED IN NAIROBI</span>
                <h1 className="home-hero__mobile-title">
                  <span>{heroHeadline || 'Handmade'}</span>
                  <span className="home-hero__mobile-title-italic">{heroSubtitle || 'in Kenya.'}</span>
                </h1>
                <p className="home-hero__mobile-description">
                  Handmade jewelry by Nairobi artisans. Made to order.
                </p>
                <div className="home-hero__mobile-actions">
                  <Link href={heroButtonLink} className="home-hero__mobile-primary">
                    {heroButtonText}
                  </Link>
                  <a href="#homepage-collections" className="home-hero__mobile-secondary" aria-label="Jump to collections">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </a>
                </div>
              </div>
              <div className="home-hero__mobile-scroll" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </div>
            </div>
          </section>
          {/* Section 2 â€” Stats */}
          <section className="relative z-0 isolate bg-white border-b border-[rgba(0,0,0,0.08)]">
            <div className="grid grid-cols-4 max-md:grid-cols-2">
              {STATS.map((stat, index) => (
                <div
                  key={stat.label}
                  className="reveal border-r border-[rgba(0,0,0,0.08)] px-2 py-7 text-center last:border-r-0 max-md:nth-[2n]:border-r-0 max-md:border-b max-md:nth-last-[1]:border-b-0 max-md:nth-last-[2]:border-b-0"
                  style={{ transitionDelay: `${index * 80}ms` }}
                >
                  <span className="mb-[5px] block text-[24px] font-light tracking-[-0.5px] text-[#1c1c1c]">
                    {stat.value}
                  </span>
                  <span className="block text-[9px] uppercase tracking-[2.5px] text-[#bbb]">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Section 3 â€” Categories */}
          <section
            id="homepage-collections"
            className="relative z-0 isolate overflow-hidden bg-[#fafaf8] px-10 pb-16 pt-12 max-md:px-0 max-md:pb-12 max-md:pt-9"
          >
            <div className="mx-auto max-w-[1320px]">
              <p className="reveal mb-6 px-0 text-[10px] uppercase tracking-[4px] text-[#bbb] max-md:px-5 max-md:text-[9px] max-md:tracking-[3px]">
                Our Collections
              </p>

              {loading ? (
                <div className="grid grid-cols-[1.5fr_1fr_1fr] grid-rows-[280px_240px] gap-[3px] overflow-hidden px-0 max-md:flex max-md:flex-col max-md:gap-[3px] max-md:px-0">
                  {CATEGORY_BLUEPRINTS.map((category) => (
                    <div
                      key={category.key}
                      className={[
                        'relative overflow-hidden',
                        category.cardClass,
                        'max-md:w-full max-md:aspect-[16/9]',
                        category.key === 'jewellery' ? 'max-md:aspect-[4/3]' : '',
                      ].join(' ')}
                      style={{
                        minHeight: category.key === 'jewellery' ? '523px' : undefined,
                        height:
                          category.key === 'accessories'
                            ? '280px'
                            : category.key === 'african-wear'
                              ? '280px'
                              : category.key === 'home-living'
                                ? '240px'
                                : undefined,
                        background: category.gradient,
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-[1.5fr_1fr_1fr] grid-rows-[280px_240px] gap-[3px] overflow-hidden px-0 max-md:flex max-md:flex-col max-md:gap-[3px] max-md:px-0">
                  {categoryCards.map((category, index) => (
                    <CategoryCard key={category.key} category={category} index={index} />
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Section 4 â€” Featured Products */}
          <section className="relative z-0 isolate bg-[#fafaf8] px-10 py-20 max-md:px-5 max-md:py-12">
            <div className="mx-auto max-w-[1320px]">
              <div className="mb-10 flex items-baseline justify-between gap-5">
                <div className="reveal">
                  <p className="mb-3 text-[10px] uppercase tracking-[4px] text-[#bbb] max-md:text-[9px] max-md:tracking-[3px]">
                    Our Pieces
                  </p>
                  <h2 className="text-[24px] font-light leading-[1.2] text-[#1c1c1c]">
                    Handmade in Nairobi
                  </h2>
                </div>
                <Link
                  href="/shop"
                  className="reveal border-b border-[#1c1c1c] pb-[3px] text-[10px] uppercase tracking-[3px] text-[#1c1c1c] transition-opacity duration-200 ease-out hover:opacity-50"
                >
                  View all â†’
                </Link>
              </div>

              {loading ? (
                <div className="grid grid-cols-3 gap-5 max-md:grid-cols-2 max-md:gap-3">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={`product-skeleton-${index}`} className={index === 3 ? 'md:hidden' : ''}>
                      <div className="aspect-[1/1.25] animate-[shimmer_1.5s_ease_infinite] bg-[#F5F0EB]" />
                      <div className="pt-3">
                        <div className="mb-2 h-2 w-20 animate-[shimmer_1.5s_ease_infinite] bg-[#ece3da]" />
                        <div className="mb-2 h-3 w-full animate-[shimmer_1.5s_ease_infinite] bg-[#ece3da]" />
                        <div className="h-3 w-16 animate-[shimmer_1.5s_ease_infinite] bg-[#ece3da]" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-5 max-md:grid-cols-2 max-md:gap-3">
                  {desktopProducts.map((product, index) => (
                    <ProductCard key={product.id} product={product} index={index} />
                  ))}
                  {mobileOnlyProduct ? (
                    <ProductCard
                      key={mobileOnlyProduct.id}
                      product={mobileOnlyProduct}
                      index={3}
                      hideOnDesktop
                    />
                  ) : null}
                </div>
              )}
            </div>
          </section>

          {/* Section 5 â€” Artisan */}
          <section className="relative z-0 isolate grid min-h-[460px] grid-cols-2 overflow-hidden border-t border-[rgba(0,0,0,0.08)] max-md:grid-cols-1">
            <div className="relative min-h-[460px] overflow-hidden bg-[#1a0e08] max-md:min-h-[280px] max-md:h-[280px]">
              <div
                ref={artisanParallaxRef}
                className="absolute inset-x-0 -top-[10%] h-[120%] will-change-transform max-md:top-0 max-md:h-full"
              >
                {artisanImage ? (
                  <Image
                    src={artisanImage}
                    alt="SharonCraft artisan portrait"
                    fill
                    sizes="(max-width:768px) 100vw, 50vw"
                    className="object-cover object-top"
                  />
                ) : (
                  <div className="h-full w-full bg-[linear-gradient(160deg,#0e0a08_0%,#1a0e08_50%,#3D1F0D_100%)]" />
                )}
              </div>
              <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_60px,rgba(255,255,255,0.015)_60px,rgba(255,255,255,0.015)_61px)]" />
            </div>

            <div className="flex flex-col justify-center bg-[#fafaf8] px-14 py-[72px] max-md:px-5 max-md:py-10">
              <p className="reveal-right mb-3 text-[9px] uppercase tracking-[5px] text-[#bbb] max-md:tracking-[3px]">
                The Maker
              </p>
              <blockquote
                className="reveal-right mb-[14px] max-w-[380px] text-[20px] font-light italic leading-[1.65] text-[#1c1c1c] max-md:text-[17px]"
                style={{ transitionDelay: '80ms' }}
              >
                {artisanQuote}
              </blockquote>
              <p
                className="reveal-right mb-9 text-[10px] uppercase tracking-[3px] text-[#bbb]"
                style={{ transitionDelay: '160ms' }}
              >
                {artisanAuthor}
              </p>
              <Link
                href={artisanLinkHref}
                className="reveal-right w-fit border-b border-[#1c1c1c] pb-[3px] text-[10px] uppercase tracking-[3px] text-[#1c1c1c] transition-opacity duration-200 ease-out hover:opacity-50"
                style={{ transitionDelay: '240ms' }}
              >
                {artisanLinkText}
              </Link>
            </div>
          </section>

          {/* Section 6 â€” Trust */}
          <section className="relative z-0 isolate overflow-hidden border-y border-[rgba(0,0,0,0.08)] bg-[#fafaf8] px-10 py-[18px] max-md:px-5">
            <div className="flex items-center overflow-hidden">
              <span className="shrink-0 border-r border-[rgba(0,0,0,0.08)] pr-6 text-[9px] uppercase tracking-[3px] text-[#ccc]">
                Trusted by
              </span>
              <div className="ml-6 flex-1 overflow-hidden">
                <div className="inline-flex min-w-max animate-[marquee_22s_linear_infinite]">
                  {[...TRUST_ITEMS, ...TRUST_ITEMS].map((item, index) => (
                    <span
                      key={`${item}-${index}`}
                      className="whitespace-nowrap px-7 text-[9px] uppercase tracking-[3px] text-[#ccc]"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Section 7 â€” Newsletter */}
          <section className="relative z-0 isolate border-t border-[rgba(0,0,0,0.08)] bg-[#F5F0EB] px-10 py-[52px] max-md:px-5 max-md:py-10">
            <div className="mx-auto flex max-w-[1320px] items-center gap-14 max-md:flex-col max-md:items-start max-md:gap-8">
              <div className="reveal-left flex-1">
                <p className="mb-3 text-[9px] uppercase tracking-[4px] text-[#8B5E3C]">
                  Stay in the Loop
                </p>
                <h2 className="max-w-[300px] text-[22px] font-light leading-[1.35] text-[#1c1c1c] max-md:text-[18px]">
                  New pieces, artisan stories and exclusive offers
                </h2>
              </div>

              <div className="reveal-right flex w-full max-w-[420px] flex-col gap-2">
                <form onSubmit={handleNewsletterSubmit} className="flex gap-2 max-md:flex-col">
                  <input
                    type="email"
                    value={newsletterEmail}
                    onChange={(event) => setNewsletterEmail(event.target.value)}
                    placeholder="Your email address"
                    className="h-11 w-[220px] border border-[rgba(0,0,0,0.15)] bg-white px-4 text-[12px] text-[#1c1c1c] outline-none transition-colors duration-200 ease-out placeholder:text-[#bbb] focus:border-[#8B5E3C] max-md:w-full"
                  />
                  <button
                    type="submit"
                    disabled={newsletterState === 'loading'}
                    className="h-11 bg-[#1c1c1c] px-[22px] text-[9px] uppercase tracking-[3px] text-white transition-colors duration-200 ease-out hover:bg-[#8B5E3C] disabled:cursor-not-allowed disabled:opacity-70 max-md:w-full"
                  >
                    {newsletterState === 'loading' ? 'Submitting' : 'Subscribe'}
                  </button>
                </form>
                <p className="text-[10px] text-[#bbb]">
                  {newsletterState === 'success'
                    ? 'Thanks for subscribing.'
                    : newsletterState === 'error'
                      ? 'Something went wrong. Please try again.'
                      : 'No spam. Unsubscribe anytime.'}
                </p>
              </div>
            </div>
          </section>
        </main>

        <Footer siteContent={{}} />

        <button
          type="button"
          onClick={openWhatsApp}
          aria-label="Chat with SharonCraft on WhatsApp"
          className="fixed bottom-6 right-6 z-[1001] flex h-12 w-12 items-center justify-center rounded-full bg-[#1c1c1c] text-white transition-all duration-200 ease-out hover:scale-[1.08] hover:bg-[#8B5E3C] max-md:bottom-20"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path d="M6.6 10.8c1.1 2.2 2.8 4 5 5l1.7-1.7c.2-.2.5-.3.8-.2 1 .3 2 .5 3 .5.5 0 .9.4.9.9v2.7c0 .5-.4.9-.9.9C10 18.9 5.1 14 5.1 7.9c0-.5.4-.9.9-.9h2.7c.5 0 .9.4.9.9 0 1 .2 2 .5 3 .1.3 0 .6-.2.8l-1.8 1.7Z" />
          </svg>
        </button>
      </div>

      <style jsx global>{`
        body.homepage-refactor {
          background: #fafaf8;
          color: #1c1c1c;
        }

        body.homepage-refactor .whatsapp-fab,
        body.homepage-refactor .sticky-mini-cart,
        body.homepage-refactor a[aria-label='Chat with us on WhatsApp'] {
          display: none !important;
        }

        .reveal,
        .reveal-left,
        .reveal-right {
          opacity: 0;
        }

        .reveal {
          transform: translateY(24px);
          transition:
            opacity 0.65s ease,
            transform 0.65s ease;
        }

        .reveal.revealed,
        .reveal.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .reveal-left {
          transform: translateX(-28px);
          transition:
            opacity 0.65s ease,
            transform 0.65s ease;
        }

        .reveal-left.revealed,
        .reveal-left.visible {
          opacity: 1;
          transform: translateX(0);
        }

        .reveal-right {
          transform: translateX(28px);
          transition:
            opacity 0.65s ease,
            transform 0.65s ease;
        }

        .reveal-right.revealed,
        .reveal-right.visible {
          opacity: 1;
          transform: translateX(0);
        }

        .home-hero {
          position: relative;
          overflow: hidden;
          background: #fafaf8;
        }

        .home-hero__desktop {
          display: grid;
          min-height: 640px;
          grid-template-columns: 45% 55%;
          height: calc(100vh - var(--announcement-height));
          background: #fafaf8;
        }

        .home-hero__copy {
          position: relative;
          z-index: 2;
          display: flex;
          overflow: hidden;
          flex-direction: column;
          justify-content: flex-end;
          background: #fafaf8;
          padding: 0 56px 72px;
        }

        .home-hero__texture {
          position: absolute;
          inset: 0;
          background-image:
            radial-gradient(circle at 20% 80%, rgba(139, 94, 60, 0.04) 0%, transparent 60%),
            radial-gradient(circle at 80% 20%, rgba(139, 94, 60, 0.03) 0%, transparent 50%);
          pointer-events: none;
        }

        .home-hero__meta {
          position: absolute;
          top: 32px;
          left: 56px;
          color: #ccc;
          font-size: 9px;
          letter-spacing: 5px;
          text-transform: uppercase;
        }

        .home-hero__copy-inner,
        .home-hero__scroll,
        .home-hero__stats,
        .home-hero__tag {
          opacity: 0;
          animation: fadeUp 0.7s ease forwards;
        }

        .home-hero__copy-inner {
          position: relative;
          z-index: 2;
          animation-delay: 0.35s;
        }

        .home-hero__eyebrow {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }

        .home-hero__eyebrow-line {
          width: 32px;
          height: 1px;
          background: #8b5e3c;
          animation: lineGrow 0.6s ease 0.3s both;
        }

        .home-hero__eyebrow-text {
          color: #8b5e3c;
          font-size: 10px;
          letter-spacing: 5px;
          text-transform: uppercase;
          opacity: 0;
          animation: fadeUp 0.6s ease 0.4s both;
        }

        .home-hero__title {
          margin-bottom: 20px;
        }

        .home-hero__title-line {
          display: block;
          color: #1c1c1c;
          font-size: clamp(40px, 5vw, 64px);
          font-weight: 300;
          letter-spacing: -1px;
          line-height: 1.05;
          opacity: 0;
          animation: fadeUp 0.7s ease both;
        }

        .home-hero__title-line:first-child {
          animation-delay: 0.5s;
        }

        .home-hero__title-line--italic {
          color: #888;
          font-style: italic;
          animation-delay: 0.6s;
        }

        .home-hero__title-caption {
          display: block;
          color: #bbb;
          font-size: clamp(14px, 1.8vw, 20px);
          font-weight: 300;
          letter-spacing: 0;
          margin-top: 8px;
          opacity: 0;
          animation: fadeUp 0.7s ease 0.7s both;
        }

        .home-hero__description {
          max-width: 320px;
          margin-bottom: 40px;
          color: #888;
          font-size: 13px;
          letter-spacing: 0.3px;
          line-height: 1.8;
          opacity: 0;
          animation: fadeUp 0.7s ease 0.8s both;
        }

        .home-hero__actions {
          display: flex;
          align-items: center;
          gap: 16px;
          opacity: 0;
          animation: fadeUp 0.7s ease 0.9s both;
        }

        .home-hero__primary,
        .home-hero__secondary,
        .home-hero__mobile-primary,
        .home-hero__mobile-secondary {
          border-radius: 2px;
          text-transform: uppercase;
        }

        .home-hero__primary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 52px;
          padding: 0 32px;
          border: 2px solid #1c1c1c;
          background: #1c1c1c;
          color: #fff;
          font-size: 10px;
          letter-spacing: 4px;
          transition: all 0.3s ease;
          white-space: nowrap;
        }

        .home-hero__primary:hover {
          transform: translateY(-1px);
          background: transparent;
          color: #1c1c1c;
        }

        .home-hero__secondary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 52px;
          padding: 0 24px;
          border: 1px solid rgba(0, 0, 0, 0.15);
          color: #888;
          font-size: 10px;
          letter-spacing: 3px;
          transition: all 0.3s ease;
        }

        .home-hero__secondary:hover {
          border-color: #1c1c1c;
          color: #1c1c1c;
        }

        .home-hero__scroll {
          position: absolute;
          bottom: 32px;
          left: 56px;
          z-index: 2;
          display: flex;
          align-items: center;
          gap: 10px;
          animation-delay: 1.2s;
        }

        .home-hero__scroll-line {
          position: relative;
          width: 1px;
          height: 40px;
          overflow: hidden;
          background: rgba(0, 0, 0, 0.15);
        }

        .home-hero__scroll-line::after {
          position: absolute;
          top: -100%;
          left: 0;
          width: 100%;
          height: 100%;
          background: #8b5e3c;
          content: '';
          animation: scrollLine 2s ease 1.5s infinite;
        }

        .home-hero__scroll-text {
          color: #bbb;
          font-size: 8px;
          letter-spacing: 3px;
          writing-mode: vertical-rl;
          transform: rotate(180deg);
        }

        .home-hero__stats {
          position: absolute;
          right: 56px;
          bottom: 32px;
          z-index: 2;
          display: flex;
          gap: 32px;
          animation-delay: 1.1s;
        }

        .home-hero__stat {
          text-align: right;
        }

        .home-hero__stat-value {
          display: block;
          color: #1c1c1c;
          font-size: 20px;
          font-weight: 300;
          letter-spacing: -0.5px;
        }

        .home-hero__stat-label {
          color: #bbb;
          font-size: 8px;
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        .home-hero__media {
          position: relative;
          overflow: hidden;
          height: calc(100vh - var(--announcement-height));
          min-height: 640px;
          background: linear-gradient(145deg, #f5f0eb 0%, #e8e0d4 40%, #d4c4b0 70%, #c8a882 100%);
        }

        .home-hero__media-track {
          position: absolute;
          inset: 0;
          will-change: transform;
        }

        .home-hero__image-layer {
          position: absolute;
          inset: 0;
          opacity: 0;
          transition: opacity 0.8s ease;
        }

        .home-hero__image-layer.is-active {
          opacity: 1;
        }

        .home-hero__image-fallback {
          width: 100%;
          height: 100%;
          background: linear-gradient(145deg, #f5f0eb 0%, #e8e0d4 40%, #d4c4b0 70%, #c8a882 100%);
        }

        .home-hero__edge-gradient,
        .home-hero__bottom-gradient,
        .home-hero__mobile-overlay {
          pointer-events: none;
        }

        .home-hero__edge-gradient {
          position: absolute;
          top: 0;
          left: 0;
          bottom: 0;
          width: 120px;
          z-index: 1;
          background: linear-gradient(to right, #fafaf8 0%, rgba(250, 250, 248, 0.6) 40%, transparent 100%);
        }

        .home-hero__bottom-gradient {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          height: 200px;
          z-index: 1;
          background: linear-gradient(to top, rgba(250, 250, 248, 0.4) 0%, transparent 100%);
        }

        .home-hero__tag {
          position: absolute;
          right: 40px;
          bottom: 80px;
          z-index: 3;
          display: flex;
          align-items: center;
          gap: 12px;
          border: 0.5px solid rgba(0, 0, 0, 0.08);
          background: rgba(250, 250, 248, 0.92);
          backdrop-filter: blur(10px);
          padding: 12px 16px 12px 12px;
          transition: transform 0.2s ease;
          animation-delay: 1.3s;
        }

        .home-hero__tag:hover {
          transform: translateY(-2px);
        }

        .home-hero__tag-thumb {
          position: relative;
          width: 40px;
          height: 40px;
          flex: 0 0 40px;
          background: #f5f0eb;
        }

        .home-hero__tag-copy {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .home-hero__tag-kicker {
          color: #bbb;
          font-size: 8px;
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        .home-hero__tag-title {
          color: #1c1c1c;
          font-size: 12px;
          font-weight: 400;
        }

        .home-hero__tag-price {
          color: #8b5e3c;
          font-size: 11px;
        }

        .home-hero__dots {
          position: absolute;
          right: 40px;
          bottom: 32px;
          z-index: 3;
          display: flex;
          gap: 6px;
        }

        .home-hero__dot {
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.2);
        }

        .home-hero__dot.is-active {
          width: 20px;
          border-radius: 2px;
          background: #1c1c1c;
        }

        .home-hero__mobile {
          display: none;
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

        @keyframes lineGrow {
          from {
            width: 0;
            opacity: 0;
          }
          to {
            width: 32px;
            opacity: 1;
          }
        }

        @keyframes scrollLine {
          0% {
            top: -100%;
          }
          50%,
          100% {
            top: 100%;
          }
        }

        @keyframes bounce {
          0%,
          100% {
            transform: translateX(-50%) translateY(0);
          }
          50% {
            transform: translateX(-50%) translateY(6px);
          }
        }

        @keyframes shimmer {
          0%,
          100% {
            opacity: 0.4;
          }
          50% {
            opacity: 0.8;
          }
        }

        @keyframes marquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }

        @media (max-width: 767px) {
          .reveal,
          .reveal-left,
          .reveal-right {
            transition-duration: 0.55s;
          }

          .home-hero__desktop {
            display: none;
          }

          .home-hero__mobile {
            position: relative;
            display: block;
            min-height: 600px;
            height: calc(100vh - var(--announcement-height));
            overflow: hidden;
            background: #080808;
          }

          .home-hero__mobile-media {
            position: absolute;
            inset: 0;
          }

          .home-hero__mobile-overlay {
            position: absolute;
            inset: 0;
            z-index: 1;
            background: linear-gradient(to top, rgba(8, 8, 8, 0.9) 0%, rgba(8, 8, 8, 0.5) 40%, rgba(8, 8, 8, 0.1) 70%, transparent 100%);
          }

          .home-hero__mobile-content {
            position: absolute;
            right: 0;
            bottom: 0;
            left: 0;
            z-index: 2;
            padding: 0 24px 40px;
          }

          .home-hero__mobile-eyebrow,
          .home-hero__mobile-title span,
          .home-hero__mobile-description,
          .home-hero__mobile-actions {
            opacity: 0;
            animation: fadeUp 0.7s ease forwards;
          }

          .home-hero__mobile-eyebrow {
            display: block;
            margin-bottom: 12px;
            color: rgba(255, 255, 255, 0.4);
            font-size: 9px;
            letter-spacing: 5px;
            text-transform: uppercase;
            animation-delay: 0.3s;
          }

          .home-hero__mobile-title {
            margin-bottom: 8px;
          }

          .home-hero__mobile-title span {
            display: block;
            color: #ffffff;
            font-size: 36px;
            font-weight: 300;
            letter-spacing: -0.5px;
            line-height: 1.1;
            animation-delay: 0.4s;
          }

          .home-hero__mobile-title-italic {
            color: rgba(255, 255, 255, 0.6) !important;
            font-style: italic;
            animation-delay: 0.5s !important;
          }

          .home-hero__mobile-description {
            margin-bottom: 28px;
            color: rgba(255, 255, 255, 0.4);
            font-size: 12px;
            line-height: 1.7;
            animation-delay: 0.6s;
          }

          .home-hero__mobile-actions {
            display: flex;
            gap: 10px;
            animation-delay: 0.7s;
          }

          .home-hero__mobile-primary {
            display: inline-flex;
            flex: 1;
            min-height: 50px;
            align-items: center;
            justify-content: center;
            background: #ffffff;
            color: #1c1c1c;
            font-size: 10px;
            letter-spacing: 3px;
          }

          .home-hero__mobile-primary:active {
            transform: scale(0.97);
          }

          .home-hero__mobile-secondary {
            display: inline-flex;
            width: 50px;
            height: 50px;
            align-items: center;
            justify-content: center;
            border: 1px solid rgba(255, 255, 255, 0.3);
            color: #ffffff;
          }

          .home-hero__mobile-secondary svg,
          .home-hero__mobile-scroll svg {
            width: 16px;
            height: 16px;
          }

          .home-hero__mobile-scroll {
            position: absolute;
            left: 50%;
            bottom: 16px;
            z-index: 3;
            color: rgba(255, 255, 255, 0.25);
            animation: bounce 1.8s ease infinite;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .reveal,
          .reveal-left,
          .reveal-right,
          .home-hero__copy-inner,
          .home-hero__scroll,
          .home-hero__stats,
          .home-hero__tag,
          .home-hero__mobile-eyebrow,
          .home-hero__mobile-title span,
          .home-hero__mobile-description,
          .home-hero__mobile-actions,
          .home-hero__eyebrow-line,
          .home-hero__eyebrow-text,
          .home-hero__title-line,
          .home-hero__title-caption,
          .home-hero__description,
          .home-hero__image-layer,
          .home-hero__mobile-scroll {
            animation: none !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </>
  )
}

export async function getStaticProps() {
  try {
    const [{ readProducts }, { readSiteImages }] = await Promise.all([
      import('../lib/store'),
      import('../lib/site-images'),
    ])

    const [storeProducts, siteImages] = await Promise.all([
      readProducts(),
      readSiteImages(),
    ])

    const visibleProducts = Array.isArray(storeProducts)
      ? storeProducts.filter((product: any) => product?.publishStatus !== 'draft')
      : []

    const featuredProducts = visibleProducts.filter((product: any) => Boolean(product?.featured))
    const homepageProducts = (featuredProducts.length > 0 ? featuredProducts : visibleProducts)
      .slice(0, 4)
      .map((product: any) =>
        normalizeProduct({
          id: compact(product?.id),
          name: compact(product?.name),
          slug: compact(product?.slug),
          description: compact(product?.description || product?.shortDescription),
          price: Number(product?.price || 0),
          sale_price:
            Number.isFinite(Number(product?.originalPrice)) &&
            Number(product?.originalPrice) > Number(product?.price)
              ? Number(product?.price)
              : null,
          images: Array.isArray(product?.images)
            ? product.images
            : compact(product?.image)
              ? [product.image]
              : [],
          artisan: compact(product?.artisan || product?.story?.artisanName),
          is_visible: product?.publishStatus !== 'draft',
          is_featured: Boolean(product?.featured),
          created_at: compact(product?.created_at),
        }),
      )

    const homepageCategories: Partial<Category>[] = [
      {
        id: 'jewellery',
        name: 'Jewellery',
        subcategories: ['Necklaces', 'Earrings', 'Bracelets'],
        image_url: normalizeImage(siteImages?.collectionJewellery),
        is_visible: true,
        display_order: 1,
      },
      {
        id: 'accessories',
        name: 'Accessories',
        subcategories: ['Bags', 'Belts', 'Key Holders'],
        image_url: normalizeImage(siteImages?.collectionAccessories),
        is_visible: true,
        display_order: 2,
      },
      {
        id: 'african-wear',
        name: 'African Wear',
        subcategories: ['Wraps', 'Tops', 'Occasion'],
        image_url: normalizeImage(siteImages?.collectionBridal),
        is_visible: true,
        display_order: 3,
      },
      {
        id: 'home-living',
        name: 'Home & Living',
        subcategories: ['Baskets', 'Decor', 'Kitchen'],
        image_url: normalizeImage(siteImages?.collectionHome),
        is_visible: true,
        display_order: 4,
      },
    ]

    const heroFromSiteImages: HeroSlide | null = siteImages?.heroImage
      ? {
          image_url: normalizeImage(siteImages.heroImage),
          headline: compact(siteImages?.heroTitle) || FALLBACK_HERO.headline,
          subtitle: FALLBACK_HERO.subtitle,
          description: FALLBACK_HERO.description,
          button_text: FALLBACK_HERO.button_text,
          button_link: FALLBACK_HERO.button_link,
        }
      : null

    const artisanFromSiteImages: ArtisanContent | null =
      siteImages?.artisanPortrait || siteImages?.artisanBio
        ? {
            image_url: normalizeImage(siteImages?.artisanPortrait),
            quote: compact(siteImages?.artisanBio) || FALLBACK_ARTISAN.quote,
            author: FALLBACK_ARTISAN.author,
            link_text: FALLBACK_ARTISAN.link_text,
            link_href: FALLBACK_ARTISAN.link_href,
          }
        : null

    return {
      props: {
        initialProducts: homepageProducts,
        initialCategories: homepageCategories,
        initialHeroSlide: heroFromSiteImages,
        initialArtisanData: artisanFromSiteImages,
      },
      revalidate: 300,
    }
  } catch {
    return {
      props: {
        initialProducts: [],
        initialCategories: [
          {
            id: 'jewellery',
            name: 'Jewellery',
            subcategories: ['Necklaces', 'Earrings', 'Bracelets'],
            image_url: '/media/products/Gemini_Generated_Image_uwdxzguwdxzguwdx.png',
            is_visible: true,
            display_order: 1,
          },
          {
            id: 'accessories',
            name: 'Accessories',
            subcategories: ['Bags', 'Belts', 'Key Holders'],
            image_url: '/media/products/Gemini_Generated_Image_9vevmr9vevmr9vev.png',
            is_visible: true,
            display_order: 2,
          },
          {
            id: 'african-wear',
            name: 'African Wear',
            subcategories: ['Wraps', 'Tops', 'Occasion'],
            image_url: '/media/products/Gemini_Generated_Image_cji2fcji2fcji2fc.png',
            is_visible: true,
            display_order: 3,
          },
          {
            id: 'home-living',
            name: 'Home & Living',
            subcategories: ['Baskets', 'Decor', 'Kitchen'],
            image_url: '/media/products/Gemini_Generated_Image_xj81bfxj81bfxj81.png',
            is_visible: true,
            display_order: 4,
          },
        ],
        initialHeroSlide: null,
        initialArtisanData: null,
      },
      revalidate: 300,
    }
  }
}


