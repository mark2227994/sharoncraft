'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  total_amount: number;
  order_status: string;
  payment_status: string;
  created_at: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  async function fetchOrders() {
    setLoading(true);
    try {
      let query = supabase.from('orders').select('*').order('created_at', { ascending: false });

      if (statusFilter) {
        query = query.eq('order_status', statusFilter);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching orders:', error);
        return;
      }

      setOrders(data || []);
    } finally {
      setLoading(false);
    }
  }

  async function updateOrderStatus(id: string, newStatus: string) {
    const { error } = await supabase
      .from('orders')
      .update({ order_status: newStatus })
      .eq('id', id);

    if (!error) {
      setOrders(
        orders.map((o) => (o.id === id ? { ...o, order_status: newStatus } : o))
      );
    }
  }

  const statusColors: Record<string, { bg: string; text: string }> = {
    pending: { bg: '#fff3cd', text: '#856404' },
    processing: { bg: '#d1ecf1', text: '#0c5460' },
    shipped: { bg: '#d4edda', text: '#155724' },
    delivered: { bg: '#cce5ff', text: '#004085' },
    cancelled: { bg: '#f8d7da', text: '#721c24' },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-medium">Orders</h2>
        <p className="text-xs text-gray-500 mt-1">{orders.length} total</p>
      </div>

      {/* Filter */}
      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="text-xs px-3 py-2 border"
        style={{ borderColor: '#e0e0e0' }}
      >
        <option value="">All Orders</option>
        <option value="pending">Pending</option>
        <option value="processing">Processing</option>
        <option value="shipped">Shipped</option>
        <option value="delivered">Delivered</option>
        <option value="cancelled">Cancelled</option>
      </select>

      {/* Orders Table */}
      {loading ? (
        <div className="text-xs text-gray-500">Loading...</div>
      ) : orders.length === 0 ? (
        <div className="text-xs text-gray-500">No orders found</div>
      ) : (
        <div className="border overflow-x-auto" style={{ borderColor: '#f0f0f0' }}>
          <table className="w-full text-xs">
            <thead>
              <tr style={{ backgroundColor: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
                <th className="px-4 py-3 text-left font-medium">Order ID</th>
                <th className="px-4 py-3 text-left font-medium">Customer</th>
                <th className="px-4 py-3 text-left font-medium">Phone</th>
                <th className="px-4 py-3 text-left font-medium">Amount</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const colors = statusColors[order.order_status] || statusColors.pending;
                return (
                  <tr
                    key={order.id}
                    style={{ borderBottom: '1px solid #f0f0f0' }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 font-mono">{order.id.slice(0, 8)}</td>
                    <td className="px-4 py-3">{order.customer_name}</td>
                    <td className="px-4 py-3 text-gray-600">{order.customer_phone}</td>
                    <td className="px-4 py-3">KES {order.total_amount}</td>
                    <td className="px-4 py-3">
                      <select
                        value={order.order_status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className="text-xs px-2 py-1 rounded-sm border-0"
                        style={{
                          backgroundColor: colors.bg,
                          color: colors.text,
                        }}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
