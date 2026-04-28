'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Product } from '@/lib/types';
import Link from 'next/link';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    try {
      console.log('Fetching products...');
      let query = supabase.from('products').select('*').order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
      }
      if (categoryFilter) {
        query = query.eq('category', categoryFilter);
      }

      const { data, error } = await query;

      console.log('Products response:', { data, error, count: data?.length });

      if (error) {
        console.error('Error fetching products:', error);
        return;
      }

      setProducts(data || []);
    } catch (err) {
      console.error('Exception fetching products:', err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchCategories() {
    const { data } = await supabase.from('categories').select('name').order('display_order');
    if (data) {
      setCategories(data.map((c: any) => c.name));
    }
  }

  async function toggleVisibility(id: string, isVisible: boolean) {
    const { error } = await supabase
      .from('products')
      .update({ is_visible: !isVisible })
      .eq('id', id);

    if (!error) {
      setProducts(
        products.map((p) => (p.id === id ? { ...p, is_visible: !isVisible } : p))
      );
    }
  }

  async function deleteProduct(id: string) {
    if (!confirm('Delete this product?')) return;

    const { error } = await supabase.from('products').delete().eq('id', id);

    if (!error) {
      setProducts(products.filter((p) => p.id !== id));
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium">Products</h2>
          <p className="text-xs text-gray-500 mt-1">{products.length} items</p>
        </div>
        <Link
          href="/admin-v2/products/new"
          className="text-xs tracking-wider uppercase px-4 py-2 rounded-sm transition-opacity"
          style={{
            backgroundColor: '#1c1c1c',
            color: '#fff',
            letterSpacing: '2px',
          }}
        >
          Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setTimeout(() => fetchProducts(), 300);
          }}
          className="text-xs px-3 py-2 border flex-1"
          style={{ borderColor: '#e0e0e0' }}
        />
        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setTimeout(() => fetchProducts(), 300);
          }}
          className="text-xs px-3 py-2 border"
          style={{ borderColor: '#e0e0e0' }}
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Products Table */}
      {loading ? (
        <div className="text-xs text-gray-500">Loading...</div>
      ) : products.length === 0 ? (
        <div className="text-xs text-gray-500">No products found</div>
      ) : (
        <div className="border" style={{ borderColor: '#f0f0f0' }}>
          <table className="w-full text-xs">
            <thead>
              <tr style={{ backgroundColor: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
                <th className="px-4 py-3 text-left font-medium">Name</th>
                <th className="px-4 py-3 text-left font-medium">Category</th>
                <th className="px-4 py-3 text-left font-medium">Price</th>
                <th className="px-4 py-3 text-left font-medium">Stock</th>
                <th className="px-4 py-3 text-left font-medium">Visible</th>
                <th className="px-4 py-3 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr
                  key={product.id}
                  style={{ borderBottom: '1px solid #f0f0f0' }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-4 py-3">{product.name}</td>
                  <td className="px-4 py-3 text-gray-600">{product.category}</td>
                  <td className="px-4 py-3">KES {product.price}</td>
                  <td className="px-4 py-3">{product.stock_quantity}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleVisibility(product.id, product.is_visible)}
                      className="text-xs px-2 py-1 rounded-sm transition-colors"
                      style={{
                        backgroundColor: product.is_visible ? '#efe' : '#fee',
                        color: product.is_visible ? '#3c3' : '#c33',
                      }}
                    >
                      {product.is_visible ? 'ON' : 'OFF'}
                    </button>
                  </td>
                  <td className="px-4 py-3 space-x-2">
                    <Link
                      href={`/admin-v2/products/${product.id}`}
                      className="text-xs hover:underline"
                      style={{ color: '#1c1c1c' }}
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => deleteProduct(product.id)}
                      className="text-xs hover:underline"
                      style={{ color: '#c33' }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
