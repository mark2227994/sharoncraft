'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

interface CustomOrder {
  id: string;
  customer_name: string;
  customer_phone: string;
  description: string;
  budget: number;
  status: string;
  created_at: string;
}

export default function CustomOrdersPage() {
  const [orders, setOrders] = useState<CustomOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  async function fetchOrders() {
    setLoading(true);
    try {
      let query = supabase
        .from('custom_orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter) {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching custom orders:', error);
        return;
      }

      setOrders(data || []);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: string, newStatus: string) {
    const { error } = await supabase
      .from('custom_orders')
      .update({ status: newStatus })
      .eq('id', id);

    if (!error) {
      setOrders(orders.map((o) => (o.id === id ? { ...o, status: newStatus } : o)));
    }
  }

  async function deleteOrder(id: string) {
    if (!confirm('Delete this custom order request?')) return;

    const { error } = await supabase.from('custom_orders').delete().eq('id', id);

    if (!error) {
      setOrders(orders.filter((o) => o.id !== id));
    }
  }

  const statusColors: Record<string, { bg: string; text: string }> = {
    pending: { bg: '#fff3cd', text: '#856404' },
    quoted: { bg: '#d1ecf1', text: '#0c5460' },
    accepted: { bg: '#d4edda', text: '#155724' },
    rejected: { bg: '#f8d7da', text: '#721c24' },
    completed: { bg: '#cce5ff', text: '#004085' },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-medium">Custom Orders</h2>
        <p className="text-xs text-gray-500 mt-1">Manage custom order requests</p>
      </div>

      {/* Filter */}
      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="text-xs px-3 py-2 border"
        style={{ borderColor: '#e0e0e0' }}
      >
        <option value="">All Requests</option>
        <option value="pending">Pending</option>
        <option value="quoted">Quoted</option>
        <option value="accepted">Accepted</option>
        <option value="rejected">Rejected</option>
        <option value="completed">Completed</option>
      </select>

      {/* Custom Orders List */}
      {loading ? (
        <div className="text-xs text-gray-500">Loading...</div>
      ) : orders.length === 0 ? (
        <div className="text-xs text-gray-500">No custom orders found</div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const colors = statusColors[order.status] || statusColors.pending;
            return (
              <div
                key={order.id}
                className="border p-4 rounded-sm"
                style={{ borderColor: '#f0f0f0' }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-medium">{order.customer_name}</h3>
                    <p className="text-xs text-gray-600 mt-1">{order.customer_phone}</p>
                  </div>
                  <select
                    value={order.status}
                    onChange={(e) => updateStatus(order.id, e.target.value)}
                    className="text-xs px-2 py-1 rounded-sm border-0"
                    style={{
                      backgroundColor: colors.bg,
                      color: colors.text,
                    }}
                  >
                    <option value="pending">Pending</option>
                    <option value="quoted">Quoted</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <p className="text-xs text-gray-700 mb-3">{order.description}</p>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-600">
                    Budget: <span className="font-medium">KES {order.budget}</span>
                  </p>
                  <button
                    onClick={() => deleteOrder(order.id)}
                    className="text-xs hover:underline"
                    style={{ color: '#c33' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
