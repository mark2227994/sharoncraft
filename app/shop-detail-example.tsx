// Example: Product detail page using Supabase
// Replace existing product page or create new /app/shop/[id]/page.tsx

import {
  fetchProductById,
  fetchProductReviews,
  fetchRelatedProducts,
} from '@/lib/supabase/public';
import ProductDetailClient from './product-detail-client';

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await fetchProductById(params.id);
  const reviews = await fetchProductReviews(params.id);

  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <ProductDetailClient product={product} reviews={reviews} />
    </div>
  );
}
