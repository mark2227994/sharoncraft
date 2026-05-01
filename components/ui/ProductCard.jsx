'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import Icon from '../icons';
import { useCart } from '../../lib/cart-context';
import './ProductCard.css';

const COLORS = {
  cream: '#fafaf8',
  black: '#080808',
  dark: '#1c1c1c',
  brown: '#8B5E3C',
  border: 'rgba(0,0,0,0.08)',
  cardBg: '#F5F0EB',
};

function cleanArtisanLabel(value) {
  const label = String(value || '').trim();
  if (label.toUpperCase().startsWith('BY ')) {
    return label.slice(3).trim();
  }
  return label || 'Sharon';
}

function formatPrice(price) {
  const num = Number(price) || 0;
  return `KES ${num.toLocaleString('en-KE')}`;
}

function hasSecondImage(product) {
  const images = product?.images;
  if (!Array.isArray(images) || images.length < 2) return false;
  const secondImage = images[1];
  return secondImage !== null && secondImage !== '' && secondImage !== undefined;
}

function getImageSrc(product) {
  if (product?.image) return product.image;
  if (product?.images?.[0]?.src) return product.images[0].src;
  if (product?.images?.[0]) return product.images[0];
  return '/media/site/placeholder.svg';
}

function getSecondImageSrc(product) {
  const images = product?.images;
  if (!Array.isArray(images)) return null;
  if (images[1]?.src) return images[1].src;
  if (images[1]) return images[1];
  return null;
}

export default function ProductCard({ product, variant = 'default' }) {
  const { addToCart, isWishlisted, toggleWishlist, openCart } = useCart();
  const [hovered, setHovered] = useState(false);
  const [mobileImageIndex, setMobileImageIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState(null);
  const cardRef = useRef(null);

  const {
    slug,
    name,
    artisan,
    price,
    originalPrice,
    isSold,
    badge,
    isNew,
    newArrival,
  } = product || {};

  const firstImage = getImageSrc(product);
  const secondImageSrc = getSecondImageSrc(product);
  const hasSecond = hasSecondImage(product);
  const isShopCatalog = variant === 'shop-catalog';
  const saved = isWishlisted(product?.id);

  const hasSale = Number(originalPrice) > Number(price) && !isSold;
  const salePercent = hasSale
    ? Math.round(((Number(originalPrice) - Number(price)) / Number(originalPrice)) * 100)
    : 0;

  const showNewBadge = Boolean(product?.isNew || newArrival || badge === 'New');
  const showSaleBadge = hasSale;
  const artisanLabel = cleanArtisanLabel(artisan);

  useEffect(() => {
    if (!hasSecond || !secondImageSrc) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = new window.Image();
            img.src = secondImageSrc;
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1, rootMargin: '50px' }
    );
    if (cardRef.current) {
      observer.observe(cardRef.current);
    }
    return () => observer.disconnect();
  }, [hasSecond, secondImageSrc]);

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

  function handleTouchStart(e) {
    setTouchStartX(e.touches[0].clientX);
  }

  function handleTouchEnd(e) {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 40) {
      if (diff < 0 && hasSecond) {
        setMobileImageIndex(1);
      }
      else if (diff > 0) {
        setMobileImageIndex(0);
      }
    }
    setTouchStartX(null);
  }

  function handleMouseEnter() {
    setHovered(true);
  }

  function handleMouseLeave() {
    setHovered(false);
  }

  if (isShopCatalog) {
    return (
      <article
        ref={cardRef}
        className="product-card product-card--shop-catalog"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Link
          href={`/product/${slug}`}
          className="product-card__link"
          aria-label={`View ${name}`}
        >
          <div className="product-card__media">
            {(showNewBadge || showSaleBadge) && (
              <div className="product-card__badges">
                {showNewBadge && (
                  <span className="product-card__badge product-card__badge--new">
                    New
                  </span>
                )}
                {showSaleBadge && (
                  <span className="product-card__badge product-card__badge--sale">
                    Save {salePercent}%
                  </span>
                )}
              </div>
            )}
            <div className="product-card__image-container">
              <img
                src={firstImage}
                alt={name}
                loading="lazy"
                decoding="async"
                className="product-card__image product-card__image--primary"
                style={{
                  opacity: hasSecond && !hovered ? 1 : 0,
                  transform: hasSecond && !hovered ? 'scale(1)' : 'scale(1.04)',
                }}
              />
              {hasSecond && secondImageSrc && (
                <img
                  src={secondImageSrc}
                  alt={`${name} - detail view`}
                  loading="lazy"
                  decoding="async"
                  className="product-card__image product-card__image--secondary"
                  style={{
                    opacity: hovered ? 1 : 0,
                    transform: hovered ? 'scale(1)' : 'scale(1.04)',
                  }}
                />
              )}
              {hasSecond && (
                <span
                  className="product-card__hover-cta"
                  style={{
                    transform: hovered ? 'translateY(0)' : 'translateY(100%)',
                  }}
                >
                  VIEW PIECE
                </span>
              )}
            </div>
            <button
              className="product-card__wishlist"
              aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'}
              onClick={handleToggleWishlist}
              style={{ color: saved ? COLORS.brown : 'rgba(255,255,255,0)' }}
            >
              <Icon name={saved ? 'heart-filled' : 'heart'} size={14} />
            </button>
          </div>
          <div className="product-card__info">
            <span className="product-card__artisan">
              BY {artisanLabel.toUpperCase()}
            </span>
            <h3 className="product-card__name">{name}</h3>
            <div className="product-card__pricing">
              <span className="product-card__price">
                {isSold ? 'Sold Out' : formatPrice(price)}
              </span>
              {hasSale && !isSold && (
                <span className="product-card__original">
                  {formatPrice(originalPrice)}
                </span>
              )}
            </div>
          </div>
        </Link>
      </article>
    );
  }

  return (
    <article
      ref={cardRef}
      className="product-card"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link
        href={`/product/${slug}`}
        className="product-card__link"
        aria-label={`View ${name}`}
      >
        <div className="product-card__media">
          {(showNewBadge || showSaleBadge) && (
            <div className="product-card__badges">
              {showNewBadge && (
                <span className="product-card__badge product-card__badge--new">
                  New
                </span>
              )}
              {showSaleBadge && (
                <span className="product-card__badge product-card__badge--sale">
                  Save {salePercent}%
                </span>
              )}
            </div>
          )}
          <div className="product-card__image-container">
            <img
              src={firstImage}
              alt={name}
              loading="lazy"
              decoding="async"
              className="product-card__image product-card__image--primary"
              style={{
                opacity: hasSecond && !hovered ? 1 : 0,
                transform: hasSecond && !hovered ? 'scale(1)' : 'scale(1.04)',
              }}
            />
            {hasSecond && secondImageSrc && (
              <img
                src={secondImageSrc}
                alt={`${name} - detail view`}
                loading="lazy"
                decoding="async"
                className="product-card__image product-card__image--secondary"
                style={{
                  opacity: hovered ? 1 : 0,
                  transform: hovered ? 'scale(1)' : 'scale(1.04)',
                }}
              />
            )}
            {hasSecond && (
              <span
                className="product-card__hover-cta"
                style={{
                  transform: hovered ? 'translateY(0)' : 'translateY(100%)',
                }}
              >
                VIEW PIECE
              </span>
            )}
          </div>
          <button
            className="product-card__wishlist"
            aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'}
            onClick={handleToggleWishlist}
            style={{
              color: saved ? COLORS.brown : 'rgba(255,255,255,0)',
              background: saved ? 'rgba(255,255,255,0.95)' : 'transparent',
            }}
          >
            <Icon name={saved ? 'heart-filled' : 'heart'} size={20} />
          </button>
        </div>
        <div className="product-card__info">
          <span className="product-card__artisan">
            BY {artisanLabel.toUpperCase()}
          </span>
          <h3 className="product-card__name">{name}</h3>
          <div className="product-card__rating">
            <div className="product-card__stars">
              {[...Array(5)].map((_, i) => (
                <Icon key={i} name={i < 4 ? 'star-fill' : 'star'} size={14} />
              ))}
            </div>
            <span className="product-card__reviews">(87)</span>
          </div>
          <div className="product-card__pricing">
            <span className="product-card__price">
              {isSold ? 'Sold Out' : formatPrice(price)}
            </span>
            {hasSale && !isSold && (
              <span className="product-card__original">
                {formatPrice(originalPrice)}
              </span>
            )}
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
          <span>{isSold ? 'Sold Out' : 'Add to Cart'}</span>
        </button>
      </div>
    </article>
  );
}
