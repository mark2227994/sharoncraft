import Link from "next/link";
import Icon from "./icons";
import { useCart } from "../lib/cart-context";

export default function ProductCard({ product }) {
  const { isWishlisted, toggleWishlist } = useCart();
  const { slug, name, artisan, price, originalPrice, image, images, isSold, isNew } = product;
  const imageSrc = image || images?.[0]?.src || "/media/site/placeholder.svg";
  const discount = originalPrice ? Math.round((1 - price / originalPrice) * 100) : null;
  const saved = isWishlisted(product.id);

  return (
    <Link href={`/product/${slug}`} className="product-card" aria-label={`View ${name}`}>
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
          <span className="product-card__badge product-card__badge--discount">-{discount}%</span>
        ) : null}
        <button
          className="product-card__wishlist"
          aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
          onClick={(event) => {
            event.preventDefault();
            toggleWishlist(product);
          }}
          style={{
            color: saved ? "var(--color-accent)" : "currentColor",
            borderColor: saved ? "rgba(107,69,19,0.22)" : undefined,
            background: saved ? "rgba(255,255,255,0.96)" : undefined,
          }}
        >
          <Icon name="heart" size={18} />
        </button>
      </div>
      <div className="product-card__info">
        {artisan ? (
          <div className="product-card__artisan-info">
            <span className="product-card__artisan overline">BY {artisan.toUpperCase()}</span>
            <p className="product-card__certified" style={{ fontSize: "0.65rem", color: "var(--color-accent)" }}>
              ✓ CERTIFIED ARTISAN
            </p>
          </div>
        ) : null}
        <h3 className="product-card__name heading-sm">{name}</h3>
        <div className="product-card__pricing">
          <span className="price" style={{ fontFamily: "var(--font-price)", fontSize: "1.1rem", fontWeight: 600 }}>
            {isSold ? "Sold Out" : `KES ${price.toLocaleString()}`}
          </span>
          {originalPrice && !isSold ? (
            <span className="price--original" style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
              KES {originalPrice.toLocaleString()}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
