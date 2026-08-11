'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notifyIndexNowForProduct } from '@/lib/indexnow';
import { supabase } from '@/lib/supabase/client';

interface Product {
  id: string;
  name: string;
  price: number;
  images?: string[] | null;
  category?: string | null;
  subcategory?: string | null;
  artisan?: string | null;
  product_type?: string | null;
  stock_quantity?: number | null;
  is_visible?: boolean | null;
  is_featured?: boolean | null;
  is_new?: boolean | null;
  created_at?: string | null;
  slug?: string | null;
}

function safeArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item) => typeof item === 'string') : [];
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    void fetchProducts();
  }, [filter, sortBy]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let query = supabase.from('products').select('*');

      if (filter === 'visible') {
        query = query.eq('is_visible', true);
      } else if (filter === 'hidden') {
        query = query.eq('is_visible', false);
      } else if (filter === 'featured') {
        query = query.eq('is_featured', true);
      } else if (filter === 'out_of_stock') {
        query = query.eq('product_type', 'ready_to_ship').eq('stock_quantity', 0);
      }

      if (sortBy === 'newest') {
        query = query.order('created_at', { ascending: false });
      } else if (sortBy === 'price_low') {
        query = query.order('price', { ascending: true });
      } else if (sortBy === 'price_high') {
        query = query.order('price', { ascending: false });
      } else if (sortBy === 'name') {
        query = query.order('name', { ascending: true });
      }

      const { data, error } = await query;
      if (error) throw error;
      setProducts((data ?? []) as Product[]);
    } catch (err) {
      console.error('Error fetching products:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const syncStorefrontCatalog = async () => {
    try {
      await fetch('/api/admin/sync-catalog', { method: 'POST' });
    } catch (err) {
      console.error('Catalog sync failed:', err);
    }
  };

  const toggleVisibility = async (product: Product) => {
    const nextVisible = !Boolean(product.is_visible);
    await supabase.from('products').update({ is_visible: nextVisible }).eq('id', product.id);
    const updatedProduct = { ...product, is_visible: nextVisible };
    setProducts((prev) =>
      prev.map((product) =>
        product.id === updatedProduct.id ? updatedProduct : product,
      ),
    );
    void notifyIndexNowForProduct(updatedProduct);
    void syncStorefrontCatalog();
  };

  const toggleFeatured = async (product: Product) => {
    const nextFeatured = !Boolean(product.is_featured);
    await supabase.from('products').update({ is_featured: nextFeatured }).eq('id', product.id);
    const updatedProduct = { ...product, is_featured: nextFeatured };
    setProducts((prev) =>
      prev.map((product) =>
        product.id === updatedProduct.id ? updatedProduct : product,
      ),
    );
    void notifyIndexNowForProduct(updatedProduct);
    void syncStorefrontCatalog();
  };

  const deleteProduct = async (product: Product) => {
    if (!confirm('Delete this product? This cannot be undone.')) return;

    setDeleting(product.id);
    await supabase.from('products').delete().eq('id', product.id);
    setProducts((prev) => prev.filter((entry) => entry.id !== product.id));
    void notifyIndexNowForProduct(product);
    void syncStorefrontCatalog();
    setDeleting(null);
  };

  const filtered = useMemo(
    () =>
      products.filter((product) => {
        const query = search.toLowerCase();
        return (
          product.name?.toLowerCase().includes(query) ||
          product.category?.toLowerCase().includes(query) ||
          product.artisan?.toLowerCase().includes(query)
        );
      }),
    [products, search],
  );

  const stats = useMemo(
    () => ({
      total: products.length,
      visible: products.filter((product) => product.is_visible).length,
      featured: products.filter((product) => product.is_featured).length,
      outOfStock: products.filter(
        (product) =>
          product.product_type === 'ready_to_ship' &&
          Number(product.stock_quantity || 0) === 0,
      ).length,
    }),
    [products],
  );

  return (
    <div
      style={{
        padding: '32px',
        background: '#fafaf8',
        minHeight: '100vh',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '28px',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '20px',
              fontWeight: 400,
              color: '#1c1c1c',
              marginBottom: '4px',
            }}
          >
            Products
          </h1>
          <p
            style={{
              fontSize: '13px',
              color: '#888',
            }}
          >
            {stats.total} products in your store
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={() => void syncStorefrontCatalog()}
            style={{
              height: '40px',
              padding: '0 16px',
              background: '#fff',
              color: '#1c1c1c',
              fontSize: '11px',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              borderRadius: '2px',
              border: '1px solid #e0e0e0',
              cursor: 'pointer',
            }}
          >
            Sync Storefront
          </button>
          <Link
            href="/admin-v2/products/new"
            style={{
              height: '40px',
              padding: '0 20px',
              background: '#1c1c1c',
              color: '#ffffff',
              fontSize: '11px',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              borderRadius: '2px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              textDecoration: 'none',
            }}
          >
            + New Product
          </Link>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '12px',
          marginBottom: '24px',
        }}
      >
        {[
          { label: 'Total Products', value: stats.total, color: '#1c1c1c' },
          { label: 'Visible', value: stats.visible, color: '#2E7D32' },
          { label: 'Featured', value: stats.featured, color: '#8B5E3C' },
          {
            label: 'Out of Stock',
            value: stats.outOfStock,
            color: stats.outOfStock > 0 ? '#C0392B' : '#bbb',
          },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              background: '#ffffff',
              border: '0.5px solid rgba(0,0,0,0.08)',
              padding: '20px',
              borderRadius: '2px',
            }}
          >
            <span
              style={{
                fontSize: '28px',
                fontWeight: 300,
                color: stat.color,
                display: 'block',
                marginBottom: '4px',
                letterSpacing: '-0.5px',
              }}
            >
              {stat.value}
            </span>
            <span
              style={{
                fontSize: '11px',
                color: '#888',
                letterSpacing: '0.5px',
              }}
            >
              {stat.label}
            </span>
          </div>
        ))}
      </div>

      <div
        style={{
          background: '#ffffff',
          border: '0.5px solid rgba(0,0,0,0.08)',
          borderRadius: '2px',
          padding: '14px 16px',
          marginBottom: '2px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          style={{
            flex: 1,
            minWidth: '200px',
            border: '0.5px solid rgba(0,0,0,0.15)',
            padding: '8px 12px',
            fontSize: '13px',
            color: '#1c1c1c',
            background: '#fafaf8',
            outline: 'none',
            borderRadius: '2px',
          }}
        />

        <select
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          style={{
            border: '0.5px solid rgba(0,0,0,0.15)',
            padding: '8px 12px',
            fontSize: '12px',
            color: '#666',
            background: '#fafaf8',
            outline: 'none',
            borderRadius: '2px',
            cursor: 'pointer',
          }}
        >
          <option value="all">All Products</option>
          <option value="visible">Visible Only</option>
          <option value="hidden">Hidden Only</option>
          <option value="featured">Featured Only</option>
          <option value="out_of_stock">Out of Stock</option>
        </select>

        <select
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value)}
          style={{
            border: '0.5px solid rgba(0,0,0,0.15)',
            padding: '8px 12px',
            fontSize: '12px',
            color: '#666',
            background: '#fafaf8',
            outline: 'none',
            borderRadius: '2px',
            cursor: 'pointer',
          }}
        >
          <option value="newest">Newest First</option>
          <option value="name">Name A–Z</option>
          <option value="price_low">Price: Low to High</option>
          <option value="price_high">Price: High to Low</option>
        </select>

        <span
          style={{
            fontSize: '11px',
            color: '#bbb',
            whiteSpace: 'nowrap',
          }}
        >
          {filtered.length} results
        </span>
      </div>

      <div
        style={{
          background: '#ffffff',
          border: '0.5px solid rgba(0,0,0,0.08)',
          borderRadius: '2px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '60px 1fr 120px 100px 100px 80px 80px 120px',
            padding: '10px 16px',
            borderBottom: '0.5px solid rgba(0,0,0,0.08)',
            background: '#fafaf8',
          }}
        >
          {['Image', 'Product', 'Category', 'Price', 'Type', 'Stock', 'Status', 'Actions'].map(
            (column) => (
              <span
                key={column}
                style={{
                  fontSize: '9px',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  color: '#bbb',
                }}
              >
                {column}
              </span>
            ),
          )}
        </div>

        {loading ? (
          Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              style={{
                display: 'grid',
                gridTemplateColumns: '60px 1fr 120px 100px 100px 80px 80px 120px',
                padding: '14px 16px',
                borderBottom: '0.5px solid rgba(0,0,0,0.06)',
                gap: '16px',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  background: '#F5F0EB',
                  animation: 'shimmer 1.5s infinite',
                }}
              />
              {Array.from({ length: 7 }).map((__, itemIndex) => (
                <div
                  key={itemIndex}
                  style={{
                    height: '12px',
                    background: '#F5F0EB',
                    width: itemIndex === 0 ? '70%' : '50%',
                    animation: `shimmer 1.5s ${itemIndex * 0.05}s infinite`,
                  }}
                />
              ))}
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div
            style={{
              padding: '60px',
              textAlign: 'center',
            }}
          >
            <p
              style={{
                fontSize: '14px',
                fontWeight: 300,
                color: '#1c1c1c',
                marginBottom: '6px',
              }}
            >
              No products found
            </p>
            <p
              style={{
                fontSize: '12px',
                color: '#888',
                marginBottom: '20px',
              }}
            >
              {search ? `No results for "${search}"` : 'Add your first product'}
            </p>
            <Link
              href="/admin-v2/products/new"
              style={{
                padding: '10px 24px',
                background: '#1c1c1c',
                color: '#fff',
                fontSize: '10px',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                borderRadius: '2px',
                textDecoration: 'none',
              }}
            >
              + Add Product
            </Link>
          </div>
        ) : (
          filtered.map((product) => {
            const imageUrl = safeArray(product.images)[0];
            const stockQuantity = Number(product.stock_quantity || 0);
            const productType = product.product_type || 'made_to_order';

            return (
              <div
                key={product.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '60px 1fr 120px 100px 100px 80px 80px 120px',
                  padding: '12px 16px',
                  borderBottom: '0.5px solid rgba(0,0,0,0.06)',
                  alignItems: 'center',
                  gap: '16px',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.background = '#fafaf8';
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.background = '#ffffff';
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    background: '#F5F0EB',
                    position: 'relative',
                    overflow: 'hidden',
                    flexShrink: 0,
                  }}
                >
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={product.name}
                      fill
                      sizes="48px"
                      style={{
                        objectFit: 'contain',
                        padding: '4px',
                      }}
                    />
                  ) : null}
                </div>

                <div>
                  <span
                    style={{
                      fontSize: '13px',
                      color: '#1c1c1c',
                      display: 'block',
                      marginBottom: '2px',
                      fontWeight: 400,
                    }}
                  >
                    {product.name}
                  </span>
                  {product.artisan ? (
                    <span
                      style={{
                        fontSize: '10px',
                        color: '#bbb',
                        letterSpacing: '1px',
                      }}
                    >
                      By {product.artisan}
                    </span>
                  ) : null}
                </div>

                <span
                  style={{
                    fontSize: '11px',
                    color: '#888',
                  }}
                >
                  {product.category}
                  {product.subcategory ? ` · ${product.subcategory}` : ''}
                </span>

                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#1c1c1c',
                  }}
                >
                  KES {Number(product.price || 0).toLocaleString('en-KE')}
                </span>

                <span
                  style={{
                    fontSize: '9px',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    color: productType === 'ready_to_ship' ? '#2E7D32' : '#888',
                  }}
                >
                  {productType === 'ready_to_ship' ? 'Ready' : 'MTO'}
                </span>

                <span
                  style={{
                    fontSize: '12px',
                    color:
                      productType !== 'ready_to_ship'
                        ? '#bbb'
                        : stockQuantity === 0
                          ? '#C0392B'
                          : stockQuantity <= 2
                            ? '#E67E22'
                            : '#2E7D32',
                    fontWeight: 500,
                  }}
                >
                  {productType !== 'ready_to_ship' ? '—' : stockQuantity}
                </span>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}
                >
                  <button
                    onClick={() => toggleVisibility(product)}
                    style={{
                      fontSize: '9px',
                      letterSpacing: '1px',
                      textTransform: 'uppercase',
                      padding: '2px 8px',
                      border: 'none',
                      borderRadius: '2px',
                      cursor: 'pointer',
                      background: product.is_visible ? 'rgba(46,125,50,0.1)' : 'rgba(0,0,0,0.05)',
                      color: product.is_visible ? '#2E7D32' : '#888',
                    }}
                  >
                    {product.is_visible ? 'Visible' : 'Hidden'}
                  </button>
                  <button
                    onClick={() => toggleFeatured(product)}
                    style={{
                      fontSize: '9px',
                      letterSpacing: '1px',
                      textTransform: 'uppercase',
                      padding: '2px 8px',
                      border: 'none',
                      borderRadius: '2px',
                      cursor: 'pointer',
                      background: product.is_featured ? 'rgba(139,94,60,0.1)' : 'rgba(0,0,0,0.05)',
                      color: product.is_featured ? '#8B5E3C' : '#888',
                    }}
                  >
                    {product.is_featured ? 'Featured' : 'Normal'}
                  </button>
                </div>

                <div
                  style={{
                    display: 'flex',
                    gap: '6px',
                  }}
                >
                  <Link
                    href={`/admin-v2/products/${product.id}/edit`}
                    style={{
                      fontSize: '10px',
                      letterSpacing: '1px',
                      textTransform: 'uppercase',
                      padding: '6px 12px',
                      background: '#1c1c1c',
                      color: '#fff',
                      textDecoration: 'none',
                      borderRadius: '2px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Edit
                  </Link>

                  <button
                    onClick={() => deleteProduct(product)}
                    disabled={deleting === product.id}
                    style={{
                      fontSize: '10px',
                      letterSpacing: '1px',
                      textTransform: 'uppercase',
                      padding: '6px 10px',
                      background: 'rgba(192,57,45,0.08)',
                      color: '#C0392B',
                      border: 'none',
                      borderRadius: '2px',
                      cursor: 'pointer',
                      opacity: deleting === product.id ? 0.5 : 1,
                    }}
                  >
                    {deleting === product.id ? '...' : 'Del'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <style jsx global>{`
        @keyframes shimmer {
          0%,
          100% {
            opacity: 0.5;
          }
          50% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
