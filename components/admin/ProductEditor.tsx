'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { buildStorefrontSlug } from '@/lib/catalog-sync';
import { notifyIndexNowForProduct } from '@/lib/indexnow';
import { supabase } from '@/lib/supabase/client';

export type ProductFormState = {
  name: string;
  slug: string;
  description: string;
  short_description: string;
  full_description: string;
  heritage_story: string;
  price: string;
  sale_price: string;
  category: string;
  subcategory: string;
  stock_quantity: string;
  artisan: string;
  care_instructions: string;
  sku: string;
  fulfillment_type: string;
  featured_order: string;
  badge: string;
  materials: string;
  details: string;
  story_text: string;
  story_cultural_note: string;
  images: string[];
  sizes: string;
  colors: string;
  is_visible: boolean;
  is_featured: boolean;
  is_new: boolean;
};

const EMPTY_FORM: ProductFormState = {
  name: '',
  slug: '',
  description: '',
  short_description: '',
  full_description: '',
  heritage_story: '',
  price: '',
  sale_price: '',
  category: '',
  subcategory: '',
  stock_quantity: '10',
  artisan: 'By Sharon',
  care_instructions: '',
  sku: '',
  fulfillment_type: 'ready_to_ship',
  featured_order: '999',
  badge: '',
  materials: '',
  details: '',
  story_text: '',
  story_cultural_note: '',
  images: [],
  sizes: '',
  colors: '',
  is_visible: true,
  is_featured: false,
  is_new: true,
};

function splitLines(value: string) {
  return value
    .split(/[\n,|]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function rowToForm(data: Record<string, unknown>): ProductFormState {
  const images = Array.isArray(data.images)
    ? (data.images as string[]).filter(Boolean)
    : [];

  return {
    name: String(data.name || ''),
    slug: String(data.slug || buildStorefrontSlug(data as { id?: string; name?: string })),
    description: String(data.description || ''),
    short_description: String(data.short_description || ''),
    full_description: String(data.full_description || ''),
    heritage_story: String(data.heritage_story || ''),
    price: data.price != null ? String(data.price) : '',
    sale_price: data.sale_price != null ? String(data.sale_price) : '',
    category: String(data.category || ''),
    subcategory: String(data.subcategory || ''),
    stock_quantity: data.stock_quantity != null ? String(data.stock_quantity) : '10',
    artisan: String(data.artisan || 'By Sharon'),
    care_instructions: String(data.care_instructions || ''),
    sku: String(data.sku || ''),
    fulfillment_type: String(data.fulfillment_type || 'ready_to_ship'),
    featured_order: data.featured_order != null ? String(data.featured_order) : '999',
    badge: String(data.badge || ''),
    materials: Array.isArray(data.materials) ? (data.materials as string[]).join(', ') : '',
    details: Array.isArray(data.details) ? (data.details as string[]).join('\n') : '',
    story_text: String(data.story_text || ''),
    story_cultural_note: String(data.story_cultural_note || ''),
    images,
    sizes: Array.isArray(data.sizes) ? (data.sizes as string[]).join(', ') : '',
    colors: Array.isArray(data.colors) ? (data.colors as string[]).join(', ') : '',
    is_visible: data.is_visible !== false,
    is_featured: Boolean(data.is_featured),
    is_new: data.is_new !== false,
  };
}

function formToRow(form: ProductFormState, isEditing: boolean) {
  const slug = form.slug.trim() || buildStorefrontSlug({ name: form.name });
  const row: Record<string, unknown> = {
    name: form.name.trim(),
    slug,
    description: form.description.trim(),
    short_description: form.short_description.trim() || form.description.trim(),
    full_description: form.full_description.trim() || form.description.trim(),
    heritage_story: form.heritage_story.trim(),
    price: parseFloat(form.price) || 0,
    sale_price: form.sale_price.trim() ? parseFloat(form.sale_price) : null,
    category: form.category.trim(),
    subcategory: form.subcategory.trim() || null,
    stock_quantity: parseInt(form.stock_quantity, 10) || 0,
    artisan: form.artisan.trim() || 'By Sharon',
    care_instructions: form.care_instructions.trim() || null,
    sku: form.sku.trim() || null,
    fulfillment_type: form.fulfillment_type || 'ready_to_ship',
    featured_order: parseInt(form.featured_order, 10) || 999,
    badge: form.badge.trim() || null,
    materials: splitLines(form.materials),
    details: splitLines(form.details),
    story_text: form.story_text.trim() || form.description.trim(),
    story_cultural_note: form.story_cultural_note.trim() || null,
    images: form.images.filter(Boolean),
    sizes: splitLines(form.sizes),
    colors: splitLines(form.colors),
    is_visible: form.is_visible,
    is_featured: form.is_featured,
    is_new: form.is_new,
    updated_at: new Date().toISOString(),
  };

  if (!isEditing) {
    row.created_at = new Date().toISOString();
  }

  return row;
}

async function syncCatalog() {
  await fetch('/api/admin/sync-catalog', { method: 'POST' });
}

type ProductEditorProps = {
  productId?: string;
  cancelHref?: string;
};

export default function ProductEditor({
  productId = '',
  cancelHref = '/admin/products',
}: ProductEditorProps) {
  const router = useRouter();
  const isEditing = Boolean(productId);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [form, setForm] = useState<ProductFormState>(EMPTY_FORM);
  const [imageDraft, setImageDraft] = useState('');

  useEffect(() => {
    void fetchCategories();
    if (isEditing) {
      void fetchProduct();
    }
  }, [isEditing, productId]);

  async function fetchCategories() {
    const { data } = await supabase.from('categories').select('name').order('display_order');
    if (data) {
      setCategories(data.map((entry: { name: string }) => entry.name));
    }
  }

  async function fetchProduct() {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (error || !data) {
      setStatus('Could not load product.');
      setLoading(false);
      return;
    }

    setForm(rowToForm(data as Record<string, unknown>));
    setLoading(false);
  }

  function updateField<K extends keyof ProductFormState>(key: K, value: ProductFormState[K]) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'name' && !prev.slug.trim()) {
        next.slug = buildStorefrontSlug({ name: String(value) });
      }
      return next;
    });
  }

  function addImage() {
    const url = imageDraft.trim();
    if (!url) return;
    updateField('images', [...form.images, url]);
    setImageDraft('');
  }

  function removeImage(index: number) {
    updateField(
      'images',
      form.images.filter((_, itemIndex) => itemIndex !== index),
    );
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setStatus('');

    const row = formToRow(form, isEditing);
    const query = isEditing
      ? supabase.from('products').update(row).eq('id', productId).select('*').single()
      : supabase.from('products').insert([row]).select('*').single();

    const { data: saved, error } = await query;

    if (error) {
      setStatus(error.message);
      setSaving(false);
      return;
    }

    try {
      await syncCatalog();
    } catch {
      setStatus('Saved to database, but catalog sync failed. Try Sync Catalog from products list.');
      setSaving(false);
      return;
    }

    if (saved) {
      void notifyIndexNowForProduct(saved);
    }

    setSaving(false);
    router.push(cancelHref);
    router.refresh();
  }

  const previewSlug = useMemo(
    () => form.slug.trim() || buildStorefrontSlug({ name: form.name }),
    [form.slug, form.name],
  );

  if (loading) {
    return <p style={{ fontSize: 13, color: '#888' }}>Loading product…</p>;
  }

  const fieldStyle = {
    width: '100%',
    fontSize: 12,
    padding: '8px 10px',
    border: '1px solid #e0e0e0',
    marginTop: 4,
  } as const;

  const labelStyle = {
    fontSize: 10,
    letterSpacing: '2px',
    textTransform: 'uppercase' as const,
    color: '#666',
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 720, display: 'grid', gap: 16 }}>
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 400, margin: 0 }}>
          {isEditing ? 'Edit Product' : 'New Product'}
        </h2>
        <p style={{ fontSize: 12, color: '#888', marginTop: 6 }}>
          Storefront URL: /product/{previewSlug}
        </p>
      </div>

      <div style={{ display: 'grid', gap: 12 }}>
        <label style={labelStyle}>
          Name
          <input
            style={fieldStyle}
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
            required
          />
        </label>

        <label style={labelStyle}>
          Slug
          <input
            style={fieldStyle}
            value={form.slug}
            onChange={(e) => updateField('slug', e.target.value)}
            placeholder="auto-generated from name"
          />
        </label>

        <label style={labelStyle}>
          Short description (cards / teaser)
          <textarea
            style={{ ...fieldStyle, minHeight: 72 }}
            value={form.short_description}
            onChange={(e) => updateField('short_description', e.target.value)}
          />
        </label>

        <label style={labelStyle}>
          Description (product page lead)
          <textarea
            style={{ ...fieldStyle, minHeight: 96 }}
            value={form.description}
            onChange={(e) => updateField('description', e.target.value)}
            required
          />
        </label>

        <label style={labelStyle}>
          Full description (long copy)
          <textarea
            style={{ ...fieldStyle, minHeight: 120 }}
            value={form.full_description}
            onChange={(e) => updateField('full_description', e.target.value)}
          />
        </label>

        <label style={labelStyle}>
          Heritage story
          <textarea
            style={{ ...fieldStyle, minHeight: 96 }}
            value={form.heritage_story}
            onChange={(e) => updateField('heritage_story', e.target.value)}
          />
        </label>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <label style={labelStyle}>
            Price (KES)
            <input
              type="number"
              min="0"
              style={fieldStyle}
              value={form.price}
              onChange={(e) => updateField('price', e.target.value)}
              required
            />
          </label>
          <label style={labelStyle}>
            Sale price (KES)
            <input
              type="number"
              min="0"
              style={fieldStyle}
              value={form.sale_price}
              onChange={(e) => updateField('sale_price', e.target.value)}
            />
          </label>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <label style={labelStyle}>
            Category
            <select
              style={fieldStyle}
              value={form.category}
              onChange={(e) => updateField('category', e.target.value)}
              required
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </label>
          <label style={labelStyle}>
            Subcategory
            <input
              style={fieldStyle}
              value={form.subcategory}
              onChange={(e) => updateField('subcategory', e.target.value)}
            />
          </label>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <label style={labelStyle}>
            Stock
            <input
              type="number"
              min="0"
              style={fieldStyle}
              value={form.stock_quantity}
              onChange={(e) => updateField('stock_quantity', e.target.value)}
            />
          </label>
          <label style={labelStyle}>
            Featured order (1 = first)
            <input
              type="number"
              min="1"
              style={fieldStyle}
              value={form.featured_order}
              onChange={(e) => updateField('featured_order', e.target.value)}
            />
          </label>
          <label style={labelStyle}>
            Badge
            <input
              style={fieldStyle}
              value={form.badge}
              onChange={(e) => updateField('badge', e.target.value)}
              placeholder="New, Best Seller"
            />
          </label>
        </div>

        <label style={labelStyle}>
          Artisan
          <input
            style={fieldStyle}
            value={form.artisan}
            onChange={(e) => updateField('artisan', e.target.value)}
          />
        </label>

        <label style={labelStyle}>
          Materials (comma-separated)
          <input
            style={fieldStyle}
            value={form.materials}
            onChange={(e) => updateField('materials', e.target.value)}
          />
        </label>

        <label style={labelStyle}>
          Detail bullets (one per line)
          <textarea
            style={{ ...fieldStyle, minHeight: 88 }}
            value={form.details}
            onChange={(e) => updateField('details', e.target.value)}
            placeholder="Handmade in Kenya&#10;Ships in 2-3 days"
          />
        </label>

        <label style={labelStyle}>
          Care instructions
          <textarea
            style={{ ...fieldStyle, minHeight: 72 }}
            value={form.care_instructions}
            onChange={(e) => updateField('care_instructions', e.target.value)}
          />
        </label>

        <label style={labelStyle}>
          Artisan story
          <textarea
            style={{ ...fieldStyle, minHeight: 72 }}
            value={form.story_text}
            onChange={(e) => updateField('story_text', e.target.value)}
          />
        </label>

        <label style={labelStyle}>
          Cultural note
          <textarea
            style={{ ...fieldStyle, minHeight: 64 }}
            value={form.story_cultural_note}
            onChange={(e) => updateField('story_cultural_note', e.target.value)}
          />
        </label>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <label style={labelStyle}>
            SKU
            <input
              style={fieldStyle}
              value={form.sku}
              onChange={(e) => updateField('sku', e.target.value)}
            />
          </label>
          <label style={labelStyle}>
            Fulfillment
            <select
              style={fieldStyle}
              value={form.fulfillment_type}
              onChange={(e) => updateField('fulfillment_type', e.target.value)}
            >
              <option value="ready_to_ship">Ready to ship</option>
              <option value="made_to_order">Made to order</option>
              <option value="custom_order">Custom order</option>
            </select>
          </label>
        </div>

        <label style={labelStyle}>
          Sizes (comma-separated)
          <input
            style={fieldStyle}
            value={form.sizes}
            onChange={(e) => updateField('sizes', e.target.value)}
          />
        </label>

        <label style={labelStyle}>
          Colors (comma-separated)
          <input
            style={fieldStyle}
            value={form.colors}
            onChange={(e) => updateField('colors', e.target.value)}
          />
        </label>

        <div>
          <span style={labelStyle}>Images (URLs)</span>
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <input
              style={{ ...fieldStyle, flex: 1, marginTop: 0 }}
              value={imageDraft}
              onChange={(e) => setImageDraft(e.target.value)}
              placeholder="/media/... or https://..."
            />
            <button type="button" onClick={addImage} style={{ padding: '8px 12px', fontSize: 12 }}>
              Add
            </button>
          </div>
          {form.images.length > 0 ? (
            <ul style={{ margin: '8px 0 0', padding: 0, listStyle: 'none', fontSize: 11 }}>
              {form.images.map((url, index) => (
                <li
                  key={`${url}-${index}`}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 8,
                    padding: '4px 0',
                    borderBottom: '1px solid #eee',
                  }}
                >
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{url}</span>
                  <button type="button" onClick={() => removeImage(index)}>
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, fontSize: 12 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input
              type="checkbox"
              checked={form.is_visible}
              onChange={(e) => updateField('is_visible', e.target.checked)}
            />
            Visible on store
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input
              type="checkbox"
              checked={form.is_featured}
              onChange={(e) => updateField('is_featured', e.target.checked)}
            />
            Featured
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input
              type="checkbox"
              checked={form.is_new}
              onChange={(e) => updateField('is_new', e.target.checked)}
            />
            New arrival
          </label>
        </div>
      </div>

      {status ? <p style={{ fontSize: 12, color: '#b45309' }}>{status}</p> : null}

      <div style={{ display: 'flex', gap: 10 }}>
        <button
          type="submit"
          disabled={saving}
          style={{
            background: '#1c1c1c',
            color: '#fff',
            fontSize: 11,
            letterSpacing: '2px',
            textTransform: 'uppercase',
            padding: '10px 16px',
            border: 'none',
            opacity: saving ? 0.6 : 1,
          }}
        >
          {saving ? 'Saving…' : isEditing ? 'Save product' : 'Create product'}
        </button>
        <button
          type="button"
          onClick={() => router.push(cancelHref)}
          style={{
            fontSize: 11,
            letterSpacing: '2px',
            textTransform: 'uppercase',
            padding: '10px 16px',
            border: '1px solid #e0e0e0',
            background: '#fff',
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
