import Link from "next/link";
import Icon from "./icons";
import { useCart } from "../lib/cart-context";

export default function ProductCard({ product }) {
  const { addToCart, isWishlisted, toggleWishlist } = useCart();
  const { slug, name, artisan, price, originalPrice, image, images, isSold, isNew } = product;
  const imageSrc = image || images?.[0]?.src || "/media/site/placeholder.svg";
  const discount = originalPrice ? Math.round((1 - price / originalPrice) * 100) : null;
  const saved = isWishlisted(product.id);
  
  // Mock ratings - you can replace with real data from your database
  const rating = 4.5;
  const reviews = 87;

  function handleAddToCart(e) {
    e.preventDefault();
    addToCart(product);
  }

  function handleToggleWishlist(e) {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
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
          {isSold ? <span className="product-card__badge product-card__badge--sold">Sold Out</span> : null}
          {isNew && !isSold ? <span className="product-card__badge product-card__badge--new">New</span> : null}
          {discount && !isSold ? (
            <span className="product-card__badge product-card__badge--discount">Save {discount}%</span>
          ) : null}
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

          {/* Rating and reviews */}
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

          {/* Pricing */}
          <div className="product-card__pricing">
            <span className="product-card__price">
              {isSold ? "Sold Out" : `KES ${price.toLocaleString()}`}
            </span>
            {originalPrice && !isSold ? (
              <>
                <span className="product-card__original-price">KES {originalPrice.toLocaleString()}</span>
              </>
            ) : null}
          </div>
        </div>
      </Link>

      {/* Action buttons - always visible */}
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
