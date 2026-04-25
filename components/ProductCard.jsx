import Link from "next/link";
import Icon from "./icons";
import { useCart } from "../lib/cart-context";

export default function ProductCard({ product, variant = "default" }) {
  const { addToCart, isWishlisted, toggleWishlist, openCart } = useCart();
  const { slug, name, artisan, price, originalPrice, image, images, isSold, badge, newArrival } = product;
  const imageSrc = image || images?.[0]?.src || images?.[0] || "/media/site/placeholder.svg";
  const saved = isWishlisted(product.id);
  const isShopCatalog = variant === "shop-catalog";
  const hasSale = Number(originalPrice) > Number(price) && !isSold;
  const salePercent = hasSale ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
  const showNewBadge = Boolean(product.isNew || newArrival || badge === "New");

  // Mock ratings - you can replace with real data from your database
  const rating = 4.5;
  const reviews = 87;

  function handleAddToCart(e) {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    openCart();
  }

  function handleToggleWishlist(e) {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  }

  if (isShopCatalog) {
    return (
      <div className="product-card product-card--shop-catalog">
        <div className="product-card__media">
          <Link href={`/product/${slug}`} className="product-card__image-link" aria-label={`View ${name}`}>
            <div className="product-card__image-wrap">
              {showNewBadge || hasSale ? (
                <div className="product-card__badges">
                  {showNewBadge ? <span className="product-card__badge product-card__badge--new">New</span> : null}
                  {hasSale ? <span className="product-card__badge product-card__badge--sale">Save {salePercent}%</span> : null}
                </div>
              ) : null}

              <img
                src={imageSrc}
                alt={name}
                loading="lazy"
                decoding="async"
                className="product-card__image"
              />
              <span className="product-card__hover-label">View</span>
            </div>
          </Link>

          <button
            className="product-card__wishlist"
            aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
            onClick={handleToggleWishlist}
          >
            <Icon name={saved ? "heart-filled" : "heart"} size={14} />
          </button>
        </div>

        <div className="product-card__content product-card__content--shop">
          <Link href={`/product/${slug}`} className="product-card__link" aria-label={`View ${name}`}>
            {artisan ? (
              <div className="product-card__artisan">
                <span className="product-card__artisan-name">BY {artisan.toUpperCase()}</span>
              </div>
            ) : null}

            <h3 className="product-card__name">{name}</h3>

            <div className="product-card__pricing">
              <span className="product-card__price">{isSold ? "Sold Out" : `KES ${price.toLocaleString()}`}</span>
              {originalPrice && !isSold ? (
                <span className="product-card__original-price">KES {originalPrice.toLocaleString()}</span>
              ) : null}
            </div>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="product-card">
      <Link href={`/product/${slug}`} className="product-card__link" aria-label={`View ${name}`}>
        <div className="product-card__image-wrap">
          <img
            src={imageSrc}
            alt={name}
            loading="lazy"
            decoding="async"
            className="product-card__image"
          />
          <button
            className="product-card__wishlist"
            aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
            onClick={handleToggleWishlist}
            style={{
              color: saved ? "var(--color-terracotta)" : "currentColor",
              background: saved ? "rgba(255, 255, 255, 0.99)" : "rgba(255, 255, 255, 0.95)",
            }}
          >
            <Icon name={saved ? "heart-filled" : "heart"} size={20} />
          </button>
        </div>

        <div className="product-card__content">
          {artisan ? (
            <div className="product-card__artisan">
              <span className="product-card__artisan-name">BY {artisan.toUpperCase()}</span>
            </div>
          ) : null}

          <h3 className="product-card__name">{name}</h3>

          <div className="product-card__rating">
            <div className="product-card__stars">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  width="14"
                  height="14"
                  viewBox="0 0 16 16"
                  fill={i < Math.floor(rating) ? "currentColor" : i < rating ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth="0.5"
                >
                  <path d="M8 1l2.5 5h5.5l-4.5 3.5 1.5 5.5-5-4-5 4 1.5-5.5-4.5-3.5h5.5z" />
                </svg>
              ))}
            </div>
            <span className="product-card__review-count">({reviews})</span>
          </div>

          <div className="product-card__pricing">
            <span className="product-card__price">{isSold ? "Sold Out" : `KES ${price.toLocaleString()}`}</span>
            {originalPrice && !isSold ? (
              <>
                <span className="product-card__original-price">KES {originalPrice.toLocaleString()}</span>
              </>
            ) : null}
          </div>
        </div>
      </Link>

      <div className="product-card__actions">
        <button
          className="product-card__add-btn"
          onClick={handleAddToCart}
          disabled={isSold}
          aria-label={`Add ${name} to cart`}
        >
          <Icon name="shopping-cart" size={18} />
          <span>{isSold ? "Sold Out" : "Add to Cart"}</span>
        </button>
      </div>
    </div>
  );
}
