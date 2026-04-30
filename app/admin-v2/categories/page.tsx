'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

interface Category {
  id: string;
  name: string;
  subcategories: string[];
  image_url?: string;
  is_visible: boolean;
  display_order: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', subcategories: '', image_url: '' });

  useEffect(() => {
    fetchCategories();
  }, []);

  async function uploadImage(file: File) {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'category-images');

      const response = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || 'Upload failed');
        return;
      }

      const data = await response.json();
      setFormData((prev) => ({ ...prev, image_url: data.url }));
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  }

  async function fetchCategories() {
    setLoading(true);
    try {
      console.log('Fetching categories...');
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order');

      console.log('Categories response:', { data, error });

      if (error) {
        console.error('Error fetching categories:', error);
        return;
      }

      console.log('Setting categories:', data);
      setCategories(data || []);
    } catch (err) {
      console.error('Exception fetching categories:', err);
    } finally {
      setLoading(false);
    }
  }

  async function saveCategory(id?: string) {
    const subcategoriesArray = formData.subcategories
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s);

    const categoryData = {
      name: formData.name,
      subcategories: subcategoriesArray,
      image_url: formData.image_url || null,
    };

    const { error } = id
      ? await supabase.from('categories').update(categoryData).eq('id', id)
      : await supabase.from('categories').insert([categoryData]);

    if (!error) {
      setEditingId(null);
      setFormData({ name: '', subcategories: '', image_url: '' });
      fetchCategories();
    }
  }

  async function deleteCategory(id: string) {
    if (!confirm('Delete this category?')) return;

    const { error } = await supabase.from('categories').delete().eq('id', id);

    if (!error) {
      setCategories(categories.filter((c) => c.id !== id));
    }
  }

  async function toggleVisibility(id: string, isVisible: boolean) {
    const { error } = await supabase
      .from('categories')
      .update({ is_visible: !isVisible })
      .eq('id', id);

    if (!error) {
      setCategories(
        categories.map((c) => (c.id === id ? { ...c, is_visible: !isVisible } : c))
      );
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-medium">Categories</h2>
        <p className="text-xs text-gray-500 mt-1">{categories.length} categories</p>
      </div>

      {/* Add New Category Form */}
      {editingId === 'new' && (
        <div
          className="border p-4 rounded-sm"
          style={{ borderColor: '#f0f0f0', backgroundColor: '#fafafa' }}
        >
          <input
            type="text"
            placeholder="Category name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="text-xs px-3 py-2 border w-full mb-3"
            style={{ borderColor: '#e0e0e0' }}
          />
          <input
            type="text"
            placeholder="Subcategories (comma-separated)"
            value={formData.subcategories}
            onChange={(e) => setFormData({ ...formData, subcategories: e.target.value })}
            className="text-xs px-3 py-2 border w-full mb-3"
            style={{ borderColor: '#e0e0e0' }}
          />
          <div className="space-y-2 mb-3">
            <label className="text-xs font-medium block">Category Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.currentTarget.files?.[0];
                if (file) {
                  uploadImage(file);
                }
              }}
              disabled={uploading}
              className="text-xs px-3 py-2 border w-full"
              style={{ borderColor: '#e0e0e0' }}
            />
            {uploading && <p className="text-xs text-gray-500">Uploading...</p>}
            {formData.image_url && (
              <p className="text-xs text-gray-600 truncate">✓ Image ready</p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => saveCategory()}
              className="text-xs px-3 py-2 rounded-sm"
              style={{
                backgroundColor: '#1c1c1c',
                color: '#fff',
              }}
            >
              Save
            </button>
            <button
              onClick={() => {
                setEditingId(null);
                setFormData({ name: '', subcategories: '', image_url: '' });
              }}
              className="text-xs px-3 py-2 border rounded-sm"
              style={{ borderColor: '#e0e0e0' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Add Button */}
      {editingId !== 'new' && (
        <button
          onClick={() => setEditingId('new')}
          className="text-xs px-3 py-2 rounded-sm"
          style={{
            backgroundColor: '#1c1c1c',
            color: '#fff',
          }}
        >
          Add Category
        </button>
      )}

      {/* Categories List */}
      {loading ? (
        <div className="text-xs text-gray-500">Loading...</div>
      ) : categories.length === 0 ? (
        <div className="text-xs text-gray-500">No categories found</div>
      ) : (
        <div className="space-y-2">
          {categories.map((category) => (
            <div
              key={category.id}
              className="border p-4 rounded-sm flex gap-4 items-start justify-between"
              style={{ borderColor: '#f0f0f0' }}
            >
              {category.image_url && (
                <div className="w-16 h-16 bg-gray-200 rounded-sm flex-shrink-0 flex items-center justify-center">
                  <img
                    src={category.image_url}
                    alt={category.name}
                    className="w-full h-full object-cover rounded-sm"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium">{category.name}</h3>
                {category.subcategories.length > 0 && (
                  <p className="text-xs text-gray-600 mt-1">
                    {category.subcategories.join(', ')}
                  </p>
                )}
              </div>
              <div className="flex gap-3 flex-shrink-0">
                <button
                  onClick={() => toggleVisibility(category.id, category.is_visible)}
                  className="text-xs px-2 py-1 rounded-sm transition-colors"
                  style={{
                    backgroundColor: category.is_visible ? '#efe' : '#fee',
                    color: category.is_visible ? '#3c3' : '#c33',
                  }}
                >
                  {category.is_visible ? 'ON' : 'OFF'}
                </button>
                <button
                  onClick={() => deleteCategory(category.id)}
                  className="text-xs hover:underline"
                  style={{ color: '#c33' }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
