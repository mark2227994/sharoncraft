'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface Artisan {
  id: string;
  name: string;
  image_url?: string;
  bio?: string;
}

type CategoryImageKey =
  | 'collectionJewellery'
  | 'collectionAccessories'
  | 'collectionBridal'
  | 'collectionHome';

interface HomepageCategoryImages {
  collectionJewellery: string;
  collectionAccessories: string;
  collectionBridal: string;
  collectionHome: string;
}

const CATEGORY_IMAGE_FIELDS: Array<{ key: CategoryImageKey; label: string }> = [
  { key: 'collectionJewellery', label: 'Jewellery' },
  { key: 'collectionAccessories', label: 'Accessories' },
  { key: 'collectionBridal', label: 'African Wear' },
  { key: 'collectionHome', label: 'Home & Living' },
];

const DEFAULT_CATEGORY_IMAGES: HomepageCategoryImages = {
  collectionJewellery: '',
  collectionAccessories: '',
  collectionBridal: '',
  collectionHome: '',
};

export default function SettingsPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [artisans, setArtisans] = useState<Artisan[]>([]);
  const [loading, setLoading] = useState(true);
  const [artisanUploading, setArtisanUploading] = useState(false);
  const [editingArtisanId, setEditingArtisanId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    role: 'admin',
  });
  const [artisanFormData, setArtisanFormData] = useState({
    name: '',
    image_url: '',
    bio: '',
  });
  const [categoryImages, setCategoryImages] = useState<HomepageCategoryImages>(DEFAULT_CATEGORY_IMAGES);
  const [categoryImagesSaving, setCategoryImagesSaving] = useState(false);
  const [categoryImagesUploading, setCategoryImagesUploading] = useState<CategoryImageKey | null>(null);
  const [categoryImagesMessage, setCategoryImagesMessage] = useState('');
  const [storeInfo, setStoreInfo] = useState({
    store_name: 'SharonCraft',
    phone: '',
    email: '',
    address: '',
  });

  useEffect(() => {
    fetchAdmins();
    fetchStoreInfo();
    fetchArtisans();
    fetchCategoryImages();
  }, []);

  async function fetchAdmins() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .order('created_at');

      if (error) {
        console.error('Error fetching admins:', error);
        return;
      }

      setAdmins(data || []);
    } finally {
      setLoading(false);
    }
  }

  async function fetchStoreInfo() {
    const { data } = await supabase
      .from('homepage_content')
      .select('*')
      .eq('section', 'store_info')
      .single();

    if (data) {
      setStoreInfo(data.content || storeInfo);
    }
  }

  async function fetchArtisans() {
    try {
      const { data, error } = await supabase
        .from('artisans')
        .select('*')
        .order('created_at');

      if (error) {
        console.error('Error fetching artisans:', error);
        return;
      }

      setArtisans(data || []);
    } catch (err) {
      console.error('Exception fetching artisans:', err);
    }
  }

  async function fetchCategoryImages() {
    try {
      const response = await fetch('/api/admin/site-images', {
        credentials: 'same-origin',
      });

      if (!response.ok) {
        return;
      }

      const data = await response.json();
      setCategoryImages({
        collectionJewellery: data.collectionJewellery || '',
        collectionAccessories: data.collectionAccessories || '',
        collectionBridal: data.collectionBridal || '',
        collectionHome: data.collectionHome || '',
      });
    } catch (error) {
      console.error('Error fetching homepage category images:', error);
    }
  }

  async function uploadArtisanImage(file: File) {
    setArtisanUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'artisan-portraits');

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
      setArtisanFormData((prev) => ({ ...prev, image_url: data.url }));
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image');
    } finally {
      setArtisanUploading(false);
    }
  }

  async function uploadCategoryImage(file: File, key: CategoryImageKey) {
    setCategoryImagesUploading(key);
    setCategoryImagesMessage('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'site/homepage');

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
      setCategoryImages((prev) => ({ ...prev, [key]: data.url }));
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image');
    } finally {
      setCategoryImagesUploading(null);
    }
  }

  async function saveArtisan(id?: string) {
    if (!artisanFormData.name) {
      alert('Artisan name is required');
      return;
    }

    const artisanData = {
      name: artisanFormData.name,
      image_url: artisanFormData.image_url || null,
      bio: artisanFormData.bio || null,
    };

    const { error } = id
      ? await supabase.from('artisans').update(artisanData).eq('id', id)
      : await supabase.from('artisans').insert([artisanData]);

    if (!error) {
      setEditingArtisanId(null);
      setArtisanFormData({ name: '', image_url: '', bio: '' });
      fetchArtisans();
    } else {
      alert('Error saving artisan');
    }
  }

  async function deleteArtisan(id: string) {
    if (!confirm('Delete this artisan?')) return;

    const { error } = await supabase.from('artisans').delete().eq('id', id);

    if (!error) {
      setArtisans(artisans.filter((a) => a.id !== id));
    }
  }

  async function addAdmin() {
    if (!formData.email || !formData.name) {
      alert('Email and name are required');
      return;
    }

    // Note: In production, you would create the Supabase Auth user first
    // For now, this is a placeholder
    alert('To add an admin:\n1. Create a user in Supabase Auth\n2. Copy their UUID\n3. Contact support to add them to admin_users table');
  }

  async function deleteAdmin(id: string) {
    if (!confirm('Remove this admin user?')) return;

    const { error } = await supabase.from('admin_users').delete().eq('id', id);

    if (!error) {
      setAdmins(admins.filter((a) => a.id !== id));
    }
  }

  async function updateStoreInfo() {
    const { error } = await supabase
      .from('homepage_content')
      .upsert({
        section: 'store_info',
        content: storeInfo,
      });

    if (!error) {
      alert('Store info updated');
    }
  }

  async function saveCategoryImages() {
    setCategoryImagesSaving(true);
    setCategoryImagesMessage('');

    try {
      const response = await fetch('/api/admin/site-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(categoryImages),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || 'Could not save homepage category images');
      }

      setCategoryImages({
        collectionJewellery: data.siteImages?.collectionJewellery || '',
        collectionAccessories: data.siteImages?.collectionAccessories || '',
        collectionBridal: data.siteImages?.collectionBridal || '',
        collectionHome: data.siteImages?.collectionHome || '',
      });
      setCategoryImagesMessage('Homepage category images updated');
    } catch (error) {
      console.error('Error saving homepage category images:', error);
      setCategoryImagesMessage(
        error instanceof Error ? error.message : 'Could not save homepage category images'
      );
    } finally {
      setCategoryImagesSaving(false);
    }
  }

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Header */}
      <div>
        <h2 className="text-lg font-medium">Settings</h2>
      </div>

      {/* Store Information Section */}
      <div className="border p-6 rounded-sm" style={{ borderColor: '#f0f0f0' }}>
        <h3 className="text-sm font-medium mb-4">Store Information</h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs uppercase tracking-wider" style={{ letterSpacing: '2px' }}>
              Store Name
            </label>
            <input
              type="text"
              value={storeInfo.store_name}
              onChange={(e) => setStoreInfo({ ...storeInfo, store_name: e.target.value })}
              className="w-full text-xs px-3 py-2 border mt-1"
              style={{ borderColor: '#e0e0e0' }}
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider" style={{ letterSpacing: '2px' }}>
              Phone
            </label>
            <input
              type="text"
              value={storeInfo.phone}
              onChange={(e) => setStoreInfo({ ...storeInfo, phone: e.target.value })}
              className="w-full text-xs px-3 py-2 border mt-1"
              style={{ borderColor: '#e0e0e0' }}
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider" style={{ letterSpacing: '2px' }}>
              Email
            </label>
            <input
              type="email"
              value={storeInfo.email}
              onChange={(e) => setStoreInfo({ ...storeInfo, email: e.target.value })}
              className="w-full text-xs px-3 py-2 border mt-1"
              style={{ borderColor: '#e0e0e0' }}
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider" style={{ letterSpacing: '2px' }}>
              Address
            </label>
            <textarea
              value={storeInfo.address}
              onChange={(e) => setStoreInfo({ ...storeInfo, address: e.target.value })}
              className="w-full text-xs px-3 py-2 border mt-1"
              style={{ borderColor: '#e0e0e0' }}
              rows={3}
            />
          </div>
          <button
            onClick={updateStoreInfo}
            className="text-xs tracking-wider uppercase px-4 py-2 rounded-sm mt-4"
            style={{
              backgroundColor: '#1c1c1c',
              color: '#fff',
              letterSpacing: '2px',
            }}
          >
            Save Store Info
          </button>
        </div>
      </div>

      {/* Homepage Category Images Section */}
      <div className="border p-6 rounded-sm" style={{ borderColor: '#f0f0f0' }}>
        <h3 className="text-sm font-medium mb-4">Homepage Category Images</h3>
        <p className="text-xs text-gray-500 mb-4">
          These images affect the homepage collection grid only. Category names and links stay the same.
        </p>

        {categoryImagesMessage && (
          <p className="text-xs mb-4" style={{ color: categoryImagesMessage.includes('updated') ? '#666' : '#c33' }}>
            {categoryImagesMessage}
          </p>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          {CATEGORY_IMAGE_FIELDS.map((field) => (
            <div
              key={field.key}
              className="border p-4 rounded-sm space-y-3"
              style={{ borderColor: '#f0f0f0', backgroundColor: '#fafafa' }}
            >
              <div>
                <label className="text-xs uppercase tracking-wider" style={{ letterSpacing: '2px' }}>
                  {field.label}
                </label>
              </div>

              {categoryImages[field.key] ? (
                <div className="w-full h-32 bg-gray-100 rounded-sm flex items-center justify-center overflow-hidden">
                  <img
                    src={categoryImages[field.key]}
                    alt={`${field.label} preview`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div
                  className="w-full h-32 border rounded-sm flex items-center justify-center text-xs text-gray-400"
                  style={{ borderColor: '#e0e0e0' }}
                >
                  No image selected
                </div>
              )}

              <input
                type="text"
                value={categoryImages[field.key]}
                onChange={(e) =>
                  setCategoryImages((prev) => ({
                    ...prev,
                    [field.key]: e.target.value,
                  }))
                }
                placeholder="Paste image URL or upload below"
                className="w-full text-xs px-3 py-2 border"
                style={{ borderColor: '#e0e0e0' }}
              />

              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.currentTarget.files?.[0];
                  if (file) {
                    uploadCategoryImage(file, field.key);
                  }
                }}
                disabled={categoryImagesUploading === field.key}
                className="w-full text-xs px-3 py-2 border"
                style={{ borderColor: '#e0e0e0' }}
              />

              {categoryImagesUploading === field.key && (
                <p className="text-xs text-gray-500">Uploading...</p>
              )}

              {categoryImages[field.key] && (
                <button
                  type="button"
                  onClick={() =>
                    setCategoryImages((prev) => ({
                      ...prev,
                      [field.key]: '',
                    }))
                  }
                  className="text-xs hover:underline"
                  style={{ color: '#c33' }}
                >
                  Clear image
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={saveCategoryImages}
          disabled={categoryImagesSaving}
          className="text-xs tracking-wider uppercase px-4 py-2 rounded-sm mt-4"
          style={{
            backgroundColor: '#1c1c1c',
            color: '#fff',
            letterSpacing: '2px',
          }}
        >
          {categoryImagesSaving ? 'Saving...' : 'Save Homepage Images'}
        </button>
      </div>

      {/* Featured Artisans Section */}
      <div className="border p-6 rounded-sm" style={{ borderColor: '#f0f0f0' }}>
        <h3 className="text-sm font-medium mb-4">Featured Artisans</h3>
        <p className="text-xs text-gray-500 mb-4">Manage artisan profiles displayed on homepage</p>

        {/* Add/Edit Artisan Form */}
        {editingArtisanId !== null && (
          <div className="mb-6 p-4 border rounded-sm" style={{ borderColor: '#e0e0e0', backgroundColor: '#fafafa' }}>
            <input
              type="text"
              placeholder="Artisan name"
              value={artisanFormData.name}
              onChange={(e) => setArtisanFormData({ ...artisanFormData, name: e.target.value })}
              className="text-xs px-3 py-2 border w-full mb-3"
              style={{ borderColor: '#e0e0e0' }}
            />
            <div className="space-y-2 mb-3">
              <label className="text-xs font-medium block">Portrait Image</label>
              {artisanFormData.image_url && (
                <div className="w-full h-24 bg-gray-200 rounded-sm flex items-center justify-center mb-2">
                  <img
                    src={artisanFormData.image_url}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-sm"
                  />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.currentTarget.files?.[0];
                  if (file) {
                    uploadArtisanImage(file);
                  }
                }}
                disabled={artisanUploading}
                className="text-xs px-3 py-2 border w-full"
                style={{ borderColor: '#e0e0e0' }}
              />
              {artisanUploading && <p className="text-xs text-gray-500">Uploading...</p>}
              {artisanFormData.image_url && (
                <button
                  onClick={() => setArtisanFormData({ ...artisanFormData, image_url: '' })}
                  className="text-xs px-2 py-1 border rounded-sm"
                  style={{ borderColor: '#e0e0e0', color: '#c33' }}
                >
                  Clear Image
                </button>
              )}
            </div>
            <textarea
              placeholder="Bio (optional)"
              value={artisanFormData.bio}
              onChange={(e) => setArtisanFormData({ ...artisanFormData, bio: e.target.value })}
              className="text-xs px-3 py-2 border w-full mb-3"
              style={{ borderColor: '#e0e0e0' }}
              rows={2}
            />
            <div className="flex gap-2">
              <button
                onClick={() => saveArtisan(editingArtisanId === 'new' ? undefined : editingArtisanId)}
                className="text-xs px-3 py-2 rounded-sm"
                style={{ backgroundColor: '#1c1c1c', color: '#fff' }}
              >
                Save
              </button>
              <button
                onClick={() => {
                  setEditingArtisanId(null);
                  setArtisanFormData({ name: '', image_url: '', bio: '' });
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
        {editingArtisanId === null && (
          <button
            onClick={() => setEditingArtisanId('new')}
            className="text-xs px-3 py-2 rounded-sm mb-4"
            style={{ backgroundColor: '#1c1c1c', color: '#fff' }}
          >
            Add Artisan
          </button>
        )}

        {/* Artisans List */}
        {artisans.length === 0 ? (
          <div className="text-xs text-gray-500">No artisans added yet</div>
        ) : (
          <div className="space-y-2">
            {artisans.map((artisan) => (
              <div
                key={artisan.id}
                className="border p-4 rounded-sm flex gap-4 items-start"
                style={{ borderColor: '#f0f0f0' }}
              >
                {artisan.image_url && (
                  <div className="w-16 h-16 bg-gray-200 rounded-sm flex-shrink-0 flex items-center justify-center">
                    <img
                      src={artisan.image_url}
                      alt={artisan.name}
                      className="w-full h-full object-cover rounded-sm"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium">{artisan.name}</h4>
                  {artisan.bio && (
                    <p className="text-xs text-gray-600 mt-1">{artisan.bio}</p>
                  )}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => {
                      setEditingArtisanId(artisan.id);
                      setArtisanFormData({
                        name: artisan.name,
                        image_url: artisan.image_url || '',
                        bio: artisan.bio || '',
                      });
                    }}
                    className="text-xs hover:underline"
                    style={{ color: '#1c1c1c' }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteArtisan(artisan.id)}
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

      {/* Admin Users Section */}
      <div className="border p-6 rounded-sm" style={{ borderColor: '#f0f0f0' }}>
        <h3 className="text-sm font-medium mb-4">Admin Users</h3>

        {/* Add Admin Form */}
        <div className="mb-6 pb-6 border-b" style={{ borderColor: '#f0f0f0' }}>
          <p className="text-xs text-gray-600 mb-3">
            To add a new admin user:
          </p>
          <ol className="text-xs text-gray-600 list-decimal list-inside space-y-1 mb-4">
            <li>Create a user in Supabase Authentication</li>
            <li>Copy their UUID from the Auth dashboard</li>
            <li>Contact support with the UUID to add to admin_users</li>
          </ol>
        </div>

        {/* Admin List */}
        {loading ? (
          <div className="text-xs text-gray-500">Loading...</div>
        ) : admins.length === 0 ? (
          <div className="text-xs text-gray-500">No admin users configured</div>
        ) : (
          <div className="space-y-2">
            {admins.map((admin) => (
              <div
                key={admin.id}
                className="flex items-center justify-between p-3 border rounded-sm hover:bg-gray-50"
                style={{ borderColor: '#f0f0f0' }}
              >
                <div>
                  <p className="text-sm font-medium">{admin.name}</p>
                  <p className="text-xs text-gray-600">{admin.email}</p>
                </div>
                <div className="flex gap-3">
                  <span
                    className="text-xs px-2 py-1 rounded-sm"
                    style={{
                      backgroundColor: '#d4edda',
                      color: '#155724',
                    }}
                  >
                    {admin.role}
                  </span>
                  <button
                    onClick={() => deleteAdmin(admin.id)}
                    className="text-xs hover:underline"
                    style={{ color: '#c33' }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Danger Zone */}
      <div className="border p-6 rounded-sm" style={{ borderColor: '#f8d7da', backgroundColor: '#fff5f7' }}>
        <h3 className="text-sm font-medium mb-4" style={{ color: '#721c24' }}>
          Danger Zone
        </h3>
        <p className="text-xs text-gray-600 mb-4">
          These actions cannot be undone. Contact support before proceeding.
        </p>
        <button
          disabled
          className="text-xs px-4 py-2 rounded-sm opacity-50 cursor-not-allowed"
          style={{
            backgroundColor: '#c33',
            color: '#fff',
          }}
        >
          Clear All Data
        </button>
      </div>
    </div>
  );
}
