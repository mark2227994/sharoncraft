'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

type Order = {
  id: string;
  customer_name: string;
  customer_whatsapp: string | null;
  total_amount: number;
  order_status: string;
  created_at: string;
};

type DashboardStats = {
  todayRevenue: number;
  newOrders: number;
  lowStock: number;
  pendingOrders: number;
};

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key || url === 'http://localhost:54321' || key === 'anon-key-stub') {
    return null;
  }

  try {
    return createClient(url, key);
  } catch {
    return null;
  }
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    todayRevenue: 0,
    newOrders: 0,
    lowStock: 0,
    pendingOrders: 0,
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState<boolean>(false);

  useEffect(() => {
    async function fetchDashboardData() {
      const supabase = getSupabaseClient();

      // If Supabase is not configured, show setup message
      if (!supabase) {
        setStats({ todayRevenue: 0, newOrders: 0, lowStock: 0, pendingOrders: 0 });
        setOrders([]);
        setDbError(true);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setDbError(false);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Today's Revenue
        const { data: revenueData, error: revenueError } = await supabase
          .from('orders')
          .select('total_amount')
          .gte('created_at', today.toISOString())
          .eq('payment_status', 'paid');

        if (revenueError) {
          console.error('Revenue query error:', revenueError);
          if ((revenueError as any).code === 'PGRST116') {
            setDbError(true);
            setStats({ todayRevenue: 0, newOrders: 0, lowStock: 0, pendingOrders: 0 });
            setOrders([]);
            setLoading(false);
            return;
          }
        }

        const totalRevenue = (revenueData ?? []).reduce(
          (sum: number, order: { total_amount: number | null }) =>
            sum + (order.total_amount ?? 0),
          0
        );

        // New Orders (today)
        const { count: newOrdersCount, error: newOrdersError } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', today.toISOString());

        if (newOrdersError) {
          console.error('New orders query error:', newOrdersError);
          if ((newOrdersError as any).code === 'PGRST116') {
            setDbError(true);
            setStats({ todayRevenue: 0, newOrders: 0, lowStock: 0, pendingOrders: 0 });
            setOrders([]);
            setLoading(false);
            return;
          }
        }

        // Low Stock (not applicable to current schema, hardcode to 0)
        const lowStockCount = 0;

        // Pending Orders
        const { count: pendingCount, error: pendingError } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('order_status', 'pending');

        if (pendingError) {
          console.error('Pending orders query error:', pendingError);
          if ((pendingError as any).code === 'PGRST116') {
            setDbError(true);
            setStats({ todayRevenue: 0, newOrders: 0, lowStock: 0, pendingOrders: 0 });
            setOrders([]);
            setLoading(false);
            return;
          }
        }

        setStats({
          todayRevenue: totalRevenue,
          newOrders: newOrdersCount ?? 0,
          lowStock: lowStockCount,
          pendingOrders: pendingCount ?? 0,
        });

        // Recent Orders
        const { data: recentOrders, error: ordersError } = await supabase
          .from('orders')
          .select('id, customer_name, customer_whatsapp, total_amount, order_status, created_at')
          .order('created_at', { ascending: false })
          .limit(10);

        if (ordersError) {
          console.error('Recent orders query error:', ordersError);
        }

        setOrders(recentOrders ?? []);
      } catch (error) {
        // On any unexpected error, log it
        console.error('Dashboard data fetch error:', error);
        setStats({ todayRevenue: 0, newOrders: 0, lowStock: 0, pendingOrders: 0 });
        setOrders([]);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  const formatOrderId = (uuid: string) => {
    return `#SC-${uuid.slice(0, 8)}`;
  };

  const statusBadge = (status: string) => {
    const styles: Record<string, React.CSSProperties> = {
      pending: { backgroundColor: '#fffbeb', color: '#b45309' },
      processing: { backgroundColor: '#eff6ff', color: '#1d4ed8' },
      shipped: { backgroundColor: '#faf5ff', color: '#7e22ce' },
      delivered: { backgroundColor: '#f0fdf4', color: '#15803d' },
      cancelled: { backgroundColor: '#fef2f2', color: '#b91c1c' },
    };
    const s = status?.toLowerCase() ?? 'pending';
    return (
      <span
        className="font-normal px-2 py-0.5"
        style={{
          ...(styles[s] ?? styles.pending),
          borderRadius: '2px',
          fontSize: '10px',
          letterSpacing: '1px',
          textTransform: 'uppercase',
        }}
      >
        {status}
      </span>
    );
  };

  const whatsappLink = (order: Order) => {
    const phone = order.customer_whatsapp ?? '';
    const name = order.customer_name ?? 'there';
    const amount = (order.total_amount ?? 0).toLocaleString();
    const text = `Hi ${name} 👋 Your SharonCraft order is confirmed!\nTotal: KES ${amount}\nWe will be in touch shortly. 🙏`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  };

  const statCards = [
    { label: "Today's Revenue", value: stats.todayRevenue, prefix: 'KES ' },
    { label: 'New Orders', value: stats.newOrders, prefix: '' },
    { label: 'Low Stock', value: stats.lowStock, prefix: '' },
    { label: 'Pending Orders', value: stats.pendingOrders, prefix: '' },
  ];

  return (
    <div className="space-y-8">
      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4">
        {statCards.map(({ label, value, prefix }) => (
          <div
            key={label}
            className="bg-white border p-4"
            style={{ borderColor: '#f0f0f0', borderRadius: '2px' }}
          >
            <p
              className="uppercase mb-2 font-normal"
              style={{ letterSpacing: '2px', color: '#999', fontSize: '9px' }}
            >
              {label}
            </p>
            {loading ? (
              <div className="h-4 w-16 bg-gray-100 animate-pulse" style={{ borderRadius: '2px' }} />
            ) : dbError ? (
              <p style={{ color: '#999', fontSize: '9px' }}>
                Set up database to see stats
              </p>
            ) : (
              <p className="text-2xl font-light" style={{ color: '#1c1c1c' }}>
                {prefix}
                {value.toLocaleString()}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div>
        <p
          className="uppercase font-normal mb-4"
          style={{ letterSpacing: '2px', color: '#999', fontSize: '9px' }}
        >
          Recent Orders
        </p>
        <div className="bg-white border" style={{ borderColor: '#f0f0f0', borderRadius: '2px' }}>
          {loading ? (
            <div className="p-8 flex items-center justify-center">
              <div className="h-4 w-32 bg-gray-100 animate-pulse" style={{ borderRadius: '2px' }} />
            </div>
          ) : orders.length > 0 ? (
            <table className="w-full text-left">
              <thead>
                <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                  {['Order ID', 'Customer', 'Total', 'Status', 'WhatsApp'].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 font-normal uppercase"
                      style={{
                        fontSize: '9px',
                        letterSpacing: '2px',
                        color: '#999',
                        fontWeight: 400,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="transition-colors hover:bg-gray-50"
                    style={{ borderBottom: '1px solid #f8f8f8' }}
                  >
                    <td className="px-4 py-3 text-xs" style={{ color: '#1c1c1c', fontWeight: 500 }}>
                      {formatOrderId(order.id)}
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: '#666' }}>
                      {order.customer_name}
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: '#1c1c1c', fontWeight: 500 }}>
                      KES {(order.total_amount ?? 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      {statusBadge(order.order_status)}
                    </td>
                    <td className="px-4 py-3">
                      {order.customer_whatsapp ? (
                        <a
                          href={whatsappLink(order)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block text-white hover:opacity-90 transition-opacity"
                          style={{
                            backgroundColor: '#25D366',
                            fontSize: '10px',
                            padding: '4px 10px',
                            borderRadius: '2px',
                            letterSpacing: '1px',
                            textTransform: 'uppercase',
                          }}
                        >
                          WhatsApp
                        </a>
                      ) : (
                        <span className="text-xs" style={{ color: '#ccc' }}>-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center">
              <p className="text-xs" style={{ color: '#999' }}>
                No orders yet. Orders will appear here when customers place their first order.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
