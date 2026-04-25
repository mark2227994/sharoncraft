import Link from "next/link";
import React, { useEffect, useState } from "react";
import Footer from "../../components/Footer";
import Nav from "../../components/Nav";
import SeoHead from "../../components/SeoHead";
import { useCart } from "../../lib/cart-context";
import {
  getComplementaryJewelryTypes,
  getJewelryTypeLabel,
  isPublishedProduct,
} from "../../lib/products";
import { readProducts } from "../../lib/store";

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

export default function ProductDetailPage({
  product,
  wearItWithProducts,
  wearItWithTitle,
}) {
  const { addItem, isWishlisted, toggleWishlist } = useCart();
  const saved = isWishlisted(product.id);
  const [openSection, setOpenSection] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showZoom, setShowZoom] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);

  const hasDiscount =
    product.originalPrice && product.originalPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100,
      )
    : 0;
  const galleryImages = product.images?.length
    ? product.images
    : [{ src: product.image }];
  const trustPoints = [
    "Handmade in Kenya",
    "30-day Returns",
    "WhatsApp Support",
  ];
  const whyShopItems = [
    {
      title: "Handmade Quality",
      description:
        "Each piece is crafted by skilled Kenyan artisans using thoughtful, small-batch techniques.",
    },
    {
      title: "Fast Shipping",
      description:
        "Orders ship within 24 hours, with clear delivery timelines and updates.",
    },
    {
      title: "Easy Returns",
      description:
        "A simple 30-day return window gives you room to choose with confidence.",
    },
  ];

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i += 1) {
      addItem(product);
    }
    setQuantity(1);
  };

  const handleWhatsApp = () => {
    const artisanInfo = product.artisan ? ` by ${product.artisan}` : "";
    const materials = product.story?.materials?.length
      ? ` | ${product.story.materials.slice(0, 2).join(", ")}`
      : "";
    const scarcity =
      product.stock && product.stock < 3
        ? " (Limited stock available)"
        : " (In stock)";
    const variant = selectedVariant ? ` | ${selectedVariant}` : "";

    const lines = [
      "Hello SharonCraft,",
      "",
      `I am interested in: ${product.name}${artisanInfo}`,
      `Price: KES ${product.price.toLocaleString()} x ${quantity} = KES ${(product.price * quantity).toLocaleString()}`,
      `${materials}${scarcity}${variant}`,
      "",
      "Questions:",
      "- Is this item still available?",
      "- What is the current delivery timeline?",
      "- Can I choose specific colors or customize this piece?",
      "- What are the payment options?",
      "",
      "Thank you!",
    ];

    window.open(
      `https://wa.me/254112222572?text=${encodeURIComponent(lines.join("\n"))}`,
      "_blank",
    );
  };

  const handleShare = (platform) => {
    const productUrl =
      typeof window !== "undefined" ? window.location.href : "";
    const text = `Check out this beautiful ${product.name} from @SharonCraft - handmade in Kenya!`;
    const shareUrls = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + " " + productUrl)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(productUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`,
      copy: productUrl,
    };

    if (platform === "copy") {
      navigator.clipboard.writeText(productUrl);
      alert("Link copied to clipboard!");
      return;
    }

    window.open(shareUrls[platform], "_blank");
  };

  useEffect(() => {
    const handleScroll = () => {
      setShowStickyBar(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <SeoHead
        title={product.name}
        description={product.description}
        path={`/product/${product.slug}`}
        image={product.image}
        type="product"
      />
      <Nav />
      <main className="product-page">
        <nav className="product-page__breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href="/shop">Shop</Link>
          <span>/</span>
          <Link href={`/shop?category=${product.category}`}>
            {product.category}
          </Link>
          <span>/</span>
          <span>{product.name}</span>
        </nav>

        {showZoom && (
          <div
            className="product-page__zoom-modal"
            onClick={() => setShowZoom(false)}
          >
            <button
              type="button"
              onClick={() => setShowZoom(false)}
              className="product-page__zoom-close"
              aria-label="Close image zoom"
            >
              ×
            </button>
            <img
              src={galleryImages[selectedImageIndex]?.src || product.image}
              alt={product.name}
              className="product-page__zoom-image"
              onClick={(event) => event.stopPropagation()}
            />
            <div className="product-page__zoom-count">
              {selectedImageIndex + 1} / {galleryImages.length}
            </div>
          </div>
        )}

        <div className="product-page__grid">
          <div className="product-page__gallery">
            {galleryImages.map((image, idx) => (
              <button
                key={image.src || `${product.id}-${idx}`}
                type="button"
                className="product-page__image-frame"
                onClick={() => {
                  setSelectedImageIndex(idx);
                  setShowZoom(true);
                }}
              >
                <img
                  src={image.src}
                  alt={product.name}
                  loading="lazy"
                  decoding="async"
                  className="product-page__image"
                />
                <span className="product-page__zoom-label">Zoom</span>
              </button>
            ))}
          </div>

          <div className="product-page__summary">
            <p className="product-page__eyebrow">Sharon</p>
            <h1 className="product-page__title">{product.name}</h1>

            <div className="product-page__price-row">
              <span className="product-page__price">
                KES {product.price.toLocaleString()}
              </span>
              {hasDiscount ? (
                <span className="product-page__price-original">
                  KES {product.originalPrice.toLocaleString()}
                </span>
              ) : null}
              {hasDiscount ? (
                <span className="product-page__price-badge">
                  -{discountPercent}%
                </span>
              ) : null}
            </div>

            <div className="product-page__trust-line">
              {trustPoints.join(" · ")}
            </div>

            <div className="product-page__stock-line">
              <span
                className="product-page__stock-dot"
                aria-hidden="true"
              ></span>
              <span className="product-page__stock-text">
                In Stock • Ships within 24 hours
              </span>
            </div>

            <div className="product-page__rating-line">
              <span className="product-page__rating-stars">★★★★★</span>
              <span className="product-page__rating-count">(127 reviews)</span>
              <button
                type="button"
                onClick={() =>
                  setOpenSection(openSection === "reviews" ? null : "reviews")
                }
                className="product-page__rating-link"
              >
                Read reviews
              </button>
            </div>

            <p className="product-page__description">{product.description}</p>

            {product.options?.length > 0 ? (
              <div className="product-page__variant-picker">
                <p className="product-page__variant-label">Choose an option:</p>
                <div className="product-page__variant-options">
                  {product.options.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() =>
                        setSelectedVariant(
                          selectedVariant === option ? null : option,
                        )
                      }
                      className={`product-page__variant-option${selectedVariant === option ? " product-page__variant-option--selected" : ""}`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="product-page__quantity">
              <div className="product-page__quantity-row">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="product-page__quantity-button"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(event) =>
                    setQuantity(
                      Math.max(1, parseInt(event.target.value, 10) || 1),
                    )
                  }
                  className="product-page__quantity-input"
                  aria-label="Quantity"
                />
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="product-page__quantity-button"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
              <span className="product-page__quantity-total">
                Total: KES {(product.price * quantity).toLocaleString()}
              </span>
            </div>

            <div className="product-page__actions">
              <button
                type="button"
                className="product-page__cta"
                onClick={handleAddToCart}
              >
                Add to Cart
              </button>
              <button
                type="button"
                className="product-page__whatsapp"
                onClick={handleWhatsApp}
              >
                Order on WhatsApp
              </button>
              <button
                type="button"
                className="product-page__wishlist-link"
                onClick={() => toggleWishlist(product)}
              >
                {saved ? "♥" : "♡"} Save to Wishlist
              </button>
            </div>

            <div className="product-page__share">
              <span className="product-page__share-label">Share —</span>
              <div className="product-page__share-links">
                <button
                  type="button"
                  className="product-page__share-link"
                  onClick={() => handleShare("whatsapp")}
                >
                  WhatsApp
                </button>
                <span className="product-page__share-separator">·</span>
                <button
                  type="button"
                  className="product-page__share-link"
                  onClick={() => handleShare("twitter")}
                >
                  Twitter
                </button>
                <span className="product-page__share-separator">·</span>
                <button
                  type="button"
                  className="product-page__share-link"
                  onClick={() => handleShare("facebook")}
                >
                  Facebook
                </button>
                <span className="product-page__share-separator">·</span>
                <button
                  type="button"
                  className="product-page__share-link"
                  onClick={() => handleShare("copy")}
                >
                  Copy
                </button>
              </div>
            </div>

            <div className="product-page__accordion">
              <button
                type="button"
                onClick={() => toggleSection("specs")}
                className={`product-page__accordion-toggle${openSection === "specs" ? " is-open" : ""}`}
              >
                <span className="product-page__accordion-label">
                  Specifications
                </span>
                <span
                  className={`product-page__accordion-icon${openSection === "specs" ? " is-open" : ""}`}
                >
                  ›
                </span>
              </button>
              {openSection === "specs" ? (
                <div className="product-page__accordion-content">
                  <table className="product-page__spec-table">
                    <tbody>
                      {product.jewelryType ? (
                        <tr>
                          <td>Type</td>
                          <td>{getJewelryTypeLabel(product.jewelryType)}</td>
                        </tr>
                      ) : null}
                      {product.story?.materials?.length ? (
                        <tr>
                          <td>Materials</td>
                          <td>{product.story.materials.join(", ")}</td>
                        </tr>
                      ) : null}
                      {product.dimensions ? (
                        <tr>
                          <td>Dimensions</td>
                          <td>{product.dimensions}</td>
                        </tr>
                      ) : null}
                      {product.weight ? (
                        <tr>
                          <td>Weight</td>
                          <td>{product.weight}</td>
                        </tr>
                      ) : null}
                      {product.artisanLocation ? (
                        <tr>
                          <td>Handmade in</td>
                          <td>{product.artisanLocation}</td>
                        </tr>
                      ) : null}
                      <tr>
                        <td>Shipping</td>
                        <td>
                          Ships within 24 hours | Free in Nairobi, KES 500
                          elsewhere
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : null}

              <button
                type="button"
                onClick={() => toggleSection("reviews")}
                className={`product-page__accordion-toggle${openSection === "reviews" ? " is-open" : ""}`}
              >
                <span className="product-page__accordion-label">
                  Customer Reviews (127)
                </span>
                <span
                  className={`product-page__accordion-icon${openSection === "reviews" ? " is-open" : ""}`}
                >
                  ›
                </span>
              </button>
              {openSection === "reviews" ? (
                <div className="product-page__accordion-content">
                  <div className="product-page__reviews-summary">
                    <div className="product-page__reviews-score">
                      <p>4.8</p>
                      <span>out of 5</span>
                    </div>
                    <div className="product-page__reviews-bars">
                      <div className="product-page__reviews-bar-row">
                        <div className="product-page__reviews-bar-track">
                          <div className="product-page__reviews-bar-fill product-page__reviews-bar-fill--80"></div>
                        </div>
                        <span>5★</span>
                      </div>
                      <div className="product-page__reviews-bar-row">
                        <div className="product-page__reviews-bar-track">
                          <div className="product-page__reviews-bar-fill product-page__reviews-bar-fill--12"></div>
                        </div>
                        <span>4★</span>
                      </div>
                      <div className="product-page__reviews-bar-row">
                        <div className="product-page__reviews-bar-track">
                          <div className="product-page__reviews-bar-fill product-page__reviews-bar-fill--5"></div>
                        </div>
                        <span>3★</span>
                      </div>
                    </div>
                  </div>

                  {REVIEW_ITEMS.map((review, index) => (
                    <div
                      key={review.name}
                      className={`product-page__review-item${index === REVIEW_ITEMS.length - 1 ? " is-last" : ""}`}
                    >
                      <div className="product-page__review-header">
                        <div>
                          <span className="product-page__review-name">
                            {review.name}
                          </span>
                          {review.verified ? (
                            <span className="product-page__review-verified">
                              Verified Purchase
                            </span>
                          ) : null}
                        </div>
                        <span className="product-page__review-date">
                          {review.date}
                        </span>
                      </div>
                      <div className="product-page__review-stars">
                        {"★".repeat(review.rating)}
                      </div>
                      <p className="product-page__review-text">{review.text}</p>
                    </div>
                  ))}
                </div>
              ) : null}

              <button
                type="button"
                onClick={() => toggleSection("details")}
                className={`product-page__accordion-toggle${openSection === "details" ? " is-open" : ""}`}
              >
                <span className="product-page__accordion-label">Details</span>
                <span
                  className={`product-page__accordion-icon${openSection === "details" ? " is-open" : ""}`}
                >
                  ›
                </span>
              </button>
              {openSection === "details" ? (
                <div className="product-page__accordion-content product-page__accordion-content--details">
                  {product.jewelryType ? (
                    <div>
                      <span className="product-page__detail-label">Type</span>
                      <p>{getJewelryTypeLabel(product.jewelryType)}</p>
                    </div>
                  ) : null}
                  <div>
                    <span className="product-page__detail-label">Location</span>
                    <p>{product.artisanLocation || "Kenya"}</p>
                  </div>
                  {product.story?.materials?.length ? (
                    <div>
                      <span className="product-page__detail-label">
                        Materials
                      </span>
                      <p>{product.story.materials.join(", ")}</p>
                    </div>
                  ) : null}
                </div>
              ) : null}

              <button
                type="button"
                onClick={() => toggleSection("faq")}
                className={`product-page__accordion-toggle${openSection === "faq" ? " is-open" : ""}`}
              >
                <span className="product-page__accordion-label">FAQ</span>
                <span
                  className={`product-page__accordion-icon${openSection === "faq" ? " is-open" : ""}`}
                >
                  ›
                </span>
              </button>
              {openSection === "faq" ? (
                <div className="product-page__accordion-content product-page__accordion-content--faq">
                  <div>
                    <p className="product-page__faq-question">
                      How long does delivery take?
                    </p>
                    <p className="product-page__faq-answer">
                      Free delivery in Nairobi within 2-3 business days. KES 500
                      for other areas. Orders are shipped within 24 hours.
                    </p>
                  </div>
                  <div>
                    <p className="product-page__faq-question">
                      Can I customize this product?
                    </p>
                    <p className="product-page__faq-answer">
                      Yes. Contact us on WhatsApp to discuss custom colors,
                      sizes, or materials. We specialize in custom orders.
                    </p>
                  </div>
                  <div>
                    <p className="product-page__faq-question">
                      What&apos;s your return policy?
                    </p>
                    <p className="product-page__faq-answer">
                      30-day returns if the product doesn&apos;t meet your
                      expectations. Items must be unused and in original
                      packaging.
                    </p>
                  </div>
                  <div>
                    <p className="product-page__faq-question">
                      How do I care for this piece?
                    </p>
                    <p className="product-page__faq-answer">
                      Wipe with a soft, dry cloth after each use. Store in a
                      cool, dry place away from direct sunlight. Avoid water,
                      perfumes, and harsh chemicals.
                    </p>
                  </div>
                </div>
              ) : null}

              <button
                type="button"
                onClick={() => toggleSection("care")}
                className={`product-page__accordion-toggle${openSection === "care" ? " is-open" : ""}`}
              >
                <span className="product-page__accordion-label">
                  Care Instructions
                </span>
                <span
                  className={`product-page__accordion-icon${openSection === "care" ? " is-open" : ""}`}
                >
                  ›
                </span>
              </button>
              {openSection === "care" ? (
                <div className="product-page__accordion-content">
                  <p className="product-page__care-copy">
                    Wipe with a soft, dry cloth after each use. Store in a cool,
                    dry place away from direct sunlight. Avoid exposure to
                    water, perfumes, or harsh chemicals.
                  </p>
                </div>
              ) : null}

              <button
                type="button"
                onClick={() => toggleSection("artisan")}
                className={`product-page__accordion-toggle${openSection === "artisan" ? " is-open" : ""}`}
              >
                <span className="product-page__accordion-label">
                  About the Artisan
                </span>
                <span
                  className={`product-page__accordion-icon${openSection === "artisan" ? " is-open" : ""}`}
                >
                  ›
                </span>
              </button>
              {openSection === "artisan" ? (
                <div className="product-page__accordion-content">
                  <div className="product-page__artisan-card">
                    <div className="product-page__artisan-header">
                      <div className="product-page__artisan-avatar">•</div>
                      <div>
                        <h3 className="product-page__artisan-name">
                          {product.artisan || "Artisan Name"}
                        </h3>
                        <p className="product-page__artisan-location">
                          {product.artisanLocation || "Kenya"}
                        </p>
                        <p className="product-page__artisan-rating">
                          <span>★★★★★</span>
                          <span>(127 customer ratings)</span>
                        </p>
                      </div>
                    </div>
                    <p className="product-page__artisan-copy">
                      {product.story?.text ||
                        "Skilled artisan handcrafting beautiful beaded pieces with traditional techniques passed down through generations. Each piece is unique and made with attention to detail."}
                    </p>
                    {product.story?.culturalNote ? (
                      <div className="product-page__artisan-note">
                        <p className="product-page__artisan-note-label">
                          Cultural Heritage
                        </p>
                        <p className="product-page__artisan-note-copy">
                          {product.story.culturalNote}
                        </p>
                      </div>
                    ) : null}
                  </div>

                  <div className="product-page__artisan-actions">
                    <Link
                      href="/artisans"
                      className="product-page__artisan-link"
                    >
                      View all artisans
                    </Link>
                    <button
                      type="button"
                      onClick={handleWhatsApp}
                      className="product-page__artisan-button"
                    >
                      Message artisan
                    </button>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="product-page__shipping-note">
              <div className="product-page__shipping-title-row">
                <span className="product-page__shipping-icon">•</span>
                <span className="product-page__shipping-title">
                  Free Delivery in Nairobi
                </span>
              </div>
              <p className="product-page__shipping-copy">
                Delivery within 2-3 business days. KES 500 for other areas.
              </p>
              <div className="product-page__shipping-status">
                Ships within 24 hours
              </div>
            </div>

            <div className="product-page__sku">
              SKU:{" "}
              {product.id?.substring(0, 8).toUpperCase() ||
                `SC-${product.name?.split(" ").slice(0, 2).join("").toUpperCase()}`}
            </div>
          </div>
        </div>

        <section className="wear-it-with">
          <h2 className="wear-it-with__heading">{wearItWithTitle}</h2>
          <div className="wear-it-with__items">
            {wearItWithProducts.map((item) => (
              <Link
                key={item.id}
                href={`/product/${item.slug}`}
                className="wear-it-with__link"
                title={item.name}
              >
                <img
                  src={
                    item.images?.[0]?.src ||
                    item.image ||
                    "/media/site/placeholder.svg"
                  }
                  alt={item.name}
                  className="wear-it-with__image"
                  loading="lazy"
                  decoding="async"
                />
                <span className="wear-it-with__content">
                  <span className="wear-it-with__name">{item.name}</span>
                  <span className="wear-it-with__price">
                    KES {item.price.toLocaleString()}
                  </span>
                </span>
                <span className="wear-it-with__action">Add</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="product-page__why-shop">
          <h2 className="product-page__why-shop-heading">
            Why shop with SharonCraft?
          </h2>
          <div className="product-page__why-shop-grid">
            {whyShopItems.map((item) => (
              <div key={item.title} className="product-page__why-shop-item">
                <p className="product-page__why-shop-title">{item.title}</p>
                <p className="product-page__why-shop-description">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {showStickyBar ? (
        <div className="product-page__sticky-bar">
          <div className="product-page__sticky-inner">
            <div className="product-page__sticky-copy">
              <p className="product-page__sticky-name">{product.name}</p>
              <p className="product-page__sticky-price">
                KES {product.price.toLocaleString()}
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddToCart}
              className="product-page__sticky-button"
            >
              Add to Cart
            </button>
          </div>
        </div>
      ) : null}

      <Footer />

      <style jsx>{`
        .product-page {
          max-width: var(--max-width);
          margin: 0 auto;
          padding: calc(var(--nav-height) + var(--space-6)) var(--gutter)
            calc(var(--space-7) + 72px);
        }

        .product-page__breadcrumb {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 24px;
          font-size: 12px;
          color: #999;
          letter-spacing: 0.3px;
        }

        .product-page__breadcrumb a {
          color: inherit;
          text-decoration: none;
        }

        .product-page__breadcrumb span:last-child {
          color: #1c1c1c;
        }

        .product-page__zoom-modal {
          position: fixed;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.9);
          z-index: 999;
        }

        .product-page__zoom-close {
          position: absolute;
          top: 20px;
          right: 20px;
          border: none;
          background: transparent;
          color: #fff;
          font-size: 28px;
          cursor: pointer;
        }

        .product-page__zoom-image {
          max-width: 90vw;
          max-height: 90vh;
          border-radius: 0;
        }

        .product-page__zoom-count {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          color: #fff;
          font-size: 12px;
          letter-spacing: 2px;
        }

        .product-page__grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 48px;
          margin-bottom: 48px;
        }

        .product-page__gallery {
          display: grid;
          gap: 12px;
        }

        .product-page__image-frame {
          position: relative;
          width: 100%;
          min-height: 580px;
          padding: 0;
          border: none;
          border-radius: 0;
          background: #f4f4f2;
          overflow: hidden;
          cursor: zoom-in;
          text-align: left;
        }

        .product-page__image {
          width: 100%;
          height: 100%;
          min-height: 580px;
          object-fit: cover;
          display: block;
          border-radius: 0;
          background: #f4f4f2;
        }

        .product-page__zoom-label {
          position: absolute;
          top: 8px;
          right: 8px;
          font-size: 10px;
          letter-spacing: 2px;
          color: #999;
          text-transform: uppercase;
          background: transparent;
        }

        .product-page__summary {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .product-page__eyebrow {
          margin: 0 0 8px;
          font-size: 10px;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: #999;
          font-weight: 400;
          font-family: var(--font-body);
        }

        .product-page__title {
          margin: 0 0 16px;
          font-size: 24px;
          font-weight: 300;
          letter-spacing: 0.5px;
          line-height: 1.3;
          color: #1c1c1c;
          font-family: var(--font-body);
        }

        .product-page__price-row {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
        }

        .product-page__price {
          font-size: 16px;
          font-weight: 400;
          color: #1c1c1c;
          font-family: var(--font-body);
        }

        .product-page__price-original {
          font-size: 13px;
          color: #999;
          text-decoration: line-through;
        }

        .product-page__price-badge {
          padding: 3px 8px;
          border: 1px solid #e0e0e0;
          font-size: 10px;
          letter-spacing: 1px;
          text-transform: uppercase;
          color: #666;
        }

        .product-page__trust-line {
          margin-bottom: 20px;
          font-size: 11px;
          color: #888;
          letter-spacing: 0.5px;
          white-space: nowrap;
          overflow-x: auto;
          font-family: var(--font-body);
        }

        .product-page__stock-line {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
        }

        .product-page__stock-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #2f8f5b;
          flex: 0 0 auto;
        }

        .product-page__stock-text {
          font-size: 11px;
          color: #555;
          letter-spacing: 0.5px;
        }

        .product-page__rating-line {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .product-page__rating-stars {
          font-size: 11px;
          letter-spacing: 1px;
          color: #8b5e3c;
        }

        .product-page__rating-count {
          font-size: 11px;
          color: #999;
        }

        .product-page__rating-link {
          border: none;
          background: transparent;
          padding: 0;
          font-size: 11px;
          color: #999;
          cursor: pointer;
          text-decoration: none;
          transition:
            color 0.3s ease,
            text-decoration-color 0.3s ease;
        }

        .product-page__rating-link:hover {
          color: #1c1c1c;
          text-decoration: underline;
        }

        .product-page__description {
          margin: 0 0 24px;
          font-size: 13px;
          font-weight: 300;
          line-height: 1.8;
          color: #666;
          max-width: 440px;
        }

        .product-page__variant-picker {
          width: 100%;
          margin-bottom: 24px;
        }

        .product-page__variant-label {
          margin: 0 0 8px;
          font-size: 11px;
          color: #999;
          letter-spacing: 1px;
        }

        .product-page__variant-options {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .product-page__variant-option {
          padding: 8px 12px;
          border: 1px solid #e0e0e0;
          border-radius: 0;
          background: transparent;
          color: #1c1c1c;
          font-size: 11px;
          letter-spacing: 1px;
          cursor: pointer;
          transition:
            border-color 0.3s ease,
            color 0.3s ease;
        }

        .product-page__variant-option:hover,
        .product-page__variant-option--selected {
          border-color: #1c1c1c;
          color: #1c1c1c;
        }

        .product-page__quantity {
          margin-bottom: 24px;
        }

        .product-page__quantity-row {
          display: inline-flex;
          align-items: center;
        }

        .product-page__quantity-button {
          width: 32px;
          height: 32px;
          border: 1px solid #e0e0e0;
          border-radius: 0;
          background: transparent;
          color: #1c1c1c;
          font-size: 16px;
          cursor: pointer;
          transition: border-color 0.3s ease;
        }

        .product-page__quantity-button:hover {
          border-color: #1c1c1c;
        }

        .product-page__quantity-input {
          width: 40px;
          min-width: 40px;
          height: 32px;
          border-top: 1px solid #e0e0e0;
          border-right: none;
          border-bottom: 1px solid #e0e0e0;
          border-left: none;
          border-radius: 0;
          text-align: center;
          font-size: 13px;
          color: #1c1c1c;
          background: transparent;
          padding: 0;
          appearance: textfield;
        }

        .product-page__quantity-input::-webkit-outer-spin-button,
        .product-page__quantity-input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }

        .product-page__quantity-total {
          display: block;
          margin-top: 8px;
          font-size: 11px;
          color: #999;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .product-page__actions {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: stretch;
        }

        .product-page__cta,
        .product-page__whatsapp,
        .product-page__artisan-button,
        .product-page__artisan-link,
        .product-page__sticky-button {
          border-radius: 0;
          box-shadow: none;
          font-family: var(--font-body);
        }

        .product-page__cta {
          width: 100%;
          height: 48px;
          border: none;
          background: #1c1c1c;
          color: #fff;
          font-size: 11px;
          font-weight: 400;
          letter-spacing: 3px;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 0.3s ease;
        }

        .product-page__cta:hover,
        .product-page__sticky-button:hover {
          background: #8b5e3c;
        }

        .product-page__whatsapp {
          width: 100%;
          height: 44px;
          margin-top: 8px;
          border: 1px solid #e0e0e0;
          background: transparent;
          color: #1c1c1c;
          font-size: 11px;
          font-weight: 400;
          letter-spacing: 2px;
          text-transform: uppercase;
          cursor: pointer;
          transition:
            border-color 0.3s ease,
            color 0.3s ease;
        }

        .product-page__whatsapp:hover,
        .product-page__artisan-button:hover,
        .product-page__artisan-link:hover {
          border-color: #1c1c1c;
          color: #1c1c1c;
        }

        .product-page__wishlist-link {
          display: block;
          margin-top: 12px;
          border: none;
          background: transparent;
          color: #999;
          font-size: 11px;
          letter-spacing: 1px;
          text-align: center;
          cursor: pointer;
          transition: color 0.3s ease;
        }

        .product-page__wishlist-link:hover {
          color: #1c1c1c;
        }

        .product-page__share {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 20px;
          flex-wrap: wrap;
        }

        .product-page__share-label {
          font-size: 10px;
          color: #999;
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        .product-page__share-links {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .product-page__share-link {
          border: none;
          background: transparent;
          padding: 0;
          font-size: 11px;
          color: #bbb;
          cursor: pointer;
          transition: color 0.3s ease;
        }

        .product-page__share-link:hover {
          color: #1c1c1c;
        }

        .product-page__share-separator {
          color: #bbb;
          font-size: 11px;
        }

        .product-page__accordion {
          width: 100%;
          margin-top: 24px;
          border-top: 1px solid #e8e8e8;
        }

        .product-page__accordion-toggle {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 0;
          border: none;
          border-bottom: 1px solid #e8e8e8;
          border-radius: 0;
          background: transparent;
          cursor: pointer;
          transition: color 0.3s ease;
        }

        .product-page__accordion-toggle:hover .product-page__accordion-label {
          color: #8b5e3c;
        }

        .product-page__accordion-toggle.is-open {
          border-bottom: none;
        }

        .product-page__accordion-label {
          font-size: 11px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #1c1c1c;
          font-weight: 400;
        }

        .product-page__accordion-icon {
          color: #999;
          font-size: 14px;
          transition: transform 0.3s ease;
        }

        .product-page__accordion-icon.is-open {
          transform: rotate(90deg);
        }

        .product-page__accordion-content {
          padding: 16px 0 20px;
          border-bottom: 1px solid #e8e8e8;
        }

        .product-page__spec-table {
          width: 100%;
          border-collapse: collapse;
        }

        .product-page__spec-table tr:not(:last-child) {
          border-bottom: 1px solid #eee;
        }

        .product-page__spec-table td {
          padding: 10px 0;
          font-size: 13px;
          color: #555;
          vertical-align: top;
        }

        .product-page__spec-table td:first-child {
          width: 40%;
          color: #1c1c1c;
          font-weight: 400;
        }

        .product-page__reviews-summary {
          display: grid;
          grid-template-columns: minmax(90px, auto) 1fr;
          gap: 16px;
          padding-bottom: 16px;
          border-bottom: 1px solid #eee;
          margin-bottom: 4px;
        }

        .product-page__reviews-score p {
          margin: 0 0 4px;
          font-size: 24px;
          font-weight: 400;
          color: #1c1c1c;
        }

        .product-page__reviews-score span,
        .product-page__reviews-bar-row span {
          font-size: 11px;
          color: #999;
        }

        .product-page__reviews-bars {
          display: grid;
          gap: 6px;
          align-content: start;
        }

        .product-page__reviews-bar-row {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 8px;
          align-items: center;
        }

        .product-page__reviews-bar-track {
          height: 4px;
          background: #eee;
          overflow: hidden;
        }

        .product-page__reviews-bar-fill {
          height: 100%;
          background: #8b5e3c;
        }

        .product-page__reviews-bar-fill--80 {
          width: 80%;
        }

        .product-page__reviews-bar-fill--12 {
          width: 12%;
        }

        .product-page__reviews-bar-fill--5 {
          width: 5%;
        }

        .product-page__review-item {
          padding: 16px 0;
          border-bottom: 1px solid #eee;
        }

        .product-page__review-item.is-last {
          border-bottom: none;
          padding-bottom: 0;
        }

        .product-page__review-header {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 6px;
          flex-wrap: wrap;
        }

        .product-page__review-name {
          font-size: 13px;
          color: #1c1c1c;
          font-weight: 400;
        }

        .product-page__review-verified,
        .product-page__review-date {
          font-size: 11px;
          color: #999;
          margin-left: 6px;
        }

        .product-page__review-stars {
          margin-bottom: 6px;
          font-size: 11px;
          color: #8b5e3c;
          letter-spacing: 1px;
        }

        .product-page__review-text,
        .product-page__care-copy,
        .product-page__faq-answer {
          margin: 0;
          font-size: 13px;
          line-height: 1.8;
          color: #666;
        }

        .product-page__accordion-content--details,
        .product-page__accordion-content--faq {
          display: grid;
          gap: 12px;
        }

        .product-page__detail-label {
          display: block;
          margin-bottom: 4px;
          font-size: 10px;
          color: #999;
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        .product-page__accordion-content--details p,
        .product-page__faq-question {
          margin: 0;
          font-size: 13px;
          color: #1c1c1c;
        }

        .product-page__faq-question {
          margin-bottom: 4px;
          font-weight: 400;
        }

        .product-page__artisan-card {
          padding: 16px 0 0;
        }

        .product-page__artisan-header {
          display: flex;
          gap: 12px;
          margin-bottom: 12px;
        }

        .product-page__artisan-avatar {
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #e0e0e0;
          color: #999;
          font-size: 28px;
          flex: 0 0 auto;
        }

        .product-page__artisan-name {
          margin: 0 0 4px;
          font-size: 14px;
          font-weight: 400;
          color: #1c1c1c;
        }

        .product-page__artisan-location,
        .product-page__artisan-rating {
          margin: 0 0 4px;
          font-size: 11px;
          color: #999;
        }

        .product-page__artisan-rating span:first-child {
          color: #8b5e3c;
          letter-spacing: 1px;
          margin-right: 6px;
        }

        .product-page__artisan-copy,
        .product-page__artisan-note-copy {
          margin: 0;
          font-size: 13px;
          line-height: 1.8;
          color: #666;
        }

        .product-page__artisan-note {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid #e8e8e8;
        }

        .product-page__artisan-note-label {
          margin: 0 0 4px;
          font-size: 10px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #999;
        }

        .product-page__artisan-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-top: 16px;
        }

        .product-page__artisan-link,
        .product-page__artisan-button {
          height: 42px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #e0e0e0;
          background: transparent;
          color: #1c1c1c;
          font-size: 11px;
          letter-spacing: 1px;
          text-transform: uppercase;
          text-decoration: none;
          transition:
            border-color 0.3s ease,
            color 0.3s ease;
          cursor: pointer;
        }

        .product-page__shipping-note {
          width: 100%;
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #e8e8e8;
        }

        .product-page__shipping-title-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }

        .product-page__shipping-icon {
          color: #999;
          font-size: 12px;
        }

        .product-page__shipping-title {
          font-size: 12px;
          font-weight: 400;
          color: #1c1c1c;
          letter-spacing: 0.5px;
        }

        .product-page__shipping-copy,
        .product-page__shipping-status,
        .product-page__sku {
          font-size: 11px;
          color: #999;
          letter-spacing: 0.5px;
        }

        .product-page__shipping-copy {
          margin: 0 0 8px;
          line-height: 1.8;
        }

        .product-page__sku {
          margin-top: 16px;
        }

        .wear-it-with {
          margin-top: 48px;
        }

        .wear-it-with__heading {
          margin: 0 0 24px;
          font-size: 14px;
          font-weight: 300;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #1c1c1c;
          font-family: var(--font-body);
        }

        .wear-it-with__items {
          display: grid;
          gap: 12px;
        }

        .wear-it-with__link {
          display: grid;
          grid-template-columns: 60px 1fr auto;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          color: inherit;
          padding: 0 0 12px;
          border-bottom: 1px solid #e8e8e8;
        }

        .wear-it-with__image {
          width: 60px;
          height: 60px;
          object-fit: cover;
          background: #f4f4f2;
        }

        .wear-it-with__content {
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 0;
        }

        .wear-it-with__name,
        .wear-it-with__price,
        .wear-it-with__action {
          display: block;
        }

        .wear-it-with__name {
          font-size: 11px;
          color: #1c1c1c;
          line-height: 1.5;
        }

        .wear-it-with__price {
          font-size: 11px;
          color: #999;
        }

        .wear-it-with__action {
          font-size: 10px;
          letter-spacing: 1px;
          color: #999;
          text-transform: uppercase;
          transition: color 0.3s ease;
        }

        .wear-it-with__link:hover .wear-it-with__action {
          color: #1c1c1c;
        }

        .product-page__why-shop {
          margin-top: 48px;
          padding: 32px 0;
          background: #fafaf8;
        }

        .product-page__why-shop-heading {
          margin: 0 0 24px;
          font-size: 14px;
          font-weight: 300;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #1c1c1c;
          font-family: var(--font-body);
        }

        .product-page__why-shop-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 24px;
        }

        .product-page__why-shop-title {
          margin: 0 0 8px;
          font-size: 12px;
          font-weight: 500;
          color: #1c1c1c;
          letter-spacing: 1px;
        }

        .product-page__why-shop-description {
          margin: 0;
          font-size: 11px;
          color: #888;
          line-height: 1.6;
        }

        .product-page__sticky-bar {
          position: fixed;
          left: 0;
          right: 0;
          bottom: 0;
          height: 56px;
          background: #fff;
          border-top: 1px solid #e8e8e8;
          z-index: 100;
        }

        .product-page__sticky-inner {
          max-width: var(--max-width);
          height: 100%;
          margin: 0 auto;
          padding: 0 var(--gutter);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .product-page__sticky-copy {
          min-width: 0;
        }

        .product-page__sticky-name,
        .product-page__sticky-price {
          margin: 0;
          font-size: 12px;
          color: #1c1c1c;
          line-height: 1.3;
        }

        .product-page__sticky-button {
          padding: 12px 24px;
          border: none;
          border-radius: 0;
          background: #1c1c1c;
          color: #fff;
          font-size: 11px;
          letter-spacing: 2px;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 0.3s ease;
          white-space: nowrap;
        }

        @media (min-width: 960px) {
          .product-page__grid {
            grid-template-columns: 1.05fr 0.95fr;
          }
        }

        @media (max-width: 959px) {
          .product-page {
            padding-bottom: calc(var(--space-7) + 72px);
          }

          .product-page__image-frame,
          .product-page__image {
            min-height: 420px;
          }

          .product-page__why-shop-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .product-page__title {
            font-size: 22px;
          }

          .product-page__trust-line {
            white-space: normal;
          }

          .product-page__description {
            max-width: none;
          }

          .product-page__quantity-row,
          .product-page__actions,
          .product-page__share,
          .product-page__share-links {
            width: 100%;
          }

          .product-page__share-links {
            gap: 8px;
          }

          .product-page__cta,
          .product-page__whatsapp {
            width: 100%;
          }

          .product-page__artisan-actions {
            grid-template-columns: 1fr;
          }

          .wear-it-with__link {
            grid-template-columns: 60px 1fr;
          }

          .wear-it-with__action {
            grid-column: 2;
          }

          .product-page__sticky-inner {
            gap: 12px;
          }

          .product-page__sticky-button {
            padding: 12px 18px;
          }
        }

        @media (max-width: 560px) {
          .product-page {
            padding-top: calc(var(--nav-height) + var(--space-5));
          }

          .product-page__image-frame,
          .product-page__image {
            min-height: 360px;
          }

          .product-page__title {
            font-size: 20px;
          }

          .product-page__sticky-name,
          .product-page__sticky-price {
            font-size: 11px;
          }

          .product-page__sticky-button {
            padding: 10px 14px;
          }
        }
      `}</style>
    </>
  );
}

export async function getServerSideProps({ params }) {
  const products = await readProducts();
  const product = products.find(
    (item) => item.slug === params.slug && isPublishedProduct(item),
  );

  if (!product) {
    return { notFound: true };
  }

  const otherProducts = products.filter(
    (item) =>
      item.id !== product.id && !item.isSold && isPublishedProduct(item),
  );
  const manualWearItWith = (product.wearItWithIds || [])
    .map((id) => otherProducts.find((item) => item.id === id))
    .filter(Boolean);
  const preferredTypes = getComplementaryJewelryTypes(product.jewelryType);
  const preferredProducts = preferredTypes.flatMap((type) =>
    otherProducts.filter(
      (item) => item.category === "Jewellery" && item.jewelryType === type,
    ),
  );
  const fallbackJewellery = otherProducts.filter(
    (item) =>
      item.category === "Jewellery" &&
      item.jewelryType &&
      item.jewelryType !== product.jewelryType,
  );
  const fallbackGallery = otherProducts;
  const wearItWithProducts = [];
  const seen = new Set();

  for (const candidate of [
    ...manualWearItWith,
    ...preferredProducts,
    ...fallbackJewellery,
    ...fallbackGallery,
  ]) {
    if (seen.has(candidate.id)) continue;
    seen.add(candidate.id);
    wearItWithProducts.push(candidate);
    if (wearItWithProducts.length === 3) break;
  }

  return {
    props: {
      product,
      wearItWithTitle: product.jewelryType
        ? "Wear it with"
        : "More From the Gallery",
      wearItWithProducts,
    },
  };
}
