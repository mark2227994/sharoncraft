import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useRef, useState } from 'react';
import Footer from '../../components/Footer';
import Nav from '../../components/Nav';
import { buildShopHref } from '@/lib/categories';
import { SITE_URL } from '../../lib/constants';
import { useCart } from '../../lib/cart-context';
import siteImages from '../../data/site-images.json';
import { getProductBySlug, isPublishedProduct, normalizeProducts } from '../../lib/products';
import { readProducts } from '../../lib/store';
import ProductCard from '@/components/ui/ProductCard';
import CardWrapper from '@/components/ui/CardWrapper';
import {
  getProductCardImages,
  getProductCardIsNew,
  getProductCardPricing,
  getProductCardSlug,
  getProductCardStockQuantity,
  getProductCardType,
} from '@/lib/product-card';

const DEFAULT_WHATSAPP_NUMBER = '254112222572';
const WHATSAPP_NUMBER = formatWhatsAppNumber(
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || siteImages?.contactWhatsApp || DEFAULT_WHATSAPP_NUMBER,
);
const BREADCRUMB_SEPARATOR = '\u203A';
const RECENTLY_VIEWED_KEY = 'sc_recently_viewed';
const INSTAGRAM_URL = 'https://www.instagram.com/sharoncraft/';
const FALLBACK_CARE_TEXT =
  'Store in the pouch provided. Avoid water and perfume contact. Wipe gently with a dry soft cloth. Keep away from direct sunlight.';

function formatWhatsAppNumber(value) {
  const digits = String(value || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('254')) return digits;
  if (digits.startsWith('0')) return `254${digits.slice(1)}`;
  return digits;
}

function cleanText(value) {
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number') return String(value);
  return '';
}

function formatPrice(value) {
  const amount = Number(value || 0);
  if (!Number.isFinite(amount) || amount <= 0) return 'KES 0';
  return `KES ${amount.toLocaleString('en-KE')}`;
}

function toAbsoluteUrl(value) {
  const input = cleanText(value);
  if (!input) return SITE_URL;
  if (/^https?:\/\//i.test(input)) return input;
  return `${SITE_URL.replace(/\/$/, '')}/${input.replace(/^\/+/, '')}`;
}

function getDescription(product) {
  return (
    cleanText(product?.description) ||
    cleanText(product?.longDescription) ||
    cleanText(product?.shortDescription) ||
    cleanText(product?.story?.text) ||
    cleanText(product?.story?.description)
  );
}

function getParagraphs(text) {
  return cleanText(text)
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function getShortDescription(product) {
  const description = getDescription(product);
  if (!description) return '';
  const sentences = description.split(/(?<=[.!?])\s+/).filter(Boolean);
  if (sentences.length <= 2) return description;
  return sentences.slice(0, 3).join(' ');
}

function getArtisanName(product) {
  const direct =
    cleanText(product?.artisan) ||
    cleanText(product?.maker) ||
    cleanText(product?.created_by) ||
    cleanText(product?.story?.artisanName) ||
    cleanText(product?.artisanProfile?.name) ||
    cleanText(product?.artisan?.name);

  return direct || 'Sharon';
}

function getArtisanLabel(product) {
  const artisan = getArtisanName(product).toUpperCase();
  return artisan.startsWith('BY ') ? artisan : `BY ${artisan}`;
}

function getArtisanBio(product) {
  return (
    cleanText(product?.artisanBio) ||
    cleanText(product?.makerBio) ||
    cleanText(product?.story?.bio) ||
    cleanText(product?.artisanProfile?.bio) ||
    cleanText(product?.artisan?.bio)
  );
}

function getArtisanPhoto(product) {
  return (
    cleanText(product?.artisanPhoto) ||
    cleanText(product?.artisan_image) ||
    cleanText(product?.artisanProfile?.image_url) ||
    cleanText(product?.artisan?.image_url) ||
    cleanText(product?.story?.behindScenesPhoto)
  );
}

function getArtisanSpecialty(product) {
  return (
    cleanText(product?.artisanSpecialty) ||
    cleanText(product?.artisanProfile?.specialty) ||
    cleanText(product?.artisan?.specialty) ||
    cleanText(product?.subcategory) ||
    cleanText(product?.category)
  );
}

function getCareText(product) {
  return cleanText(product?.careInstructions || product?.care_instructions || product?.story?.care);
}

function getMaterialsText(product) {
  if (Array.isArray(product?.materials)) {
    return product.materials.map((item) => cleanText(item)).filter(Boolean).join(', ');
  }
  return cleanText(product?.materials) || cleanText(product?.story?.materials);
}

function getCategory(product) {
  return cleanText(product?.category);
}

function getPriceMeta(product) {
  const basePrice = Number(product?.price || 0);
  const originalPriceCandidate = Number(product?.originalPrice || product?.compareAtPrice || 0);
  const salePriceCandidate = Number(product?.salePrice || 0);

  if (Number.isFinite(salePriceCandidate) && salePriceCandidate > 0 && salePriceCandidate < basePrice) {
    return {
      current: salePriceCandidate,
      original: basePrice,
      isOnSale: true,
    };
  }

  if (Number.isFinite(originalPriceCandidate) && originalPriceCandidate > basePrice) {
    return {
      current: basePrice,
      original: originalPriceCandidate,
      isOnSale: true,
    };
  }

  return {
    current: Number.isFinite(basePrice) ? basePrice : 0,
    original: 0,
    isOnSale: false,
  };
}

function getStockMeta(product) {
  const quantity = Number(product?.quantity ?? product?.stock ?? 0);
  const fulfillmentType = cleanText(product?.fulfillmentType || product?.fulfillment_type).toLowerCase();
  const isMadeToOrder =
    fulfillmentType === 'made_to_order' ||
    fulfillmentType === 'custom_order' ||
    product?.madeToOrder ||
    product?.custom;

  if (quantity <= 0 && !isMadeToOrder) {
    return { dot: '#ccc', text: 'Currently unavailable', textColor: '#bbb' };
  }

  if (quantity > 0 && quantity <= 2) {
    return { dot: '#E67E22', text: `Only ${quantity} left`, textColor: '#E67E22' };
  }

  if (isMadeToOrder) {
    return { dot: '#F59E0B', text: 'Made to Order \u00B7 5\u20137 days', textColor: '#888' };
  }

  return { dot: '#2E7D32', text: 'In Stock', textColor: '#555' };
}

function getProductType(product) {
  const fulfillmentType = cleanText(product?.fulfillmentType || product?.fulfillment_type).toLowerCase();
  if (fulfillmentType === 'made_to_order' || fulfillmentType === 'custom_order' || product?.madeToOrder) {
    return 'Made to Order';
  }
  return 'Ready to Ship';
}

function getSpecificationRows(product) {
  const rows = [];
  const category = getCategory(product);
  const subcategory = cleanText(product?.subcategory);
  const artisan = getArtisanName(product);
  const materials = getMaterialsText(product);
  const sku = cleanText(product?.sku || product?.id);

  if (category) rows.push({ key: 'Category', value: category });
  if (subcategory) rows.push({ key: 'Subcategory', value: subcategory });
  if (artisan) rows.push({ key: 'Artisan', value: artisan });
  rows.push({ key: 'Made in', value: 'Kenya' });
  if (materials) rows.push({ key: 'Materials', value: materials });
  rows.push({ key: 'Product Type', value: getProductType(product) });
  if (sku) rows.push({ key: 'SKU', value: sku });

  return rows;
}

function getImageSource(image) {
  if (typeof image === 'string') return image;
  return cleanText(image?.src || image?.url);
}

function getGalleryImages(product) {
  const productImages = [];
  if (product?.image) {
    productImages.push({ src: product.image, hasModelShot: false });
  }

  if (Array.isArray(product?.images)) {
    product.images.forEach((image) => {
      const src = getImageSource(image);
      if (!src) return;
      if (productImages.some((entry) => entry.src === src)) return;
      productImages.push({
        src,
        hasModelShot: Boolean(
          image?.has_model_shot ||
            image?.hasModelShot ||
            product?.has_model_shot ||
            product?.hasModelShot,
        ),
      });
    });
  }

  if (productImages.length === 0) {
    productImages.push({ src: '/media/site/placeholder.svg', hasModelShot: false });
  }

  return productImages.map((image) => ({
    ...image,
    isModelShot: isModelShot(image.src, image.hasModelShot, product),
  }));
}

function isModelShot(src, imageFlag, product) {
  if (imageFlag || product?.has_model_shot || product?.hasModelShot) return true;
  const candidate = cleanText(src).toLowerCase();
  return /model|wear|worn|portrait|lookbook|body|editorial/.test(candidate);
}

function getCardImage(item) {
  if (Array.isArray(item?.images) && item.images.length > 0) {
    const first = getImageSource(item.images[0]);
    if (first) return first;
  }
  return cleanText(item?.image) || '/media/site/placeholder.svg';
}

function getCardImageMode(item) {
  const image = getCardImage(item);
  return isModelShot(image, item?.has_model_shot || item?.hasModelShot, item);
}

function buildOrderMessage(product, qty, note, unitPrice) {
  const cleanNote = cleanText(note);
  const total = unitPrice * qty;
  return encodeURIComponent(
    `Hi Sharon 👋\n\nI'd like to order:\n\n*${cleanText(product?.name)}*\nQty: ${qty}\nPrice: KES ${total.toLocaleString('en-KE')}` +
      (cleanNote ? `\n\nNote: ${cleanNote}` : '') +
      '\n\nPlease confirm and send payment details 🙏',
  );
}

function ProductBreadcrumb({ product }) {
  const category = getCategory(product);
  const subcategory = cleanText(product?.subcategory);

  return (
    <div className="product-breadcrumb-shell">
      <nav className="product-breadcrumb product-breadcrumb--desktop" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span>{BREADCRUMB_SEPARATOR}</span>
        <Link href="/shop">Shop</Link>
        {category ? (
          <>
            <span>{BREADCRUMB_SEPARATOR}</span>
            <Link href={buildShopHref(category)}>{category}</Link>
          </>
        ) : null}
        {category && subcategory ? (
          <>
            <span>{BREADCRUMB_SEPARATOR}</span>
            <Link href={buildShopHref(category, subcategory)}>{subcategory}</Link>
          </>
        ) : null}
        <span>{BREADCRUMB_SEPARATOR}</span>
        <strong>{cleanText(product?.name)}</strong>
      </nav>

      <nav className="product-breadcrumb product-breadcrumb--mobile" aria-label="Back to shop">
        <Link href="/shop">← Back to Shop</Link>
      </nav>
    </div>
  );
}

function HeartIcon({ filled = false, size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? '#8B5E3C' : 'none'} stroke="currentColor" strokeWidth="1.5">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function MessageIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      <path d="M8 9h8" />
      <path d="M8 13h6" />
    </svg>
  );
}

function PackageIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  );
}

function ReturnIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7v6h6" />
      <path d="M21 17v-6h-6" />
      <path d="M20 8a8 8 0 0 0-14.9-2" />
      <path d="M4 16a8 8 0 0 0 14.9 2" />
    </svg>
  );
}

function SupportIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 10a6 6 0 1 0-12 0v4a2 2 0 0 0 2 2h2v-5H6" />
      <path d="M18 14h-4v5h4a2 2 0 0 0 2-2v-3h-2Z" />
      <path d="M12 19v2" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="1.5" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function useBodyScrollLock(locked) {
  useEffect(() => {
    if (!locked) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [locked]);
}

function ProductGallery({ product, productName }) {
  const images = useMemo(() => getGalleryImages(product), [product]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [imageReady, setImageReady] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [touchStartX, setTouchStartX] = useState(null);
  const frameRef = useRef(null);
  const activeImage = images[activeIndex] || images[0];
  const viewingCount = useMemo(() => Math.floor(Math.random() * 8) + 3, []);

  useBodyScrollLock(lightboxOpen);

  useEffect(() => {
    setImageReady(false);
  }, [activeIndex]);

  useEffect(() => {
    if (!lightboxOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setLightboxOpen(false);
      if (event.key === 'ArrowLeft') {
        setActiveIndex((current) => (current - 1 + images.length) % images.length);
      }
      if (event.key === 'ArrowRight') {
        setActiveIndex((current) => (current + 1) % images.length);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [images.length, lightboxOpen]);

  function handleTouchEnd(event) {
    if (touchStartX === null) return;
    const endX = event.changedTouches[0]?.screenX ?? 0;
    const delta = touchStartX - endX;
    if (Math.abs(delta) > 40) {
      if (delta > 0) {
        setActiveIndex((current) => (current + 1) % images.length);
      } else {
        setActiveIndex((current) => (current - 1 + images.length) % images.length);
      }
    }
    setTouchStartX(null);
  }

  const desktopImageClass = activeImage?.isModelShot ? 'gallery-image gallery-image--cover' : 'gallery-image gallery-image--contain';
  const desktopStageClass = activeImage?.isModelShot ? 'gallery-stage gallery-stage--dark' : 'gallery-stage gallery-stage--cream';

  return (
    <>
      <div className="gallery-shell">
        <div className="gallery-shell__desktop">
          <div className="gallery-thumbnails" aria-label="Product thumbnails">
            {images.map((image, index) => (
              <button
                key={image.src}
                type="button"
                className={`gallery-thumbnail${index === activeIndex ? ' is-active' : ''}`}
                onClick={() => setActiveIndex(index)}
                aria-label={`View image ${index + 1}`}
              >
                <div className="gallery-thumbnail__inner">
                  <Image
                    src={image.src}
                    alt=""
                    fill
                    sizes="72px"
                    className={image.isModelShot ? 'gallery-thumbnail__image gallery-thumbnail__image--cover' : 'gallery-thumbnail__image gallery-thumbnail__image--contain'}
                  />
                </div>
              </button>
            ))}
          </div>

          <button
            ref={frameRef}
            type="button"
            className={`${desktopStageClass} cursor-zoom-in`}
            onClick={() => setLightboxOpen(true)}
          >
            <div className="gallery-counter">
              {activeIndex + 1} / {images.length}
            </div>

            <div className="gallery-viewing">
              <span className="gallery-viewing__dot" />
              <span className="gallery-viewing__text">
                <strong>{viewingCount}</strong> people viewing now
              </span>
            </div>

            <div className={`gallery-image-fade${imageReady ? ' is-ready' : ''}`}>
              <Image
                key={activeImage.src}
                src={activeImage.src}
                alt={productName}
                fill
                priority={activeIndex === 0}
                sizes="55vw"
                className={desktopImageClass}
                onLoad={() => setImageReady(true)}
              />
            </div>
          </button>
        </div>

        <div className="gallery-shell__mobile">
          <button
            type="button"
            className={activeImage?.isModelShot ? 'gallery-mobile-stage gallery-mobile-stage--dark' : 'gallery-mobile-stage gallery-mobile-stage--cream'}
            onClick={() => setLightboxOpen(true)}
            onTouchStart={(event) => setTouchStartX(event.changedTouches[0]?.screenX ?? null)}
            onTouchEnd={handleTouchEnd}
          >
            <div className={`gallery-image-fade${imageReady ? ' is-ready' : ''}`}>
              <Image
                key={activeImage.src}
                src={activeImage.src}
                alt={productName}
                fill
                priority
                sizes="100vw"
                className={activeImage?.isModelShot ? 'gallery-image gallery-image--cover' : 'gallery-image gallery-image--contain'}
                onLoad={() => setImageReady(true)}
              />
            </div>
          </button>

          <div className="gallery-mobile-dots" aria-label="Image indicators">
            {images.map((image, index) => (
              <button
                key={`${image.src}-dot`}
                type="button"
                className={`gallery-mobile-dot${index === activeIndex ? ' is-active' : ''}`}
                onClick={() => setActiveIndex(index)}
                aria-label={`Show image ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {lightboxOpen ? (
        <div className="gallery-lightbox" onClick={() => setLightboxOpen(false)}>
          <button type="button" className="gallery-lightbox__close" onClick={() => setLightboxOpen(false)}>
            ✕ CLOSE
          </button>

          {images.length > 1 ? (
            <>
              <button
                type="button"
                className="gallery-lightbox__arrow gallery-lightbox__arrow--left"
                onClick={(event) => {
                  event.stopPropagation();
                  setActiveIndex((current) => (current - 1 + images.length) % images.length);
                }}
              >
                ←
              </button>
              <button
                type="button"
                className="gallery-lightbox__arrow gallery-lightbox__arrow--right"
                onClick={(event) => {
                  event.stopPropagation();
                  setActiveIndex((current) => (current + 1) % images.length);
                }}
              >
                →
              </button>
            </>
          ) : null}

          <div className="gallery-lightbox__frame" onClick={(event) => event.stopPropagation()}>
            <Image
              src={activeImage.src}
              alt={productName}
              fill
              sizes="90vw"
              className="gallery-lightbox__image"
            />
          </div>
        </div>
      ) : null}
    </>
  );
}

function DeliveryRows() {
  const rows = [
    {
      icon: <PackageIcon />,
      title: 'Free Delivery in Nairobi',
      sub: 'Within 2\u20133 business days',
    },
    {
      icon: <ReturnIcon />,
      title: 'Easy Returns',
      sub: '30-day hassle-free policy',
    },
    {
      icon: <SupportIcon />,
      title: 'WhatsApp Support',
      sub: 'Chat with us anytime',
    },
  ];

  return (
    <div className="product-delivery">
      {rows.map((row) => (
        <div key={row.title} className="product-delivery__row">
          <span className="product-delivery__icon">{row.icon}</span>
          <div>
            <div className="product-delivery__title">{row.title}</div>
            <div className="product-delivery__sub">{row.sub}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ShareRow({ shareUrl }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.warn('Unable to copy product link.', error);
    }
  }

  const whatsappShare = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(shareUrl)}`;

  return (
    <div className="product-share">
      <span className="product-share__label">SHARE —</span>
      <a href={whatsappShare} target="_blank" rel="noreferrer">
        WhatsApp
      </a>
      <span className="product-share__separator">·</span>
      <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer">
        Instagram
      </a>
      <span className="product-share__separator">·</span>
      <button type="button" className="product-share__copy" onClick={handleCopy}>
        <CopyIcon />
        {copied ? 'Copied ✓' : 'Copy Link'}
      </button>
    </div>
  );
}

function ProductInfo({
  product,
  qty,
  setQty,
  customNote,
  setCustomNote,
  actionsRef,
  shareUrl,
}) {
  const { addItem, isWishlisted, toggleWishlist, openCart } = useCart();
  const stock = useMemo(() => getStockMeta(product), [product]);
  const shortDescription = useMemo(() => getShortDescription(product), [product]);
  const artisanLabel = useMemo(() => getArtisanLabel(product), [product]);
  const priceMeta = useMemo(() => getPriceMeta(product), [product]);
  const totalText = formatPrice(priceMeta.current * qty);
  const saved = isWishlisted(product?.id);

  function addSelectedQuantityToCart() {
    const totalCount = Math.max(1, qty);
    for (let index = 0; index < totalCount; index += 1) {
      addItem(product);
    }
    openCart();
  }

  function orderOnWhatsApp() {
    if (!WHATSAPP_NUMBER) return;
    const message = buildOrderMessage(product, qty, customNote, priceMeta.current);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank', 'noopener,noreferrer');
  }

  return (
    <div className="product-info">
      <div className="fade-up-block" style={{ animationDelay: '0ms' }}>
        <span className="product-info__artisan">{artisanLabel}</span>
      </div>

      <div className="fade-up-block" style={{ animationDelay: '50ms' }}>
        <h1 className="product-info__title">{cleanText(product?.name)}</h1>
      </div>

      <div className="fade-up-block" style={{ animationDelay: '100ms' }}>
        <div className="product-price">
          <span className="product-price__current">{formatPrice(priceMeta.current)}</span>
          {priceMeta.isOnSale ? (
            <>
              <span className="product-price__original">{formatPrice(priceMeta.original)}</span>
              <span className="product-price__badge">Sale</span>
            </>
          ) : null}
        </div>
      </div>

      <div className="fade-up-block" style={{ animationDelay: '120ms' }}>
        <div className="product-divider" />
      </div>

      <div className="fade-up-block" style={{ animationDelay: '150ms' }}>
        <div className="product-stock">
          <span className="product-stock__dot" style={{ background: stock.dot }} />
          <span className="product-stock__text" style={{ color: stock.textColor }}>
            {stock.text}
          </span>
        </div>
      </div>

      {shortDescription ? (
        <div className="fade-up-block" style={{ animationDelay: '200ms' }}>
          <p className="product-info__description">{shortDescription}</p>
        </div>
      ) : null}

      <div className="fade-up-block" style={{ animationDelay: '250ms' }}>
        <label className="product-label" htmlFor="custom-note">
          CUSTOMISATION NOTE
        </label>
        <textarea
          id="custom-note"
          className="product-note"
          value={customNote}
          onChange={(event) => setCustomNote(event.target.value)}
          placeholder="e.g. size, color preference, special occasion..."
        />
      </div>

      <div className="fade-up-block" style={{ animationDelay: '300ms' }}>
        <span className="product-label">QTY</span>
        <div className="product-qty">
          <button type="button" onClick={() => setQty((current) => Math.max(1, current - 1))} disabled={qty <= 1}>
            −
          </button>
          <span>{qty}</span>
          <button type="button" onClick={() => setQty((current) => current + 1)}>
            +
          </button>
        </div>
        <div className="product-total">{totalText}</div>
      </div>

      <div ref={actionsRef} className="fade-up-block" style={{ animationDelay: '350ms' }}>
        <div className="product-actions">
          <button type="button" className="product-actions__primary" onClick={orderOnWhatsApp}>
            <MessageIcon />
            ORDER ON WHATSAPP
          </button>
          <button type="button" className="product-actions__secondary" onClick={addSelectedQuantityToCart}>
            ADD TO CART
          </button>
          <button type="button" className="product-actions__wishlist" onClick={() => toggleWishlist(product)}>
            <HeartIcon filled={saved} />
            {saved ? 'Saved to Wishlist' : 'Save to Wishlist'}
          </button>
        </div>
      </div>

      <div className="fade-up-block" style={{ animationDelay: '400ms' }}>
        <DeliveryRows />
      </div>

      <div className="fade-up-block" style={{ animationDelay: '450ms' }}>
        <ShareRow shareUrl={shareUrl} />
      </div>
    </div>
  );
}

function TabsSection({ product }) {
  const description = getDescription(product);
  const careText = getCareText(product);
  const artisanName = getArtisanName(product);
  const artisanBio = getArtisanBio(product);
  const artisanPhoto = getArtisanPhoto(product);
  const artisanSpecialty = getArtisanSpecialty(product);
  const specificationRows = getSpecificationRows(product);
  const descriptionParagraphs = getParagraphs(description);
  const careParagraphs = getParagraphs(careText);

  const tabs = [];

  if (description) {
    tabs.push({
      id: 'details',
      label: 'DETAILS',
      content: (
        <div className="tab-copy">
          {descriptionParagraphs.length > 0
            ? descriptionParagraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)
            : <p>{description}</p>}
        </div>
      ),
    });
  }

  if (specificationRows.length > 0) {
    tabs.push({
      id: 'specifications',
      label: 'SPECIFICATIONS',
      content: (
        <div className="tab-specs">
          {specificationRows.map((row) => (
            <div key={row.key} className="tab-specs__row">
              <span>{row.key}</span>
              <span>{row.value}</span>
            </div>
          ))}
        </div>
      ),
    });
  }

  if (careText) {
    tabs.push({
      id: 'care',
      label: 'CARE',
      content: (
        <div className="tab-copy">
          {(careParagraphs.length > 0 ? careParagraphs : [careText || FALLBACK_CARE_TEXT]).map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      ),
    });
  }

  if (artisanName || artisanBio || artisanPhoto) {
    tabs.push({
      id: 'artisan',
      label: 'ARTISAN',
      content: (
        <div className="artisan-tab">
          <div className="artisan-tab__card">
            {artisanPhoto ? (
              <div className="artisan-tab__photo">
                <Image src={artisanPhoto} alt={artisanName} fill sizes="64px" className="artisan-tab__photo-image" />
              </div>
            ) : null}
            <div className="artisan-tab__info">
              <h3>{artisanName}</h3>
              {artisanSpecialty ? <div className="artisan-tab__specialty">{artisanSpecialty}</div> : null}
              {artisanBio ? <p>{artisanBio}</p> : null}
            </div>
          </div>
          <Link href={`/shop?artisan=${encodeURIComponent(artisanName)}`} className="artisan-tab__link">
            View all by {artisanName} →
          </Link>
        </div>
      ),
    });
  }

  const [activeTab, setActiveTab] = useState(tabs[0]?.id || '');

  useEffect(() => {
    if (!tabs.some((tab) => tab.id === activeTab)) {
      setActiveTab(tabs[0]?.id || '');
    }
  }, [activeTab, tabs]);

  if (tabs.length === 0) return null;

  const currentTab = tabs.find((tab) => tab.id === activeTab) || tabs[0];

  return (
    <section className="product-tabs">
      <div className="product-tabs__bar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`product-tabs__trigger${tab.id === activeTab ? ' is-active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div key={currentTab.id} className="product-tabs__content">
        {currentTab.content}
      </div>
    </section>
  );
}

function RelatedSection({ products }) {
  if (!Array.isArray(products) || products.length === 0) return null;

  return (
    <section className="related-section mt-16 md:mt-24">
      <div className="flex justify-between items-center mb-6 px-4 md:px-0">
        <span className="text-[11px] md:text-[12px] tracking-[2px] font-medium uppercase">YOU MAY ALSO LIKE</span>
        <Link href="/shop" className="text-[11px] md:text-[12px] uppercase tracking-[1px] underline">View all →</Link>
      </div>

      <div className="hidden md:grid grid-cols-4 gap-4">
        {products.map((item, index) => (
          <CardWrapper key={item.id} delay={(index % 4) * 80}>
            {(() => {
              const pricing = getProductCardPricing(item);
              return (
            <ProductCard
              id={item.id}
              name={item.name}
              price={pricing.price}
              original_price={pricing.original_price}
              images={getProductCardImages(item)}
              artisan={item.artisan}
              category={item.category}
              slug={getProductCardSlug(item)}
              is_new={getProductCardIsNew(item)}
              product_type={getProductCardType(item)}
              stock_quantity={getProductCardStockQuantity(item)}
              size="default"
            />
              );
            })()}
          </CardWrapper>
        ))}
      </div>

      <div className="md:hidden flex overflow-x-auto snap-x snap-mandatory gap-2.5 px-4 pb-4 hide-scrollbar">
        {products.map((item) => (
          <div key={`${item.id}-mobile`} className="shrink-0 w-[43vw] snap-start">
            {(() => {
              const pricing = getProductCardPricing(item);
              return (
            <ProductCard
              id={item.id}
              name={item.name}
              price={pricing.price}
              original_price={pricing.original_price}
              images={getProductCardImages(item)}
              artisan={item.artisan}
              category={item.category}
              slug={getProductCardSlug(item)}
              is_new={getProductCardIsNew(item)}
              product_type={getProductCardType(item)}
              stock_quantity={getProductCardStockQuantity(item)}
              size="default"
            />
              );
            })()}
          </div>
        ))}
      </div>
    </section>
  );
}

function RecentlyViewedSection({ products, onClear, visible }) {
  if (!visible || products.length === 0) return null;

  return (
    <section className="recent-section mt-16 md:mt-24 border-t border-[#EAE5DF] pt-12 pb-16">
      <div className="flex justify-between items-center mb-6 px-4 md:px-10">
        <span className="text-[11px] tracking-[2px] font-medium uppercase">RECENTLY VIEWED</span>
        <button type="button" onClick={onClear} className="text-[10px] uppercase tracking-[1px] underline">
          Clear
        </button>
      </div>

      <div className="flex overflow-x-auto snap-x snap-mandatory gap-2.5 px-4 md:px-10 hide-scrollbar">
        {products.map((item) => (
          <div key={item.id} className="shrink-0 w-[130px] md:w-[160px] snap-start">
            {(() => {
              const pricing = getProductCardPricing(item);
              return (
            <ProductCard
              id={item.id}
              name={item.name}
              price={pricing.price}
              original_price={pricing.original_price}
              images={getProductCardImages(item)}
              artisan={item.artisan}
              category={item.category}
              slug={getProductCardSlug(item)}
              is_new={getProductCardIsNew(item)}
              product_type={getProductCardType(item)}
              stock_quantity={getProductCardStockQuantity(item)}
              size="small"
              showArtisan={false}
            />
              );
            })()}
          </div>
        ))}
      </div>
    </section>
  );
}

function StickyBottomBar({ product, qty, customNote, actionsVisible }) {
  const { addItem, openCart } = useCart();
  const priceMeta = getPriceMeta(product);
  const artisan = getArtisanName(product);
  const title = cleanText(product?.name);
  const shortTitle = title.length > 28 ? `${title.slice(0, 28)}...` : title;

  function orderOnWhatsApp() {
    if (!WHATSAPP_NUMBER) return;
    const message = buildOrderMessage(product, qty, customNote, priceMeta.current);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank', 'noopener,noreferrer');
  }

  function addSelectedQuantityToCart() {
    const totalCount = Math.max(1, qty);
    for (let index = 0; index < totalCount; index += 1) {
      addItem(product);
    }
    openCart();
  }

  return (
    <div className={`sticky-order-bar${actionsVisible ? '' : ' is-visible'}`}>
      <div className="sticky-order-bar__meta">
        <span className="sticky-order-bar__title">{shortTitle}</span>
        <span className="sticky-order-bar__price">{formatPrice(priceMeta.current)}</span>
        <span className="sticky-order-bar__artisan">{artisan}</span>
      </div>

      <div className="sticky-order-bar__actions sticky-order-bar__actions--desktop">
        <button type="button" className="sticky-order-bar__primary" onClick={orderOnWhatsApp}>
          WHATSAPP
        </button>
        <button type="button" className="sticky-order-bar__secondary" onClick={addSelectedQuantityToCart}>
          ADD TO CART
        </button>
      </div>

      <div className="sticky-order-bar__actions sticky-order-bar__actions--mobile">
        <button type="button" className="sticky-order-bar__primary sticky-order-bar__primary--mobile" onClick={orderOnWhatsApp}>
          WHATSAPP
        </button>
      </div>
    </div>
  );
}

function ProductPageSkeleton() {
  return (
    <div className="product-page-shell">
      <Nav />
      <div className="product-page-shell__inner">
        <div className="product-breadcrumb-shell">
          <div className="product-breadcrumb product-breadcrumb--desktop">
            <span>Home</span>
            <span>{BREADCRUMB_SEPARATOR}</span>
            <span>Shop</span>
            <span>{BREADCRUMB_SEPARATOR}</span>
            <span>Loading</span>
          </div>
          <div className="product-breadcrumb product-breadcrumb--mobile">
            <span>← Back to Shop</span>
          </div>
        </div>

        <div className="skeleton-hero">
          <div className="skeleton-gallery">
            <div className="skeleton-thumbs">
              {[0, 1, 2, 3].map((item) => (
                <span key={item} className="skeleton-box skeleton-box--thumb" />
              ))}
            </div>
            <div className="skeleton-box skeleton-box--main" />
          </div>
          <div className="skeleton-info">
            <span className="skeleton-box skeleton-box--artisan" />
            <span className="skeleton-box skeleton-box--title" />
            <span className="skeleton-box skeleton-box--price" />
            <span className="skeleton-box skeleton-box--line" />
            <span className="skeleton-box skeleton-box--line" />
            <span className="skeleton-box skeleton-box--line" />
            <span className="skeleton-box skeleton-box--button" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductPage({ product, relatedProducts }) {
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [customNote, setCustomNote] = useState('');
  const [recentProducts, setRecentProducts] = useState([]);
  const [showRecentProducts, setShowRecentProducts] = useState(false);
  const [actionsVisible, setActionsVisible] = useState(true);
  const actionsRef = useRef(null);

  useEffect(() => {
    const node = actionsRef.current;
    if (!node) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => setActionsVisible(entry.isIntersecting),
      { threshold: 0, rootMargin: '0px 0px -80px 0px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!product?.id || typeof window === 'undefined') return;
    const currentItem = {
      id: product.id,
      name: product.name,
      price: getPriceMeta(product).current,
      images: getGalleryImages(product).map((item) => item.src),
      slug: product.slug,
      artisan: getArtisanName(product),
    };

    try {
      const existing = JSON.parse(window.localStorage.getItem(RECENTLY_VIEWED_KEY) ?? '[]');
      const filtered = existing.filter((item) => item?.id !== product.id);
      const updated = [currentItem, ...filtered].slice(0, 8);
      window.localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(updated));
      const others = updated.filter((item) => item.id !== product.id);
      setRecentProducts(others);
      setShowRecentProducts(updated.length >= 2 && others.length > 0);
    } catch (error) {
      console.warn('Unable to persist recently viewed products.', error);
    }
  }, [product?.id, product]);

  function clearRecentlyViewed() {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(RECENTLY_VIEWED_KEY);
    setRecentProducts([]);
    setShowRecentProducts(false);
  }

  if (router.isFallback) {
    return <ProductPageSkeleton />;
  }

  if (!product) {
    return (
      <div className="product-page-shell">
        <Nav />
        <main className="product-page-shell__inner">
          <div className="product-empty">Product not found.</div>
        </main>
        <Footer />
      </div>
    );
  }

  const productTitle = cleanText(product?.name);
  const productArtisan = getArtisanName(product) || 'our artisans';
  const productType = getProductType(product);
  const priceMeta = getPriceMeta(product);
  const productPriceText = priceMeta.current ? `KES ${priceMeta.current}` : '';
  const metaDescription =
    productTitle && productArtisan
      ? `Handmade ${productTitle} by ${productArtisan} in Nairobi, Kenya. ${productPriceText ? `${productPriceText}. ` : ''}${productType}. Ships Kenya-wide.`
      : getDescription(product) || `Handmade ${productTitle || 'this piece'} in Nairobi, Kenya. Ships Kenya-wide.`;
  const shareUrl = `${SITE_URL}/product/${product.slug}`;
  const primaryImage = toAbsoluteUrl(getCardImage(product));
  const stockQuantity = Number(product?.stock_quantity ?? product?.stock ?? product?.quantity ?? 0);
  const isAvailable = stockQuantity > 0 || product?.madeToOrder || product?.custom;
  const materials = getMaterialsText(product);
  
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: cleanText(product?.name),
    description: cleanText(product?.description) || metaDescription,
    image: getGalleryImages(product).map((image) => toAbsoluteUrl(image.src)),
    sku: cleanText(product?.sku || product?.id),
    category: getCategory(product) || undefined,
    material: materials || undefined,
    brand: {
      '@type': 'Brand',
      name: 'SharonCraft',
    },
    offers: {
      '@type': 'Offer',
      price: priceMeta.current || 0,
      priceCurrency: 'KES',
      availability:
        stockQuantity > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/PreOrder',
      seller: {
        '@type': 'Organization',
        name: 'SharonCraft',
      },
    },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Shop',
        item: `${SITE_URL}/shop`,
      },
      ...(getCategory(product)
        ? [
            {
              '@type': 'ListItem',
              position: 3,
              name: getCategory(product),
              item: `${SITE_URL}${buildShopHref(getCategory(product))}`,
            },
          ]
        : []),
      {
        '@type': 'ListItem',
        position: (getCategory(product) ? 4 : 3),
        name: cleanText(product?.name),
        item: shareUrl,
      },
    ],
  };

  return (
    <div className="product-page-shell">
      <SeoHead
        title={cleanText(product?.name)}
        description={metaDescription}
        keywords={`${cleanText(product?.name)}, handmade jewelry Kenya, SharonCraft, ${getCategory(product) || 'Kenyan jewelry'}`}
        path={`/product/${product.slug}`}
        image={primaryImage}
        type="product"
        structuredData={[productSchema, breadcrumbSchema]}
      />

      <Nav />

      <main className="product-page-shell__inner">
        <ProductBreadcrumb product={product} />

        <section className="product-hero">
          <div className="product-hero__gallery">
            <ProductGallery product={product} productName={cleanText(product?.name)} />
          </div>
          <div className="product-hero__info">
            <ProductInfo
              product={product}
              qty={qty}
              setQty={setQty}
              customNote={customNote}
              setCustomNote={setCustomNote}
              actionsRef={actionsRef}
              shareUrl={shareUrl}
            />
          </div>
        </section>

        <TabsSection product={product} />
        <RelatedSection products={relatedProducts} />
        <RecentlyViewedSection products={recentProducts} onClear={clearRecentlyViewed} visible={showRecentProducts} />
      </main>

      <Footer />
      <StickyBottomBar product={product} qty={qty} customNote={customNote} actionsVisible={actionsVisible} />

      <style jsx global>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes tabFade {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes viewingPulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.3;
          }
        }

        @keyframes shimmer {
          0%,
          100% {
            opacity: 0.5;
          }
          50% {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(24px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .product-page-shell {
          min-height: 100vh;
          background: #fafaf8;
        }

        .product-page-shell__inner {
          padding-top: 88px;
        }

        .product-empty {
          padding: 120px 20px;
          text-align: center;
          color: #666;
          font-size: 14px;
        }

        .product-breadcrumb-shell {
          background: #ffffff;
          border-bottom: 0.5px solid rgba(0, 0, 0, 0.06);
        }

        .product-breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 40px;
          font-size: 11px;
          letter-spacing: 0.4px;
        }

        .product-breadcrumb a,
        .product-breadcrumb span {
          color: #bbb;
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .product-breadcrumb a:hover {
          color: #8b5e3c;
        }

        .product-breadcrumb strong {
          color: #1c1c1c;
          font-weight: 400;
        }

        .product-breadcrumb--mobile {
          display: none;
        }

        .product-hero {
          display: grid;
          grid-template-columns: 55% 45%;
          min-height: calc(100vh - 112px);
          align-items: start;
          background: #fafaf8;
        }

        .product-hero__gallery,
        .product-hero__info {
          min-width: 0;
        }

        .gallery-shell__desktop {
          position: sticky;
          top: 60px;
          height: calc(100vh - 60px);
          display: grid;
          grid-template-columns: 72px 1fr;
          gap: 10px;
          padding: 24px 16px 24px 40px;
        }

        .gallery-thumbnails {
          display: flex;
          flex-direction: column;
          gap: 8px;
          overflow-y: auto;
          height: 100%;
          scrollbar-width: none;
        }

        .gallery-thumbnails::-webkit-scrollbar,
        .related-section__mobile::-webkit-scrollbar,
        .recent-section__rail::-webkit-scrollbar {
          display: none;
        }

        .gallery-thumbnail {
          width: 72px;
          height: 72px;
          position: relative;
          background: #f5f0eb;
          overflow: hidden;
          cursor: pointer;
          flex-shrink: 0;
          border: 1.5px solid transparent;
          opacity: 0.45;
          transition: all 0.2s ease;
          padding: 0;
        }

        .gallery-thumbnail:hover {
          opacity: 0.8;
        }

        .gallery-thumbnail.is-active {
          border-color: #1c1c1c;
          opacity: 1;
        }

        .gallery-thumbnail__inner {
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }

        .gallery-thumbnail__image {
          object-position: center;
        }

        .gallery-thumbnail__image--contain {
          object-fit: contain;
          padding: 6px;
        }

        .gallery-thumbnail__image--cover {
          object-fit: cover;
        }

        .gallery-stage,
        .gallery-mobile-stage {
          position: relative;
          overflow: hidden;
          border: none;
          padding: 0;
          width: 100%;
        }

        .gallery-stage {
          height: calc(100vh - 108px);
          cursor: zoom-in;
        }

        .gallery-stage--cream,
        .gallery-mobile-stage--cream {
          background: #f5f0eb;
        }

        .gallery-stage--dark,
        .gallery-mobile-stage--dark {
          background: #1c1c1c;
        }

        .gallery-mobile-stage {
          width: 100vw;
          height: 85vw;
          max-height: 440px;
          margin-left: calc(50% - 50vw);
          margin-right: calc(50% - 50vw);
        }

        .gallery-image-fade {
          position: absolute;
          inset: 0;
          opacity: 0;
          transition: opacity 0.35s ease;
        }

        .gallery-image-fade.is-ready {
          opacity: 1;
        }

        .gallery-image {
          object-position: center;
          transition: opacity 0.4s ease;
        }

        .gallery-image--contain {
          object-fit: contain;
          padding: 32px;
        }

        .gallery-image--cover {
          object-fit: cover;
          padding: 0;
        }

        .gallery-counter,
        .gallery-viewing,
        .gallery-zoom-ring,
        .gallery-zoom-lens {
          pointer-events: none;
        }

        .gallery-counter {
          position: absolute;
          top: 16px;
          right: 16px;
          z-index: 2;
          font-size: 9px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #bbb;
        }

        .gallery-viewing {
          position: absolute;
          bottom: 16px;
          left: 16px;
          z-index: 2;
          display: flex;
          align-items: center;
          gap: 6px;
          opacity: 0;
          animation: fadeIn 0.4s ease 1s forwards;
        }

        .gallery-viewing__dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #2e7d32;
          animation: viewingPulse 1.8s ease infinite;
        }

        .gallery-viewing__text {
          font-size: 10px;
          color: #888;
          letter-spacing: 0.5px;
        }

        .gallery-viewing__text strong {
          font-weight: 500;
          color: #1c1c1c;
        }

        .gallery-zoom-ring {
          position: absolute;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 1px solid rgba(28, 28, 28, 0.4);
          transform: translate(-50%, -50%);
          z-index: 3;
        }

        .gallery-zoom-lens {
          position: absolute;
          width: 140px;
          height: 140px;
          border-radius: 50%;
          border: 1px solid rgba(28, 28, 28, 0.18);
          transform: translate(-50%, -50%);
          background-repeat: no-repeat;
          background-size: 250% 250%;
          z-index: 2;
        }

        .gallery-shell__mobile {
          display: none;
        }

        .gallery-mobile-dots {
          display: none;
        }

        .gallery-mobile-dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #ccc;
          border: none;
          padding: 0;
        }

        .gallery-mobile-dot.is-active {
          width: 16px;
          border-radius: 2px;
          background: #1c1c1c;
        }

        .gallery-lightbox {
          position: fixed;
          inset: 0;
          z-index: 3000;
          background: rgba(8, 8, 8, 0.92);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .gallery-lightbox__frame {
          position: relative;
          width: 90vw;
          height: 90vh;
        }

        .gallery-lightbox__image {
          object-fit: contain;
          object-position: center;
        }

        .gallery-lightbox__close,
        .gallery-lightbox__arrow {
          position: absolute;
          background: none;
          border: none;
          cursor: pointer;
        }

        .gallery-lightbox__close {
          top: 24px;
          right: 24px;
          font-size: 10px;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.35);
        }

        .gallery-lightbox__arrow {
          top: 50%;
          transform: translateY(-50%);
          font-size: 22px;
          color: rgba(255, 255, 255, 0.3);
          transition: color 0.2s ease;
        }

        .gallery-lightbox__arrow:hover {
          color: rgba(255, 255, 255, 0.8);
        }

        .gallery-lightbox__arrow--left {
          left: 32px;
        }

        .gallery-lightbox__arrow--right {
          right: 32px;
        }

        .product-info {
          padding: 40px 40px 40px 24px;
          display: flex;
          flex-direction: column;
        }

        .fade-up-block {
          animation: fadeUp 0.45s ease both;
        }

        .product-info__artisan,
        .product-label {
          display: block;
          font-size: 9px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #bbb;
          margin-bottom: 8px;
        }

        .product-info__artisan {
          font-size: 10px;
          letter-spacing: 3px;
          margin-bottom: 10px;
        }

        .product-info__title {
          margin: 0 0 16px;
          font-size: 26px;
          font-weight: 300;
          color: #1c1c1c;
          line-height: 1.15;
          letter-spacing: -0.3px;
        }

        .product-price {
          display: flex;
          align-items: baseline;
          gap: 12px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .product-price__current {
          font-size: 22px;
          font-weight: 400;
          color: #1c1c1c;
        }

        .product-price__original {
          font-size: 15px;
          color: #ccc;
          text-decoration: line-through;
        }

        .product-price__badge {
          background: #8b5e3c;
          color: #ffffff;
          font-size: 9px;
          letter-spacing: 1px;
          text-transform: uppercase;
          padding: 2px 8px;
          border-radius: 2px;
        }

        .product-divider {
          height: 0.5px;
          background: rgba(0, 0, 0, 0.08);
          margin: 4px 0 20px;
        }

        .product-stock {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 20px;
        }

        .product-stock__dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .product-stock__text {
          font-size: 12px;
        }

        .product-info__description {
          margin: 0 0 24px;
          max-width: 400px;
          font-size: 13px;
          color: #666;
          line-height: 1.85;
          letter-spacing: 0.2px;
        }

        .product-note {
          width: 100%;
          min-height: 72px;
          background: #ffffff;
          border: 0.5px solid rgba(0, 0, 0, 0.15);
          padding: 10px 14px;
          font-size: 12px;
          color: #1c1c1c;
          line-height: 1.6;
          resize: none;
          outline: none;
          border-radius: 0;
          margin-bottom: 20px;
          transition: border-color 0.2s ease;
        }

        .product-note::placeholder {
          color: #ccc;
        }

        .product-note:focus {
          border-color: #8b5e3c;
        }

        .product-qty {
          display: inline-flex;
          align-items: center;
          width: fit-content;
        }

        .product-qty button,
        .product-qty span {
          height: 40px;
        }

        .product-qty button {
          width: 40px;
          border: 0.5px solid #e0e0e0;
          background: transparent;
          font-size: 16px;
          color: #1c1c1c;
          cursor: pointer;
          transition: background 0.2s ease;
          padding: 0;
        }

        .product-qty button:hover:not(:disabled) {
          background: #f5f5f5;
        }

        .product-qty button:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .product-qty button:first-child {
          border-right: none;
        }

        .product-qty button:last-child {
          border-left: none;
        }

        .product-qty span {
          width: 52px;
          border-top: 0.5px solid #e0e0e0;
          border-bottom: 0.5px solid #e0e0e0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: #fafaf8;
          font-size: 13px;
          color: #1c1c1c;
        }

        .product-total {
          margin: 8px 0 24px;
          font-size: 10px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: #bbb;
        }

        .product-actions {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 24px;
        }

        .product-actions__primary,
        .product-actions__secondary {
          width: 100%;
          border-radius: 2px;
          text-transform: uppercase;
          letter-spacing: 3px;
          font-size: 11px;
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .product-actions__primary {
          height: 52px;
          background: #1c1c1c;
          color: #ffffff;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .product-actions__primary:hover {
          background: #8b5e3c;
        }

        .product-actions__secondary {
          height: 48px;
          background: transparent;
          border: 0.5px solid #1c1c1c;
          color: #1c1c1c;
        }

        .product-actions__secondary:hover {
          background: rgba(0, 0, 0, 0.03);
        }

        .product-actions__wishlist {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          margin-top: 4px;
          padding: 0;
          background: none;
          border: none;
          color: #bbb;
          font-size: 11px;
          cursor: pointer;
          transition: color 0.2s ease;
        }

        .product-actions__wishlist:hover {
          color: #8b5e3c;
        }

        .product-delivery {
          border-top: 0.5px solid rgba(0, 0, 0, 0.08);
          padding-top: 20px;
        }

        .product-delivery__row {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 10px 0;
          border-bottom: 0.5px solid rgba(0, 0, 0, 0.06);
        }

        .product-delivery__row:last-child {
          border-bottom: none;
        }

        .product-delivery__icon {
          color: #bbb;
          flex-shrink: 0;
          margin-top: 1px;
        }

        .product-delivery__title {
          font-size: 12px;
          color: #1c1c1c;
          font-weight: 400;
        }

        .product-delivery__sub {
          margin-top: 2px;
          font-size: 11px;
          color: #bbb;
        }

        .product-share {
          padding-top: 20px;
          border-top: 0.5px solid rgba(0, 0, 0, 0.08);
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }

        .product-share__label {
          font-size: 9px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #bbb;
        }

        .product-share a,
        .product-share__copy {
          font-size: 10px;
          color: #999;
          text-decoration: none;
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          transition: color 0.2s ease;
        }

        .product-share a:hover,
        .product-share__copy:hover {
          color: #1c1c1c;
        }

        .product-share__separator {
          color: #e0e0e0;
        }

        .product-tabs {
          background: #ffffff;
          border-top: 0.5px solid rgba(0, 0, 0, 0.08);
        }

        .product-tabs__bar {
          display: flex;
          padding: 0 40px;
          overflow-x: auto;
          border-bottom: 0.5px solid rgba(0, 0, 0, 0.08);
          scrollbar-width: none;
        }

        .product-tabs__bar::-webkit-scrollbar {
          display: none;
        }

        .product-tabs__trigger {
          padding: 16px 20px;
          border: none;
          border-bottom: 2px solid transparent;
          background: none;
          color: #999;
          font-size: 10px;
          letter-spacing: 2px;
          text-transform: uppercase;
          white-space: nowrap;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .product-tabs__trigger.is-active {
          color: #1c1c1c;
          border-bottom-color: #8b5e3c;
          font-weight: 500;
        }

        .product-tabs__content {
          max-width: 680px;
          margin: 0 auto;
          padding: 40px;
          animation: tabFade 0.3s ease;
        }

        .tab-copy {
          display: grid;
          gap: 16px;
          font-size: 13px;
          color: #666;
          line-height: 1.9;
          letter-spacing: 0.2px;
        }

        .tab-copy p {
          margin: 0;
        }

        .tab-specs__row {
          display: grid;
          grid-template-columns: 180px 1fr;
          gap: 12px;
          padding: 10px 0;
          border-bottom: 0.5px solid rgba(0, 0, 0, 0.06);
        }

        .tab-specs__row span:first-child {
          font-size: 11px;
          color: #bbb;
          letter-spacing: 0.5px;
        }

        .tab-specs__row span:last-child {
          font-size: 11px;
          color: #1c1c1c;
        }

        .artisan-tab {
          display: grid;
          gap: 20px;
        }

        .artisan-tab__card {
          display: flex;
          align-items: flex-start;
          gap: 20px;
        }

        .artisan-tab__photo {
          position: relative;
          width: 64px;
          height: 64px;
          flex-shrink: 0;
          overflow: hidden;
          background: #f5f0eb;
        }

        .artisan-tab__photo-image {
          object-fit: cover;
          object-position: top;
        }

        .artisan-tab__info h3 {
          margin: 0 0 6px;
          font-size: 14px;
          font-weight: 400;
          color: #1c1c1c;
        }

        .artisan-tab__specialty {
          margin-bottom: 8px;
          font-size: 10px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #bbb;
        }

        .artisan-tab__info p {
          margin: 0;
          font-size: 13px;
          color: #666;
          line-height: 1.8;
        }

        .artisan-tab__link {
          width: fit-content;
          padding-bottom: 2px;
          border-bottom: 1px solid #1c1c1c;
          text-decoration: none;
          font-size: 10px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #1c1c1c;
        }

        .related-section,
        .recent-section {
          border-top: 0.5px solid rgba(0, 0, 0, 0.08);
        }

        .related-section {
          padding: 64px 40px;
          background: #fafaf8;
        }

        .recent-section {
          padding: 48px 40px 64px;
          background: #ffffff;
          opacity: 0;
          transform: translateY(20px);
        }

        .recent-section.is-visible {
          opacity: 1;
          transform: translateY(0);
          transition: transform 0.4s ease, opacity 0.4s ease;
        }

        .related-section__header,
        .recent-section__header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 24px;
        }

        .related-section__header {
          margin-bottom: 36px;
        }

        .related-section__header span,
        .recent-section__header span {
          font-size: 10px;
          text-transform: uppercase;
          color: #bbb;
        }

        .related-section__header span {
          letter-spacing: 5px;
        }

        .recent-section__header span {
          letter-spacing: 4px;
        }

        .related-section__header a,
        .recent-section__header button {
          font-size: 10px;
          color: #999;
          text-decoration: none;
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
        }

        .related-section__header a {
          letter-spacing: 2px;
          text-transform: uppercase;
          border-bottom: 1px solid #e0e0e0;
          padding-bottom: 2px;
        }

        .recent-section__header button:hover {
          color: #c0392b;
        }

        .related-section__desktop {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 20px;
        }

        .related-section__mobile,
        .recent-section__rail {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          scrollbar-width: none;
        }

        .related-section__mobile {
          display: none;
          scroll-snap-type: x mandatory;
        }

        .stagger-card {
          opacity: 0;
          transform: translateY(14px);
        }

        .stagger-card.is-visible {
          animation: fadeUp 0.45s ease both;
        }

        .editorial-card {
          position: relative;
          flex-shrink: 0;
        }

        .editorial-card--compact {
          width: 140px;
        }

        .editorial-card__link {
          display: block;
          color: inherit;
          text-decoration: none;
        }

        .editorial-card__media {
          position: relative;
          aspect-ratio: 1 / 1.25;
          overflow: hidden;
          background: #f5f0eb;
          margin-bottom: 10px;
        }

        .editorial-card__media.is-dark {
          background: #1c1c1c;
        }

        .editorial-card__image-wrap {
          position: absolute;
          inset: 0;
          overflow: hidden;
        }

        .editorial-card__image {
          transition: transform 0.4s ease, filter 0.4s ease;
        }

        .editorial-card__image--contain {
          object-fit: contain;
          padding: 12px;
        }

        .editorial-card__image--cover {
          object-fit: cover;
          padding: 0;
        }

        .editorial-card__hover-copy {
          position: absolute;
          left: 12px;
          bottom: 12px;
          font-size: 10px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #ffffff;
          opacity: 0;
          transform: translateY(12px);
          transition: opacity 0.25s ease, transform 0.25s ease;
          pointer-events: none;
        }

        .editorial-card__link:hover .editorial-card__image {
          filter: brightness(0.87);
        }

        .editorial-card__link:hover .editorial-card__hover-copy {
          opacity: 1;
          transform: translateY(0);
        }

        .editorial-card__meta {
          display: grid;
          gap: 4px;
        }

        .editorial-card__artisan {
          font-size: 9px;
          letter-spacing: 1px;
          text-transform: uppercase;
          color: #bbb;
        }

        .editorial-card__name {
          margin: 0;
          font-size: 12px;
          font-weight: 400;
          color: #1c1c1c;
          line-height: 1.4;
        }

        .editorial-card__price {
          font-size: 13px;
          font-weight: 500;
          color: #1c1c1c;
        }

        .editorial-card__wishlist {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 32px;
          height: 32px;
          border: 0.5px solid rgba(0, 0, 0, 0.08);
          background: rgba(255, 255, 255, 0.88);
          color: #8b5e3c;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .editorial-card--compact .editorial-card__name {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .sticky-order-bar {
          position: fixed;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 500;
          height: 64px;
          padding: 0 40px;
          background: rgba(250, 250, 248, 0.96);
          border-top: 0.5px solid rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          display: flex;
          align-items: center;
          justify-content: space-between;
          transform: translateY(100%);
          transition: transform 0.35s ease;
        }

        .sticky-order-bar.is-visible {
          transform: translateY(0);
        }

        .sticky-order-bar__meta {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .sticky-order-bar__title {
          font-size: 12px;
          color: #1c1c1c;
          font-weight: 400;
        }

        .sticky-order-bar__price {
          font-size: 13px;
          color: #1c1c1c;
          font-weight: 500;
        }

        .sticky-order-bar__artisan {
          font-size: 10px;
          letter-spacing: 1px;
          color: #bbb;
        }

        .sticky-order-bar__actions {
          display: flex;
          gap: 8px;
        }

        .sticky-order-bar__actions--mobile {
          display: none;
        }

        .sticky-order-bar__primary,
        .sticky-order-bar__secondary {
          height: 42px;
          border-radius: 2px;
          font-size: 10px;
          letter-spacing: 2px;
          text-transform: uppercase;
          cursor: pointer;
        }

        .sticky-order-bar__primary {
          padding: 0 20px;
          background: #1c1c1c;
          color: #ffffff;
          border: none;
        }

        .sticky-order-bar__primary:hover {
          background: #8b5e3c;
        }

        .sticky-order-bar__secondary {
          padding: 0 16px;
          background: transparent;
          border: 0.5px solid #1c1c1c;
          color: #1c1c1c;
        }

        .skeleton-hero {
          display: grid;
          grid-template-columns: 55% 45%;
          min-height: calc(100vh - 112px);
        }

        .skeleton-gallery {
          display: grid;
          grid-template-columns: 72px 1fr;
          gap: 10px;
          padding: 24px 16px 24px 40px;
        }

        .skeleton-thumbs {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .skeleton-info {
          padding: 40px 40px 40px 24px;
        }

        .skeleton-box {
          display: block;
          background: #ede8e2;
          animation: shimmer 1.6s ease infinite;
        }

        .skeleton-box--thumb {
          width: 72px;
          height: 72px;
        }

        .skeleton-box--main {
          height: calc(100vh - 108px);
          background: #f5f0eb;
        }

        .skeleton-box--artisan {
          width: 80px;
          height: 10px;
          margin-bottom: 12px;
        }

        .skeleton-box--title {
          width: 60%;
          height: 20px;
          margin-bottom: 16px;
        }

        .skeleton-box--price {
          width: 30%;
          height: 16px;
          margin-bottom: 20px;
        }

        .skeleton-box--line {
          width: 100%;
          height: 10px;
          margin-bottom: 10px;
        }

        .skeleton-box--button {
          width: 100%;
          height: 52px;
          margin-top: 18px;
        }

        @media (max-width: 767px) {
          .product-page-shell__inner {
            padding-top: 88px;
          }

          .product-breadcrumb--desktop {
            display: none;
          }

          .product-breadcrumb--mobile {
            display: flex;
            padding: 12px 20px;
          }

          .product-breadcrumb--mobile a,
          .product-breadcrumb--mobile span {
            font-size: 10px;
            letter-spacing: 1px;
            color: #999;
          }

          .product-hero,
          .skeleton-hero {
            display: block;
            min-height: auto;
          }

          .gallery-shell__desktop {
            display: none;
          }

          .gallery-shell__mobile {
            display: block;
          }

          .gallery-mobile-dots {
            display: flex;
            justify-content: center;
            gap: 6px;
            padding: 12px 0;
          }

          .gallery-counter,
          .gallery-viewing,
          .gallery-zoom-ring,
          .gallery-zoom-lens {
            display: none;
          }

          .gallery-image--contain {
            padding: 20px;
          }

          .product-info {
            padding: 28px 20px;
          }

          .product-info__title {
            font-size: 20px;
          }

          .product-tabs__bar {
            padding: 0 20px;
          }

          .product-tabs__content {
            padding: 32px 20px;
          }

          .tab-specs__row {
            grid-template-columns: 1fr;
            gap: 4px;
          }

          .related-section {
            padding: 48px 20px;
          }

          .related-section__desktop {
            display: none;
          }

          .related-section__mobile {
            display: flex;
          }

          .related-section__mobile .stagger-card {
            width: 44vw;
            min-width: 44vw;
            scroll-snap-align: start;
          }

          .recent-section {
            padding: 40px 20px 88px;
          }

          .editorial-card--compact {
            width: 120px;
          }

          .sticky-order-bar {
            height: 64px;
            padding: 0 16px;
          }

          .sticky-order-bar__meta {
            min-width: 0;
          }

          .sticky-order-bar__actions--desktop {
            display: none;
          }

          .sticky-order-bar__actions--mobile {
            display: flex;
            flex: 1;
            justify-content: flex-end;
          }

          .sticky-order-bar__primary--mobile {
            flex: 1;
            max-width: 180px;
            height: 48px;
          }

          .sticky-order-bar__artisan {
            display: none;
          }

          .skeleton-gallery {
            display: block;
            padding: 0;
          }

          .skeleton-thumbs {
            display: none;
          }

          .skeleton-box--main {
            width: 100vw;
            height: 85vw;
            max-height: 440px;
            margin-left: calc(50% - 50vw);
          }

          .skeleton-info {
            padding: 28px 20px;
          }
        }
      `}</style>
    </div>
  );
}

export async function getServerSideProps({ params }) {
  try {
    const products = normalizeProducts(await readProducts()).filter(isPublishedProduct);
    const product = getProductBySlug(products, params.slug);

    if (!product) {
      return { notFound: true };
    }

    const sameSubcategoryProducts = products.filter(
      (item) =>
        item.id !== product.id &&
        item.category === product.category &&
        item.subcategory &&
        product.subcategory &&
        item.subcategory === product.subcategory,
    );

    const sameCategoryProducts = products.filter(
      (item) => item.id !== product.id && item.category === product.category,
    );

    const relatedProducts = [
      ...sameSubcategoryProducts,
      ...sameCategoryProducts.filter(
        (item) => !sameSubcategoryProducts.some((candidate) => candidate.id === item.id),
      ),
    ].slice(0, 4);

    return {
      props: {
        product,
        relatedProducts,
      },
    };
  } catch (error) {
    return { notFound: true };
  }
}
