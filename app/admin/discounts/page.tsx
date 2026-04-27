'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

interface Discount {
  id: string;
  code: string;
  type: string;
  amount: number;
  is_active: boolean;
  times_used: number;
  usage_limit: number;
  expiry_date: string;
}

export default function DiscountsPage() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'percentage',
    discount_value: '',
    max_uses: '',
    expires_at: '',
  });

  useEffect(() => {
    fetchDiscounts();
  }, []);

  async function fetchDiscounts() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('discounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching discounts:', error);
        return;
      }

      setDiscounts(data || []);
    } finally {
      setLoading(false);
    }
  }

  async function saveDiscount(id?: string) {
    const discountData = {
      code: formData.code.toUpperCase(),
      type: formData.discount_type,
      amount: parseFloat(formData.discount_value),
      usage_limit: formData.max_uses ? parseInt(formData.max_uses) : null,
      expiry_date: formData.expires_at || null,
    };

    const { error } = id
      ? await supabase.from('discounts').update(discountData).eq('id', id)
      : await supabase.from('discounts').insert([discountData]);

    if (!error) {
      setEditingId(null);
      setFormData({
        code: '',
        discount_type: 'percentage',
        discount_value: '',
        max_uses: '',
        expires_at: '',
      });
      fetchDiscounts();
    }
  }

  async function deleteDiscount(id: string) {
    if (!confirm('Delete this discount code?')) return;

    const { error } = await supabase.from('discounts').delete().eq('id', id);

    if (!error) {
      setDiscounts(discounts.filter((d) => d.id !== id));
    }
  }

  async function toggleDiscount(id: string, isActive: boolean) {
    const { error } = await supabase
      .from('discounts')
      .update({ is_active: !isActive })
      .eq('id', id);

    if (!error) {
      setDiscounts(
        discounts.map((d) => (d.id === id ? { ...d, is_active: !isActive } : d))
      );
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-medium">Discount Codes</h2>
        <p className="text-xs text-gray-500 mt-1">{discounts.length} codes</p>
      </div>

      {/* Add New Discount Form */}
      {editingId === 'new' && (
        <div
          className="border p-4 rounded-sm space-y-3"
          style={{ borderColor: '#f0f0f0', backgroundColor: '#fafafa' }}
        >
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Code (e.g., SAVE20)"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              className="text-xs px-3 py-2 border col-span-2"
              style={{ borderColor: '#e0e0e0' }}
            />
            <select
              value={formData.discount_type}
              onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
              className="text-xs px-3 py-2 border"
              style={{ borderColor: '#e0e0e0' }}
            >
              <option value="percentage">Percentage %</option>
              <option value="fixed">Fixed Amount</option>
            </select>
            <input
              type="number"
              placeholder="Discount value"
              value={formData.discount_value}
              onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
              className="text-xs px-3 py-2 border"
              style={{ borderColor: '#e0e0e0' }}
            />
            <input
              type="number"
              placeholder="Max uses (optional)"
              value={formData.max_uses}
              onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
              className="text-xs px-3 py-2 border col-span-2"
              style={{ borderColor: '#e0e0e0' }}
            />
            <input
              type="date"
              value={formData.expires_at}
              onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
              className="text-xs px-3 py-2 border col-span-2"
              style={{ borderColor: '#e0e0e0' }}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => saveDiscount()}
              className="text-xs px-3 py-2 rounded-sm"
              style={{
                backgroundColor: '#1c1c1c',
                color: '#fff',
              }}
            >
              Create Code
            </button>
            <button
              onClick={() => {
                setEditingId(null);
                setFormData({
                  code: '',
                  discount_type: 'percentage',
                  discount_value: '',
                  max_uses: '',
                  expires_at: '',
                });
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
          Create Discount Code
        </button>
      )}

      {/* Discounts List */}
      {loading ? (
        <div className="text-xs text-gray-500">Loading...</div>
      ) : discounts.length === 0 ? (
        <div className="text-xs text-gray-500">No discount codes found</div>
      ) : (
        <div className="border overflow-x-auto" style={{ borderColor: '#f0f0f0' }}>
          <table className="w-full text-xs">
            <thead>
              <tr style={{ backgroundColor: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
                <th className="px-4 py-3 text-left font-medium">Code</th>
                <th className="px-4 py-3 text-left font-medium">Type</th>
                <th className="px-4 py-3 text-left font-medium">Value</th>
                <th className="px-4 py-3 text-left font-medium">Used</th>
                <th className="px-4 py-3 text-left font-medium">Max</th>
                <th className="px-4 py-3 text-left font-medium">Expires</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {discounts.map((discount) => (
                <tr
                  key={discount.id}
                  style={{ borderBottom: '1px solid #f0f0f0' }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-4 py-3 font-medium">{discount.code}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {discount.type === 'percentage' ? '%' : 'KES'}
                  </td>
                  <td className="px-4 py-3">{discount.amount}</td>
                  <td className="px-4 py-3">{discount.times_used}</td>
                  <td className="px-4 py-3">{discount.usage_limit || '∞'}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {discount.expiry_date
                      ? new Date(discount.expiry_date).toLocaleDateString()
                      : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleDiscount(discount.id, discount.is_active)}
                      className="text-xs px-2 py-1 rounded-sm transition-colors"
                      style={{
                        backgroundColor: discount.is_active ? '#efe' : '#fee',
                        color: discount.is_active ? '#3c3' : '#c33',
                      }}
                    >
                      {discount.is_active ? 'ON' : 'OFF'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => deleteDiscount(discount.id)}
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
