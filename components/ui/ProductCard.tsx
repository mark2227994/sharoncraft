'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { getStockStatus } from '@/lib/utils'

interface ProductCardProps {
  id: string
  name: string
  price: number
  original_price?: number
  images: string[]
  artisan?: string | null
  category?: string | null
  slug: string
  is_new?: boolean
  is_featured?: boolean
  product_type?: 'ready_to_ship' | 'made_to_order' | 'custom_order' | string
  stock_quantity?: number
  low_stock_alert?: number
  size?: 'default' | 'small' | 'large'
  showArtisan?: boolean
  onOpen?: () => void
}

const SIZE_MAP = {
  default: {
    aspectRatio: '1 / 1.25',
    nameSize: '14px',
    priceSize: '14px',
    artisanSize: '10px',
    nameClamp: 2,
  },
  small: {
    aspectRatio: '1 / 1.2',
    nameSize: '12px',
    priceSize: '12px',
    artisanSize: '0px',
    nameClamp: 1,
  },
  large: {
    aspectRatio: '1 / 1.35',
    nameSize: '15px',
    priceSize: '15px',
    artisanSize: '10px',
    nameClamp: 2,
  },
} as const

function compact(value: unknown) {
  if (typeof value === 'string') return value.trim()
  if (typeof value === 'number') return String(value)
  return ''
}

function normalizeImage(value: unknown) {
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
  return source.startsWith('/') ? source : `/${source}`
}

function isModelShot(source: string) {
  return /model|wear|worn|portrait|lookbook|body|editorial/i.test(source)
}

export default function ProductCard({
  id,
  name,
  price,
  original_price,
  images,
  artisan,
  category,
  slug,
  is_new = false,
  product_type = 'ready_to_ship',
  stock_quantity = 1,
  low_stock_alert = 2,
  size = 'default',
  showArtisan = true,
  onOpen,
}: ProductCardProps) {
  const [hovered, setHovered] = useState(false)
  const [supportsHover, setSupportsHover] = useState(false)
  const [erroredImages, setErroredImages] = useState<Record<number, boolean>>({})

  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    const mediaQuery = window.matchMedia('(hover: hover) and (pointer: fine)')
    const syncHoverSupport = () => setSupportsHover(mediaQuery.matches)

    syncHoverSupport()

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', syncHoverSupport)
      return () => mediaQuery.removeEventListener('change', syncHoverSupport)
    }

    mediaQuery.addListener(syncHoverSupport)
    return () => mediaQuery.removeListener(syncHoverSupport)
  }, [])

  const cardSize = SIZE_MAP[size] ?? SIZE_MAP.default
  const safeName = compact(name) || 'SharonCraft Piece'
  const safeSlug = compact(slug) || compact(id) || 'piece'
  const rawArtisan = artisan?.trim() || 'Sharon'
  const cleanArtisan = rawArtisan.replace(/^(by\s+)+/i, '')
  const safeArtisan = cleanArtisan.replace(/[^a-zA-Z\s-]/g, '') || 'Sharon'
  const safeImages = useMemo(
    () => (Array.isArray(images) ? images.map((image) => normalizeImage(image)).filter(Boolean) : []),
    [images],
  )
  const primaryImage = safeImages[0] || ''
  const secondaryImage = safeImages[1] || ''
  const hasSecondImage = Boolean(secondaryImage)
  
  const displayPrice = Number(price || 0).toLocaleString('en-KE')
  const displayOriginal =
    typeof original_price === 'number'
      ? Number(original_price).toLocaleString('en-KE')
      : undefined

  const isOnSale = typeof original_price === 'number' && original_price > price
  const stockStatus = useMemo(
    () =>
      getStockStatus({
        product_type,
        stock_quantity,
        low_stock_alert,
      }),
    [low_stock_alert, product_type, stock_quantity],
  )
  const customStatusColor = useMemo(() => {
    if (stockStatus.type === 'mto') return '#8B5E3C' // Savanna clay terracotta
    if (stockStatus.type === 'low') return '#D35400' // Burnt orange
    if (stockStatus.type === 'in_stock') return '#2E7D32' // Forest green
    return '#666666' // Darker grey for better visibility
  }, [stockStatus.type])
  const normalizedType = stockStatus.productType
  const isLowStock = stockStatus.isLowStock
  const isOutOfStock = stockStatus.isOutOfStock
  const primaryObjectFit = isModelShot(primaryImage) ? 'cover' : 'contain'
  const secondaryObjectFit = isModelShot(secondaryImage) ? 'cover' : 'contain'
  const isInteractiveHover = supportsHover && hovered
  const shouldRenderHoverImage = supportsHover && hasSecondImage

  const showArtisanLine = showArtisan && size !== 'small'
  const showTypeTag = size !== 'small'
  const showStockDot =
    normalizedType === 'ready_to_ship' && !isOutOfStock

  const handleImageError = (index: number) => {
    setErroredImages((current) => ({
      ...current,
      [index]: true,
    }))
  }

  return (
    <Link
      href={`/product/${safeSlug}`}
      className="product-card-link"
      aria-label={`View ${safeName}`}
      onClick={onOpen}
      style={{ textDecoration: 'none' }}
    >
      <article
        className="product-card"
        data-size={size}
        onMouseEnter={() => {
          if (supportsHover) setHovered(true)
        }}
        onMouseLeave={() => {
          if (supportsHover) setHovered(false)
        }}
        style={{
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          background: '#ffffff',
          border: '1px solid rgba(96, 52, 20, 0.125)',
          borderRadius: '6px',
          boxShadow: isInteractiveHover ? '0 12px 28px rgba(96, 52, 20, 0.08)' : '0 4px 14px rgba(96, 52, 20, 0.02)',
          transform: isInteractiveHover ? 'translateY(-4px)' : 'translateY(0)',
          transition: 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          overflow: 'hidden',
        }}
      >
        <div
          className="product-card__image product-card-image"
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: cardSize.aspectRatio,
            overflow: 'hidden',
            background: '#F5F0EB',
            flexShrink: 0,
          }}
        >
          <div
            className="product-card__image-frame"
            style={{
              position: 'absolute',
              inset: 0,
              padding: '14px',
              transition: 'opacity 0.55s ease, transform 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              opacity: isInteractiveHover && hasSecondImage ? 0 : 1,
              transform: isInteractiveHover ? 'scale(1.04)' : 'scale(1)',
            }}
          >
            {primaryImage && !erroredImages[0] ? (
              <Image
                src={primaryImage}
                alt={safeName}
                fill
                quality={76}
                sizes={
                  size === 'small'
                    ? '(max-width: 768px) 130px, 160px'
                    : '(max-width: 768px) 50vw, 33vw'
                }
                style={{
                  objectFit: primaryObjectFit,
                  objectPosition: primaryObjectFit === 'cover' ? 'center top' : 'center',
                }}
                onError={() => handleImageError(0)}
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#F5F0EB',
                }}
              >
                <span
                  style={{
                    color: '#ccc',
                    fontSize: '11px',
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                  }}
                >
                  No image
                </span>
              </div>
            )}
          </div>

          {shouldRenderHoverImage && !erroredImages[1] ? (
            <div
              className="product-card__hover-image"
              style={{
                position: 'absolute',
                inset: 0,
                padding: secondaryObjectFit === 'contain' ? '14px' : '0',
                transition: 'opacity 0.55s ease, transform 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                opacity: isInteractiveHover ? 1 : 0,
                transform: isInteractiveHover ? 'scale(1.04)' : 'scale(1)',
              }}
            >
              <Image
                src={secondaryImage}
                alt={`${safeName} alternate view`}
                fill
                quality={76}
                sizes={
                  size === 'small'
                    ? '(max-width: 768px) 130px, 160px'
                    : '(max-width: 768px) 50vw, 33vw'
                }
                style={{
                  objectFit: secondaryObjectFit,
                  objectPosition: secondaryObjectFit === 'cover' ? 'center top' : 'center',
                }}
                onError={() => handleImageError(1)}
              />
            </div>
          ) : null}

          <div
            className="product-card__overlay"
            style={{
              position: 'absolute',
              inset: 0,
              background: isInteractiveHover ? 'rgba(28,28,28,0.12)' : 'rgba(28,28,28,0)',
              transition: 'background 0.4s ease',
              pointerEvents: 'none',
            }}
          />

          {size !== 'small' ? (
            <div
              className="product-card__view-cta"
              style={{
                position: 'absolute',
                right: 0,
                bottom: 0,
                left: 0,
                transform: isInteractiveHover ? 'translateY(0)' : 'translateY(100%)',
                transition: 'transform 0.35s cubic-bezier(0.4,0,0.2,1)',
                background: 'rgba(28,28,28,0.88)',
                color: '#ffffff',
                fontSize: '10px',
                letterSpacing: '3px',
                textTransform: 'uppercase',
                textAlign: 'center',
                padding: '12px',
                pointerEvents: 'none',
              }}
            >
              View Piece
            </div>
          ) : null}

          <div
            style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              zIndex: 2,
            }}
          >
            {is_new && !isOnSale ? (
              <span
                className="product-card__badge"
                style={{
                  background: 'rgba(252, 250, 247, 0.92)',
                  border: '1px solid rgba(139, 94, 60, 0.15)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  color: '#1c1c1c',
                  display: 'inline-block',
                  fontSize: '8px',
                  letterSpacing: '1.5px',
                  padding: '4px 10px',
                  textTransform: 'uppercase',
                  borderRadius: '2px',
                  fontWeight: 500,
                }}
              >
                New
              </span>
            ) : null}

            {isOnSale ? (
              <span
                className="product-card__badge"
                style={{
                  background: 'rgba(252, 250, 247, 0.92)',
                  border: '1px solid rgba(139, 94, 60, 0.35)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  color: '#8B5E3C',
                  display: 'inline-block',
                  fontSize: '8px',
                  letterSpacing: '1.5px',
                  padding: '4px 10px',
                  textTransform: 'uppercase',
                  borderRadius: '2px',
                  fontWeight: 500,
                }}
              >
                Sale
              </span>
            ) : null}

            {isLowStock ? (
              <span
                className="product-card__badge"
                style={{
                  background: 'rgba(252, 250, 247, 0.92)',
                  border: `1px solid ${customStatusColor}`,
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  color: customStatusColor,
                  display: 'inline-block',
                  fontSize: '8px',
                  letterSpacing: '1.5px',
                  padding: '4px 10px',
                  textTransform: 'uppercase',
                  borderRadius: '2px',
                  fontWeight: 500,
                }}
              >
                Only {stockStatus.stockQuantity} left
              </span>
            ) : null}
          </div>

          {showStockDot ? (
            <div
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                zIndex: 2,
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: customStatusColor,
                }}
              />
            </div>
          ) : null}

          {isOutOfStock ? (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(250,250,248,0.72)',
                pointerEvents: 'none',
              }}
            >
              <span
                style={{
                  background: '#ffffff',
                  border: '0.5px solid #e0e0e0',
                  color: '#bbb',
                  fontSize: '9px',
                  letterSpacing: '2px',
                  padding: '6px 14px',
                  textTransform: 'uppercase',
                }}
              >
                Out of Stock
              </span>
            </div>
          ) : null}
        </div>

        <div
          className="product-card-info product-card__info"
          style={{
            padding: size === 'small' ? '8px 10px 10px' : '12px 14px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '3px',
          }}
        >
          {showArtisanLine ? (
            <span
              className="product-card__artisan"
              style={{
                color: 'rgba(28, 28, 28, 0.55)',
                display: 'block',
                fontSize: cardSize.artisanSize,
                letterSpacing: '2px',
                textTransform: 'uppercase',
                fontWeight: 500,
              }}
            >
              By {safeArtisan}
            </span>
          ) : null}

          <span
            className="product-card__name"
            title={safeName}
            style={{
              color: '#1c1c1c',
              display: '-webkit-box',
              fontSize: cardSize.nameSize,
              fontWeight: 500,
              letterSpacing: '0.2px',
              lineHeight: '1.4',
              overflow: 'hidden',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: cardSize.nameClamp,
              minHeight: cardSize.nameClamp === 2 ? '2.8em' : '1.4em',
            }}
          >
            {safeName}
          </span>

          <div
            className="product-card__price-row"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginTop: '2px',
            }}
          >
            <span
              className="product-card__price-current price"
              style={{
                color: isOnSale ? '#C0392B' : isInteractiveHover ? '#8B5E3C' : '#1c1c1c',
                fontSize: cardSize.priceSize,
                fontWeight: 600,
                transition: 'color 0.3s ease',
              }}
            >
              KES {displayPrice}
            </span>

            {isOnSale && displayOriginal ? (
              <span
                className="product-card__price-original"
                style={{
                  color: '#777777',
                  fontSize: '11px',
                  textDecoration: 'line-through',
                }}
              >
                KES {displayOriginal}
              </span>
            ) : null}
          </div>

          {showTypeTag ? (
            <div
              className="product-card__type-row"
              style={{
                marginTop: '4px',
              }}
            >
              <span
                className="product-card__type"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  marginTop: '4px',
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    width: '5px',
                    height: '5px',
                    borderRadius: '50%',
                    background: customStatusColor,
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontSize: '10px',
                    letterSpacing: '1.05px',
                    textTransform: 'uppercase',
                    color: customStatusColor,
                    fontWeight: 600,
                  }}
                >
                  {stockStatus.label}
                </span>
              </span>
            </div>
          ) : null}
        </div>
      </article>
    </Link>
  )
}
