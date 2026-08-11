'use client'

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// SHARONCRAFT HOMEPAGE
// pages/index.tsx
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

import SeoHead from '../components/SeoHead'
import Image from 'next/image'
import Link from 'next/link'
import ProductCard from '@/components/ui/ProductCard'
import ProductCardSkeleton from '@/components/ui/ProductCardSkeleton'
import CardWrapper from '@/components/ui/CardWrapper'
import { createBrowserClient } from '@supabase/ssr'
import {
  buildShopHref,
  CATEGORIES,
  getCategorySlug,
  getHomepageFallbackCategories,
  HOMEPAGE_CATEGORY_IMAGE_KEYS,
} from '@/lib/categories'
import {
  getProductCardImages,
  getProductCardIsNew,
  getProductCardPricing,
  getProductCardSlug,
  getProductCardStockQuantity,
  getProductCardType,
} from '@/lib/product-card'
import {
  type CSSProperties,
  type FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from 'react'
import Footer from '../components/Footer'
import { useCart } from '../lib/cart-context'

interface Product {
  id: string
  name: string
  slug?: string | null
  description?: string | null
  price: number
  sale_price?: number | null
  images: string[]
  image?: string | null
  artisan?: string | null
  category?: string | null
  stock?: number | null
  originalPrice?: number | null
  isNew?: boolean
  fulfillmentType?: string | null
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
  fallbackProducts?: Product[]
  fallbackCategories?: Partial<Category>[]
}

interface SiteImageRow {
  key: string
  image_url?: string | null
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

const CATEGORY_CARD_GRADIENTS: Record<string, string> = {
  jewellery: 'linear-gradient(160deg, #C0392B, #5D1F0D)',
  accessories: 'linear-gradient(160deg, #2C1810, #8B5E3C)',
  'african-wear': 'linear-gradient(160deg, #0e0e0e, #3D1F0D)',
  'home-living': 'linear-gradient(160deg, #8B5E3C, #3D1F0D)',
  'art-craft': 'linear-gradient(160deg, #2b2119, #5f3d24)',
  'gifted-carry': 'linear-gradient(160deg, #4a2a1d, #8B5E3C)',
}

const CATEGORY_CARD_CLASSES: Record<string, string> = {
  jewellery: 'md:col-[1] md:row-[1/3]',
  accessories: 'md:col-[2] md:row-[1]',
  'african-wear': 'md:col-[3] md:row-[1]',
  'home-living': 'md:col-[2/4] md:row-[2]',
  'art-craft': 'md:col-[1] md:row-[3]',
  'gifted-carry': 'md:col-[2/4] md:row-[3]',
}

const CATEGORY_CARD_MOBILE_HEIGHTS: Record<string, string> = {
  jewellery: '50vw',
  accessories: '56vw',
  'african-wear': '64vw',
  'home-living': '52vw',
  'art-craft': '54vw',
  'gifted-carry': '54vw',
}

const CATEGORY_BLUEPRINTS: CategoryBlueprint[] = CATEGORIES.map((category) => ({
  key: category.slug,
  title: category.name,
  href: buildShopHref(category.name),
  aliases: [category.slug, category.name.toLowerCase()],
  subcategories: category.subcategories.slice(0, 3).map((subcategory) => subcategory.name),
  gradient: CATEGORY_CARD_GRADIENTS[category.slug] || 'linear-gradient(160deg, #2C1810, #8B5E3C)',
  cardClass: CATEGORY_CARD_CLASSES[category.slug] || '',
  mobileHeight: CATEGORY_CARD_MOBILE_HEIGHTS[category.slug] || '52vw',
}))

const MOBILE_CATEGORY_ORDER = ['jewellery', 'accessories', 'african-wear', 'home-living'] as const

const MOBILE_CATEGORY_FALLBACK_GRADIENTS: Record<string, string> = {
  jewellery: 'linear-gradient(145deg, #C0392B 0%, #3D1F0D 100%)',
  accessories: 'linear-gradient(145deg, #1c1c1c 0%, #3D1F0D 100%)',
  'african-wear': 'linear-gradient(145deg, #8B5E3C 0%, #1a0e08 100%)',
  'home-living': 'linear-gradient(145deg, #1a3a2a 0%, #2E7D32 100%)',
}

const MOBILE_CATEGORY_LAYOUT: Record<string, { height: string; maxHeight: string }> = {
  jewellery: { height: '72vw', maxHeight: '340px' },
  accessories: { height: '64vw', maxHeight: '300px' },
  'african-wear': { height: '54vw', maxHeight: '260px' },
  'home-living': { height: '46vw', maxHeight: '220px' },
}

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
    'Every bead is placed with intention. This is not a product - it is a piece of Kenya.',
  author: 'Sharon · Lead Designer, Nairobi',
  link_text: 'MEET OUR MAKERS →',
  link_href: '/artisans',
}

const FALLBACK_CATEGORY_IMAGE_LOOKUP = {
  [HOMEPAGE_CATEGORY_IMAGE_KEYS.jewellery]: '/media/products/Gemini_Generated_Image_uwdxzguwdxzguwdx.png',
  [HOMEPAGE_CATEGORY_IMAGE_KEYS.accessories]: '/media/products/Gemini_Generated_Image_9vevmr9vevmr9vev.png',
  [HOMEPAGE_CATEGORY_IMAGE_KEYS['african-wear']]: '/media/products/Gemini_Generated_Image_cji2fcji2fcji2fc.png',
  [HOMEPAGE_CATEGORY_IMAGE_KEYS['home-living']]: '/media/products/Gemini_Generated_Image_xj81bfxj81bfxj81.png',
  [HOMEPAGE_CATEGORY_IMAGE_KEYS['art-craft']]: '/media/site/artisans/Gemini_Generated_Image_dvxjjhdvxjjhdvxj.png',
  [HOMEPAGE_CATEGORY_IMAGE_KEYS['gifted-carry']]: '/media/site/homepage/ai-intent-gift-it.webp',
}

const FALLBACK_CATEGORIES: Partial<Category>[] = getHomepageFallbackCategories(FALLBACK_CATEGORY_IMAGE_LOOKUP)

const HOME_SITE_IMAGE_KEYS = [
  'homepage_hero',
  'homepage_artisan_split',
  'homepage_cat_jewellery',
  'homepage_cat_accessories',
  'homepage_cat_african_wear',
  'homepage_cat_home_living',
  'homepage_cat_art_craft',
  'homepage_cat_gifted_carry',
]

function buildSiteImageLookup(rows: SiteImageRow[] = []) {
  return rows.reduce<Record<string, string>>((acc, row) => {
    if (row?.key && row?.image_url) {
      acc[row.key] = row.image_url
    }
    return acc
  }, {})
}

function resolveHomepageCategorySlot(category: Partial<Category>) {
  const categorySlug = getCategorySlug(String(category.name || category.id || ''))
  return HOMEPAGE_CATEGORY_IMAGE_KEYS[categorySlug as keyof typeof HOMEPAGE_CATEGORY_IMAGE_KEYS] || ''
}

function applyHomepageCategoryImages(
  categories: Partial<Category>[],
  siteImageLookup: Record<string, string>,
) {
  return categories.map((category) => {
    const slotKey = resolveHomepageCategorySlot(category)
    const overrideImage = slotKey ? siteImageLookup[slotKey] : ''

    if (!overrideImage) {
      return category
    }

    return {
      ...category,
      image_url: overrideImage,
    }
  })
}

function withFallbackCategoryImages(
  categories: Partial<Category>[],
  fallbackSource: Partial<Category>[],
) {
  return CATEGORY_BLUEPRINTS.map((blueprint) => {
    const categoryMatch = findCategoryForBlueprint(categories, blueprint)
    const fallbackMatch = findCategoryForBlueprint(fallbackSource, blueprint)

    if (!categoryMatch) {
      return fallbackMatch || null
    }

    return {
      ...categoryMatch,
      image_url:
        normalizeImage(categoryMatch.image_url) || normalizeImage(fallbackMatch?.image_url),
    }
  }).filter(Boolean) as Partial<Category>[]
}

const FALLBACK_PRODUCTS: Product[] = [
  {
    id: 'uhuru-home-set',
    name: 'Uhuru Home Set',
    slug: 'uhuru-home-set',
    price: 6800,
    images: ['/media/products/Jewellery.jpg'],
    artisan: 'Sharon',
  },
  {
    id: 'sunburst-cascade-necklace',
    name: 'Sunburst Cascade Necklace',
    slug: 'sunburst-cascade-necklace',
    price: 3200,
    images: ['/media/products/1777391299524-Bracelet-damiti-dt-meilleurs-bracelets-ami-par.jpg'],
    artisan: 'Sharon',
  },
  {
    id: 'malkia-collar',
    name: 'Malkia Collar',
    slug: 'malkia-collar',
    price: 2900,
    images: ['/media/products/1777501795839-pomelli_photoshoot_image_1_1_0430.png'],
    artisan: 'Sharon',
  },
  {
    id: 'kenya-pride-bracelet',
    name: 'Kenya Pride Bracelet',
    slug: 'kenya-pride-bracelet',
    price: 900,
    images: ['/media/products/12 Afro-Modern Home Essentials for a Stylish, Culturally Grounded Space.jpg'],
    artisan: 'Sharon',
  }
]

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

const useScrollReveal = (dependencies: React.DependencyList = []) => {
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
  }, dependencies)
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
      name: blueprint.title,
      image_url: normalizeImage(match?.image_url),
      subcategories:
        Array.isArray(match?.subcategories) && match?.subcategories.length > 0
          ? match.subcategories.map((item) => compact(item)).filter(Boolean)
          : blueprint.subcategories,
      href:
        match?.name ? buildShopHref(compact(match.name)) : blueprint.href,
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
      name: blueprint.title,
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

const MOBILE_CATEGORY_FALLBACKS: Record<string, string> = {
  'jewellery': 'linear-gradient(145deg, #C0392B 0%, #3D1F0D 100%)',
  'accessories': 'linear-gradient(145deg, #1c1c1c 0%, #3D1F0D 100%)',
  'african-wear': 'linear-gradient(145deg, #8B5E3C 0%, #1a0e08 100%)',
  'home-living': 'linear-gradient(145deg, #1a3a2a 0%, #2E7D32 100%)',
}

function MobileCategory({
  category,
  href,
  index,
  rowIndex,
}: {
  category: Partial<Category>
  href: string
  index: number
  rowIndex: number
}) {
  const ref = useRef<HTMLAnchorElement | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isPressed, setIsPressed] = useState(false)
  
  const categorySlug = getCategorySlug(String(category.name || '')).toLowerCase()
  const fallbackGradient = MOBILE_CATEGORY_FALLBACKS[categorySlug as keyof typeof MOBILE_CATEGORY_FALLBACKS] || 'linear-gradient(145deg, #1c1c1c 0%, #3D1F0D 100%)'
  
  const imageAlt = `${category.name} SharonCraft collection`
  const subcatsDisplay = (category.subcategories || []).slice(0, 3).join(' · ')
  
  const delayMs = (rowIndex === 3 ? index + 2 : rowIndex) * 60
  const animationStyle = isVisible ? {
    opacity: 1,
    transform: 'translateY(0)',
  } : {
    opacity: 0,
    transform: 'translateY(20px)',
  }

  useEffect(() => {
    if (!ref.current) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delayMs)
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [delayMs])

  return (
    <Link
      href={href}
      ref={ref}
      className="block relative overflow-hidden text-inherit no-underline"
      style={{
        transition: 'opacity 0.5s ease, transform 0.5s ease',
        ...animationStyle,
      }}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          overflow: 'hidden',
          background: fallbackGradient,
          transform: isPressed ? 'scale(0.98)' : 'scale(1)',
          transition: isPressed ? '0.2s ease' : '0.3s ease',
        }}
        className={rowIndex === 0 ? 'mobile-cat-hero-1' : rowIndex === 1 ? 'mobile-cat-hero-2' : rowIndex === 2 ? 'mobile-cat-left' : 'mobile-cat-right'}
      >
        {/* Image */}
        {category.image_url ? (
          <Image
            src={category.image_url}
            alt={imageAlt}
            fill
            sizes="100vw"
            style={{
              objectFit: 'cover',
              objectPosition: 'center top',
            }}
            className="absolute inset-0"
          />
        ) : null}

        {/* Overlay gradient */}
        <div
          className="pointer-events-none absolute inset-0 z-[1]"
          style={{
            background: 'linear-gradient(to top, rgba(8,8,8,0.82) 0%, rgba(8,8,8,0.3) 35%, rgba(8,8,8,0) 60%)',
          }}
        />

        {/* Content */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] px-[18px] pb-5 pt-4"
          style={{
            padding: '16px 18px 20px',
          }}
        >
          <span
            style={{
              fontSize: rowIndex === 0 || rowIndex === 1 ? '22px' : '18px',
              fontWeight: 300,
              color: '#ffffff',
              display: 'block',
              marginBottom: '3px',
              letterSpacing: '0.2px',
            }}
          >
            {category.name}
          </span>
          {subcatsDisplay && (
            <span
              style={{
                fontSize: '9px',
                letterSpacing: '2.5px',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.45)',
                display: 'block',
              }}
            >
              {subcatsDisplay}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
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
        'md:h-full min-h-0',
        'max-md:h-[150px]',
        category.cardClass,
        'md:[&:first-child]:min-h-[523px]',
        'category-card-mobile',
      ].join(' ')}
      style={
        {
          transitionDelay,
          '--mobile-height': category.mobileHeight,
        } as React.CSSProperties
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
              className="object-cover object-top transition-transform duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-105 max-md:duration-[280ms] max-md:ease-out"
            />
          ) : (
            <div className="h-full w-full" style={{ background: category.gradient }} />
          )}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(to_top,rgba(8,8,8,0.75)_0%,rgba(8,8,8,0.1)_45%,transparent_65%)] transition-opacity duration-500 ease-out group-hover:opacity-90 max-md:duration-[280ms]" />

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
          Explore →
        </span>
      </div>
    </Link>
  )
}


export default function HomePage({
  initialProducts,
  initialCategories,
  initialHeroSlide,
  initialArtisanData,
  fallbackProducts = [],
  fallbackCategories = [],
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

  useScrollReveal([loading])

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
          .select('id, name, image_url, is_visible, display_order')
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
          .from('artisans')
          .select('name, image_url, bio, specialty')
          .eq('is_featured', true)
          .eq('is_visible', true)
          .limit(1)
          .maybeSingle()

        const siteImagesPromise = supabase
          .from('site_images')
          .select('key, image_url')
          .in('key', HOME_SITE_IMAGE_KEYS)

        const [featuredRes, categoriesRes, heroSlidesRes, heroFeaturedRes, artisanRes, siteImagesRes] = await Promise.all([
          featuredPromise,
          categoriesPromise,
          heroSlidesPromise,
          heroFeaturedPromise,
          artisanPromise,
          siteImagesPromise,
        ])

        const siteImageLookup = buildSiteImageLookup(
          (siteImagesRes?.data || []) as SiteImageRow[],
        )
        const homepageHeroImage = siteImageLookup.homepage_hero
        const homepageArtisanImage = siteImageLookup.homepage_artisan_split

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
          } else {
            setProducts(fallbackProducts.length > 0 ? fallbackProducts : FALLBACK_PRODUCTS)
          }

          const fetchedCategories = (categoriesRes?.data || []) as Partial<Category>[]
          if (fetchedCategories.length > 0) {
            const fallbackCategorySource =
              fallbackCategories.length > 0 ? fallbackCategories : FALLBACK_CATEGORIES
            // Patch missing images in Supabase with local fallback images so the design doesn't break
            const patchedCategories = withFallbackCategoryImages(
              fetchedCategories,
              fallbackCategorySource,
            )
            const slotAwareCategories = applyHomepageCategoryImages(
              patchedCategories,
              siteImageLookup,
            )
            setCategories(mergeCategoryData(slotAwareCategories, fallbackCategorySource))
          } else {
            const fallbackCategorySource =
              fallbackCategories.length > 0 ? fallbackCategories : FALLBACK_CATEGORIES
            setCategories(
              applyHomepageCategoryImages(fallbackCategorySource, siteImageLookup),
            )
          }

          if (homepageHeroImage) {
            const baseSlide =
              (Array.isArray(heroSlidesRes?.data) && heroSlidesRes.data[0]) ||
              FALLBACK_HERO
            setHeroSlides([
              {
                ...baseSlide,
                image_url: homepageHeroImage,
              } as HeroSlide,
            ])
          } else if (Array.isArray(heroSlidesRes?.data) && heroSlidesRes.data.length > 0) {
            setHeroSlides(heroSlidesRes.data as HeroSlide[])
          }

          if (heroFeaturedRes?.data) {
            setFeaturedHeroProduct(normalizeProduct(heroFeaturedRes.data as Partial<Product>))
          } else if (nextProducts.length > 0) {
            setFeaturedHeroProduct(nextProducts[0])
          } else {
            const fallbackProd = fallbackProducts.length > 0 ? fallbackProducts[0] : FALLBACK_PRODUCTS[0]
            setFeaturedHeroProduct(fallbackProd)
          }

          if (artisanRes?.data) {
            setArtisanData({
              image_url:
                homepageArtisanImage ||
                artisanRes.data.image_url ||
                FALLBACK_ARTISAN.image_url,
              quote: artisanRes.data.bio || FALLBACK_ARTISAN.quote,
              author: `${artisanRes.data.name} · ${artisanRes.data.specialty || 'SharonCraft Artisan'}`,
              link_text: 'MEET OUR MAKERS →',
              link_href: '/artisans'
            })
          } else {
            setArtisanData({
              ...FALLBACK_ARTISAN,
              image_url: homepageArtisanImage || FALLBACK_ARTISAN.image_url,
            })
          }
        }
      } catch (err) {
        if (!cancelled) {
          setProducts(fallbackProducts.length > 0 ? fallbackProducts : FALLBACK_PRODUCTS)
          setCategories(fallbackCategories.length > 0 ? fallbackCategories : FALLBACK_CATEGORIES)
          setArtisanData(FALLBACK_ARTISAN)
          setFeaturedHeroProduct(fallbackProducts.length > 0 ? fallbackProducts[0] : FALLBACK_PRODUCTS[0])
        }
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
  const mobileCategories = useMemo(
    () =>
      MOBILE_CATEGORY_ORDER
        .map((key) => categoryCards.find((category) => category.key === key))
        .filter(
          (category): category is ReturnType<typeof normalizeCategories>[number] => Boolean(category),
        ),
    [categoryCards],
  )
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

  return (
    <>
      <SeoHead
        title="Handmade Kenyan Jewelry - Nairobi"
        description="Shop authentic handmade Kenyan jewelry by Nairobi artisans. Maasai beaded earrings, necklaces, bracelets and accessories made to order. Free delivery in Nairobi."
        keywords="handmade jewelry Nairobi, Maasai beaded jewelry Kenya, Kenyan artisan jewelry, African jewelry Kenya, beaded earrings Kenya, custom jewelry Nairobi, handmade accessories Kenya, Maasai bracelets, SharonCraft"
        path="/"
        image="/logo-og.png"
      />

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
                  <div className="hidden md:block">
                <p className="reveal mb-6 px-0 text-[10px] uppercase tracking-[4px] text-[#bbb]">
                  Our Collections
                </p>

                {loading ? (
                  <div className="grid grid-cols-[1.5fr_1fr_1fr] grid-rows-[280px_240px] gap-[3px] overflow-hidden px-0">
                    {CATEGORY_BLUEPRINTS.map((category) => (
                      <div
                        key={category.key}
                        className={['relative overflow-hidden skeleton-category', category.cardClass].join(' ')}
                        style={{ background: category.gradient }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-[1.5fr_1fr_1fr] grid-rows-[280px_240px] gap-[3px] overflow-hidden px-0">
                    {categoryCards.map((category, index) => (
                      <CategoryCard key={category.key} category={category} index={index} />
                    ))}
                  </div>
                )}
              </div>

              <div className="md:hidden">
                <div
                  className="reveal"
                  style={{ padding: '32px 20px 20px' }}
                >
                  <span className="mb-1 block text-[11px] uppercase tracking-[5px] text-[#bbb]">
                    OUR COLLECTIONS
                  </span>
                  <span className="block text-[18px] font-light leading-[1.1] text-[#1c1c1c]">
                    Browse the collection
                  </span>
                </div>

                <div className="space-y-[3px]">
                  {loading ? (
                    [
                      { key: 'jewellery', height: '72vw', maxHeight: '340px' },
                      { key: 'accessories', height: '64vw', maxHeight: '300px' },
                      { key: 'african-wear', height: '54vw', maxHeight: '260px' },
                      { key: 'home-living', height: '46vw', maxHeight: '220px' },
                    ].map((item) => (
                      <div
                        key={item.key}
                        className="relative overflow-hidden"
                        style={{
                          width: '100%',
                          height: item.height,
                          maxHeight: item.maxHeight,
                          background: MOBILE_CATEGORY_FALLBACK_GRADIENTS[item.key] || '#d7d0c8',
                        }}
                      />
                    ))
                  ) : (
                    mobileCategories.map((category, index) => {
                      const layout = MOBILE_CATEGORY_LAYOUT[category.key] || {
                        height: '52vw',
                        maxHeight: '260px',
                      }
                      const sublabel = Array.isArray(category.subcategories) && category.subcategories.length > 0
                        ? category.subcategories.slice(0, 3).join(' · ')
                        : 'Handcrafted Pieces'
                      const fallbackGradient = MOBILE_CATEGORY_FALLBACK_GRADIENTS[category.key] || category.gradient

                      return (
                        <Link
                          key={category.key}
                          href={category.href}
                          className="reveal mobile-collection-card relative block overflow-hidden text-inherit no-underline"
                          style={{
                            width: '100%',
                            height: layout.height,
                            maxHeight: layout.maxHeight,
                            transition: 'transform 0.2s ease',
                            transitionDelay: `${index * 60}ms`,
                          }}
                          onTouchStart={(event) => {
                            event.currentTarget.style.transform = 'scale(0.98)'
                          }}
                          onTouchEnd={(event) => {
                            event.currentTarget.style.transform = 'scale(1)'
                          }}
                        >
                          <div
                            className="relative h-full w-full"
                            style={{ background: category.image_url ? undefined : fallbackGradient }}
                          >
                            {category.image_url ? (
                              <Image
                                src={category.image_url}
                                alt={`${category.name} collection`}
                                fill
                                sizes="100vw"
                                className="object-cover"
                                style={{ objectPosition: 'center top' }}
                              />
                            ) : null}

                            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(8,8,8,0.82)_0%,rgba(8,8,8,0.3)_35%,rgba(8,8,8,0)_60%)]" />

                            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] px-[18px] pb-5 pt-4">
                              <span className="block text-[22px] font-light tracking-[0.2px] text-white">
                                {category.name}
                              </span>
                              <span className="mt-[3px] block text-[9px] uppercase tracking-[2.5px] text-white/45">
                                {sublabel}
                              </span>
                            </div>
                          </div>
                        </Link>
                      )
                    })
                  )}
                </div>

                <div className="px-[20px] pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] tracking-[1px] text-[#bbb]">6 collections</span>
                    <Link
                      href="/shop"
                      className="text-[10px] uppercase tracking-[2px] text-[#1c1c1c] border-b border-[#1c1c1c] pb-[2px]"
                    >
                      View all →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4 â€” Featured Products */}
          <section className="relative z-0 isolate bg-[#fafaf8] px-10 py-20 max-md:px-5 max-md:py-12">
            <div className="mx-auto max-w-[1320px]">
              <div className="mb-10 flex items-baseline justify-between gap-5">
                <div className="reveal">
                  <p className="mb-3 text-[10px] uppercase tracking-[4px] text-[#bbb] max-md:text-[11px] max-md:tracking-[3px]">
                    Our Pieces
                  </p>
                  <h2 className="text-[24px] max-md:text-[20px] font-light leading-[1.2] text-[#1c1c1c]">
                    Handmade in Nairobi
                  </h2>
                </div>
                <Link
                  href="/shop"
                  className="reveal border-b border-[#1c1c1c] pb-[3px] text-[10px] uppercase tracking-[3px] text-[#1c1c1c] transition-opacity duration-200 ease-out hover:opacity-50"
                >
                  View all →
                </Link>
              </div>

              {loading ? (
                <div className="grid grid-cols-3 gap-5 max-md:grid-cols-2 max-md:gap-[10px] px-0 max-md:px-[16px]">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={`product-skeleton-${index}`} className={index === 3 ? 'md:hidden' : ''}>
                      <ProductCardSkeleton />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-5 max-md:grid-cols-2 max-md:gap-[10px] px-0 max-md:px-[16px]">
                  {desktopProducts.map((product, index) => (
                    <CardWrapper key={product.id} delay={(index % 3) * 80}>
                      {(() => {
                        const pricing = getProductCardPricing(product)
                        return (
                      <ProductCard 
                        id={product.id}
                        name={product.name}
                        price={pricing.price}
                        original_price={pricing.original_price}
                        images={getProductCardImages(product)}
                        artisan={product.artisan}
                        category={product.category}
                        slug={getProductCardSlug(product)}
                        is_new={getProductCardIsNew(product)}
                        product_type={getProductCardType(product)}
                        stock_quantity={getProductCardStockQuantity(product)}
                        size="default"
                      />
                        )
                      })()}
                    </CardWrapper>
                  ))}
                  {mobileOnlyProduct ? (
                    <div className="md:hidden">
                      <CardWrapper key={mobileOnlyProduct.id} delay={3 * 80}>
                        {(() => {
                          const pricing = getProductCardPricing(mobileOnlyProduct)
                          return (
                        <ProductCard 
                          id={mobileOnlyProduct.id}
                          name={mobileOnlyProduct.name}
                          price={pricing.price}
                          original_price={pricing.original_price}
                          images={getProductCardImages(mobileOnlyProduct)}
                          artisan={mobileOnlyProduct.artisan}
                          category={mobileOnlyProduct.category}
                          slug={getProductCardSlug(mobileOnlyProduct)}
                          is_new={getProductCardIsNew(mobileOnlyProduct)}
                          product_type={getProductCardType(mobileOnlyProduct)}
                          stock_quantity={getProductCardStockQuantity(mobileOnlyProduct)}
                          size="default"
                        />
                          )
                        })()}
                      </CardWrapper>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </section>

          {/* Section 5 — Artisan */}
          <section className="relative z-0 isolate overflow-hidden bg-[#fafaf8] py-24 max-md:py-16">
            <div className="mx-auto max-w-[1200px] px-10 max-md:px-5">
              <div className="relative flex items-center max-md:flex-col max-md:items-start">
                
                {/* Image Section */}
                <div className="relative w-[60%] min-h-[500px] overflow-hidden max-md:w-full max-md:min-h-[400px]">
                  <div
                    ref={artisanParallaxRef}
                    className="absolute inset-x-0 -top-[10%] h-[120%] will-change-transform max-md:top-0 max-md:h-full"
                  >
                    {artisanImage ? (
                      <Image
                        src={artisanImage}
                        alt="SharonCraft artisan portrait"
                        fill
                        sizes="(max-width:768px) 100vw, 60vw"
                        className="object-cover object-center transition-transform duration-[20s] ease-linear hover:scale-110 animate-[slowPan_20s_infinite_alternate]"
                      />
                    ) : (
                      <div className="h-full w-full bg-[linear-gradient(160deg,#0e0a08_0%,#1a0e08_50%,#3D1F0D_100%)]" />
                    )}
                  </div>
                </div>

                {/* Text Box Section (Overlapping) */}
                <div className="reveal-right relative z-10 -ml-[10%] w-[50%] bg-white p-16 shadow-[0_20px_40px_rgba(0,0,0,0.06)] max-md:ml-0 max-md:-mt-12 max-md:w-[95%] max-md:p-8">
                  <p className="mb-4 text-[9px] uppercase tracking-[5px] text-[#8B5E3C] max-md:tracking-[3px]">
                    The Maker
                  </p>
                  
                  {/* Handwritten Signature Style */}
                  <h3 className="mb-6 font-serif text-[42px] italic text-[#1c1c1c] opacity-90 max-md:text-[32px]">
                    {artisanAuthor.split('·')[0]?.trim()}
                  </h3>

                  <blockquote
                    className="mb-8 text-[18px] font-light leading-[1.8] text-[#1c1c1c] max-md:text-[15px]"
                  >
                    "{artisanQuote}"
                  </blockquote>
                  
                  <div className="flex flex-col gap-4">
                    <p className="text-[10px] uppercase tracking-[3px] text-[#bbb]">
                      {artisanAuthor.split('·')[1]?.trim() || 'Lead Artisan'}
                    </p>
                    <div className="mt-2 flex items-center gap-6 max-md:flex-col max-md:items-start max-md:gap-4">
                      <Link
                        href="/shop"
                        className="inline-flex h-11 items-center justify-center bg-[#1c1c1c] px-8 text-[9px] uppercase tracking-[3px] text-white transition-colors duration-300 hover:bg-[#8B5E3C]"
                      >
                        Shop Their Pieces
                      </Link>
                      <Link
                        href={artisanLinkHref}
                        className="border-b border-[#1c1c1c] pb-[2px] text-[9px] uppercase tracking-[3px] text-[#1c1c1c] transition-opacity duration-200 hover:opacity-50"
                      >
                        Read Story
                      </Link>
                    </div>
                  </div>
                </div>

              </div>
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

      </div>

      <style jsx global>{`
        body.homepage-refactor {
          background: #fafaf8;
          color: #1c1c1c;
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
          width: 100%;
          min-height: 640px;
          overflow: hidden;
          background: #fafaf8;
        }

        .home-hero__desktop {
          display: grid;
          width: 100%;
          min-width: 0;
          height: calc(100vh - var(--announcement-height));
          min-height: 640px;
          grid-template-columns: 45% 55%;
          background: #fafaf8;
        }

        .home-hero__copy {
          position: relative;
          height: 100%;
          z-index: 2;
          display: flex;
          overflow: visible;
          flex-direction: column;
          justify-content: flex-end;
          background: #fafaf8;
          padding: 0 56px 118px 56px;
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
          top: calc(var(--nav-height) + 22px);
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
          bottom: 38px;
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
          bottom: 38px;
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
          height: 100%;
          overflow: hidden;
          min-height: 640px;
          z-index: 1;
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
          width: 118px;
          z-index: 2;
          background: linear-gradient(to right, #fafaf8 0%, rgba(250, 250, 248, 0.56) 42%, transparent 100%);
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
          bottom: 110px;
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

        /* Category Card Mobile Animations */
        @keyframes cardFadeSlide {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Apply stagger animation to mobile category cards */
        @media (max-width: 767px) {
          .category-card-mobile {
            animation: cardFadeSlide 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
            opacity: 0;
          }

          .category-card-mobile:nth-child(1) {
            animation-delay: 0ms;
          }

          .category-card-mobile:nth-child(2) {
            animation-delay: 80ms;
          }

          .category-card-mobile:nth-child(3) {
            animation-delay: 160ms;
          }

          .category-card-mobile:nth-child(4) {
            animation-delay: 240ms;
          }

          /* Mobile tap feedback */
          .category-card-mobile:active .absolute {
            transform: scale(1.02);
            transition: transform 120ms ease-out;
          }
        }

        /* Hover effects for desktop and touch-capable devices */
        @media (hover: hover) {
          .group:has(.category-card-mobile):hover .group-hover\:scale-105 {
            transition: transform 280ms ease-out, opacity 280ms ease-out;
          }

          .category-card-mobile:hover .absolute:first-child {
            opacity: 0.95;
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

        @keyframes slowPan {
          from {
            transform: scale(1);
          }
          to {
            transform: scale(1.15);
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
            width: 100%;
            min-width: 0;
            min-height: 600px;
            height: 100svh;
            overflow: hidden;
            background: #080808;
          }

          .home-hero__mobile-media {
            position: absolute;
            inset: 0;
            width: 100%;
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

          .home-hero__copy-inner,
          .home-hero__scroll,
          .home-hero__stats,
          .home-hero__tag,
          .home-hero__eyebrow-text,
          .home-hero__title-line,
          .home-hero__title-caption,
          .home-hero__description,
          .home-hero__actions,
          .home-hero__mobile-eyebrow,
          .home-hero__mobile-title span,
          .home-hero__mobile-description,
          .home-hero__mobile-actions {
            opacity: 1 !important;
            transform: none !important;
          }

          .home-hero__image-layer {
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
    const fallbackProductsData = (featuredProducts.length > 0 ? featuredProducts : visibleProducts)
      .slice(0, 4)
      .map((product: any) => ({
        id: product?.id || '',
        name: product?.name || '',
        slug:
          compact(product?.slug) ||
          slugify(compact(product?.name) || 'piece'),
        description: product?.description || product?.shortDescription || '',
        price: Number(product?.price || 0),
        images: Array.isArray(product?.images) ? product.images : [],
        artisan: product?.artisan || '',
        is_visible: true,
        is_featured: true,
      }))

    const fallbackCategoriesData = getHomepageFallbackCategories({
      homepage_cat_jewellery: siteImages?.collectionJewellery || '',
      homepage_cat_accessories: siteImages?.collectionAccessories || '',
      homepage_cat_african_wear: siteImages?.collectionBridal || '',
      homepage_cat_home_living: siteImages?.collectionHome || '',
      homepage_cat_art_craft: '/media/site/artisans/Gemini_Generated_Image_dvxjjhdvxjjhdvxj.png',
      homepage_cat_gifted_carry: '/media/site/homepage/ai-intent-gift-it.webp',
    })

    return {
      props: {
        initialProducts: [], // Start empty so the client fetches live data without UI flicker
        initialCategories: [],
        initialHeroSlide: siteImages?.heroImage
          ? {
              ...FALLBACK_HERO,
              image_url: siteImages.heroImage,
            }
          : null,
        initialArtisanData: siteImages?.artisanPortrait
          ? {
              ...FALLBACK_ARTISAN,
              image_url: siteImages.artisanPortrait,
            }
          : null,
        fallbackProducts: fallbackProductsData,
        fallbackCategories: fallbackCategoriesData,
      },
      revalidate: 1,
    }
  } catch (err) {
    return {
      props: {
        initialProducts: [],
        initialCategories: [],
        initialHeroSlide: null,
        initialArtisanData: null,
        fallbackProducts: [],
        fallbackCategories: [],
      },
      revalidate: 1,
    }
  }
}
