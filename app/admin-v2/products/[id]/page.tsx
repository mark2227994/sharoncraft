'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Product } from '@/lib/types';

export default function ProductFormPage() {
  const router = useRouter();
  const params = useParams();
  const productId = typeof params?.id === 'string' ? params.id : '';
  const isEditing = productId && productId !== 'new';

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock_quantity: '10',
    is_visible: true,
    is_featured: false,
    is_new: true,
    images: [] as string[],
  });

  useEffect(() => {
    fetchCategories();
    if (isEditing) {
      fetchProduct();
    }
  }, []);

  async function fetchCategories() {
    const { data } = await supabase.from('categories').select('name').order('display_order');
    if (data) {
      setCategories(data.map((c: any) => c.name));
    }
  }

  async function fetchProduct() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (error) {
      console.error('Error fetching product:', error);
      router.push('/admin-v2/products');
      return;
    }

    setFormData({
      name: data.name || '',
      description: data.description || '',
      price: data.price?.toString() || '',
      category: data.category || '',
      stock_quantity: data.stock_quantity?.toString() || '10',
      is_visible: data.is_visible || true,
      is_featured: data.is_featured || false,
      is_new: data.is_new || true,
      images: data.images || [],
    });
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const productData = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      category: formData.category,
      stock_quantity: parseInt(formData.stock_quantity),
      is_visible: formData.is_visible,
      is_featured: formData.is_featured,
      is_new: formData.is_new,
      images: formData.images,
    };

    const { error } = isEditing
      ? await supabase.from('products').update(productData).eq('id', productId)
      : await supabase.from('products').insert([productData]);

    setSaving(false);

    if (error) {
      console.error('Error saving product:', error);
      return;
    }

    router.push('/admin-v2/products');
  }

  if (loading) return <div className="text-xs text-gray-500">Loading...</div>;

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-lg font-medium">{isEditing ? 'Edit Product' : 'Add Product'}</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="text-xs uppercase tracking-wider" style={{ letterSpacing: '2px' }}>
            Product Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full text-xs px-3 py-2 border mt-1"
            style={{ borderColor: '#e0e0e0' }}
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-xs uppercase tracking-wider" style={{ letterSpacing: '2px' }}>
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full text-xs px-3 py-2 border mt-1"
            style={{ borderColor: '#e0e0e0' }}
            rows={4}
          />
        </div>

        {/* Price & Category */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs uppercase tracking-wider" style={{ letterSpacing: '2px' }}>
              Price (KES)
            </label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full text-xs px-3 py-2 border mt-1"
              style={{ borderColor: '#e0e0e0' }}
              required
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider" style={{ letterSpacing: '2px' }}>
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full text-xs px-3 py-2 border mt-1"
              style={{ borderColor: '#e0e0e0' }}
              required
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Stock Quantity */}
        <div>
          <label className="text-xs uppercase tracking-wider" style={{ letterSpacing: '2px' }}>
            Stock Quantity
          </label>
          <input
            type="number"
            value={formData.stock_quantity}
            onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
            className="w-full text-xs px-3 py-2 border mt-1"
            style={{ borderColor: '#e0e0e0' }}
          />
        </div>

        {/* Checkboxes */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_visible}
              onChange={(e) => setFormData({ ...formData, is_visible: e.target.checked })}
            />
            <span>Visible on Store</span>
          </label>
          <label className="flex items-center gap-2 text-xs cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_featured}
              onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
            />
            <span>Featured</span>
          </label>
          <label className="flex items-center gap-2 text-xs cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_new}
              onChange={(e) => setFormData({ ...formData, is_new: e.target.checked })}
            />
            <span>New Arrival</span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="text-xs tracking-wider uppercase px-4 py-2 rounded-sm transition-opacity disabled:opacity-50"
            style={{
              backgroundColor: '#1c1c1c',
              color: '#fff',
              letterSpacing: '2px',
            }}
          >
            {saving ? 'Saving...' : isEditing ? 'Update' : 'Create'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin-v2/products')}
            className="text-xs tracking-wider uppercase px-4 py-2 border rounded-sm transition-colors hover:bg-gray-50"
            style={{ borderColor: '#e0e0e0', letterSpacing: '2px' }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
