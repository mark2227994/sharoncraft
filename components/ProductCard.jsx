import Link from "next/link";
import Icon from "./icons";

export default function ProductCard({ product }) {
  const { slug, name, artisan, price, originalPrice, image, images, isSold, isNew } = product;
  const imageSrc = image || images?.[0]?.src;
  const discount = originalPrice ? Math.round((1 - price / originalPrice) * 100) : null;

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
        {isSold ? <span className="product-card__badge product-card__badge--sold">Sold</span> : null}
        {isNew && !isSold ? <span className="product-card__badge product-card__badge--new">New</span> : null}
        {discount && !isSold ? (
          <span className="product-card__badge product-card__badge--discount">-{discount}%</span>
        ) : null}
        <button
          className="product-card__wishlist"
          aria-label="Add to wishlist"
          onClick={(event) => {
            event.preventDefault();
          }}
        >
          <Icon name="heart" size={18} />
        </button>
      </div>
      <div className="product-card__info">
        {artisan ? <span className="product-card__artisan overline">{artisan}</span> : null}
        <h3 className="product-card__name heading-sm">{name}</h3>
        <div className="product-card__pricing">
          <span className="price">{isSold ? "Sold" : `KES ${price.toLocaleString()}`}</span>
          {originalPrice && !isSold ? (
            <span className="price--original">KES {originalPrice.toLocaleString()}</span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
