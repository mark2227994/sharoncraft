import Link from "next/link";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Footer from "../../components/Footer";
import Nav from "../../components/Nav";
import SeoHead from "../../components/SeoHead";
import fallbackProductsData from "../../data/store/products.json";
import { SITE_NAME, SITE_URL } from "../../lib/constants";
import { useCart } from "../../lib/cart-context";
import { isPublishedProduct, normalizeProducts, slugify } from "../../lib/products";
import { readProducts } from "../../lib/store";

const REVIEW_COUNT = 127;
const BREADCRUMB_SEPARATOR = "\u203A";
const INLINE_SEPARATOR = "\u00B7";
const EM_DASH = "\u2014";
const RIGHT_ARROW = "\u2192";
const PAGE_THEME_CLASS = "product-page--luxury";
const WHATSAPP_FALLBACK = "254112222572";
const PRODUCT_PLACEHOLDER_SRC = "/media/site/placeholder.svg";

const REVIEW_ITEMS = [
  {
    name: "Sarah M.",
    date: "2 weeks ago",
    rating: 5,
    verified: true,
    text: "Beautiful piece, exactly as described. Fast delivery and excellent packaging. I would absolutely buy again.",
  },
  {
    name: "James K.",
    date: "1 month ago",
    rating: 5,
    verified: true,
    text: "Excellent craftsmanship. The finish feels thoughtful and the piece looks even better in person.",
  },
  {
    name: "Amara J.",
    date: "1 month ago",
    rating: 5,
    verified: true,
    text: "Elegant, well made, and easy to wear. The whole experience felt polished from order to delivery.",
  },
  {
    name: "David L.",
    date: "2 months ago",
    rating: 4,
    verified: true,
    text: "Great quality overall. Slight lighting difference from the photos, but still a beautiful piece.",
  },
];

const FAQ_ITEMS = [
  {
    question: "Can I request a different color palette?",
    answer:
      "Yes. Message Sharon on WhatsApp and we will confirm whether this piece can be customized in alternate tones or bead mixes.",
  },
  {
    question: "How quickly can this piece ship?",
    answer:
      "Ready pieces usually ship within 24 hours after payment confirmation. Made-to-order items typically need 5-7 days before dispatch.",
  },
  {
    question: "What payment options do you accept?",
    answer:
      "We confirm availability and share payment guidance directly on WhatsApp, including M-Pesa details for local orders.",
  },
];

const DELIVERY_ROWS = [
  {
    key: "delivery",
    title: "Free Delivery in Nairobi",
    subtitle: "Within 2-3 business days. KES 500 for other areas.",
    icon: "truck",
  },
  {
    key: "dispatch",
    title: "Ships within 24 hours",
    subtitle: "Once payment is confirmed.",
    icon: "check",
  },
  {
    key: "returns",
    title: "30-day Returns",
    subtitle: "Hassle-free return policy.",
    icon: "return",
  },
  {
    key: "support",
    title: "WhatsApp Support",
    subtitle: "Chat with us anytime.",
    icon: "chat",
  },
];

function cleanText(value) {
  return String(value || "").trim();
}

function cleanArtisanLabel(value) {
  const label = cleanText(value)
    .replace(/^by\s+/i, "")
    .replace(/^sharoncraft\s+/i, "");

  return label || "Sharon";
}

function normalizeImage(image, fallbackAlt) {
  if (!image) return null;

  if (typeof image === "string") {
    return { src: image, alt: fallbackAlt };
  }

  if (typeof image === "object") {
    const src = cleanText(image.src || image.url || image.image);
    if (!src) return null;
    return {
      src,
      alt: cleanText(image.alt || image.caption) || fallbackAlt,
    };
  }

  return null;
}

function isPlaceholderImageSrc(value) {
  const source = cleanText(value);
  if (!source) return false;

  return (
    source === PRODUCT_PLACEHOLDER_SRC ||
    source.endsWith(PRODUCT_PLACEHOLDER_SRC) ||
    /placeholder\.svg(?:[?#].*)?$/i.test(source)
  );
}

function normalizeGalleryImages(product) {
  const fallbackAlt = cleanText(product?.name) || "SharonCraft piece";
  const sourceImages = Array.isArray(product?.images) ? product.images : [];
  const normalized = sourceImages
    .map((image) => normalizeImage(image, fallbackAlt))
    .filter(Boolean)
    .filter((image) => !isPlaceholderImageSrc(image.src));

  if (normalized.length > 0) {
    return normalized;
  }

  const fallbackImage = normalizeImage(product?.image, fallbackAlt);
  return fallbackImage && !isPlaceholderImageSrc(fallbackImage.src) ? [fallbackImage] : [];
}

function toAbsoluteUrl(value) {
  const source = cleanText(value);
  if (!source) return "";
  if (source.startsWith("http")) return source;
  return `${SITE_URL.replace(/\/$/, "")}${source.startsWith("/") ? source : `/${source}`}`;
}

function getProductDescription(product) {
  return (
    cleanText(product?.fullDescription) ||
    cleanText(product?.description) ||
    cleanText(product?.shortDescription) ||
    cleanText(product?.story?.text) ||
    cleanText(product?.heritageStory) ||
    `Handmade ${cleanText(product?.category) || "piece"} from ${SITE_NAME}.`
  );
}

function getProductDetailsList(product) {
  const details = Array.isArray(product?.details)
    ? product.details.map((item) => cleanText(item)).filter(Boolean)
    : [];

  if (details.length > 0) {
    return details;
  }

  return [
    cleanText(product?.fullDescription),
    cleanText(product?.subcategory)
      ? `Designed within our ${cleanText(product.subcategory)} collection.`
      : "",
    cleanText(product?.dimensions)
      ? `Dimensions: ${cleanText(product.dimensions)}.`
      : "",
    cleanText(product?.weight) ? `Weight: ${cleanText(product.weight)}.` : "",
    cleanText(product?.finish) ? `Finish: ${cleanText(product.finish)}.` : "",
  ].filter(Boolean);
}

function getSpecificationRows(product) {
  const materials = Array.isArray(product?.materials)
    ? product.materials.map((item) => cleanText(item)).filter(Boolean)
    : cleanText(product?.materials)
      ? [cleanText(product.materials)]
      : Array.isArray(product?.story?.materials)
        ? product.story.materials.map((item) => cleanText(item)).filter(Boolean)
        : [];
  const options = Array.isArray(product?.options)
    ? product.options.map((item) => cleanText(item)).filter(Boolean)
    : [];

  return [
    {
      label: "Category",
      value: cleanText(product?.category),
    },
    {
      label: "Subcategory",
      value: cleanText(product?.subcategory),
    },
    {
      label: "Materials",
      value: materials.join(", "),
    },
    {
      label: "Available sizes",
      value: options.join(", "),
    },
    {
      label: "Dimensions",
      value: cleanText(product?.dimensions),
    },
    {
      label: "Weight",
      value: cleanText(product?.weight),
    },
    {
      label: "Handmade in",
      value: cleanText(product?.artisanLocation) || "Kenya",
    },
    {
      label: "Delivery",
      value: "Free in Nairobi. KES 500 for other areas.",
    },
  ].filter((row) => row.value);
}

function getStockMeta(product) {
  const stock = Number(product?.stock || 0);
  const isMadeToOrder =
    Boolean(product?.madeToOrder) ||
    Boolean(product?.isMadeToOrder) ||
    /made to order/i.test(
      [
        product?.badge,
        product?.availability,
        product?.productionType,
        product?.leadTime,
      ]
        .map((item) => cleanText(item))
        .join(" "),
    );

  if (Boolean(product?.isSold) || stock <= 0) {
    return {
      dotClass: "product-page__stock-dot--out",
      text: "Out of Stock",
      textClass: "product-page__stock-text--muted",
    };
  }

  if (isMadeToOrder) {
    return {
      dotClass: "product-page__stock-dot--made",
      text: `Made to Order ${INLINE_SEPARATOR} 5-7 days`,
      textClass: "",
    };
  }

  return {
    dotClass: "product-page__stock-dot--in",
    text: `In Stock ${INLINE_SEPARATOR} Ships within 24 hours`,
    textClass: "",
  };
}

function formatWhatsAppNumber(value) {
  const digits = String(value || "").replace(/\D/g, "");
  return digits || WHATSAPP_FALLBACK;
}

function normalizeStringList(value) {
  if (Array.isArray(value)) {
    return value.map((item) => cleanText(item)).filter(Boolean);
  }

  if (cleanText(value)) {
    return [cleanText(value)];
  }

  return [];
}

function toNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function mapSupabaseProduct(product) {
  const basePrice = Math.max(0, toNumber(product?.price, 0));
  const salePrice = toNumber(product?.sale_price, NaN);
  const hasSalePrice = Number.isFinite(salePrice) && salePrice > 0 && salePrice < basePrice;
  const images = normalizeStringList(product?.images);
  const sizes = normalizeStringList(product?.sizes);
  const colors = normalizeStringList(product?.colors);
  const stock = Math.max(0, Math.floor(toNumber(product?.stock_quantity, product?.stock)));
  const description = cleanText(product?.description) || cleanText(product?.short_description);
  const materials = normalizeStringList(product?.materials);

  const nameSlug = slugify(
    cleanText(product?.name) || cleanText(product?.subcategory) || cleanText(product?.category) || "product",
  );
  const idPrefix = cleanText(product?.id).split("-")[0];
  const storefrontSlug = idPrefix ? `${nameSlug}-${idPrefix}` : nameSlug;

  return {
    id: cleanText(product?.id),
    slug: cleanText(product?.slug) || cleanText(product?.handle) || storefrontSlug,
    name: cleanText(product?.name) || "Untitled Piece",
    description,
    fullDescription: cleanText(product?.full_description) || description,
    shortDescription: cleanText(product?.short_description) || description,
    category: cleanText(product?.category),
    subcategory: cleanText(product?.subcategory),
    price: hasSalePrice ? salePrice : basePrice,
    originalPrice: hasSalePrice ? basePrice : null,
    stock,
    isSold: Boolean(product?.is_sold) || stock <= 0,
    image: images[0] || "",
    images,
    featured: Boolean(product?.is_featured),
    recent: Boolean(product?.is_new),
    isNew: Boolean(product?.is_new),
    newArrival: Boolean(product?.is_new),
    publishStatus: product?.is_visible === false ? "draft" : "published",
    artisan: cleanText(product?.artisan) || "Sharon",
    artisanLocation: cleanText(product?.artisan_location),
    careInstructions: cleanText(product?.care_instructions),
    details: [
      cleanText(product?.subcategory) ? `Subcategory: ${cleanText(product.subcategory)}` : "",
      sizes.length > 0 ? `Available sizes: ${sizes.join(", ")}` : "",
      colors.length > 0 ? `Available colors: ${colors.join(", ")}` : "",
      cleanText(product?.care_instructions)
        ? `Care instructions: ${cleanText(product.care_instructions)}`
        : "",
    ].filter(Boolean),
    options: sizes,
    materials,
    story: {
      artisanName: cleanText(product?.artisan) || "Sharon",
      artisanLocation: cleanText(product?.artisan_location),
      text: description,
      materials,
    },
  };
}

function getProductSlugCandidates(product) {
  const id = cleanText(product?.id);
  const name = cleanText(product?.name);
  const subcategory = cleanText(product?.subcategory);
  const category = cleanText(product?.category);
  const explicitSlug = cleanText(product?.slug);
  const handle = cleanText(product?.handle);
  const idPrefix = id.split("-")[0];
  const baseSlug = slugify(name || subcategory || category || "product");
  const storefrontSlug = idPrefix ? `${baseSlug}-${idPrefix}` : baseSlug;

  return Array.from(
    new Set(
      [
        explicitSlug,
        handle,
        baseSlug,
        storefrontSlug,
        slugify(id),
      ].filter(Boolean),
    ),
  );
}

function buildWhatsAppUrl({ productName, quantity, totalPrice, phoneNumber }) {
  const message = encodeURIComponent(
    `Hi Sharon \u{1F44B}\n\n` +
      `I'd like to order:\n\n` +
      `*${productName}*\n` +
      `Qty: ${quantity}\n` +
      `Price: KES ${totalPrice.toLocaleString()}\n\n` +
      `Please confirm availability and payment details. \u{1F64F}`,
  );

  return `https://wa.me/${phoneNumber}?text=${message}`;
}

function truncateName(value, maxLength = 30) {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 3).trim()}...`;
}

function ProductImagePlaceholder({ compact = false }) {
  return (
    <div className={`product-page__media-placeholder${compact ? " product-page__media-placeholder--compact" : ""}`}>
      <span className="product-page__media-placeholder-mark">SharonCraft</span>
      <span className="product-page__media-placeholder-copy">Handmade piece imagery coming soon</span>
    </div>
  );
}

function IconStar({ filled = true }) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      className="product-page__star"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="0.7"
    >
      <path d="M8 1.3l2.1 4.34 4.79.7-3.45 3.35.81 4.73L8 12.05l-4.25 2.37.81-4.73L1.11 6.34l4.79-.7L8 1.3z" />
    </svg>
  );
}

function IconWhatsAppMono(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <path d="M12.1 3C7.1 3 3 6.9 3 11.8c0 1.8.5 3.4 1.5 4.9L3.3 21l4.5-1.2c1.3.7 2.7 1 4.2 1 5 0 9-3.9 9-8.8S17.1 3 12.1 3z" />
      <path d="M8.8 8.7c.2-.5.4-.5.6-.5h.5c.2 0 .4 0 .6.5l.6 1.5c.1.3.1.5-.1.8l-.5.7c.7 1.3 1.8 2.4 3.1 3l.6-.4c.2-.1.5-.2.8-.1l1.6.6c.4.1.5.3.5.6v.5c0 .2-.1.4-.5.6-.5.2-1.1.3-1.5.2-2.7-.5-5.8-3.6-6.3-6.3-.1-.4 0-1 .2-1.5z" />
    </svg>
  );
}

function IconChevron({ direction = "right", ...props }) {
  const rotations = {
    left: "rotate(180 12 12)",
    right: "",
  };

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <g transform={rotations[direction] || ""}>
        <path d="M9 5l7 7-7 7" />
      </g>
    </svg>
  );
}

function IconClose(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

function DeliveryIcon({ name }) {
  if (name === "truck") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 7h11v8H3zM14 10h3l2 2v3h-5zM7 18a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm10 0a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" />
      </svg>
    );
  }

  if (name === "check") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M5 12.5l4.2 4.2L19 7" />
      </svg>
    );
  }

  if (name === "return") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M8 7H5v3" />
        <path d="M5 10a7 7 0 111.8 7.6" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 20a8 8 0 100-16 8 8 0 000 16z" />
      <path d="M8.8 10.1c.2-.4.4-.5.7-.5h.3c.2 0 .4 0 .6.4l.5 1.3c.1.2.1.4 0 .6l-.4.5c.6 1 1.4 1.8 2.4 2.4l.5-.4c.2-.1.4-.1.6 0l1.3.5c.4.2.4.4.4.6v.3c0 .3-.1.5-.5.7-.4.1-.9.2-1.2.1-2.1-.4-4.6-2.9-5-5-.1-.4 0-.8.1-1.2z" />
    </svg>
  );
}

function AccordionItem({ id, label, isOpen, onToggle, children }) {
  const panelInnerRef = useRef(null);
  const [maxHeight, setMaxHeight] = useState(0);

  useEffect(() => {
    if (!panelInnerRef.current) return;
    setMaxHeight(panelInnerRef.current.scrollHeight);
  }, [children, isOpen]);

  return (
    <div className="product-page__accordion-item">
      <button
        type="button"
        className="product-page__accordion-toggle"
        onClick={() => onToggle(id)}
        aria-expanded={isOpen}
        aria-controls={`accordion-panel-${id}`}
      >
        <span className="product-page__accordion-label">{label}</span>
        <span className="product-page__accordion-icon" aria-hidden="true">
          {isOpen ? "\u2212" : "+"}
        </span>
      </button>

      <div
        id={`accordion-panel-${id}`}
        className={`product-page__accordion-panel${isOpen ? " is-open" : ""}`}
        style={{ maxHeight: isOpen ? `${maxHeight}px` : "0px" }}
      >
        <div ref={panelInnerRef} className="product-page__accordion-content">
          {children}
        </div>
      </div>
    </div>
  );
}

function RelatedCard({ product, delay }) {
  const artisanLabel = cleanArtisanLabel(product?.artisan).toUpperCase();
  const image = normalizeGalleryImages(product)[0];
  const href = `/product/${product.slug}`;

  return (
    <article className="product-page__related-card product-page__reveal" style={{ "--reveal-delay": `${delay}ms` }}>
      <Link href={href} className="product-page__related-link" aria-label={`View ${product.name}`}>
        <div className="product-page__related-media">
          {image ? (
            <img
              src={image.src}
              alt={image.alt || product.name}
              loading="lazy"
              decoding="async"
              className="product-page__related-image"
            />
          ) : (
            <div className="product-page__related-placeholder" aria-hidden="true">
              <ProductImagePlaceholder compact />
            </div>
          )}
          <span className="product-page__related-hover">View Piece</span>
        </div>

        <div className="product-page__related-copy">
          <span className="product-page__related-artisan">BY {artisanLabel}</span>
          <h3 className="product-page__related-name">{product.name}</h3>
          <div className="product-page__related-pricing">
            <span className="product-page__related-price">KES {Number(product.price || 0).toLocaleString()}</span>
            {Number(product.originalPrice) > Number(product.price) ? (
              <span className="product-page__related-original">
                KES {Number(product.originalPrice).toLocaleString()}
              </span>
            ) : null}
          </div>
        </div>
      </Link>
    </article>
  );
}

export default function ProductDetailPage({ product, relatedProducts }) {
  const { addItem, isWishlisted, toggleWishlist, openCart } = useCart();
  const [openSection, setOpenSection] = useState("specifications");
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showZoom, setShowZoom] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState("");
  const [summaryVisible, setSummaryVisible] = useState(false);
  const [relatedVisible, setRelatedVisible] = useState(false);

  const summaryRef = useRef(null);
  const actionsRef = useRef(null);
  const relatedRef = useRef(null);
  const accordionRef = useRef(null);

  const saved = isWishlisted(product.id);
  const artisanLabel = cleanArtisanLabel(product.artisan);
  const galleryImages = useMemo(() => normalizeGalleryImages(product), [product]);
  const productDescription = useMemo(() => getProductDescription(product), [product]);
  const descriptionNeedsClamp = productDescription.length > 180;
  const specificationRows = useMemo(() => getSpecificationRows(product), [product]);
  const detailItems = useMemo(() => getProductDetailsList(product), [product]);
  const stockMeta = useMemo(() => getStockMeta(product), [product]);
  const hasDiscount = Number(product.originalPrice) > Number(product.price);
  const totalPrice = Number(product.price || 0) * quantity;
  const whatsappNumber = useMemo(
    () => formatWhatsAppNumber(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER),
    [],
  );
  const absoluteProductUrl = `${SITE_URL.replace(/\/$/, "")}/product/${product.slug}`;
  const currentImage = galleryImages[selectedImageIndex] || galleryImages[0];
  const hasZoomableImage = Boolean(currentImage);

  const accordionSections = [
    {
      id: "specifications",
      label: "SPECIFICATIONS",
      content: (
        <div className="product-page__spec-list">
          {specificationRows.map((row) => (
            <div key={row.label} className="product-page__spec-row">
              <span>{row.label}</span>
              <span>{row.value}</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: "reviews",
      label: `CUSTOMER REVIEWS (${REVIEW_COUNT})`,
      content: (
        <div className="product-page__reviews">
          <div className="product-page__reviews-summary">
            <div>
              <p className="product-page__reviews-score">4.8</p>
              <p className="product-page__reviews-meta">{REVIEW_COUNT} verified customer reviews</p>
            </div>
            <div className="product-page__reviews-bars">
              {[80, 12, 5, 2, 1].map((width, index) => (
                <div key={width} className="product-page__reviews-bar-row">
                  <span>{5 - index} star</span>
                  <div className="product-page__reviews-bar-track">
                    <span className="product-page__reviews-bar-fill" style={{ width: `${width}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="product-page__review-list">
            {REVIEW_ITEMS.map((review) => (
              <article key={`${review.name}-${review.date}`} className="product-page__review-item">
                <div className="product-page__review-header">
                  <div>
                    <span className="product-page__review-name">{review.name}</span>
                    {review.verified ? (
                      <span className="product-page__review-verified">Verified Buyer</span>
                    ) : null}
                  </div>
                  <span className="product-page__review-date">{review.date}</span>
                </div>
                <div className="product-page__review-stars" aria-label={`${review.rating} out of 5 stars`}>
                  {[...Array(5)].map((_, index) => (
                    <IconStar key={`${review.name}-star-${index}`} filled={index < review.rating} />
                  ))}
                </div>
                <p>{review.text}</p>
              </article>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: "details",
      label: "DETAILS",
      content: (
        <div className="product-page__detail-list">
          {detailItems.map((item) => (
            <p key={item}>{item}</p>
          ))}
        </div>
      ),
    },
    {
      id: "faq",
      label: "FAQ",
      content: (
        <div className="product-page__faq-list">
          {FAQ_ITEMS.map((item) => (
            <div key={item.question} className="product-page__faq-item">
              <p className="product-page__faq-question">{item.question}</p>
              <p>{item.answer}</p>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: "care",
      label: "CARE INSTRUCTIONS",
      content: (
        <p>
          {cleanText(product.careInstructions) ||
            "Store this piece in a dry pouch, avoid prolonged contact with water or perfume, and wipe gently after wear to preserve its finish."}
        </p>
      ),
    },
    {
      id: "artisan",
      label: "ABOUT THE ARTISAN",
      content: (
        <div className="product-page__artisan-copy">
          <p className="product-page__artisan-name">{artisanLabel}</p>
          <p>
            {cleanText(product.story?.text) ||
              `${artisanLabel} creates handmade pieces with a refined, modern Kenyan point of view, balancing texture, proportion, and everyday elegance.`}
          </p>
        </div>
      ),
    },
  ];

  useEffect(() => {
    document.body.classList.add(PAGE_THEME_CLASS);
    return () => document.body.classList.remove(PAGE_THEME_CLASS);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const summaryNode = summaryRef.current;
    const relatedNode = relatedRef.current;
    const actionsNode = actionsRef.current;

    const observers = [];

    if (summaryNode) {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            setSummaryVisible(true);
            observer.disconnect();
          }
        },
        { threshold: 0.18 },
      );

      observer.observe(summaryNode);
      observers.push(observer);
    }

    if (relatedNode) {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            setRelatedVisible(true);
            observer.disconnect();
          }
        },
        { threshold: 0.12 },
      );

      observer.observe(relatedNode);
      observers.push(observer);
    }

    if (actionsNode) {
      const observer = new IntersectionObserver(
        (entries) => {
          const [entry] = entries;
          setShowStickyBar(!entry.isIntersecting);
        },
        {
          threshold: 0.3,
          rootMargin: "0px 0px -24px 0px",
        },
      );

      observer.observe(actionsNode);
      observers.push(observer);
    }

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, []);

  useEffect(() => {
    if (!showZoom || typeof window === "undefined") return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setShowZoom(false);
      }

      if (event.key === "ArrowRight" && galleryImages.length > 1) {
        setSelectedImageIndex((currentIndex) => (currentIndex + 1) % galleryImages.length);
      }

      if (event.key === "ArrowLeft" && galleryImages.length > 1) {
        setSelectedImageIndex((currentIndex) =>
          (currentIndex - 1 + galleryImages.length) % galleryImages.length,
        );
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [galleryImages.length, showZoom]);

  useEffect(() => {
    if (!copyFeedback) return undefined;

    const timeout = window.setTimeout(() => setCopyFeedback(""), 1800);
    return () => window.clearTimeout(timeout);
  }, [copyFeedback]);

  const openWhatsApp = () => {
    if (typeof window === "undefined") return;

    const url = buildWhatsAppUrl({
      productName: product.name,
      quantity,
      totalPrice,
      phoneNumber: whatsappNumber,
    });

    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleAddToCart = () => {
    for (let index = 0; index < quantity; index += 1) {
      addItem(product);
    }

    openCart();
    setQuantity(1);
  };

  const handleShare = async (platform) => {
    if (typeof window === "undefined") return;

    const shareText = `Discover ${product.name} by SharonCraft`;
    const shareMap = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${absoluteProductUrl}`)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(absoluteProductUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(absoluteProductUrl)}`,
    };

    if (platform === "copy") {
      try {
        await navigator.clipboard.writeText(absoluteProductUrl);
        setCopyFeedback("Copied");
      } catch {
        setCopyFeedback("Copy failed");
      }
      return;
    }

    window.open(shareMap[platform], "_blank", "noopener,noreferrer");
  };

  const jumpToReviews = () => {
    setOpenSection("reviews");

    if (accordionRef.current) {
      accordionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const categoryHref = product.category
    ? `/shop?category=${encodeURIComponent(product.category)}`
    : "/shop";
  const schemaImages = galleryImages.map((image) => toAbsoluteUrl(image.src)).filter(Boolean);
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: productDescription,
    image: schemaImages.length > 0 ? schemaImages : [toAbsoluteUrl(product.image)],
    sku: product.id,
    category: product.category || undefined,
    brand: {
      "@type": "Brand",
      name: SITE_NAME,
    },
    offers: {
      "@type": "Offer",
      url: absoluteProductUrl,
      priceCurrency: "KES",
      price: Number(product.price || 0).toFixed(2),
      availability:
        Boolean(product.isSold) || Number(product.stock || 0) <= 0
          ? "https://schema.org/OutOfStock"
          : "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@type": "Organization",
        name: SITE_NAME,
      },
    },
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Shop",
        item: `${SITE_URL.replace(/\/$/, "")}/shop`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.category || "Collection",
        item: `${SITE_URL.replace(/\/$/, "")}${categoryHref}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: product.name,
        item: absoluteProductUrl,
      },
    ],
  };

  return (
    <>
      <SeoHead
        title={product.name}
        description={productDescription}
        path={`/product/${product.slug}`}
        image={product.image}
        type="product"
        structuredData={[productSchema, breadcrumbSchema]}
      />
      <Nav />

      {showZoom && currentImage ? (
        <div className="product-page__zoom-modal" role="dialog" aria-modal="true" onClick={() => setShowZoom(false)}>
          <button
            type="button"
            className="product-page__zoom-close"
            aria-label="Close fullscreen image"
            onClick={() => setShowZoom(false)}
          >
            <IconClose className="product-page__zoom-close-icon" />
          </button>

          {galleryImages.length > 1 ? (
            <>
              <button
                type="button"
                className="product-page__zoom-nav product-page__zoom-nav--left"
                aria-label="Previous image"
                onClick={(event) => {
                  event.stopPropagation();
                  setSelectedImageIndex(
                    (selectedImageIndex - 1 + galleryImages.length) % galleryImages.length,
                  );
                }}
              >
                <IconChevron direction="left" className="product-page__zoom-nav-icon" />
              </button>

              <button
                type="button"
                className="product-page__zoom-nav product-page__zoom-nav--right"
                aria-label="Next image"
                onClick={(event) => {
                  event.stopPropagation();
                  setSelectedImageIndex((selectedImageIndex + 1) % galleryImages.length);
                }}
              >
                <IconChevron direction="right" className="product-page__zoom-nav-icon" />
              </button>
            </>
          ) : null}

          <div className="product-page__zoom-frame" onClick={(event) => event.stopPropagation()}>
            <img
              src={currentImage.src}
              alt={currentImage.alt || product.name}
              className="product-page__zoom-image"
            />
            {galleryImages.length > 1 ? (
              <div className="product-page__zoom-count">
                {selectedImageIndex + 1} / {galleryImages.length}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      <main className="product-page">
        <nav className="product-page__breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span className="product-page__breadcrumb-separator">{BREADCRUMB_SEPARATOR}</span>
          <Link href="/shop">Shop</Link>
          {product.category ? (
            <>
              <span className="product-page__breadcrumb-separator">{BREADCRUMB_SEPARATOR}</span>
              <Link href={categoryHref}>{product.category}</Link>
            </>
          ) : null}
          <span className="product-page__breadcrumb-separator">{BREADCRUMB_SEPARATOR}</span>
          <span className="product-page__breadcrumb-current">{product.name}</span>
        </nav>

        <section className="product-page__hero">
          <div className="product-page__gallery-column">
            <div className="product-page__gallery-sticky">
              <button
                type="button"
                className="product-page__main-image-shell"
                onClick={() => {
                  if (hasZoomableImage) {
                    setShowZoom(true);
                  }
                }}
                aria-label={
                  hasZoomableImage
                    ? `Open fullscreen image for ${product.name}`
                    : `${product.name} image coming soon`
                }
                disabled={!hasZoomableImage}
              >
                {currentImage ? (
                  <img
                    src={currentImage.src}
                    alt={currentImage.alt || product.name}
                    className="product-page__main-image"
                  />
                ) : (
                  <div className="product-page__main-image-placeholder" aria-hidden="true">
                    <ProductImagePlaceholder />
                  </div>
                )}
                {hasZoomableImage ? <span className="product-page__zoom-label">ZOOM</span> : null}
              </button>

              {galleryImages.length > 1 ? (
                <div className="product-page__thumb-strip" aria-label="Product image thumbnails">
                  {galleryImages.map((image, index) => (
                    <button
                      key={`${image.src}-${index}`}
                      type="button"
                      className={`product-page__thumb${index === selectedImageIndex ? " is-active" : ""}`}
                      onClick={() => setSelectedImageIndex(index)}
                      aria-label={`View image ${index + 1}`}
                    >
                      <img src={image.src} alt={image.alt || `${product.name} ${index + 1}`} className="product-page__thumb-image" />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          <div className="product-page__summary-column" ref={summaryRef}>
            <div className="product-page__summary-inner">
              <span className={`product-page__eyebrow product-page__reveal${summaryVisible ? " is-visible" : ""}`} style={{ "--reveal-delay": "0ms" }}>
                {artisanLabel.toUpperCase()}
              </span>

              <h1 className={`product-page__title product-page__reveal${summaryVisible ? " is-visible" : ""}`} style={{ "--reveal-delay": "60ms" }}>
                {product.name}
              </h1>

              <div className={`product-page__price-row product-page__reveal${summaryVisible ? " is-visible" : ""}`} style={{ "--reveal-delay": "120ms" }}>
                <span className="product-page__price">KES {Number(product.price || 0).toLocaleString()}</span>
                {hasDiscount ? (
                  <span className="product-page__price-original">
                    KES {Number(product.originalPrice).toLocaleString()}
                  </span>
                ) : null}
              </div>

              <div className={`product-page__trust-line product-page__reveal${summaryVisible ? " is-visible" : ""}`} style={{ "--reveal-delay": "180ms" }}>
                <span>Handmade in Kenya</span>
                <span>{INLINE_SEPARATOR}</span>
                <span>30-day Returns</span>
                <span>{INLINE_SEPARATOR}</span>
                <span>WhatsApp Support</span>
              </div>

              <div className="product-page__stock-line">
                <span className={`product-page__stock-dot ${stockMeta.dotClass}`} aria-hidden="true" />
                <span className={`product-page__stock-text ${stockMeta.textClass}`}>{stockMeta.text}</span>
              </div>

              <div className="product-page__rating-line">
                <div className="product-page__rating-stars" aria-label="4.8 out of 5 stars">
                  {[...Array(5)].map((_, index) => (
                    <IconStar key={`rating-${index}`} filled />
                  ))}
                </div>
                <span className="product-page__rating-count">({REVIEW_COUNT} reviews)</span>
                <button type="button" className="product-page__rating-link" onClick={jumpToReviews}>
                  Read reviews
                </button>
              </div>

              <div className={`product-page__description-block product-page__reveal${summaryVisible ? " is-visible" : ""}`} style={{ "--reveal-delay": "240ms" }}>
                <p className={`product-page__description${descriptionExpanded ? " is-expanded" : ""}${descriptionNeedsClamp ? " is-clamped" : ""}`}>
                  {productDescription}
                </p>
                {descriptionNeedsClamp ? (
                  <button
                    type="button"
                    className="product-page__description-toggle"
                    onClick={() => setDescriptionExpanded((current) => !current)}
                  >
                    {descriptionExpanded ? "Show less" : "Read more"}
                  </button>
                ) : null}
              </div>

              <div className="product-page__quantity-block">
                <span className="product-page__tiny-label">QTY</span>
                <div className="product-page__quantity-row">
                  <button
                    type="button"
                    className="product-page__quantity-button product-page__quantity-button--left"
                    aria-label="Decrease quantity"
                    onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                  >
                    -
                  </button>
                  <div className="product-page__quantity-value" aria-live="polite">
                    {quantity}
                  </div>
                  <button
                    type="button"
                    className="product-page__quantity-button product-page__quantity-button--right"
                    aria-label="Increase quantity"
                    onClick={() => setQuantity((current) => current + 1)}
                  >
                    +
                  </button>
                </div>
                <span className="product-page__quantity-total">TOTAL: KES {totalPrice.toLocaleString()}</span>
              </div>

              <div
                className={`product-page__actions product-page__reveal${summaryVisible ? " is-visible" : ""}`}
                style={{ "--reveal-delay": "300ms" }}
                ref={actionsRef}
              >
                <button type="button" className="product-page__whatsapp-cta" onClick={openWhatsApp}>
                  <IconWhatsAppMono className="product-page__whatsapp-icon" />
                  <span>ORDER ON WHATSAPP</span>
                </button>

                <button type="button" className="product-page__cart-cta" onClick={handleAddToCart}>
                  ADD TO CART
                </button>

                <button type="button" className="product-page__wishlist-link" onClick={() => toggleWishlist(product)}>
                  {saved ? "\u2665 Save to Wishlist" : "\u2661 Save to Wishlist"}
                </button>
              </div>

              <div className="product-page__share-row">
                <span className="product-page__share-label">{`SHARE ${EM_DASH}`}</span>
                <div className="product-page__share-links">
                  <button type="button" className="product-page__share-link" onClick={() => handleShare("whatsapp")}>
                    WhatsApp
                  </button>
                  <span className="product-page__share-separator">{INLINE_SEPARATOR}</span>
                  <button type="button" className="product-page__share-link" onClick={() => handleShare("twitter")}>
                    Twitter
                  </button>
                  <span className="product-page__share-separator">{INLINE_SEPARATOR}</span>
                  <button type="button" className="product-page__share-link" onClick={() => handleShare("facebook")}>
                    Facebook
                  </button>
                  <span className="product-page__share-separator">{INLINE_SEPARATOR}</span>
                  <button type="button" className="product-page__share-link" onClick={() => handleShare("copy")}>
                    {copyFeedback || "Copy"}
                  </button>
                </div>
              </div>

              <div className="product-page__accordion" ref={accordionRef}>
                {accordionSections.map((section, index) => (
                  <AccordionItem
                    key={section.id}
                    id={section.id}
                    label={section.label}
                    isOpen={openSection === section.id}
                    onToggle={(id) => setOpenSection((current) => (current === id ? null : id))}
                    isFirst={index === 0}
                  >
                    {section.content}
                  </AccordionItem>
                ))}
              </div>

              <div className="product-page__delivery">
                {DELIVERY_ROWS.map((row) => (
                  <div key={row.key} className="product-page__delivery-row">
                    <span className="product-page__delivery-icon" aria-hidden="true">
                      <DeliveryIcon name={row.icon} />
                    </span>
                    <span className="product-page__delivery-copy">
                      <span className="product-page__delivery-title">{row.title}</span>
                      <span className="product-page__delivery-subtitle">{row.subtitle}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {relatedProducts.length > 0 ? (
          <section className="product-page__related" ref={relatedRef}>
            <div className="product-page__related-header">
              <span className="product-page__related-kicker">YOU MAY ALSO LIKE</span>
              <Link href={categoryHref} className="product-page__related-view-all">
                {`View all ${RIGHT_ARROW}`}
              </Link>
            </div>

            <div className={`product-page__related-grid${relatedVisible ? " is-visible" : ""}`}>
              {relatedProducts.map((item, index) => (
                <RelatedCard key={item.id} product={item} delay={index * 80} />
              ))}
            </div>
          </section>
        ) : null}

        <section className="product-page__why-bar" aria-label="Why SharonCraft">
          <div className="product-page__why-shell">
            <span className="product-page__why-kicker">WHY SHARONCRAFT</span>
            <p className="product-page__why-copy">
              Quiet luxury, Kenyan craftsmanship, and direct WhatsApp service for every order.
            </p>
            <div className="product-page__why-points">
              <span>Curated small batches</span>
              <span>{INLINE_SEPARATOR}</span>
              <span>Made with care</span>
              <span>{INLINE_SEPARATOR}</span>
              <span>Personal follow-up</span>
            </div>
          </div>
        </section>
      </main>

      {showStickyBar ? (
        <div className="product-page__sticky-bar">
          <div className="product-page__sticky-copy">
            <p className="product-page__sticky-name">{truncateName(product.name)}</p>
            <p className="product-page__sticky-price">KES {totalPrice.toLocaleString()}</p>
          </div>

          <div className="product-page__sticky-actions">
            <button type="button" className="product-page__sticky-button product-page__sticky-button--primary" onClick={openWhatsApp}>
              WHATSAPP
            </button>
            <button type="button" className="product-page__sticky-button product-page__sticky-button--secondary" onClick={handleAddToCart}>
              ADD TO CART
            </button>
          </div>
        </div>
      ) : null}

      <Footer />

      <style jsx global>{`
        body.${PAGE_THEME_CLASS} {
          background: #fafaf8;
          background-image: none;
        }

        @keyframes productPageFadeUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .product-page__reveal,
          .product-page__main-image,
          .product-page__thumb,
          .product-page__accordion-panel,
          .product-page__related-hover,
          .product-page__sticky-bar {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>

      <style jsx>{`
        .product-page {
          padding-bottom: 0;
          background: #fafaf8;
          color: #1c1c1c;
        }

        .product-page__breadcrumb {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0;
          padding: 16px 40px;
          color: #bbb;
          font-size: 11px;
          font-weight: 400;
          letter-spacing: 0.5px;
          background: #fafaf8;
        }

        .product-page__breadcrumb a {
          color: #bbb;
          transition: color 0.2s ease;
        }

        .product-page__breadcrumb a:hover {
          color: #1c1c1c;
        }

        .product-page__breadcrumb-separator {
          margin: 0 10px;
          color: #e0e0e0;
        }

        .product-page__breadcrumb-current {
          color: #1c1c1c;
        }

        .product-page__hero {
          display: grid;
          grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
          gap: 0;
          min-height: 600px;
          align-items: start;
          background: #fafaf8;
        }

        .product-page__gallery-column {
          min-width: 0;
          padding-left: 0;
          border-right: none;
        }

        .product-page__gallery-sticky {
          position: sticky;
          top: 60px;
          display: flex;
          flex-direction: column;
          height: calc(100vh - 60px);
          overflow: hidden;
        }

        .product-page__main-image-shell {
          position: relative;
          width: 100%;
          height: 85%;
          overflow: hidden;
          background: #f5f0eb;
          cursor: zoom-in;
          border: none;
          border-radius: 0;
        }

        .product-page__main-image-shell:disabled {
          cursor: default;
        }

        .product-page__main-image,
        .product-page__main-image-placeholder {
          width: 100%;
          height: 100%;
        }

        .product-page__main-image {
          object-fit: contain;
          padding: 32px;
          transition: transform 0.4s ease;
          transform-origin: center center;
        }

        .product-page__main-image-placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f5f0eb;
        }

        .product-page__media-placeholder {
          display: grid;
          place-items: center;
          gap: 10px;
          width: 100%;
          height: 100%;
          padding: 32px;
          text-align: center;
          background:
            linear-gradient(180deg, rgba(250, 250, 248, 0.24), rgba(245, 240, 235, 0.9)),
            repeating-linear-gradient(
              135deg,
              rgba(139, 94, 60, 0.06) 0,
              rgba(139, 94, 60, 0.06) 10px,
              transparent 10px,
              transparent 20px
            );
        }

        .product-page__media-placeholder--compact {
          gap: 8px;
          padding: 24px 18px;
        }

        .product-page__media-placeholder-mark {
          color: #8b5e3c;
          font-size: 10px;
          font-weight: 400;
          letter-spacing: 3px;
          text-transform: uppercase;
        }

        .product-page__media-placeholder-copy {
          max-width: 22ch;
          color: #7d766d;
          font-size: 11px;
          line-height: 1.7;
          letter-spacing: 0.3px;
        }

        .product-page__zoom-label {
          position: absolute;
          top: 16px;
          right: 16px;
          color: #bbb;
          font-size: 9px;
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        .product-page__thumb-strip {
          display: flex;
          gap: 8px;
          align-items: center;
          height: 15%;
          padding: 12px 0;
          overflow-x: auto;
          scrollbar-width: none;
        }

        .product-page__thumb-strip::-webkit-scrollbar {
          display: none;
        }

        .product-page__thumb {
          flex: 0 0 auto;
          width: 64px;
          height: 64px;
          padding: 0;
          border: 1.5px solid transparent;
          background: #f5f0eb;
          cursor: pointer;
          opacity: 0.5;
          transition: opacity 0.2s ease, border-color 0.2s ease;
        }

        .product-page__thumb:hover {
          opacity: 0.8;
        }

        .product-page__thumb.is-active {
          opacity: 1;
          border-color: #1c1c1c;
        }

        .product-page__thumb-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
        }

        .product-page__summary-column {
          min-width: 0;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
        }

        .product-page__summary-inner {
          display: flex;
          flex: 1 1 auto;
          flex-direction: column;
          padding: 48px 48px 48px 40px;
        }

        .product-page__reveal {
          opacity: 0;
          transform: translateY(16px);
        }

        .product-page__reveal.is-visible {
          animation: productPageFadeUp 0.5s ease both;
          animation-delay: var(--reveal-delay, 0ms);
        }

        .product-page__eyebrow {
          display: block;
          margin-bottom: 10px;
          color: #bbb;
          font-size: 10px;
          font-weight: 400;
          letter-spacing: 3px;
          text-transform: uppercase;
        }

        .product-page__title {
          margin: 0 0 16px;
          color: #1c1c1c;
          font-size: 26px;
          font-weight: 300;
          line-height: 1.2;
          letter-spacing: -0.3px;
        }

        .product-page__price-row {
          display: flex;
          align-items: baseline;
          gap: 0;
          margin-bottom: 24px;
        }

        .product-page__price {
          color: #1c1c1c;
          font-size: 18px;
          font-weight: 400;
        }

        .product-page__price-original {
          margin-left: 10px;
          color: #bbb;
          font-size: 14px;
          font-weight: 400;
          text-decoration: line-through;
        }

        .product-page__trust-line {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 8px;
          margin-bottom: 20px;
          color: #bbb;
          font-size: 11px;
          letter-spacing: 0.3px;
        }

        .product-page__stock-line {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 20px;
        }

        .product-page__stock-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          flex: 0 0 auto;
        }

        .product-page__stock-dot--in {
          background: #2e7d32;
        }

        .product-page__stock-dot--made {
          background: #f59e0b;
        }

        .product-page__stock-dot--out {
          background: #ccc;
        }

        .product-page__stock-text {
          color: #666;
          font-size: 11px;
          line-height: 1.4;
        }

        .product-page__stock-text--muted {
          color: #bbb;
        }

        .product-page__rating-line {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 10px;
          margin-bottom: 28px;
        }

        .product-page__rating-stars,
        .product-page__review-stars {
          display: flex;
          align-items: center;
          gap: 2px;
          color: #8b5e3c;
        }

        .product-page__star {
          width: 13px;
          height: 13px;
        }

        .product-page__rating-count {
          color: #bbb;
          font-size: 11px;
        }

        .product-page__rating-link {
          padding: 0;
          border-bottom: 1px solid #e0e0e0;
          color: #bbb;
          font-size: 11px;
          transition: color 0.2s ease, border-color 0.2s ease;
        }

        .product-page__rating-link:hover {
          color: #1c1c1c;
          border-bottom-color: #1c1c1c;
        }

        .product-page__description-block {
          margin-bottom: 32px;
        }

        .product-page__description {
          margin: 0;
          color: #555;
          font-size: 13px;
          line-height: 1.8;
          letter-spacing: 0.2px;
        }

        .product-page__description.is-clamped:not(.is-expanded) {
          display: -webkit-box;
          overflow: hidden;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 4;
        }

        .product-page__description-toggle {
          margin-top: 8px;
          padding: 0;
          color: #999;
          font-size: 11px;
          border-bottom: 1px solid #e0e0e0;
          transition: color 0.2s ease, border-color 0.2s ease;
        }

        .product-page__description-toggle:hover {
          color: #1c1c1c;
          border-bottom-color: #1c1c1c;
        }

        .product-page__tiny-label {
          display: block;
          margin-bottom: 10px;
          color: #bbb;
          font-size: 9px;
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        .product-page__quantity-block {
          margin-bottom: 24px;
        }

        .product-page__quantity-row {
          display: flex;
          align-items: center;
        }

        .product-page__quantity-button,
        .product-page__quantity-value {
          height: 40px;
          background: transparent;
          color: #1c1c1c;
        }

        .product-page__quantity-button {
          width: 40px;
          border: 0.5px solid #e0e0e0;
          font-size: 16px;
          transition: background 0.2s ease;
        }

        .product-page__quantity-button:hover {
          background: #f5f5f5;
        }

        .product-page__quantity-button--left {
          border-right: none;
        }

        .product-page__quantity-button--right {
          border-left: none;
        }

        .product-page__quantity-value {
          width: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-top: 0.5px solid #e0e0e0;
          border-bottom: 0.5px solid #e0e0e0;
          font-size: 13px;
        }

        .product-page__quantity-total {
          display: block;
          margin-top: 8px;
          color: #bbb;
          font-size: 10px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
        }

        .product-page__actions {
          display: flex;
          flex-direction: column;
          gap: 0;
          margin-bottom: 32px;
        }

        .product-page__whatsapp-cta,
        .product-page__cart-cta,
        .product-page__sticky-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          border-radius: 2px;
          box-shadow: none;
          letter-spacing: 3px;
          text-transform: uppercase;
        }

        .product-page__whatsapp-cta {
          height: 52px;
          margin-bottom: 10px;
          border: none;
          background: #1c1c1c;
          color: #fff;
          font-size: 11px;
          transition: background 0.2s ease;
        }

        .product-page__whatsapp-cta:hover,
        .product-page__sticky-button--primary:hover {
          background: #8b5e3c;
        }

        .product-page__whatsapp-icon {
          width: 16px;
          height: 16px;
          flex: 0 0 auto;
        }

        .product-page__cart-cta {
          height: 48px;
          margin-bottom: 16px;
          border: 0.5px solid #1c1c1c;
          background: transparent;
          color: #1c1c1c;
          font-size: 11px;
          transition: background 0.2s ease, color 0.2s ease;
        }

        .product-page__cart-cta:hover,
        .product-page__sticky-button--secondary:hover {
          background: rgba(0, 0, 0, 0.04);
        }

        .product-page__wishlist-link {
          color: #bbb;
          font-size: 11px;
          letter-spacing: 1px;
          text-align: center;
          transition: color 0.2s ease;
        }

        .product-page__wishlist-link:hover {
          color: #1c1c1c;
        }

        .product-page__share-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 0;
          flex-wrap: wrap;
        }

        .product-page__share-label {
          color: #ccc;
          font-size: 9px;
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        .product-page__share-links {
          display: flex;
          align-items: center;
          gap: 0;
          flex-wrap: wrap;
        }

        .product-page__share-link {
          padding: 0;
          color: #bbb;
          font-size: 10px;
          transition: color 0.2s ease;
        }

        .product-page__share-link:hover {
          color: #1c1c1c;
        }

        .product-page__share-separator {
          margin: 0 8px;
          color: #e0e0e0;
          font-size: 10px;
        }

        .product-page__accordion {
          margin-top: 24px;
          border-top: 0.5px solid #e8e4de;
        }

        .product-page__accordion-item {
          border-bottom: 0.5px solid #e8e4de;
        }

        .product-page__accordion-toggle {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 0;
          transition: opacity 0.2s ease;
        }

        .product-page__accordion-toggle:hover {
          opacity: 0.7;
        }

        .product-page__accordion-label {
          color: #1c1c1c;
          font-size: 11px;
          font-weight: 400;
          letter-spacing: 2px;
          text-transform: uppercase;
          text-align: left;
        }

        .product-page__accordion-icon {
          color: #bbb;
          font-size: 16px;
          line-height: 1;
        }

        .product-page__accordion-panel {
          max-height: 0;
          overflow: hidden;
          opacity: 0;
          transition: max-height 0.3s ease, opacity 0.3s ease;
        }

        .product-page__accordion-panel.is-open {
          opacity: 1;
        }

        .product-page__accordion-content {
          padding: 0 0 20px;
          color: #666;
          font-size: 12px;
          line-height: 1.8;
          letter-spacing: 0.2px;
        }

        .product-page__spec-list,
        .product-page__detail-list,
        .product-page__faq-list,
        .product-page__review-list {
          display: grid;
          gap: 12px;
        }

        .product-page__spec-row {
          display: grid;
          grid-template-columns: minmax(110px, 0.8fr) 1fr;
          gap: 16px;
          padding-bottom: 10px;
          border-bottom: 0.5px solid #f0f0f0;
        }

        .product-page__spec-row:last-child {
          padding-bottom: 0;
          border-bottom: none;
        }

        .product-page__spec-row span:first-child {
          color: #1c1c1c;
        }

        .product-page__reviews {
          display: grid;
          gap: 16px;
        }

        .product-page__reviews-summary {
          display: grid;
          grid-template-columns: minmax(0, 110px) 1fr;
          gap: 20px;
          padding-bottom: 16px;
          border-bottom: 0.5px solid #f0f0f0;
        }

        .product-page__reviews-score {
          margin: 0 0 4px;
          color: #1c1c1c;
          font-size: 24px;
          font-weight: 400;
        }

        .product-page__reviews-meta,
        .product-page__reviews-bar-row span,
        .product-page__review-date,
        .product-page__review-verified {
          color: #bbb;
          font-size: 11px;
        }

        .product-page__reviews-bars {
          display: grid;
          gap: 8px;
        }

        .product-page__reviews-bar-row {
          display: grid;
          grid-template-columns: 48px 1fr;
          gap: 12px;
          align-items: center;
        }

        .product-page__reviews-bar-track {
          height: 4px;
          background: #eee8e0;
        }

        .product-page__reviews-bar-fill {
          display: block;
          height: 100%;
          background: #8b5e3c;
        }

        .product-page__review-item {
          padding-bottom: 12px;
          border-bottom: 0.5px solid #f0f0f0;
        }

        .product-page__review-item:last-child {
          padding-bottom: 0;
          border-bottom: none;
        }

        .product-page__review-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 6px;
          flex-wrap: wrap;
        }

        .product-page__review-name,
        .product-page__faq-question,
        .product-page__artisan-name {
          color: #1c1c1c;
          font-size: 12px;
          font-weight: 400;
        }

        .product-page__review-verified {
          margin-left: 8px;
        }

        .product-page__review-item p,
        .product-page__faq-item p,
        .product-page__detail-list p,
        .product-page__artisan-copy p {
          margin: 0;
        }

        .product-page__faq-item {
          display: grid;
          gap: 4px;
        }

        .product-page__artisan-copy {
          display: grid;
          gap: 8px;
        }

        .product-page__delivery {
          margin-top: 0;
          padding-top: 20px;
          border-top: 0.5px solid #e8e4de;
        }

        .product-page__delivery-row {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 10px 0;
          border-bottom: 0.5px solid #f0f0f0;
        }

        .product-page__delivery-icon {
          width: 16px;
          height: 16px;
          margin-top: 1px;
          color: #bbb;
          flex: 0 0 auto;
        }

        .product-page__delivery-icon :global(svg) {
          width: 16px;
          height: 16px;
        }

        .product-page__delivery-copy {
          display: grid;
          gap: 2px;
        }

        .product-page__delivery-title {
          color: #1c1c1c;
          font-size: 12px;
          font-weight: 400;
        }

        .product-page__delivery-subtitle {
          color: #bbb;
          font-size: 11px;
        }

        .product-page__related {
          border-top: 0.5px solid #e8e4de;
          padding: 64px 40px;
        }

        .product-page__related-header {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 36px;
        }

        .product-page__related-kicker {
          color: #bbb;
          font-size: 10px;
          letter-spacing: 5px;
          text-transform: uppercase;
        }

        .product-page__related-view-all {
          padding-bottom: 2px;
          border-bottom: 1px solid #e0e0e0;
          color: #999;
          font-size: 10px;
          letter-spacing: 2px;
          text-transform: uppercase;
          transition: color 0.2s ease, border-color 0.2s ease;
        }

        .product-page__related-view-all:hover {
          color: #1c1c1c;
          border-bottom-color: #1c1c1c;
        }

        .product-page__related-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 20px;
        }

        .product-page__related-grid.is-visible .product-page__reveal {
          animation: productPageFadeUp 0.5s ease both;
          animation-delay: var(--reveal-delay, 0ms);
        }

        .product-page__related-link {
          display: block;
          color: inherit;
          text-decoration: none;
        }

        .product-page__related-media {
          position: relative;
          overflow: hidden;
          background: #f5f0eb;
          aspect-ratio: 1 / 1.25;
        }

        .product-page__related-image,
        .product-page__related-placeholder {
          width: 100%;
          height: 100%;
        }

        .product-page__related-placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f5f0eb;
        }

        .product-page__related-image {
          object-fit: cover;
          transition: filter 0.4s ease;
        }

        .product-page__related-hover {
          position: absolute;
          right: 0;
          bottom: 0;
          left: 0;
          padding: 12px;
          background: rgba(28, 28, 28, 0.88);
          color: #fff;
          font-size: 10px;
          letter-spacing: 3px;
          text-align: center;
          text-transform: uppercase;
          transform: translateY(100%);
          transition: transform 0.35s ease;
        }

        .product-page__related-copy {
          padding-top: 12px;
        }

        .product-page__related-artisan {
          display: block;
          margin-bottom: 4px;
          color: #bbb;
          font-size: 9px;
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        .product-page__related-name {
          margin: 0 0 5px;
          color: #1c1c1c;
          font-size: 12px;
          font-weight: 400;
          letter-spacing: 0.3px;
          line-height: 1.4;
        }

        .product-page__related-pricing {
          display: flex;
          align-items: baseline;
          gap: 8px;
        }

        .product-page__related-price {
          color: #1c1c1c;
          font-size: 12px;
          font-weight: 500;
        }

        .product-page__related-original {
          color: #ccc;
          font-size: 11px;
          text-decoration: line-through;
        }

        .product-page__why-bar {
          border-top: 0.5px solid #e8e4de;
          padding: 24px 40px 28px;
        }

        .product-page__why-shell {
          display: grid;
          grid-template-columns: max-content minmax(0, 1fr) max-content;
          gap: 20px;
          align-items: center;
        }

        .product-page__why-kicker {
          color: #bbb;
          font-size: 10px;
          letter-spacing: 3px;
          text-transform: uppercase;
        }

        .product-page__why-copy {
          margin: 0;
          color: #1c1c1c;
          font-size: 13px;
          font-weight: 300;
          line-height: 1.6;
        }

        .product-page__why-points {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #999;
          font-size: 10px;
          letter-spacing: 1.2px;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .product-page__sticky-bar {
          position: fixed;
          right: 0;
          bottom: 0;
          left: 0;
          z-index: 200;
          display: flex;
          align-items: center;
          gap: 16px;
          height: 64px;
          padding: 0 40px;
          background: rgba(250, 250, 248, 0.96);
          backdrop-filter: blur(12px);
          border-top: 0.5px solid #e8e4de;
        }

        .product-page__sticky-copy {
          min-width: 0;
        }

        .product-page__sticky-name {
          margin: 0 0 2px;
          color: #1c1c1c;
          font-size: 12px;
          line-height: 1.3;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .product-page__sticky-price {
          margin: 0;
          color: #1c1c1c;
          font-size: 13px;
          font-weight: 500;
          line-height: 1.3;
        }

        .product-page__sticky-actions {
          margin-left: auto;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .product-page__sticky-button {
          height: 40px;
          padding: 0 24px;
          font-size: 10px;
          transition: background 0.2s ease, color 0.2s ease;
        }

        .product-page__sticky-button--primary {
          border: none;
          background: #1c1c1c;
          color: #fff;
        }

        .product-page__sticky-button--secondary {
          border: 0.5px solid #1c1c1c;
          background: transparent;
          color: #1c1c1c;
          padding: 0 20px;
        }

        .product-page__zoom-modal {
          position: fixed;
          inset: 0;
          z-index: 1200;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px;
          background: rgba(0, 0, 0, 0.9);
        }

        .product-page__zoom-frame {
          position: relative;
          max-width: 90vw;
          max-height: 90vh;
        }

        .product-page__zoom-image {
          width: min(90vw, 1200px);
          max-width: 100%;
          height: min(90vh, 900px);
          object-fit: contain;
        }

        .product-page__zoom-close,
        .product-page__zoom-nav {
          position: absolute;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 0.5px solid rgba(255, 255, 255, 0.16);
          background: rgba(8, 8, 8, 0.32);
          color: #fff;
          transition: background 0.2s ease, border-color 0.2s ease;
        }

        .product-page__zoom-close:hover,
        .product-page__zoom-nav:hover {
          background: rgba(139, 94, 60, 0.3);
          border-color: rgba(255, 255, 255, 0.3);
        }

        .product-page__zoom-close {
          top: 24px;
          right: 24px;
          width: 44px;
          height: 44px;
        }

        .product-page__zoom-close-icon,
        .product-page__zoom-nav-icon {
          width: 18px;
          height: 18px;
        }

        .product-page__zoom-nav {
          top: 50%;
          width: 44px;
          height: 44px;
          transform: translateY(-50%);
        }

        .product-page__zoom-nav--left {
          left: 24px;
        }

        .product-page__zoom-nav--right {
          right: 24px;
        }

        .product-page__zoom-count {
          position: absolute;
          right: 0;
          bottom: -28px;
          color: rgba(255, 255, 255, 0.7);
          font-size: 10px;
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        @media (hover: hover) and (pointer: fine) {
          .product-page__main-image-shell:hover .product-page__main-image {
            transform: scale(1.04);
          }

          .product-page__related-link:hover .product-page__related-image,
          .product-page__related-link:focus-visible .product-page__related-image {
            filter: brightness(0.87);
          }

          .product-page__related-link:hover .product-page__related-hover,
          .product-page__related-link:focus-visible .product-page__related-hover {
            transform: translateY(0);
          }
        }

        @media (min-width: 768px) and (max-width: 1279px) {
          .product-page__related-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 16px;
          }
        }

        @media (max-width: 959px) {
          .product-page__hero {
            grid-template-columns: 1fr;
          }

          .product-page__gallery-column {
            padding: 0;
            border-right: none;
          }

          .product-page__gallery-sticky {
            position: static;
            height: auto;
          }

          .product-page__main-image-shell {
            height: min(80vw, 560px);
          }

          .product-page__main-image {
            padding: 20px;
          }

          .product-page__thumb {
            width: 52px;
            height: 52px;
          }

          .product-page__summary-inner {
            padding: 24px 20px 40px;
          }

          .product-page__related {
            padding: 48px 20px;
          }

          .product-page__why-bar {
            padding: 24px 20px 28px;
          }

          .product-page__why-shell {
            grid-template-columns: 1fr;
            gap: 10px;
          }

          .product-page__sticky-bar {
            height: 60px;
            padding: 0 20px;
            gap: 8px;
          }

          .product-page__sticky-copy {
            display: none;
          }

          .product-page__sticky-actions {
            width: 100%;
            gap: 8px;
          }

          .product-page__sticky-button {
            flex: 1 1 0;
            width: auto;
            padding: 0 12px;
          }
        }

        @media (max-width: 767px) {
          .product-page {
            padding-bottom: 84px;
          }

          .product-page__breadcrumb {
            padding: 12px 20px;
          }

          .product-page__title {
            font-size: 22px;
          }

          .product-page__price {
            font-size: 16px;
          }

          .product-page__share-row,
          .product-page__share-links {
            width: 100%;
          }

          .product-page__related-grid {
            display: flex;
            gap: 12px;
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            scrollbar-width: none;
          }

          .product-page__related-grid::-webkit-scrollbar {
            display: none;
          }

          .product-page__related-card {
            flex: 0 0 44vw;
            scroll-snap-align: start;
          }

          .product-page__zoom-modal {
            padding: 24px 16px 56px;
          }

          .product-page__zoom-close {
            top: 16px;
            right: 16px;
          }

          .product-page__zoom-nav--left {
            left: 12px;
          }

          .product-page__zoom-nav--right {
            right: 12px;
          }
        }

        @media (max-width: 479px) {
          .product-page__rating-line {
            gap: 8px;
          }

          .product-page__related-card {
            flex-basis: 44vw;
            min-width: 160px;
          }

          .product-page__spec-row {
            grid-template-columns: 1fr;
            gap: 4px;
          }
        }
      `}</style>
    </>
  );
}

export async function getServerSideProps({ params }) {
  let products = [];
  let productSource = "supabase-page";
  const fallbackProducts = normalizeProducts(fallbackProductsData);

  const supabaseUrl =
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "";

  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && Array.isArray(data) && data.length > 0) {
        products = normalizeProducts(data.map(mapSupabaseProduct));
      }
    } catch {
      // Fall back to the existing store reader if the public table is unavailable.
    }
  }

  if (products.length === 0) {
    products = await readProducts();
    productSource = products.length > 0 ? "store-reader" : productSource;
  }

  if (products.length === 0) {
    products = normalizeProducts(fallbackProductsData);
    productSource = "bundled-json";
  }

  const requestedSlug = cleanText(params?.slug);
  let product = products.find((item) => {
    if (!isPublishedProduct(item)) return false;
    return getProductSlugCandidates(item).includes(requestedSlug);
  });

  if (!product) {
    product = fallbackProducts.find((item) => {
      if (!isPublishedProduct(item)) return false;
      return getProductSlugCandidates(item).includes(requestedSlug);
    });

    if (product) {
      productSource = "bundled-json-legacy";
    }
  }

  if (!product) {
    return { notFound: true };
  }

  const relatedCatalog = productSource === "bundled-json-legacy" ? fallbackProducts : products;
  const relatedProducts = relatedCatalog
    .filter(
      (item) =>
        item.id !== product.id &&
        isPublishedProduct(item) &&
        !item.isSold &&
        cleanText(item.category).toLowerCase() === cleanText(product.category).toLowerCase(),
    )
    .slice(0, 4);

  return {
    props: {
      product,
      relatedProducts,
    },
  };
}
