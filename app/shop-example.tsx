// Example: Shop page using Supabase data instead of static JSON
// Replace existing /pages/shop.js or create new /app/shop/page.tsx

'use client';

import { useEffect, useState } from 'react';
import {
  fetchVisibleProducts,
  fetchVisibleCategories,
  searchProducts,
} from '@/lib/supabase/public';
import Link from 'next/link';

export default function ShopPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const cats = await fetchVisibleCategories();
    setCategories(cats);

    let products;
    if (searchTerm) {
      products = await searchProducts(searchTerm);
    } else if (selectedCategory) {
      products = await fetchVisibleProducts(selectedCategory);
    } else {
      products = await fetchVisibleProducts();
    }

    setProducts(products);
    setLoading(false);
  }

  useEffect(() => {
    const debounce = setTimeout(() => {
      loadData();
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchTerm, selectedCategory]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shop</h1>

      {/* Filters */}
      <div className="mb-8 flex gap-4 flex-wrap">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded"
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.name}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="text-center py-12">Loading products...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-12">No products found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Link key={product.id} href={`/shop/${product.id}`}>
              <div className="cursor-pointer hover:shadow-lg transition-shadow">
                {product.images?.[0] && (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-64 object-cover rounded"
                  />
                )}
                <h3 className="mt-2 font-semibold">{product.name}</h3>
                <p className="text-gray-600">KES {product.price}</p>
                {product.sale_price && (
                  <p className="text-red-500 line-through">
                    KES {product.price}
                  </p>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  {product.stock_quantity > 0 ? 'In stock' : 'Out of stock'}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
