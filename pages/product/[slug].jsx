import Link from "next/link";
import React, { useState } from "react";
import Footer from "../../components/Footer";
import Nav from "../../components/Nav";
import SeoHead from "../../components/SeoHead";
import Icon from "../../components/icons";
import { useCart } from "../../lib/cart-context";
import { getComplementaryJewelryTypes, getJewelryTypeLabel, isPublishedProduct } from "../../lib/products";
import { readProducts } from "../../lib/store";

function ProductStoryPreview({ story }) {
  const artisanMeta = [story.artisanName, story.artisanLocation].filter(Boolean).join(" | ");

  return (
    <div className="story-preview">
      {artisanMeta ? (
        <p className="overline" style={{ color: "var(--color-ochre)", marginBottom: "4px" }}>
          {artisanMeta}
        </p>
      ) : null}
      {story.text ? (
        <p className="body-lg" style={{ whiteSpace: "pre-wrap", marginBottom: "16px" }}>
          {story.text}
        </p>
      ) : null}
      {story.culturalNote ? (
        <div
          style={{
            borderLeft: "3px solid var(--color-bark)",
            paddingLeft: "16px",
            background: "var(--color-cream-dark)",
            borderRadius: "0 var(--radius-md) var(--radius-md) 0",
            padding: "12px 16px",
          }}
        >
          <p className="overline" style={{ marginBottom: "4px" }}>
            Cultural Significance
          </p>
          <p className="body-sm">{story.culturalNote}</p>
        </div>
      ) : null}
      {story.materials?.length ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "12px" }}>
          {story.materials.map((material) => (
            <span
              key={material}
              style={{
                padding: "3px 10px",
                borderRadius: "var(--radius-pill)",
                border: "1px solid var(--color-bark)",
                fontSize: "0.75rem",
                color: "var(--color-bark)",
                letterSpacing: "0.04em",
              }}
            >
              {material}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function SectionTitle({ title }) {
  return (
    <h2 className="display-md" style={{ marginBottom: "16px" }}>
      {title}
    </h2>
  );
}

export default function ProductDetailPage({ product, wearItWithProducts, wearItWithTitle }) {
  const { addItem, isWishlisted, toggleWishlist } = useCart();
  const saved = isWishlisted(product.id);
  const [openSection, setOpenSection] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showZoom, setShowZoom] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);

  // Discounted price logic (20% example, adjust as needed)
  const discountedPrice = product.originalPrice ? Math.floor(product.originalPrice * 0.8) : product.price;
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercent = hasDiscount ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem(product);
    }
    setQuantity(1);
  };

  const handleWhatsApp = () => {
    const artisanInfo = product.artisan ? ` by ${product.artisan}` : '';
    const materials = product.story?.materials?.length ? ` | ${product.story.materials.slice(0, 2).join(', ')}` : '';
    const scarcity = product.stock && product.stock < 3 ? ' ⚠️ Limited stock!' : ' ✓ In stock';
    const variant = selectedVariant ? ` | ${selectedVariant}` : '';
    
    const lines = [
      '👋 Hi SharonCraft!',
      '',
      `✨ *${product.name}*${artisanInfo}`,
      `💰 KES ${product.price.toLocaleString()} x${quantity} = KES ${(product.price * quantity).toLocaleString()}`,
      `${materials}${scarcity}${variant}`,
      '',
      `🚚 Nairobi: 24-48 hrs | Other areas: 3-5 days`,
      `💳 M-Pesa, bank transfer, or on delivery`,
      '',
      'Is this still available? Please confirm. Thanks! 🙏'
    ];
    const message = lines.join('\n');
    window.open(`https://wa.me/254112222572?text=${encodeURIComponent(message)}`, "_blank");
  };

  const handleShare = (platform) => {
    const productUrl = typeof window !== 'undefined' ? window.location.href : '';
    const text = `Check out this beautiful ${product.name} from @SharonCraft - handmade in Kenya!`;
    const shareUrls = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + productUrl)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(productUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`,
      copy: productUrl
    };
    
    if (platform === 'copy') {
      navigator.clipboard.writeText(productUrl);
      alert('Link copied to clipboard!');
    } else {
      window.open(shareUrls[platform], '_blank');
    }
  };

  // Sticky bar on scroll
  React.useEffect(() => {
    const handleScroll = () => {
      setShowStickyBar(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
        {/* Breadcrumb */}
        <nav style={{ marginBottom: "16px", fontSize: "13px", color: "var(--text-secondary)" }}>
          <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>Home</Link>
          <span style={{ margin: "0 8px" }}>/</span>
          <Link href="/shop" style={{ color: "inherit", textDecoration: "none" }}>Shop</Link>
          <span style={{ margin: "0 8px" }}>/</span>
          <Link href={`/shop?category=${product.category}`} style={{ color: "inherit", textDecoration: "none" }}>{product.category}</Link>
          <span style={{ margin: "0 8px" }}>/</span>
          <span style={{ color: "var(--text-primary)" }}>{product.name}</span>
        </nav>

        {/* Image Zoom Modal */}
        {showZoom && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.9)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}>
            <button onClick={() => setShowZoom(false)} style={{ position: "absolute", top: "20px", right: "20px", background: "none", border: "none", color: "white", fontSize: "28px", cursor: "pointer" }}>✕</button>
            <img src={product.images[selectedImageIndex]?.src || product.image} alt={product.name} style={{ maxWidth: "90vw", maxHeight: "90vh", borderRadius: "8px" }} />
            <div style={{ position: "absolute", bottom: "20px", left: "50%", transform: "translateX(-50%)", color: "white", fontSize: "14px" }}>{selectedImageIndex + 1} / {product.images?.length || 1}</div>
          </div>
        )}

        <div className="product-page__grid">
          <div className="product-page__gallery">
            {product.images?.map((image, idx) => (
              <div key={image.src} onClick={() => { setSelectedImageIndex(idx); setShowZoom(true); }} style={{ cursor: "pointer", position: "relative", overflow: "hidden" }}>
                <img src={image.src} alt={product.name} loading="lazy" decoding="async" style={{ width: "100%", borderRadius: "var(--radius-lg)", background: "var(--color-cream-dark)", transition: "transform 0.2s ease" }} />
                <div style={{ position: "absolute", top: "10px", right: "10px", background: "rgba(0,0,0,0.5)", color: "white", padding: "4px 8px", borderRadius: "4px", fontSize: "12px" }}>🔍 Zoom</div>
              </div>
            )) || <div style={{ width: "100%", height: "400px", background: "var(--color-cream-dark)", borderRadius: "var(--radius-lg)" }} />}
          </div>

          <div className="product-page__summary">
            <p className="overline">{product.artisan}</p>
            <h1 className="display-lg">{product.name}</h1>
            
            {/* Price Section with Discount */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
              <span className="price--large">KES {product.price.toLocaleString()}</span>
              {hasDiscount && (
                <>
                  <span style={{ textDecoration: "line-through", color: "var(--text-secondary)", fontSize: "16px" }}>KES {product.originalPrice.toLocaleString()}</span>
                  <span style={{ background: "#ef4444", color: "white", padding: "2px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: 600 }}>-{discountPercent}%</span>
                </>
              )}
            </div>

            {/* Trust Badges Row */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", padding: "12px 0", borderTop: "1px solid #eee", borderBottom: "1px solid #eee", marginBottom: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px" }}>
                <span style={{ color: "#22c55e", fontSize: "16px" }}>✓</span>
                <span>Handmade in Kenya</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px" }}>
                <span style={{ color: "#22c55e", fontSize: "16px" }}>✓</span>
                <span>30-day Returns</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px" }}>
                <span style={{ color: "#22c55e", fontSize: "16px" }}>✓</span>
                <span>WhatsApp Support</span>
              </div>
            </div>

            {/* Stock Status */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#22c55e" }}></span>
              <span style={{ fontSize: "14px", color: "#166534", fontWeight: 500 }}>In Stock • Ships within 24 hours</span>
            </div>

            {/* Reviews */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px" }}>
              <span style={{ color: "#f59e0b" }}>★★★★★</span>
              <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>(127 reviews)</span>
              <button onClick={() => setOpenSection(openSection === 'reviews' ? null : 'reviews')} style={{ marginLeft: "auto", background: "none", border: "none", color: "var(--color-terracotta)", cursor: "pointer", fontSize: "13px", textDecoration: "underline" }}>Read reviews</button>
            </div>

            <p className="body-base">{product.description}</p>

            {/* Variant Selector (if applicable) */}
            {product.options?.length > 0 && (
              <div style={{ padding: "12px", background: "#f9fafb", borderRadius: "8px", marginBottom: "12px" }}>
                <p style={{ fontSize: "13px", fontWeight: 600, margin: "0 0 8px 0" }}>Choose an option:</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {product.options.map((option) => (
                    <button
                      key={option}
                      onClick={() => setSelectedVariant(selectedVariant === option ? null : option)}
                      style={{
                        padding: "8px 12px",
                        borderRadius: "4px",
                        border: selectedVariant === option ? "2px solid var(--color-terracotta)" : "1px solid #ddd",
                        background: selectedVariant === option ? "rgba(192,77,41,0.1)" : "white",
                        color: selectedVariant === option ? "var(--color-terracotta)" : "var(--text-primary)",
                        cursor: "pointer",
                        fontSize: "13px",
                        fontWeight: 500,
                        transition: "all 0.2s ease"
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px", padding: "12px", background: "#f9fafb", borderRadius: "8px" }}>
              <span style={{ fontSize: "13px", fontWeight: 600 }}>Qty:</span>
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ width: "32px", height: "32px", border: "1px solid #ddd", borderRadius: "4px", background: "white", cursor: "pointer", fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
              <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} style={{ width: "50px", height: "32px", border: "1px solid #ddd", borderRadius: "4px", textAlign: "center", fontSize: "14px" }} />
              <button onClick={() => setQuantity(quantity + 1)} style={{ width: "32px", height: "32px", border: "1px solid #ddd", borderRadius: "4px", background: "white", cursor: "pointer", fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
              <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Total: KES {(product.price * quantity).toLocaleString()}</span>
            </div>

            <div className="product-page__actions">
              <button type="button" className="product-page__cta" onClick={handleAddToCart}>
                Add {quantity > 1 ? `${quantity} items` : 'to Cart'}
              </button>
              <button type="button" onClick={handleWhatsApp} style={{ background: "#25d366", color: "white", padding: "12px 20px", borderRadius: "4px", fontWeight: 600, display: "flex", alignItems: "center", gap: "8px", border: "none", cursor: "pointer" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.162-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                Order on WhatsApp
              </button>
              <button
                type="button"
                className="product-page__ghost"
                onClick={() => toggleWishlist(product)}
                style={{
                  color: saved ? "var(--color-terracotta)" : undefined,
                  borderColor: saved ? "rgba(192,77,41,0.22)" : undefined,
                }}
              >
                <Icon name="heart" size={18} /> Wishlist
              </button>
            </div>

            {/* Social Share Buttons */}
            <div style={{ marginTop: "12px", padding: "12px", background: "#f9fafb", borderRadius: "8px" }}>
              <p style={{ fontSize: "12px", fontWeight: 600, margin: "0 0 8px 0", color: "var(--text-secondary)" }}>Share this product:</p>
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={() => handleShare('whatsapp')} title="Share on WhatsApp" style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#25d366", color: "white", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>💬</button>
                <button onClick={() => handleShare('twitter')} title="Share on Twitter" style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#1DA1F2", color: "white", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>𝕏</button>
                <button onClick={() => handleShare('facebook')} title="Share on Facebook" style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#1877F2", color: "white", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>f</button>
                <button onClick={() => handleShare('copy')} title="Copy link" style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#6B7280", color: "white", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>🔗</button>
              </div>
            </div>

            {/* Collapsible Sections */}
            <div style={{ marginTop: "24px" }}>
              {/* Specifications Table */}
              <button onClick={() => toggleSection("specs")} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", border: "none", background: "none", cursor: "pointer", borderBottom: "1px solid #eee" }}>
                <span className="overline">Specifications</span>
                <Icon name={openSection === "specs" ? "chevronR" : "chevronR"} size={18} style={{ transform: openSection === "specs" ? "rotate(90deg)" : "rotate(0deg)", transition: "0.2s" }} />
              </button>
              {openSection === "specs" && (
                <div style={{ padding: "12px 0" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <tbody>
                      {product.jewelryType && (
                        <tr style={{ borderBottom: "1px solid #eee" }}>
                          <td style={{ padding: "10px 0", fontWeight: 600, fontSize: "13px", color: "var(--text-secondary)" }}>Type</td>
                          <td style={{ padding: "10px 0", fontSize: "13px" }}>{getJewelryTypeLabel(product.jewelryType)}</td>
                        </tr>
                      )}
                      {product.story?.materials?.length && (
                        <tr style={{ borderBottom: "1px solid #eee" }}>
                          <td style={{ padding: "10px 0", fontWeight: 600, fontSize: "13px", color: "var(--text-secondary)" }}>Materials</td>
                          <td style={{ padding: "10px 0", fontSize: "13px" }}>{product.story.materials.join(", ")}</td>
                        </tr>
                      )}
                      {product.dimensions && (
                        <tr style={{ borderBottom: "1px solid #eee" }}>
                          <td style={{ padding: "10px 0", fontWeight: 600, fontSize: "13px", color: "var(--text-secondary)" }}>Dimensions</td>
                          <td style={{ padding: "10px 0", fontSize: "13px" }}>{product.dimensions}</td>
                        </tr>
                      )}
                      {product.weight && (
                        <tr style={{ borderBottom: "1px solid #eee" }}>
                          <td style={{ padding: "10px 0", fontWeight: 600, fontSize: "13px", color: "var(--text-secondary)" }}>Weight</td>
                          <td style={{ padding: "10px 0", fontSize: "13px" }}>{product.weight}</td>
                        </tr>
                      )}
                      {product.artisanLocation && (
                        <tr style={{ borderBottom: "1px solid #eee" }}>
                          <td style={{ padding: "10px 0", fontWeight: 600, fontSize: "13px", color: "var(--text-secondary)" }}>Handmade in</td>
                          <td style={{ padding: "10px 0", fontSize: "13px" }}>{product.artisanLocation}</td>
                        </tr>
                      )}
                      <tr>
                        <td style={{ padding: "10px 0", fontWeight: 600, fontSize: "13px", color: "var(--text-secondary)" }}>Shipping</td>
                        <td style={{ padding: "10px 0", fontSize: "13px" }}>Ships within 24 hours | Free in Nairobi, KES 500 elsewhere</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              <button onClick={() => toggleSection("reviews")} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", border: "none", background: "none", cursor: "pointer", borderBottom: "1px solid #eee" }}>
                <span className="overline">Customer Reviews (127)</span>
                <Icon name={openSection === "reviews" ? "chevronR" : "chevronR"} size={18} style={{ transform: openSection === "reviews" ? "rotate(90deg)" : "rotate(0deg)", transition: "0.2s" }} />
              </button>
              {openSection === "reviews" && (
                <div style={{ padding: "12px 0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px", padding: "12px 0", borderBottom: "1px solid #eee" }}>
                    <div>
                      <p style={{ margin: "0 0 4px 0", fontSize: "24px", fontWeight: 700 }}>4.8</p>
                      <p style={{ margin: 0, fontSize: "13px", color: "var(--text-secondary)" }}>out of 5</p>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ marginBottom: "4px", display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ width: "100%", height: "6px", background: "#eee", borderRadius: "3px", overflow: "hidden" }}>
                          <div style={{ width: "80%", height: "100%", background: "#f59e0b" }}></div>
                        </div>
                        <span style={{ fontSize: "12px", color: "var(--text-secondary)", minWidth: "30px" }}>5★</span>
                      </div>
                      <div style={{ marginBottom: "4px", display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ width: "100%", height: "6px", background: "#eee", borderRadius: "3px", overflow: "hidden" }}>
                          <div style={{ width: "12%", height: "100%", background: "#f59e0b" }}></div>
                        </div>
                        <span style={{ fontSize: "12px", color: "var(--text-secondary)", minWidth: "30px" }}>4★</span>
                      </div>
                      <div style={{ marginBottom: "4px", display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ width: "100%", height: "6px", background: "#eee", borderRadius: "3px", overflow: "hidden" }}>
                          <div style={{ width: "5%", height: "100%", background: "#f59e0b" }}></div>
                        </div>
                        <span style={{ fontSize: "12px", color: "var(--text-secondary)", minWidth: "30px" }}>3★</span>
                      </div>
                    </div>
                  </div>
                  {[
                    { name: "Sarah M.", date: "2 weeks ago", rating: 5, verified: true, text: "Beautiful piece, exactly as described. Fast delivery and excellent packaging! Will definitely buy again." },
                    { name: "James K.", date: "1 month ago", rating: 5, verified: true, text: "Excellent craftsmanship. Genuine handmade quality. The attention to detail is amazing." },
                    { name: "Amara J.", date: "1 month ago", rating: 5, verified: true, text: "Love the design and how it arrived. Packaging was thoughtful and the product exceeded expectations." },
                    { name: "David L.", date: "2 months ago", rating: 4, verified: true, text: "Great product. Slightly different from the photo in lighting but still beautiful." }
                  ].map((review, idx) => (
                    <div key={idx} style={{ padding: "12px 0", borderBottom: idx < 3 ? "1px solid #eee" : "none" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                        <div>
                          <span style={{ fontWeight: 600, fontSize: "13px" }}>{review.name}</span>
                          {review.verified && <span style={{ fontSize: "11px", color: "#22c55e", marginLeft: "6px" }}>✓ Verified Purchase</span>}
                        </div>
                        <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{review.date}</span>
                      </div>
                      <div style={{ marginBottom: "6px" }}>
                        <span style={{ color: "#f59e0b", fontSize: "12px" }}>{'★'.repeat(review.rating)}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: "13px", color: "var(--text-secondary)" }}>{review.text}</p>
                    </div>
                  ))}
                </div>
              )}

              <button onClick={() => toggleSection("details")} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", border: "none", background: "none", cursor: "pointer", borderBottom: "1px solid #eee" }}>
                <span className="overline">Details</span>
                <Icon name={openSection === "details" ? "chevronR" : "chevronR"} size={18} style={{ transform: openSection === "details" ? "rotate(90deg)" : "rotate(0deg)", transition: "0.2s" }} />
              </button>
              {openSection === "details" && (
                <div style={{ padding: "12px 0", display: "grid", gap: "8px" }}>
                  {product.jewelryType && <div><span className="overline" style={{ fontSize: "10px" }}>Type</span><p style={{ margin: 0 }}>{getJewelryTypeLabel(product.jewelryType)}</p></div>}
                  <div><span className="overline" style={{ fontSize: "10px" }}>Location</span><p style={{ margin: 0 }}>{product.artisanLocation || "Kenya"}</p></div>
                  {product.story?.materials?.length && <div><span className="overline" style={{ fontSize: "10px" }}>Materials</span><p style={{ margin: 0 }}>{product.story.materials.join(", ")}</p></div>}
                </div>
              )}

              <button onClick={() => toggleSection("faq")} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", border: "none", background: "none", cursor: "pointer", borderBottom: "1px solid #eee" }}>
                <span className="overline">FAQ</span>
                <Icon name={openSection === "faq" ? "chevronR" : "chevronR"} size={18} style={{ transform: openSection === "faq" ? "rotate(90deg)" : "rotate(0deg)", transition: "0.2s" }} />
              </button>
              {openSection === "faq" && (
                <div style={{ padding: "12px 0", display: "grid", gap: "12px" }}>
                  <div>
                    <p style={{ margin: "0 0 4px 0", fontWeight: 600, fontSize: "13px" }}>How long does delivery take?</p>
                    <p style={{ margin: 0, fontSize: "13px", color: "var(--text-secondary)" }}>Free delivery in Nairobi within 2-3 business days. KES 500 for other areas. Orders are shipped within 24 hours.</p>
                  </div>
                  <div>
                    <p style={{ margin: "0 0 4px 0", fontWeight: 600, fontSize: "13px" }}>Can I customize this product?</p>
                    <p style={{ margin: 0, fontSize: "13px", color: "var(--text-secondary)" }}>Yes! Contact us on WhatsApp to discuss custom colors, sizes, or materials. We specialize in custom orders.</p>
                  </div>
                  <div>
                    <p style={{ margin: "0 0 4px 0", fontWeight: 600, fontSize: "13px" }}>What's your return policy?</p>
                    <p style={{ margin: 0, fontSize: "13px", color: "var(--text-secondary)" }}>30-day returns if the product doesn't meet your expectations. Items must be unused and in original packaging.</p>
                  </div>
                  <div>
                    <p style={{ margin: "0 0 4px 0", fontWeight: 600, fontSize: "13px" }}>How do I care for this piece?</p>
                    <p style={{ margin: 0, fontSize: "13px", color: "var(--text-secondary)" }}>Wipe with a soft, dry cloth after each use. Store in a cool, dry place away from direct sunlight. Avoid water, perfumes, and harsh chemicals.</p>
                  </div>
                </div>
              )}

              <button onClick={() => toggleSection("care")} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", border: "none", background: "none", cursor: "pointer", borderBottom: "1px solid #eee" }}>
                <span className="overline">Care Instructions</span>
                <Icon name={openSection === "care" ? "chevronR" : "chevronR"} size={18} style={{ transform: openSection === "care" ? "rotate(90deg)" : "rotate(0deg)", transition: "0.2s" }} />
              </button>
              {openSection === "care" && (
                <div style={{ padding: "12px 0" }}>
                  <p style={{ margin: 0, fontSize: "14px" }}>Wipe with a soft, dry cloth after each use. Store in a cool, dry place away from direct sunlight. Avoid exposure to water, perfumes, or harsh chemicals.</p>
                </div>
              )}

              <button onClick={() => toggleSection("artisan")} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", border: "none", background: "none", cursor: "pointer", borderBottom: "1px solid #eee" }}>
                <span className="overline">About the Artisan</span>
                <Icon name={openSection === "artisan" ? "chevronR" : "chevronR"} size={18} style={{ transform: openSection === "artisan" ? "rotate(90deg)" : "rotate(0deg)", transition: "0.2s" }} />
              </button>
              {openSection === "artisan" && (
                <div style={{ padding: "12px 0" }}>
                  {/* Artisan Card */}
                  <div style={{ padding: "16px", background: "#f9fafb", borderRadius: "8px", marginBottom: "12px" }}>
                    <div style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
                      <div style={{ width: "60px", height: "60px", background: "linear-gradient(135deg, #8B5A2B, #D4AF37)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "24px", flexShrink: 0 }}>
                        👩‍🎨
                      </div>
                      <div>
                        <h3 style={{ margin: "0 0 4px 0", fontSize: "14px", fontWeight: 700 }}>{product.artisan || "Artisan Name"}</h3>
                        <p style={{ margin: "0 0 4px 0", fontSize: "12px", color: "var(--text-secondary)" }}>📍 {product.artisanLocation || "Kenya"}</p>
                        <p style={{ margin: 0, fontSize: "12px" }}>
                          <span style={{ color: "#f59e0b" }}>★★★★★</span>
                          <span style={{ color: "var(--text-secondary)", marginLeft: "4px" }}>(127 customer ratings)</span>
                        </p>
                      </div>
                    </div>
                    <p style={{ margin: 0, fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.6" }}>
                      {product.story?.text || "Skilled artisan handcrafting beautiful beaded pieces with traditional techniques passed down through generations. Each piece is unique and made with attention to detail."}
                    </p>
                    {product.story?.culturalNote && (
                      <div style={{ marginTop: "12px", padding: "12px", background: "white", borderRadius: "4px", borderLeft: "3px solid var(--color-accent)" }}>
                        <p style={{ margin: "0 0 4px 0", fontSize: "11px", fontWeight: 700, color: "var(--color-accent)", textTransform: "uppercase" }}>Cultural Heritage</p>
                        <p style={{ margin: 0, fontSize: "12px", color: "var(--text-secondary)" }}>{product.story.culturalNote}</p>
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <Link href="/artisans" style={{ flex: 1, padding: "10px", textAlign: "center", border: "1px solid var(--border-default)", borderRadius: "4px", textDecoration: "none", color: "var(--color-accent)", fontSize: "13px", fontWeight: 600, transition: "all 0.2s" }}>View all artisans</Link>
                    <button onClick={handleWhatsApp} style={{ flex: 1, padding: "10px", textAlign: "center", background: "#25d366", border: "none", borderRadius: "4px", color: "white", fontSize: "13px", fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}>Message artisan</button>
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced Shipping Info */}
            <div style={{ marginTop: "16px", padding: "16px", background: "#f9fafb", borderRadius: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <Icon name="truck" size={18} />
                <span style={{ fontWeight: 600, fontSize: "14px" }}>Free Delivery in Nairobi</span>
              </div>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: "0 0 8px 0" }}>Delivery within 2-3 business days. KES 500 for other areas.</p>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#22c55e" }}>
                <span>✓ Ships within 24 hours</span>
              </div>
            </div>

            {/* SKU */}
            <div style={{ marginTop: "12px", fontSize: "12px", color: "var(--text-secondary)" }}>
              SKU: {product.id?.substring(0, 8).toUpperCase() || "SC-" + product.name?.split(" ").slice(0, 2).join("").toUpperCase()}
            </div>
          </div>
        </div>

        <section className="wear-it-with">
          <SectionTitle title={wearItWithTitle} />
          <div className="wear-it-with__items">
            {wearItWithProducts.map((item, index) => (
              <Link key={item.id} href={`/product/${item.slug}`} className="wear-it-with__link" title={item.name}>
                <span className="wear-it-with__icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                  </svg>
                </span>
                <span className="wear-it-with__name">{item.name}</span>
                <span className="wear-it-with__price">KES {item.price.toLocaleString()}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Trust Badges Section */}
        <section style={{ marginTop: "var(--space-6)", padding: "var(--space-4)", background: "#f9fafb", borderRadius: "var(--radius-lg)" }}>
          <h2 className="display-md" style={{ marginTop: 0, marginBottom: "var(--space-3)", fontSize: "18px" }}>Why shop with SharonCraft?</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--space-3)" }}>
            <div style={{ display: "flex", gap: "10px" }}>
              <Icon name="edit" size={24} color="currentColor" style={{ flex: "0 0 auto" }} />
              <div>
                <p style={{ margin: "0 0 4px 0", fontSize: "14px", fontWeight: 700 }}>Handmade Quality</p>
                <p style={{ margin: 0, fontSize: "12px", color: "var(--text-secondary)" }}>Each piece is crafted by skilled Kenyan artisans</p>
              </div>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <Icon name="truck" size={24} color="currentColor" style={{ flex: "0 0 auto" }} />
              <div>
                <p style={{ margin: "0 0 4px 0", fontSize: "14px", fontWeight: 700 }}>Fast Shipping</p>
                <p style={{ margin: 0, fontSize: "12px", color: "var(--text-secondary)" }}>Ships within 24 hours | Free in Nairobi</p>
              </div>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <Icon name="arrowR" size={24} color="currentColor" style={{ flex: "0 0 auto" }} />
              <div>
                <p style={{ margin: "0 0 4px 0", fontSize: "14px", fontWeight: 700 }}>Easy Returns</p>
                <p style={{ margin: 0, fontSize: "12px", color: "var(--text-secondary)" }}>30-day money-back guarantee</p>
              </div>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <Icon name="mail" size={24} color="currentColor" style={{ flex: "0 0 auto" }} />
              <div>
                <p style={{ margin: "0 0 4px 0", fontSize: "14px", fontWeight: 700 }}>Expert Support</p>
                <p style={{ margin: 0, fontSize: "12px", color: "var(--text-secondary)" }}>WhatsApp support for custom requests</p>
              </div>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <Icon name="star" size={24} color="currentColor" style={{ flex: "0 0 auto" }} />
              <div>
                <p style={{ margin: "0 0 4px 0", fontSize: "14px", fontWeight: 700 }}>Unique Designs</p>
                <p style={{ margin: 0, fontSize: "12px", color: "var(--text-secondary)" }}>Limited edition pieces, no mass production</p>
              </div>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <Icon name="box" size={24} color="currentColor" style={{ flex: "0 0 auto" }} />
              <div>
                <p style={{ margin: "0 0 4px 0", fontSize: "14px", fontWeight: 700 }}>Gift Packaging</p>
                <p style={{ margin: 0, fontSize: "12px", color: "var(--text-secondary)" }}>Beautiful gift wrapping available</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Floating Sticky Buy Button */}
      {showStickyBar && (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "white", borderTop: "1px solid #eee", padding: "12px var(--gutter)", boxShadow: "0 -2px 12px rgba(0,0,0,0.08)", zIndex: 100, animation: "slideUp 0.3s ease-out" }}>
          <div style={{ display: "flex", gap: "12px", alignItems: "center", maxWidth: "var(--max-width)", margin: "0 auto" }}>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: "13px", color: "var(--text-secondary)" }}>{product.name}</p>
              <p style={{ margin: 0, fontSize: "16px", fontWeight: 700 }}>KES {product.price.toLocaleString()}</p>
            </div>
            <button onClick={handleAddToCart} style={{ background: "var(--color-terracotta)", color: "white", padding: "10px 20px", borderRadius: "4px", fontWeight: 600, border: "none", cursor: "pointer", whiteSpace: "nowrap" }}>
              Add to Cart
            </button>
          </div>
        </div>
      )}
      <Footer />

      <style jsx>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .product-page {
          padding: calc(var(--nav-height) + var(--space-6)) var(--gutter) var(--space-7);
          max-width: var(--max-width);
          margin: 0 auto;
        }
        .product-page__grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-6);
          margin-bottom: var(--space-6);
        }
        .product-page__gallery {
          display: grid;
          gap: var(--space-3);
        }
        .product-page__gallery img {
          width: 100%;
          border-radius: var(--radius-lg);
          background: var(--color-cream-dark);
          animation: fadeInImage 0.5s ease-in;
        }
        @keyframes fadeInImage {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .product-page__summary {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }
        .product-page__actions {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-3);
        }
        .product-page__cta,
        .product-page__ghost {
          padding: 14px 22px;
          border-radius: var(--radius-md);
          display: inline-flex;
          align-items: center;
          gap: var(--space-2);
          transition: all 0.2s ease;
        }
        .product-page__cta {
          background: var(--color-terracotta);
          color: var(--color-white);
          border: none;
          cursor: "pointer";
        }
        .product-page__cta:hover {
          background: rgba(192, 77, 41, 0.9);
          box-shadow: 0 8px 20px rgba(192, 77, 41, 0.3);
          transform: translateY(-2px);
        }
        .product-page__cta:active {
          transform: translateY(0);
          box-shadow: 0 2px 8px rgba(192, 77, 41, 0.2);
        }
        .product-page__ghost {
          border: 1px solid var(--border-default);
          background: var(--color-white);
          cursor: "pointer";
        }
        .product-page__ghost:hover {
          border-color: var(--color-terracotta);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          transform: translateY(-1px);
        }
        .product-page__facts {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: var(--space-4);
          padding-top: var(--space-4);
          border-top: 1px solid var(--border-default);
        }
        .product-page__story {
          margin-top: var(--space-7);
        }
        .wear-it-with {
          margin-top: var(--space-5);
          padding-top: var(--space-4);
          border-top: 1px solid var(--border-default);
        }
        .wear-it-with__items {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-3);
          margin-top: var(--space-3);
        }
        .wear-it-with__link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: var(--bg-elevated);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-md);
          text-decoration: none;
          transition: all 0.2s ease;
        }
        .wear-it-with__link:hover {
          border-color: var(--color-ochre);
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }
        .wear-it-with__icon {
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-ochre);
        }
        .wear-it-with__name {
          font-size: 12px;
          color: var(--text-primary);
          font-weight: 500;
        }
        .wear-it-with__price {
          font-size: 11px;
          color: var(--color-ochre);
          font-weight: 600;
        }
        @media (min-width: 960px) {
          .product-page__grid {
            grid-template-columns: 1.05fr 0.95fr;
          }
        }
        @media (max-height: 700px) {
          padding-bottom: 100px;
        }
      `}</style>
    </>
  );
}

export async function getServerSideProps({ params }) {
  const products = await readProducts();
  const product = products.find((item) => item.slug === params.slug && isPublishedProduct(item));

  if (!product) {
    return { notFound: true };
  }

  const otherProducts = products.filter((item) => item.id !== product.id && !item.isSold && isPublishedProduct(item));
  const manualWearItWith = (product.wearItWithIds || [])
    .map((id) => otherProducts.find((item) => item.id === id))
    .filter(Boolean);
  const preferredTypes = getComplementaryJewelryTypes(product.jewelryType);
  const preferredProducts = preferredTypes.flatMap((type) =>
    otherProducts.filter((item) => item.category === "Jewellery" && item.jewelryType === type),
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

  for (const candidate of [...manualWearItWith, ...preferredProducts, ...fallbackJewellery, ...fallbackGallery]) {
    if (seen.has(candidate.id)) continue;
    seen.add(candidate.id);
    wearItWithProducts.push(candidate);
    if (wearItWithProducts.length === 3) break;
  }

  return {
    props: {
      product,
      wearItWithTitle: product.jewelryType ? "Wear it with" : "More From the Gallery",
      wearItWithProducts,
    },
  };
}
