'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export default function SettingsPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    role: 'admin',
  });
  const [storeInfo, setStoreInfo] = useState({
    store_name: 'SharonCraft',
    phone: '',
    email: '',
    address: '',
  });

  useEffect(() => {
    fetchAdmins();
    fetchStoreInfo();
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
