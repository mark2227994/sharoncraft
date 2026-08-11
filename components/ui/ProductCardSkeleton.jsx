import React from 'react';

export default function ProductCardSkeleton() {
  return (
    <div className="product-card-skeleton">
      <div className="product-card-skeleton__media" />
      <div className="product-card-skeleton__content">
        <div className="product-card-skeleton__line product-card-skeleton__line--artisan" />
        <div className="product-card-skeleton__line product-card-skeleton__line--title" />
        <div className="product-card-skeleton__line product-card-skeleton__line--title-short" />
        <div className="product-card-skeleton__line product-card-skeleton__line--price" />
      </div>

      <style jsx>{`
        .product-card-skeleton {
          --border: rgba(96, 52, 20, 0.085);
          position: relative;
          display: flex;
          flex-direction: column;
          width: 100%;
          background: #ffffff;
          border: 1px solid var(--border);
          border-radius: 6px;
          overflow: hidden;
        }

        .product-card-skeleton__media {
          width: 100%;
          aspect-ratio: 1 / 1.25;
          background: linear-gradient(90deg, #F5F0EB 25%, #EFE9E2 50%, #F5F0EB 75%);
          background-size: 200% 100%;
          animation: skeletonShimmer 1.5s infinite linear;
        }

        .product-card-skeleton__content {
          padding: 12px 14px 14px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .product-card-skeleton__line {
          height: 10px;
          border-radius: 2px;
          background: linear-gradient(90deg, #F5F0EB 25%, #EFE9E2 50%, #F5F0EB 75%);
          background-size: 200% 100%;
          animation: skeletonShimmer 1.5s infinite linear;
        }

        .product-card-skeleton__line--artisan {
          width: 30%;
          height: 8px;
        }

        .product-card-skeleton__line--title {
          width: 80%;
          height: 12px;
          margin-top: 4px;
        }

        .product-card-skeleton__line--title-short {
          width: 50%;
          height: 12px;
          margin-bottom: 6px;
        }

        .product-card-skeleton__line--price {
          width: 40%;
          height: 10px;
        }

        @keyframes skeletonShimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </div>
  );
}
