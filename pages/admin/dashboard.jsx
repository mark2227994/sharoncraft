import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import Link from 'next/link';

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [todaysSales, setTodaysSales] = useState(0);
  const [todaysRevenue, setTodaysRevenue] = useState(0);
  const [pendingPayments, setPendingPayments] = useState(0);
  const [monthlyTotal, setMonthlyTotal] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [pendingShipments, setPendingShipments] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      const res = await fetch('/api/orders/stats');
      const data = await res.json();
      
      // Calculate today's sales
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayOrders = data.orders.filter(o => {
        const orderDate = new Date(o.createdAt);
        orderDate.setHours(0, 0, 0, 0);
        return orderDate.getTime() === today.getTime();
      });

      setOrders(data.orders);
      setTodaysSales(todayOrders.length);
      setTodaysRevenue(todayOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0));
      setPendingPayments(data.orders.filter(o => o.paymentStatus === 'pending').reduce((sum, o) => sum + (o.totalPrice || 0), 0));
      setPendingShipments(data.orders.filter(o => o.orderStatus === 'processing').length);

      // Calculate monthly
      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);
      const monthOrders = data.orders.filter(o => new Date(o.createdAt) >= monthAgo);
      setMonthlyTotal(monthOrders.length);
      setMonthlyRevenue(monthOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0));
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  const goalProgress = (monthlyTotal / 10) * 100;
  const revenueGoal = 50000;
  const revenueProgress = (monthlyRevenue / revenueGoal) * 100;

  return (
    <AdminLayout>
      <div className="admin-dashboard">
        <div className="dashboard-header">
          <h1>Sales Dashboard</h1>
          <p>Track your sales and growth towards 10-sale goal</p>
        </div>

        {/* KPI Cards */}
        <div className="dashboard-grid">
          <div className="kpi-card">
            <div className="kpi-card__header">
              <h3>Today's Sales</h3>
              <span className="kpi-icon">📊</span>
            </div>
            <p className="kpi-value">{todaysSales}</p>
            <p className="kpi-secondary">KES {todaysRevenue.toLocaleString()}</p>
          </div>

          <div className="kpi-card">
            <div className="kpi-card__header">
              <h3>Monthly Total</h3>
              <span className="kpi-icon">📈</span>
            </div>
            <p className="kpi-value">{monthlyTotal}/10</p>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${Math.min(goalProgress, 100)}%` }}></div>
            </div>
            <p className="kpi-secondary">{goalProgress.toFixed(0)}% to goal</p>
          </div>

          <div className="kpi-card">
            <div className="kpi-card__header">
              <h3>Monthly Revenue</h3>
              <span className="kpi-icon">💰</span>
            </div>
            <p className="kpi-value">KES {(monthlyRevenue / 1000).toFixed(0)}k</p>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${Math.min(revenueProgress, 100)}%` }}></div>
            </div>
            <p className="kpi-secondary">Target: KES 30k-50k</p>
          </div>

          <div className="kpi-card warning">
            <div className="kpi-card__header">
              <h3>Pending Payments</h3>
              <span className="kpi-icon">⚠️</span>
            </div>
            <p className="kpi-value">KES {pendingPayments.toLocaleString()}</p>
            <p className="kpi-secondary">Follow up needed</p>
            <Link href="/admin/payments" className="kpi-link">→ View payments</Link>
          </div>

          <div className="kpi-card">
            <div className="kpi-card__header">
              <h3>Pending Shipments</h3>
              <span className="kpi-icon">📦</span>
            </div>
            <p className="kpi-value">{pendingShipments}</p>
            <p className="kpi-secondary">Orders to ship</p>
            <Link href="/admin/orders" className="kpi-link">→ View orders</Link>
          </div>

          <div className="kpi-card">
            <div className="kpi-card__header">
              <h3>Avg Order Value</h3>
              <span className="kpi-icon">💵</span>
            </div>
            <p className="kpi-value">KES {monthlyTotal > 0 ? Math.round(monthlyRevenue / monthlyTotal).toLocaleString() : 0}</p>
            <p className="kpi-secondary">Last 30 days</p>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="recent-orders">
          <div className="section-header">
            <h2>Recent Orders</h2>
            <Link href="/admin/orders">View all →</Link>
          </div>

          <div className="orders-table">
            <div className="table-header">
              <div className="col-order">Order</div>
              <div className="col-customer">Customer</div>
              <div className="col-amount">Amount</div>
              <div className="col-status">Payment</div>
              <div className="col-shipping">Shipping</div>
              <div className="col-action">Action</div>
            </div>

            {orders.slice(0, 5).map(order => (
              <div key={order.id} className="table-row">
                <div className="col-order">#{order.id.slice(-6)}</div>
                <div className="col-customer">
                  <p className="strong">{order.customerName}</p>
                  <p className="muted">{order.customerEmail}</p>
                </div>
                <div className="col-amount">KES {order.totalPrice?.toLocaleString()}</div>
                <div className="col-status">
                  <span className={`badge badge-${order.paymentStatus}`}>
                    {order.paymentStatus === 'paid' ? '✓ Paid' : '⏳ Pending'}
                  </span>
                </div>
                <div className="col-shipping">
                  <span className={`badge badge-${order.orderStatus}`}>
                    {order.orderStatus === 'shipped' ? '🚚 Shipped' : order.orderStatus === 'processing' ? '📦 Processing' : 'Pending'}
                  </span>
                </div>
                <div className="col-action">
                  <Link href={`/admin/orders/${order.id}`} className="action-link">View</Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <Link href="/admin/orders/new" className="action-btn">
              <span>➕</span>
              Log New Order
            </Link>
            <Link href="/admin/payments" className="action-btn">
              <span>💳</span>
              Verify Payments
            </Link>
            <Link href="/admin/messages" className="action-btn">
              <span>💬</span>
              View Messages
            </Link>
            <Link href="/admin/products" className="action-btn">
              <span>📦</span>
              Manage Products
            </Link>
          </div>
        </div>

        <style jsx>{`
          .admin-dashboard {
            padding: 0;
          }

          .dashboard-header {
            background: linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-dark) 100%);
            color: var(--color-white);
            padding: var(--space-6) var(--gutter);
            margin-bottom: var(--space-6);
          }

          .dashboard-header h1 {
            margin: 0 0 var(--space-2);
            font-size: 2rem;
          }

          .dashboard-header p {
            margin: 0;
            opacity: 0.9;
          }

          .dashboard-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: var(--space-4);
            padding: 0 var(--gutter) var(--space-6);
          }

          .kpi-card {
            background: var(--color-white);
            border: 1px solid var(--border-default);
            border-radius: var(--radius-lg);
            padding: var(--space-4);
            transition: all 0.3s ease;
          }

          .kpi-card:hover {
            border-color: var(--color-accent);
            box-shadow: 0 4px 12px rgba(139, 90, 43, 0.15);
          }

          .kpi-card.warning {
            border-color: #e07856;
            background: rgba(224, 120, 86, 0.05);
          }

          .kpi-card__header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: var(--space-3);
          }

          .kpi-card__header h3 {
            margin: 0;
            font-size: 0.9rem;
            font-weight: 600;
            color: var(--text-secondary);
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }

          .kpi-icon {
            font-size: 1.5rem;
          }

          .kpi-value {
            margin: 0 0 var(--space-2);
            font-size: 2rem;
            font-weight: 700;
            color: var(--text-primary);
          }

          .kpi-secondary {
            margin: 0;
            font-size: 0.85rem;
            color: var(--text-muted);
          }

          .progress-bar {
            width: 100%;
            height: 6px;
            background: var(--border-default);
            border-radius: 3px;
            overflow: hidden;
            margin: var(--space-2) 0;
          }

          .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, var(--color-accent) 0%, var(--color-gold) 100%);
            border-radius: 3px;
            transition: width 0.3s ease;
          }

          .kpi-link {
            display: inline-block;
            margin-top: var(--space-2);
            color: var(--color-accent);
            font-size: 0.85rem;
            font-weight: 600;
            text-decoration: none;
            transition: color 0.2s ease;
          }

          .kpi-link:hover {
            color: var(--color-accent-dark);
          }

          .recent-orders {
            padding: 0 var(--gutter) var(--space-6);
          }

          .section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: var(--space-4);
          }

          .section-header h2 {
            margin: 0;
          }

          .section-header a {
            color: var(--color-accent);
            text-decoration: none;
            font-weight: 600;
          }

          .orders-table {
            background: var(--color-white);
            border: 1px solid var(--border-default);
            border-radius: var(--radius-lg);
            overflow: hidden;
          }

          .table-header {
            display: grid;
            grid-template-columns: 80px 1fr 120px 120px 120px 80px;
            gap: var(--space-3);
            padding: var(--space-3) var(--space-4);
            background: var(--color-cream);
            border-bottom: 1px solid var(--border-default);
            font-weight: 600;
            font-size: 0.85rem;
            color: var(--text-secondary);
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }

          .table-row {
            display: grid;
            grid-template-columns: 80px 1fr 120px 120px 120px 80px;
            gap: var(--space-3);
            padding: var(--space-3) var(--space-4);
            border-bottom: 1px solid var(--border-default);
            align-items: center;
            transition: background 0.2s ease;
          }

          .table-row:hover {
            background: var(--color-cream);
          }

          .table-row:last-child {
            border-bottom: none;
          }

          .col-order {
            font-weight: 600;
            color: var(--color-accent);
          }

          .col-customer p {
            margin: 0;
          }

          .col-customer .strong {
            font-weight: 600;
            color: var(--text-primary);
          }

          .col-customer .muted {
            font-size: 0.85rem;
            color: var(--text-muted);
          }

          .badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 600;
          }

          .badge-paid {
            background: #E8F5E9;
            color: #2E7D32;
          }

          .badge-pending {
            background: #FFF3E0;
            color: #F57C00;
          }

          .badge-shipped {
            background: #E3F2FD;
            color: #1565C0;
          }

          .badge-processing {
            background: #FCE4EC;
            color: #C2185B;
          }

          .action-link {
            color: var(--color-accent);
            text-decoration: none;
            font-weight: 600;
            font-size: 0.85rem;
            transition: color 0.2s ease;
          }

          .action-link:hover {
            color: var(--color-accent-dark);
          }

          .quick-actions {
            padding: var(--space-6) var(--gutter) 0;
          }

          .quick-actions h2 {
            margin-bottom: var(--space-4);
          }

          .actions-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
            gap: var(--space-4);
          }

          .action-btn {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: var(--space-3);
            padding: var(--space-5);
            background: var(--color-white);
            border: 2px solid var(--border-default);
            border-radius: var(--radius-lg);
            text-decoration: none;
            color: var(--text-primary);
            font-weight: 600;
            transition: all 0.3s ease;
            cursor: pointer;
          }

          .action-btn:hover {
            border-color: var(--color-accent);
            background: linear-gradient(135deg, rgba(139, 90, 43, 0.05) 0%, rgba(212, 175, 55, 0.05) 100%);
            transform: translateY(-2px);
          }

          .action-btn span {
            font-size: 1.8rem;
          }

          @media (max-width: 768px) {
            .dashboard-grid {
              grid-template-columns: 1fr;
            }

            .table-header,
            .table-row {
              grid-template-columns: 1fr;
              gap: var(--space-2);
            }

            .actions-grid {
              grid-template-columns: repeat(2, 1fr);
            }
          }
        `}</style>
      </div>
    </AdminLayout>
  );
}
