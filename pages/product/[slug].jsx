import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Footer from "../../components/Footer";
import Nav from "../../components/Nav";
import ProductCard from "../../components/ui/ProductCard";
import SafeImage from "../../components/ui/SafeImage";
import SeoHead from "../../components/SeoHead";
import { useCart } from "../../lib/cart-context";
import { getJewelryTypeLabel, isPublishedProduct, resolveProductImageSource } from "../../lib/products";
import { readProducts } from "../../lib/store";

const PLACEHOLDER_IMAGE = "/media/site/placeholder.svg";
const FAQ_ITEMS = [
  {
    id: "delivery",
    question: "How long does delivery take?",
    answer: "2-3 days Nairobi, 5-7 elsewhere.",
  },
  {
    id: "customization",
    question: "Can I customize this piece?",
    answer: "Yes - WhatsApp us.",
  },
  {
    id: "payment",
    question: "What payment methods?",
    answer: "M-Pesa, bank transfer, cash.",
  },
];

const DEFAULT_CARE_COPY =
  "Store in the pouch provided. Avoid contact with water, perfume and body lotion. Wipe gently with dry cloth.";

function formatKes(value) {
  return `KES ${Number(value || 0).toLocaleString("en-KE")}`;
}

function readImageSource(image) {
  return resolveProductImageSource(image) || null;
}

function normalizeArtisanName(value) {
  const safeValue = String(value || "Sharon").trim() || "Sharon";
  return safeValue.replace(/^by\s+/i, "").trim() || "Sharon";
}

function buildArtisanLabel(value) {
  const artisanName = normalizeArtisanName(value).toUpperCase();
  return artisanName.startsWith("BY ") ? artisanName : `BY ${artisanName}`;
}

function truncateText(value, maxLength) {
  const safeValue = String(value || "");
  if (safeValue.length <= maxLength) return safeValue;
  return `${safeValue.slice(0, maxLength).trim()}...`;
}

function buildSku(product) {
  if (product?.sku) return String(product.sku).trim();
  const base = String(product?.slug || product?.id || "piece")
    .replace(/[^a-z0-9]/gi, "")
    .toUpperCase();
  return `SC-${base.slice(0, 8) || "PIECE"}`;
}

function getDisplayPrice(product) {
  const basePrice = Math.max(0, Number(product?.price || 0));
  const salePrice = Math.max(0, Number(product?.sale_price || 0));
  return salePrice > 0 && salePrice < basePrice ? salePrice : basePrice;
}

function getOriginalPrice(product, displayPrice) {
  const basePrice = Math.max(0, Number(product?.price || 0));
  if (displayPrice < basePrice) return basePrice;

  const originalPrice = Math.max(0, Number(product?.originalPrice || 0));
  return originalPrice > displayPrice ? originalPrice : 0;
}

function getAverageRating(reviews) {
  if (!Array.isArray(reviews) || reviews.length === 0) return 0;
  const total = reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0);
  return total / reviews.length;
}

function formatReviewDate(value) {
  if (!value) return "";

  try {
    return new Date(value).toLocaleDateString("en-KE", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

function getStockMeta(product) {
  const stockCount = Number(product?.stock || 0);

  if (stockCount <= 0 || product?.isSold) {
    return {
      dotColor: "#ddd",
      textColor: "#bbb",
      label: "Currently Out of Stock",
    };
  }

  if (product?.fulfillmentType === "made_to_order" || product?.fulfillmentType === "custom_order") {
    return {
      dotColor: "#F59E0B",
      textColor: "#555",
      label: "Made to Order · 5-7 days",
    };
  }

  return {
    dotColor: "#2E7D32",
    textColor: "#555",
    label: "In Stock · Ships within 24 hours",
  };
}

function StarIcon({ filled = false }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M12 3.2 14.78 8.83l6.22.9-4.5 4.39 1.06 6.2L12 17.4l-5.56 2.92 1.06-6.2L3 9.73l6.22-.9L12 3.2Z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StarRating({ rating, size = "default" }) {
  const roundedRating = Math.max(0, Math.min(5, Math.round(Number(rating || 0))));

  return (
    <div className={`product-detail-page__stars${size === "small" ? " product-detail-page__stars--small" : ""}`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <span
          key={`rating-star-${size}-${index}`}
          className={`product-detail-page__star${index < roundedRating ? " is-filled" : ""}`}
          aria-hidden="true"
        >
          <StarIcon filled={index < roundedRating} />
        </span>
      ))}
    </div>
  );
}

function ChatIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M5 6.5h14v9H9.8L6 18.5v-3H5z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M8.5 10.5h7M8.5 13.5h5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function DeliveryIcon({ kind }) {
  if (kind === "delivery") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path
          d="M4 16.5 10 8l3.5 4 2.5-3.5L20 13"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M3 18.5h18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }

  if (kind === "shipping") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path
          d="M3 7.5h10v9H3zM13 10.5h4l2 2v4h-6zM7 18.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM17 18.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (kind === "returns") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path
          d="M7 8.5 3.5 12 7 15.5M4 12h10a4 4 0 1 1 0 8h-3"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M5 6.5h14v9H9.8L6 18.5v-3H5z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M8.5 10.5h7M8.5 13.5h4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SpecRow({ label, value }) {
  return (
    <div className="product-detail-page__spec-row">
      <span className="product-detail-page__spec-key">{label}</span>
      <span className="product-detail-page__spec-value">{value}</span>
    </div>
  );
}

function AccordionSection({ id, label, openSection, onToggle, children }) {
  const isOpen = openSection === id;
  const panelRef = useRef(null);
  const [panelHeight, setPanelHeight] = useState(0);

  useEffect(() => {
    if (!panelRef.current) return;
    setPanelHeight(panelRef.current.scrollHeight);
  }, [children, isOpen]);

  return (
    <div className="product-detail-page__accordion-item">
      <button
        type="button"
        className="product-detail-page__accordion-trigger"
        aria-expanded={isOpen}
        onClick={() => onToggle(id)}
      >
        <span className="product-detail-page__accordion-label">{label}</span>
        <span className="product-detail-page__accordion-symbol" aria-hidden="true">
          {isOpen ? "-" : "+"}
        </span>
      </button>

      <div
        className={`product-detail-page__accordion-panel${isOpen ? " is-open" : ""}`}
        style={{
          maxHeight: isOpen ? `${panelHeight + 20}px` : "0px",
          opacity: isOpen ? 1 : 0,
          paddingBottom: isOpen ? "20px" : "0px",
        }}
      >
        <div ref={panelRef} className="product-detail-page__accordion-panel-inner">
          <div className="product-detail-page__accordion-copy">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default function ProductDetailPage({ product, relatedProducts, reviews }) {
  const { addItem, openCart, isWishlisted, toggleWishlist } = useCart();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [openSection, setOpenSection] = useState("specifications");
  const [openFaq, setOpenFaq] = useState(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [copyLabel, setCopyLabel] = useState("Copy");
  const [relatedVisible, setRelatedVisible] = useState(false);

  const actionSectionRef = useRef(null);
  const reviewsAnchorRef = useRef(null);
  const relatedSectionRef = useRef(null);

  const galleryImages = useMemo(() => {
    const sources = [
      readImageSource(product?.image),
      ...(Array.isArray(product?.images) ? product.images.map(readImageSource) : []),
    ].filter(Boolean);

    const deduped = Array.from(new Set(sources));
    return deduped.length > 0 ? deduped : [PLACEHOLDER_IMAGE];
  }, [product?.image, product?.images]);

  const artisanName = normalizeArtisanName(product?.artisan);
  const artisanLabel = buildArtisanLabel(product?.artisan);
  const description = String(product?.description || product?.shortDescription || "").trim();
  const shortDescription = truncateText(description, 200);
  const unitPrice = getDisplayPrice(product);
  const originalPrice = getOriginalPrice(product, unitPrice);
  const hasSale = originalPrice > unitPrice;
  const total = unitPrice * quantity;
  const reviewCount = Array.isArray(reviews) ? reviews.length : 0;
  const averageRating = getAverageRating(reviews);
  const stockMeta = getStockMeta(product);
  const subcategory =
    product?.subcategory ||
    (product?.jewelryType ? getJewelryTypeLabel(product.jewelryType) : product?.collectionLabel || "Signature Piece");
  const sku = buildSku(product);
  const careInstructions = String(product?.care_instructions || product?.careInstructions || DEFAULT_CARE_COPY).trim();
  const relatedList = Array.isArray(relatedProducts) ? relatedProducts.slice(0, 4) : [];
  const selectedImage = galleryImages[selectedImageIndex] || galleryImages[0] || PLACEHOLDER_IMAGE;
  const saved = isWishlisted(product.id);

  useEffect(() => {
    const current = actionSectionRef.current;
    if (!current || typeof IntersectionObserver === "undefined") return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowStickyBar(!entry.isIntersecting);
      },
      {
        threshold: 0.2,
      },
    );

    observer.observe(current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const current = relatedSectionRef.current;
    if (!current || typeof IntersectionObserver === "undefined") {
      setRelatedVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRelatedVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -60px 0px",
      },
    );

    observer.observe(current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isLightboxOpen) return undefined;

    function handleKeydown(event) {
      if (event.key === "Escape") {
        setIsLightboxOpen(false);
        return;
      }

      if (galleryImages.length <= 1) return;

      if (event.key === "ArrowRight") {
        setSelectedImageIndex((current) => (current + 1) % galleryImages.length);
      }

      if (event.key === "ArrowLeft") {
        setSelectedImageIndex((current) => (current - 1 + galleryImages.length) % galleryImages.length);
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeydown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeydown);
    };
  }, [galleryImages.length, isLightboxOpen]);

  function toggleSection(sectionId) {
    setOpenSection((current) => (current === sectionId ? null : sectionId));
  }

  function handleQuantityChange(value) {
    setQuantity(Math.max(1, Number(value || 1)));
  }

  function addSelectedQuantityToCart() {
    const cartProduct = {
      ...product,
      image: selectedImage,
      price: unitPrice,
    };

    for (let index = 0; index < quantity; index += 1) {
      addItem(cartProduct);
    }

    openCart();
  }

  function openWhatsAppOrder() {
    if (typeof window === "undefined") return;

    const phone = String(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "").replace(/[^\d]/g, "");
    if (!phone) return;

    const message = encodeURIComponent(
      `Hi Sharon 👋\n\n` +
        `I'd like to order:\n\n` +
        `*${product.name}*\n` +
        `Qty: ${quantity}\n` +
        `Price: KES ${total.toLocaleString("en-KE")}` +
        `\n\nPlease confirm availability and M-Pesa payment details. 🙏`,
    );

    window.open(`https://wa.me/${phone}?text=${message}`, "_blank", "noopener,noreferrer");
  }

  async function handleShare(type) {
    if (typeof window === "undefined") return;

    const shareUrl = window.location.href;
    const shareText = `${product.name} - SharonCraft`;

    if (type === "copy") {
      try {
        await window.navigator.clipboard.writeText(shareUrl);
        setCopyLabel("Copied");
        window.setTimeout(() => setCopyLabel("Copy"), 1800);
      } catch {
        setCopyLabel("Copied");
      }
      return;
    }

    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent(shareText);

    const shareTargets = {
      whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    };

    const targetUrl = shareTargets[type];
    if (targetUrl) {
      window.open(targetUrl, "_blank", "noopener,noreferrer");
    }
  }

  function openReviews() {
    setOpenSection("reviews");
    reviewsAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <>
      <SeoHead
        title={`${product.name} | SharonCraft`}
        description={description || `${product.name} by SharonCraft.`}
        image={selectedImage}
        path={`/product/${product.slug}`}
      />

      <div className="product-detail-page">
        <Nav />

        <main>
          <nav className="product-detail-page__breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span className="product-detail-page__breadcrumb-separator" aria-hidden="true">
              {"\u203a"}
            </span>
            <Link href="/shop">Shop</Link>
            <span className="product-detail-page__breadcrumb-separator" aria-hidden="true">
              {"\u203a"}
            </span>
            <span className="product-detail-page__breadcrumb-current">{truncateText(product.name, 30)}</span>
          </nav>

          <section className="product-detail-page__hero">
            <div className="product-detail-page__gallery-column">
              <div className="product-detail-page__gallery-shell">
                <button
                  type="button"
                  className="product-detail-page__main-image-button"
                  onClick={() => setIsLightboxOpen(true)}
                  aria-label={`Open image gallery for ${product.name}`}
                >
                  <div className="product-detail-page__main-image-frame">
                    <span className="product-detail-page__zoom-tag">ZOOM</span>
                    <SafeImage
                      src={selectedImage}
                      alt={product.name}
                      type="product"
                      className="product-detail-page__main-image"
                      priority
                    />
                  </div>
                </button>

                {galleryImages.length > 1 ? (
                  <div className="product-detail-page__thumb-strip" aria-label="Product image thumbnails">
                    {galleryImages.map((image, index) => (
                      <button
                        key={`${image}-${index}`}
                        type="button"
                        className={`product-detail-page__thumb${index === selectedImageIndex ? " is-active" : ""}`}
                        onClick={() => setSelectedImageIndex(index)}
                        aria-label={`View image ${index + 1}`}
                      >
                        <SafeImage
                          src={image}
                          alt={`${product.name} view ${index + 1}`}
                          type="square"
                          className="product-detail-page__thumb-image"
                        />
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="product-detail-page__info-column">
              <div className="product-detail-page__info-stack">
                <p className="product-detail-page__artisan-label reveal reveal--0">{artisanLabel}</p>

                <h1 className="product-detail-page__title reveal reveal--1">{product.name}</h1>

                <div className="product-detail-page__price-row reveal reveal--2">
                  <span className="product-detail-page__price">{formatKes(unitPrice)}</span>
                  {hasSale ? <span className="product-detail-page__price-original">{formatKes(originalPrice)}</span> : null}
                </div>

                <div className="product-detail-page__divider reveal reveal--2" />

                <p className="product-detail-page__trust reveal reveal--3">
                  <span>Handmade in Kenya</span>
                  <span className="product-detail-page__trust-separator">{"\u00b7"}</span>
                  <span>30-day Returns</span>
                  <span className="product-detail-page__trust-separator">{"\u00b7"}</span>
                  <span>WhatsApp Support</span>
                </p>

                <div className="product-detail-page__stock reveal reveal--4">
                  <span className="product-detail-page__stock-dot" style={{ background: stockMeta.dotColor }} />
                  <span className="product-detail-page__stock-copy" style={{ color: stockMeta.textColor }}>
                    {stockMeta.label}
                  </span>
                </div>

                <div className="product-detail-page__rating-row reveal reveal--4">
                  <StarRating rating={averageRating} />
                  <span className="product-detail-page__rating-count">({reviewCount} reviews)</span>
                  <button type="button" className="product-detail-page__rating-link" onClick={openReviews}>
                    Read reviews
                  </button>
                </div>

                <div className="product-detail-page__description-block reveal reveal--5">
                  <p
                    className={`product-detail-page__description${descriptionExpanded ? " is-expanded" : ""}${
                      description.length > 200 ? " is-collapsed" : ""
                    }`}
                  >
                    {descriptionExpanded || description.length <= 200 ? description : shortDescription}
                  </p>
                  {description.length > 200 ? (
                    <button
                      type="button"
                      className="product-detail-page__description-toggle"
                      onClick={() => setDescriptionExpanded((current) => !current)}
                    >
                      {descriptionExpanded ? "Read less" : "Read more"}
                    </button>
                  ) : null}
                </div>

                <div className="product-detail-page__purchase reveal reveal--6" ref={actionSectionRef}>
                  <div className="product-detail-page__quantity-block">
                    <p className="product-detail-page__qty-label">QTY</p>
                    <div className="product-detail-page__qty-controls">
                      <button
                        type="button"
                        className="product-detail-page__qty-button"
                        onClick={() => handleQuantityChange(quantity - 1)}
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={quantity}
                        className="product-detail-page__qty-input"
                        onChange={(event) => handleQuantityChange(event.target.value)}
                        aria-label="Quantity"
                      />
                      <button
                        type="button"
                        className="product-detail-page__qty-button"
                        onClick={() => handleQuantityChange(quantity + 1)}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                    <p className="product-detail-page__total">TOTAL: {formatKes(total)}</p>
                  </div>

                  <div className="product-detail-page__action-stack">
                    <button type="button" className="product-detail-page__primary-button" onClick={openWhatsAppOrder}>
                      <span className="product-detail-page__button-icon">
                        <ChatIcon />
                      </span>
                      <span>ORDER ON WHATSAPP</span>
                    </button>

                    <button type="button" className="product-detail-page__secondary-button" onClick={addSelectedQuantityToCart}>
                      ADD TO CART
                    </button>

                    <button
                      type="button"
                      className="product-detail-page__wishlist-button"
                      onClick={() => toggleWishlist({ ...product, image: selectedImage, price: unitPrice })}
                    >
                      {saved ? "Saved to Wishlist" : "Save to Wishlist"}
                    </button>
                  </div>
                </div>

                <div className="product-detail-page__share">
                  <span className="product-detail-page__share-label">SHARE -</span>
                  <div className="product-detail-page__share-links">
                    <button type="button" className="product-detail-page__share-link" onClick={() => handleShare("whatsapp")}>
                      WhatsApp
                    </button>
                    <span className="product-detail-page__share-separator">{"\u00b7"}</span>
                    <button type="button" className="product-detail-page__share-link" onClick={() => handleShare("twitter")}>
                      Twitter
                    </button>
                    <span className="product-detail-page__share-separator">{"\u00b7"}</span>
                    <button type="button" className="product-detail-page__share-link" onClick={() => handleShare("facebook")}>
                      Facebook
                    </button>
                    <span className="product-detail-page__share-separator">{"\u00b7"}</span>
                    <button type="button" className="product-detail-page__share-link" onClick={() => handleShare("copy")}>
                      {copyLabel}
                    </button>
                  </div>
                </div>

                <div className="product-detail-page__accordion" ref={reviewsAnchorRef}>
                  <AccordionSection
                    id="specifications"
                    label="SPECIFICATIONS"
                    openSection={openSection}
                    onToggle={toggleSection}
                  >
                    <SpecRow label="Category" value={product.category || "Jewellery"} />
                    <SpecRow label="Subcategory" value={subcategory} />
                    <SpecRow label="Artisan" value={artisanName} />
                    <SpecRow label="Handmade in" value="Kenya" />
                    <SpecRow label="SKU" value={sku} />
                  </AccordionSection>

                  <AccordionSection
                    id="reviews"
                    label={`CUSTOMER REVIEWS${reviewCount ? ` (${reviewCount})` : ""}`}
                    openSection={openSection}
                    onToggle={toggleSection}
                  >
                    {reviewCount === 0 ? (
                      <p className="product-detail-page__empty-copy">No reviews yet. Be the first!</p>
                    ) : (
                      <div className="product-detail-page__review-list">
                        {reviews.map((review) => (
                          <article
                            key={review.id || `${review.customer_name || "reviewer"}-${review.created_at || "now"}`}
                            className="product-detail-page__review-card"
                          >
                            <div className="product-detail-page__review-card-header">
                              <div className="product-detail-page__review-meta">
                                <StarRating rating={Number(review.rating || 0)} size="small" />
                                <div className="product-detail-page__review-author-row">
                                  <span className="product-detail-page__review-author">
                                    {review.customer_name || review.reviewer_name || review.name || "Verified Buyer"}
                                  </span>
                                  {review.is_verified || review.verified_buyer ? (
                                    <span className="product-detail-page__verified-badge">Verified Buyer</span>
                                  ) : null}
                                </div>
                              </div>

                              <span className="product-detail-page__review-date">{formatReviewDate(review.created_at)}</span>
                            </div>

                            <p className="product-detail-page__review-body">
                              {review.comment || review.review_text || review.text || ""}
                            </p>
                          </article>
                        ))}
                      </div>
                    )}
                  </AccordionSection>

                  <AccordionSection id="details" label="DETAILS" openSection={openSection} onToggle={toggleSection}>
                    <p>{description}</p>
                  </AccordionSection>

                  <AccordionSection id="faq" label="FAQ" openSection={openSection} onToggle={toggleSection}>
                    <div className="product-detail-page__faq-list">
                      {FAQ_ITEMS.map((item) => {
                        const isOpen = openFaq === item.id;

                        return (
                          <div key={item.id} className="product-detail-page__faq-item">
                            <button
                              type="button"
                              className="product-detail-page__faq-trigger"
                              aria-expanded={isOpen}
                              onClick={() => setOpenFaq((current) => (current === item.id ? null : item.id))}
                            >
                              <span>{item.question}</span>
                              <span aria-hidden="true">{isOpen ? "-" : "+"}</span>
                            </button>

                            <div
                              className={`product-detail-page__faq-panel${isOpen ? " is-open" : ""}`}
                              style={{
                                maxHeight: isOpen ? "120px" : "0px",
                                opacity: isOpen ? 1 : 0,
                              }}
                            >
                              <div className="product-detail-page__faq-panel-inner">
                                <p>{item.answer}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </AccordionSection>

                  <AccordionSection id="care" label="CARE INSTRUCTIONS" openSection={openSection} onToggle={toggleSection}>
                    <p>{careInstructions}</p>
                  </AccordionSection>

                  <AccordionSection
                    id="artisan"
                    label="ABOUT THE ARTISAN"
                    openSection={openSection}
                    onToggle={toggleSection}
                  >
                    <div className="product-detail-page__artisan-copy-block">
                      <p className="product-detail-page__artisan-name-copy">{artisanName}</p>
                      <p>{product?.story?.text || "Made by skilled artisans in Nairobi, Kenya."}</p>
                      {product?.story?.culturalNote ? <p>{product.story.culturalNote}</p> : null}
                    </div>
                  </AccordionSection>
                </div>

                <div className="product-detail-page__delivery">
                  <div className="product-detail-page__delivery-row">
                    <span className="product-detail-page__delivery-icon">
                      <DeliveryIcon kind="delivery" />
                    </span>
                    <div>
                      <p className="product-detail-page__delivery-title">Free Delivery in Nairobi</p>
                      <p className="product-detail-page__delivery-subtitle">
                        Within 2-3 business days. KES 500 for other areas.
                      </p>
                    </div>
                  </div>

                  <div className="product-detail-page__delivery-row">
                    <span className="product-detail-page__delivery-icon">
                      <DeliveryIcon kind="shipping" />
                    </span>
                    <div>
                      <p className="product-detail-page__delivery-title">Ships within 24 hours</p>
                      <p className="product-detail-page__delivery-subtitle">After payment confirmed.</p>
                    </div>
                  </div>

                  <div className="product-detail-page__delivery-row">
                    <span className="product-detail-page__delivery-icon">
                      <DeliveryIcon kind="returns" />
                    </span>
                    <div>
                      <p className="product-detail-page__delivery-title">30-day Returns</p>
                      <p className="product-detail-page__delivery-subtitle">Hassle-free return window.</p>
                    </div>
                  </div>

                  <div className="product-detail-page__delivery-row">
                    <span className="product-detail-page__delivery-icon">
                      <DeliveryIcon kind="support" />
                    </span>
                    <div>
                      <p className="product-detail-page__delivery-title">WhatsApp Support</p>
                      <p className="product-detail-page__delivery-subtitle">Chat with us anytime.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {relatedList.length ? (
            <section ref={relatedSectionRef} className="product-detail-page__related">
              <div className="product-detail-page__related-header">
                <h2 className="product-detail-page__related-title">YOU MAY ALSO LIKE</h2>
                <Link href="/shop" className="product-detail-page__related-link">
                  View all {String.fromCharCode(8594)}
                </Link>
              </div>

              <div className="product-detail-page__related-grid">
                {relatedList.map((item, index) => (
                  <div
                    key={item.id}
                    className={`product-detail-page__related-card${relatedVisible ? " is-visible" : ""}`}
                    style={{ animationDelay: `${index * 80}ms` }}
                  >
                    <ProductCard product={item} variant="related-products" />
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {showStickyBar ? (
            <div className="product-detail-page__sticky-bar">
              <div className="product-detail-page__sticky-inner">
                <div className="product-detail-page__sticky-copy">
                  <p className="product-detail-page__sticky-name">{truncateText(product.name, 28)}</p>
                  <p className="product-detail-page__sticky-price">{formatKes(unitPrice)}</p>
                </div>

                <div className="product-detail-page__sticky-actions">
                  <button
                    type="button"
                    className="product-detail-page__sticky-button product-detail-page__sticky-button--primary"
                    onClick={openWhatsAppOrder}
                  >
                    WHATSAPP
                  </button>
                  <button type="button" className="product-detail-page__sticky-button" onClick={addSelectedQuantityToCart}>
                    ADD TO CART
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {isLightboxOpen ? (
            <div className="product-detail-page__lightbox" onClick={() => setIsLightboxOpen(false)}>
              <button
                type="button"
                className="product-detail-page__lightbox-close"
                aria-label="Close image gallery"
                onClick={() => setIsLightboxOpen(false)}
              >
                {String.fromCharCode(215)}
              </button>

              {galleryImages.length > 1 ? (
                <>
                  <button
                    type="button"
                    className="product-detail-page__lightbox-nav product-detail-page__lightbox-nav--prev"
                    aria-label="Previous image"
                    onClick={(event) => {
                      event.stopPropagation();
                      setSelectedImageIndex((current) => (current - 1 + galleryImages.length) % galleryImages.length);
                    }}
                  >
                    {String.fromCharCode(8249)}
                  </button>

                  <button
                    type="button"
                    className="product-detail-page__lightbox-nav product-detail-page__lightbox-nav--next"
                    aria-label="Next image"
                    onClick={(event) => {
                      event.stopPropagation();
                      setSelectedImageIndex((current) => (current + 1) % galleryImages.length);
                    }}
                  >
                    {String.fromCharCode(8250)}
                  </button>
                </>
              ) : null}

              <div
                className="product-detail-page__lightbox-image-frame"
                onClick={(event) => event.stopPropagation()}
              >
                <SafeImage
                  src={selectedImage}
                  alt={product.name}
                  type="product"
                  className="product-detail-page__lightbox-image"
                  priority
                />
              </div>
            </div>
          ) : null}
        </main>

        <Footer />
      </div>

      <style jsx>{`
        :global(body) {
          background: #fafaf8;
        }

        .product-detail-page {
          --cream: #fafaf8;
          --black: #080808;
          --dark: #1c1c1c;
          --brown: #8b5e3c;
          --border: rgba(0, 0, 0, 0.08);
          --card-bg: #f5f0eb;
          background: var(--cream);
          color: var(--dark);
          padding-bottom: 84px;
        }

        .product-detail-page__breadcrumb {
          display: flex;
          align-items: center;
          gap: 0;
          overflow-x: auto;
          padding: 16px 40px;
          color: #bbb;
          font-size: 11px;
          letter-spacing: 0.5px;
          white-space: nowrap;
        }

        .product-detail-page__breadcrumb :global(a) {
          color: inherit;
          text-decoration: none;
        }

        .product-detail-page__breadcrumb-current {
          overflow: hidden;
          color: var(--dark);
          font-weight: 400;
          text-overflow: ellipsis;
        }

        .product-detail-page__breadcrumb-separator {
          margin: 0 6px;
          color: #e0e0e0;
        }

        .product-detail-page__hero {
          display: grid;
          grid-template-columns: 55% 45%;
          align-items: start;
          min-height: calc(100vh - 100px);
        }

        .product-detail-page__gallery-shell {
          position: sticky;
          top: 64px;
          display: flex;
          height: calc(100vh - 64px);
          flex-direction: column;
          padding: 0 24px 24px 40px;
          animation: galleryFade 0.5s ease 0.1s both;
        }

        .product-detail-page__main-image-button {
          display: flex;
          flex: 1;
          padding: 0;
          border: none;
          background: transparent;
          cursor: zoom-in;
        }

        .product-detail-page__main-image-frame {
          position: relative;
          flex: 1;
          min-height: 400px;
          overflow: hidden;
          background: var(--card-bg);
        }

        .product-detail-page__main-image {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          padding: 32px;
          object-fit: contain;
          transition: transform 0.4s ease;
        }

        .product-detail-page__main-image-button:hover .product-detail-page__main-image {
          transform: scale(1.03);
        }

        .product-detail-page__zoom-tag {
          position: absolute;
          top: 16px;
          right: 16px;
          z-index: 2;
          color: #ccc;
          font-size: 9px;
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        .product-detail-page__thumb-strip {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding-top: 12px;
          flex-shrink: 0;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .product-detail-page__thumb-strip::-webkit-scrollbar,
        .product-detail-page__related-grid::-webkit-scrollbar {
          display: none;
        }

        .product-detail-page__thumb {
          position: relative;
          width: 60px;
          height: 60px;
          flex-shrink: 0;
          padding: 0;
          border: 1.5px solid transparent;
          background: var(--card-bg);
          opacity: 0.45;
          cursor: pointer;
          transition:
            opacity 0.2s ease,
            border-color 0.2s ease;
        }

        .product-detail-page__thumb:hover {
          opacity: 0.75;
        }

        .product-detail-page__thumb.is-active {
          opacity: 1;
          border-color: var(--dark);
        }

        .product-detail-page__thumb-image {
          background: transparent;
        }

        .product-detail-page__info-column {
          padding: 40px 40px 40px 32px;
        }

        .product-detail-page__info-stack {
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .reveal {
          animation: fadeUp 0.45s ease both;
        }

        .reveal--0 {
          animation-delay: 0ms;
        }

        .reveal--1 {
          animation-delay: 50ms;
        }

        .reveal--2 {
          animation-delay: 100ms;
        }

        .reveal--3 {
          animation-delay: 150ms;
        }

        .reveal--4 {
          animation-delay: 200ms;
        }

        .reveal--5 {
          animation-delay: 250ms;
        }

        .reveal--6 {
          animation-delay: 300ms;
        }

        .product-detail-page__artisan-label {
          margin: 0 0 8px;
          color: #bbb;
          font-size: 10px;
          font-weight: 400;
          letter-spacing: 3px;
          text-transform: uppercase;
        }

        .product-detail-page__title {
          margin: 0 0 16px;
          color: var(--dark);
          font-size: 26px;
          font-weight: 300;
          line-height: 1.2;
          letter-spacing: -0.3px;
        }

        .product-detail-page__price-row {
          display: flex;
          align-items: baseline;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 20px;
        }

        .product-detail-page__price {
          color: var(--dark);
          font-size: 18px;
          font-weight: 400;
        }

        .product-detail-page__price-original {
          color: #ccc;
          font-size: 14px;
          text-decoration: line-through;
        }

        .product-detail-page__divider {
          height: 0.5px;
          margin: 4px 0 20px;
          background: var(--border);
        }

        .product-detail-page__trust {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 6px;
          margin: 0 0 16px;
          color: #bbb;
          font-size: 11px;
          letter-spacing: 0.3px;
        }

        .product-detail-page__trust-separator,
        .product-detail-page__share-separator {
          color: #ddd;
        }

        .product-detail-page__stock {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 20px;
        }

        .product-detail-page__stock-dot {
          width: 6px;
          height: 6px;
          border-radius: 999px;
          flex-shrink: 0;
        }

        .product-detail-page__stock-copy {
          font-size: 11px;
        }

        .product-detail-page__rating-row {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 24px;
        }

        .product-detail-page__stars {
          display: flex;
          align-items: center;
          gap: 2px;
          color: #e0e0e0;
        }

        .product-detail-page__star {
          display: inline-flex;
          width: 13px;
          height: 13px;
          color: #e0e0e0;
        }

        .product-detail-page__star.is-filled {
          color: var(--brown);
        }

        .product-detail-page__star :global(svg) {
          width: 100%;
          height: 100%;
          display: block;
        }

        .product-detail-page__stars--small .product-detail-page__star {
          width: 12px;
          height: 12px;
        }

        .product-detail-page__rating-count,
        .product-detail-page__review-date {
          color: #bbb;
          font-size: 11px;
        }

        .product-detail-page__rating-link {
          padding: 0 0 1px;
          border: none;
          border-bottom: 1px solid #e0e0e0;
          background: transparent;
          color: #bbb;
          font-size: 11px;
          cursor: pointer;
          transition:
            color 0.2s ease,
            border-color 0.2s ease;
        }

        .product-detail-page__rating-link:hover,
        .product-detail-page__share-link:hover,
        .product-detail-page__related-link:hover,
        .product-detail-page__wishlist-button:hover {
          color: var(--dark);
          border-color: var(--dark);
        }

        .product-detail-page__description-block {
          margin-bottom: 24px;
        }

        .product-detail-page__description {
          margin: 0;
          color: #555;
          font-size: 13px;
          line-height: 1.8;
          letter-spacing: 0.2px;
        }

        .product-detail-page__description-toggle {
          margin-top: 8px;
          padding: 0;
          border: none;
          background: transparent;
          color: var(--brown);
          font-size: 11px;
          cursor: pointer;
        }

        .product-detail-page__purchase {
          margin-bottom: 20px;
        }

        .product-detail-page__qty-label {
          margin: 0 0 8px;
          color: #bbb;
          font-size: 9px;
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        .product-detail-page__qty-controls {
          display: inline-flex;
          align-items: center;
        }

        .product-detail-page__qty-button {
          width: 40px;
          height: 40px;
          border: 0.5px solid #e0e0e0;
          background: transparent;
          color: var(--dark);
          font-size: 18px;
          line-height: 1;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .product-detail-page__qty-button:first-child {
          border-right: none;
        }

        .product-detail-page__qty-button:last-child {
          border-left: none;
        }

        .product-detail-page__qty-button:hover {
          background: #f5f5f5;
        }

        .product-detail-page__qty-input {
          width: 52px;
          height: 40px;
          border-top: 0.5px solid #e0e0e0;
          border-right: none;
          border-bottom: 0.5px solid #e0e0e0;
          border-left: none;
          background: #fafaf8;
          color: var(--dark);
          font-size: 13px;
          text-align: center;
          outline: none;
        }

        .product-detail-page__qty-input::-webkit-outer-spin-button,
        .product-detail-page__qty-input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }

        .product-detail-page__qty-input[type="number"] {
          -moz-appearance: textfield;
        }

        .product-detail-page__total {
          margin: 8px 0 24px;
          color: #bbb;
          font-size: 10px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
        }

        .product-detail-page__action-stack {
          display: grid;
          gap: 10px;
        }

        .product-detail-page__primary-button,
        .product-detail-page__secondary-button,
        .product-detail-page__sticky-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          border-radius: 2px;
          cursor: pointer;
          text-transform: uppercase;
          transition:
            background 0.25s ease,
            color 0.2s ease,
            border-color 0.2s ease;
        }

        .product-detail-page__primary-button {
          height: 52px;
          border: none;
          background: var(--dark);
          color: #fff;
          font-size: 11px;
          letter-spacing: 3px;
        }

        .product-detail-page__primary-button:hover,
        .product-detail-page__sticky-button--primary:hover {
          background: var(--brown);
        }

        .product-detail-page__secondary-button,
        .product-detail-page__sticky-button {
          height: 48px;
          border: 0.5px solid var(--dark);
          background: transparent;
          color: var(--dark);
          font-size: 11px;
          letter-spacing: 3px;
        }

        .product-detail-page__secondary-button:hover,
        .product-detail-page__sticky-button:hover {
          background: rgba(0, 0, 0, 0.04);
        }

        .product-detail-page__wishlist-button {
          margin-top: 4px;
          padding: 0;
          border: none;
          background: transparent;
          color: #bbb;
          font-size: 11px;
          letter-spacing: 1px;
          text-align: center;
          cursor: pointer;
          transition: color 0.2s ease;
        }

        .product-detail-page__button-icon {
          display: inline-flex;
          width: 16px;
          height: 16px;
          flex-shrink: 0;
        }

        .product-detail-page__button-icon :global(svg),
        .product-detail-page__delivery-icon :global(svg) {
          width: 100%;
          height: 100%;
          display: block;
        }

        .product-detail-page__share {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 20px;
          padding-top: 20px;
          border-top: 0.5px solid var(--border);
        }

        .product-detail-page__share-label {
          color: #ccc;
          font-size: 9px;
          letter-spacing: 2px;
          text-transform: uppercase;
          flex-shrink: 0;
        }

        .product-detail-page__share-links {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
        }

        .product-detail-page__share-link,
        .product-detail-page__related-link {
          padding: 0;
          border: none;
          border-bottom: 1px solid transparent;
          background: transparent;
          color: #bbb;
          font-size: 10px;
          letter-spacing: 0.2px;
          cursor: pointer;
          text-decoration: none;
          transition:
            color 0.2s ease,
            border-color 0.2s ease;
        }

        .product-detail-page__accordion {
          margin-top: 28px;
          border-top: 0.5px solid var(--border);
        }

        .product-detail-page__accordion-item {
          border-bottom: 0.5px solid var(--border);
        }

        .product-detail-page__accordion-trigger {
          display: flex;
          width: 100%;
          align-items: center;
          justify-content: space-between;
          padding: 16px 0;
          border: none;
          background: transparent;
          color: var(--dark);
          text-align: left;
          cursor: pointer;
        }

        .product-detail-page__accordion-label {
          color: var(--dark);
          font-size: 11px;
          font-weight: 400;
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        .product-detail-page__accordion-symbol {
          color: #bbb;
          font-size: 18px;
          line-height: 1;
          transition: transform 0.2s ease;
        }

        .product-detail-page__accordion-panel {
          overflow: hidden;
          transition:
            max-height 0.35s ease,
            opacity 0.3s ease,
            padding-bottom 0.35s ease;
        }

        .product-detail-page__accordion-copy {
          color: #555;
          font-size: 12px;
          line-height: 1.8;
        }

        .product-detail-page__accordion-copy p {
          margin: 0;
        }

        .product-detail-page__spec-row {
          display: grid;
          grid-template-columns: 140px 1fr;
          gap: 0;
          padding: 6px 0;
          border-bottom: 0.5px solid #f5f5f5;
        }

        .product-detail-page__spec-row:last-child {
          border-bottom: none;
        }

        .product-detail-page__spec-key {
          color: #bbb;
          font-size: 11px;
          letter-spacing: 0.5px;
        }

        .product-detail-page__spec-value {
          color: var(--dark);
          font-size: 11px;
        }

        .product-detail-page__empty-copy {
          color: #bbb;
          font-size: 12px;
        }

        .product-detail-page__review-list {
          display: grid;
          gap: 0;
        }

        .product-detail-page__review-card {
          padding: 16px 0;
          border-bottom: 0.5px solid rgba(0, 0, 0, 0.06);
        }

        .product-detail-page__review-card:last-child {
          padding-bottom: 0;
          border-bottom: none;
        }

        .product-detail-page__review-card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 10px;
        }

        .product-detail-page__review-meta {
          display: grid;
          gap: 8px;
        }

        .product-detail-page__review-author-row {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
        }

        .product-detail-page__review-author,
        .product-detail-page__delivery-title,
        .product-detail-page__artisan-name-copy {
          color: var(--dark);
          font-size: 12px;
          font-weight: 400;
        }

        .product-detail-page__verified-badge {
          padding: 1px 6px;
          border: 0.5px solid var(--brown);
          color: var(--brown);
          font-size: 9px;
        }

        .product-detail-page__review-body,
        .product-detail-page__delivery-subtitle {
          color: #555;
          font-size: 12px;
          line-height: 1.7;
        }

        .product-detail-page__faq-list {
          display: grid;
          gap: 10px;
        }

        .product-detail-page__faq-item {
          border-bottom: 0.5px solid #f1ece7;
        }

        .product-detail-page__faq-trigger {
          display: flex;
          width: 100%;
          align-items: center;
          justify-content: space-between;
          padding: 0 0 10px;
          border: none;
          background: transparent;
          color: var(--dark);
          font-size: 12px;
          cursor: pointer;
          text-align: left;
        }

        .product-detail-page__faq-panel {
          overflow: hidden;
          transition:
            max-height 0.3s ease,
            opacity 0.25s ease;
        }

        .product-detail-page__faq-panel-inner {
          padding-bottom: 10px;
        }

        .product-detail-page__artisan-copy-block {
          display: grid;
          gap: 10px;
        }

        .product-detail-page__delivery {
          margin-top: 28px;
          padding-top: 20px;
          border-top: 0.5px solid var(--border);
        }

        .product-detail-page__delivery-row {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 12px 0;
          border-bottom: 0.5px solid rgba(0, 0, 0, 0.06);
        }

        .product-detail-page__delivery-icon {
          width: 16px;
          height: 16px;
          color: #bbb;
          flex-shrink: 0;
        }

        .product-detail-page__delivery-title {
          margin: 0;
        }

        .product-detail-page__delivery-subtitle {
          margin: 2px 0 0;
          color: #bbb;
          font-size: 11px;
        }

        .product-detail-page__related {
          border-top: 0.5px solid var(--border);
          padding: 64px 40px;
        }

        .product-detail-page__related-header {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 36px;
        }

        .product-detail-page__related-title {
          margin: 0;
          color: #bbb;
          font-size: 10px;
          font-weight: 400;
          letter-spacing: 5px;
          text-transform: uppercase;
        }

        .product-detail-page__related-link {
          padding-bottom: 2px;
          border-bottom-color: #e0e0e0;
          font-size: 10px;
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        .product-detail-page__related-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 20px;
        }

        .product-detail-page__related-card {
          opacity: 0;
          transform: translateY(14px);
        }

        .product-detail-page__related-card.is-visible {
          animation: fadeUp 0.5s ease both;
        }

        .product-detail-page__sticky-bar {
          position: fixed;
          right: 0;
          bottom: 0;
          left: 0;
          z-index: 500;
          height: 64px;
          padding: 0 40px;
          border-top: 0.5px solid rgba(0, 0, 0, 0.1);
          background: rgba(250, 250, 248, 0.96);
          backdrop-filter: blur(16px);
        }

        .product-detail-page__sticky-inner {
          display: flex;
          height: 100%;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .product-detail-page__sticky-copy {
          min-width: 0;
        }

        .product-detail-page__sticky-name,
        .product-detail-page__sticky-price {
          margin: 0;
        }

        .product-detail-page__sticky-name {
          overflow: hidden;
          color: var(--dark);
          font-size: 12px;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .product-detail-page__sticky-price {
          color: var(--dark);
          font-size: 13px;
          font-weight: 500;
        }

        .product-detail-page__sticky-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .product-detail-page__sticky-button {
          height: 40px;
          padding: 0 16px;
          font-size: 10px;
          letter-spacing: 2px;
          white-space: nowrap;
        }

        .product-detail-page__sticky-button--primary {
          border: none;
          background: var(--dark);
          color: #fff;
          padding: 0 20px;
        }

        .product-detail-page__lightbox {
          position: fixed;
          inset: 0;
          z-index: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(8, 8, 8, 0.92);
        }

        .product-detail-page__lightbox-image-frame {
          position: relative;
          width: min(90vw, 960px);
          height: min(90vh, 960px);
        }

        .product-detail-page__lightbox-image {
          background: transparent;
        }

        .product-detail-page__lightbox-close,
        .product-detail-page__lightbox-nav {
          position: absolute;
          border: none;
          background: transparent;
          color: #fff;
          cursor: pointer;
        }

        .product-detail-page__lightbox-close {
          top: 20px;
          right: 24px;
          font-size: 28px;
          text-transform: uppercase;
        }

        .product-detail-page__lightbox-nav {
          top: 50%;
          transform: translateY(-50%);
          font-size: 42px;
          line-height: 1;
        }

        .product-detail-page__lightbox-nav--prev {
          left: 24px;
        }

        .product-detail-page__lightbox-nav--next {
          right: 24px;
        }

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

        @keyframes galleryFade {
          from {
            opacity: 0;
          }

          to {
            opacity: 1;
          }
        }

        @media (max-width: 1023px) {
          .product-detail-page__hero {
            grid-template-columns: 1fr;
          }

          .product-detail-page__gallery-shell {
            position: static;
            height: auto;
            padding: 0 20px;
          }

          .product-detail-page__main-image-frame {
            height: 80vw;
            min-height: 0;
            max-height: 440px;
          }

          .product-detail-page__main-image {
            padding: 20px;
          }

          .product-detail-page__thumb {
            width: 52px;
            height: 52px;
          }

          .product-detail-page__info-column {
            padding: 28px 20px 0;
          }

          .product-detail-page__related {
            padding: 48px 20px;
          }

          .product-detail-page__related-grid {
            display: flex;
            overflow-x: auto;
            gap: 12px;
            scrollbar-width: none;
            -ms-overflow-style: none;
            scroll-snap-type: x mandatory;
          }

          .product-detail-page__related-card {
            width: 44vw;
            min-width: 220px;
            flex-shrink: 0;
            scroll-snap-align: start;
          }
        }

        @media (max-width: 767px) {
          .product-detail-page {
            padding-bottom: 74px;
          }

          .product-detail-page__breadcrumb {
            padding: 12px 20px;
          }

          .product-detail-page__title {
            font-size: 22px;
          }

          .product-detail-page__price {
            font-size: 16px;
          }

          .product-detail-page__description.is-collapsed:not(.is-expanded) {
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 4;
            overflow: hidden;
          }

          .product-detail-page__share {
            align-items: flex-start;
            flex-direction: column;
          }

          .product-detail-page__spec-row {
            grid-template-columns: 110px 1fr;
          }

          .product-detail-page__review-card-header {
            flex-direction: column;
          }

          .product-detail-page__sticky-bar {
            height: 60px;
            padding: 0 16px;
          }

          .product-detail-page__sticky-actions {
            flex: 1;
          }

          .product-detail-page__sticky-button,
          .product-detail-page__sticky-button--primary {
            flex: 1;
            height: 44px;
            padding: 0 12px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .reveal,
          .product-detail-page__related-card.is-visible,
          .product-detail-page__gallery-shell {
            animation: none;
          }

          .product-detail-page__main-image,
          .product-detail-page__thumb,
          .product-detail-page__rating-link,
          .product-detail-page__share-link,
          .product-detail-page__accordion-panel,
          .product-detail-page__faq-panel,
          .product-detail-page__primary-button,
          .product-detail-page__secondary-button,
          .product-detail-page__sticky-button {
            transition: none;
          }
        }
      `}</style>
    </>
  );
}

async function fetchApprovedReviews(productId) {
  const supabaseUrl =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://vonzscriztdcdhobulhy.supabase.co";
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return [];
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("product_id", productId)
      .eq("is_approved", true)
      .order("created_at", { ascending: false });

    if (error || !Array.isArray(data)) {
      return [];
    }

    return data;
  } catch {
    return [];
  }
}

export async function getServerSideProps({ params }) {
  const products = await readProducts();
  const product = products.find((item) => item.slug === params.slug && isPublishedProduct(item));

  if (!product) {
    return { notFound: true };
  }

  const visibleProducts = products.filter((item) => {
    const isVisible = item.is_visible ?? item.isVisible ?? true;
    return item.id !== product.id && isVisible && isPublishedProduct(item);
  });

  const relatedProducts = [];
  const seenIds = new Set();

  for (const candidate of visibleProducts.filter((item) => item.category === product.category)) {
    if (seenIds.has(candidate.id)) continue;
    seenIds.add(candidate.id);
    relatedProducts.push(candidate);
    if (relatedProducts.length === 4) break;
  }

  if (relatedProducts.length < 4) {
    for (const candidate of visibleProducts) {
      if (seenIds.has(candidate.id)) continue;
      seenIds.add(candidate.id);
      relatedProducts.push(candidate);
      if (relatedProducts.length === 4) break;
    }
  }

  const reviews = await fetchApprovedReviews(product.id);

  return {
    props: {
      product,
      relatedProducts,
      reviews,
    },
  };
}
