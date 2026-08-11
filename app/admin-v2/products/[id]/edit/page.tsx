'use client';

import { useParams } from 'next/navigation';
import ProductEditor from '@/components/admin/ProductEditor';

export default function AdminV2EditProductPage() {
  const params = useParams();
  const rawId = params?.id;
  const productId = Array.isArray(rawId) ? rawId[0] ?? '' : rawId ?? '';

  return (
    <ProductEditor
      productId={productId}
      cancelHref="/admin-v2/products"
    />
  );
}
