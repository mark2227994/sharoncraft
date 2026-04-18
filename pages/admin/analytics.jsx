import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import Icon from '../../components/icons';
import { formatKES } from '../../lib/formatters';

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    conversionRate: 0,
    topProducts: [],
    topArtisans: [],
    revenueByStatus: {},
    ordersByDay: [],
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30days');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  async function fetchAnalytics() {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/analytics?range=${timeRange}`, {
        credentials: 'same-origin',
      });
      const data = await res.json();
      setMetrics(data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminLayout>
      <div className="analytics-page">
        <div className="analytics-header">
          <div>
            <h1>Analytics & Insights</h1>
            <p>Track performance metrics and business growth</p>
          </div>
          <div className="time-range-selector">
            {['7days', '30days', '90days', 'all'].map((range) => (
              <button
                key={range}
                className={`range-btn ${timeRange === range ? 'active' : ''}`}
                onClick={() => setTimeRange(range)}
              >
                {range === '7days' ? '7 Days' : range === '30days' ? '30 Days' : range === '90days' ? '90 Days' : 'All Time'}
              </button>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <section className="metrics-section">
          <h2>Key Performance Indicators</h2>
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-icon">
                <Icon name="dollar" size={24} />
              </div>
              <div className="metric-content">
                <p className="metric-label">Total Revenue</p>
                <p className="metric-value">{formatKES(metrics.totalRevenue)}</p>
                <p className="metric-change">↑ 12.5% from last period</p>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon">
                <Icon name="package" size={24} />
              </div>
              <div className="metric-content">
                <p className="metric-label">Total Orders</p>
                <p className="metric-value">{metrics.totalOrders}</p>
                <p className="metric-change">↑ 8 more than last period</p>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon">
                <Icon name="check" size={24} />
              </div>
              <div className="metric-content">
                <p className="metric-label">Average Order Value</p>
                <p className="metric-value">{formatKES(metrics.averageOrderValue)}</p>
                <p className="metric-change">↑ 3.2% increase</p>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon">
                <Icon name="star" size={24} />
              </div>
              <div className="metric-content">
                <p className="metric-label">Conversion Rate</p>
                <p className="metric-value">{metrics.conversionRate.toFixed(1)}%</p>
                <p className="metric-change">Target: 5-10%</p>
              </div>
            </div>
          </div>
        </section>

        {/* Revenue by Status */}
        <section className="revenue-section">
          <h2>Revenue by Order Status</h2>
          <div className="status-breakdown">
            {Object.entries(metrics.revenueByStatus || {}).map(([status, revenue]) => (
              <div key={status} className="status-item">
                <div className="status-info">
                  <span className="status-label">{status}</span>
                </div>
                <div className="status-bar">
                  <div className="status-fill" style={{ width: `${(revenue / metrics.totalRevenue) * 100}%` }}></div>
                </div>
                <span className="status-value">{formatKES(revenue)}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Top Products & Artisans */}
        <div className="top-section">
          <section className="top-products">
            <h2>Top Products</h2>
            <div className="top-list">
              {metrics.topProducts?.slice(0, 5).map((product, idx) => (
                <div key={idx} className="top-item">
                  <span className="rank">#{idx + 1}</span>
                  <div className="item-info">
                    <p className="item-name">{product.name}</p>
                    <p className="item-meta">{product.count} sales</p>
                  </div>
                  <p className="item-revenue">{formatKES(product.revenue)}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="top-artisans">
            <h2>Top Artisans</h2>
            <div className="top-list">
              {metrics.topArtisans?.slice(0, 5).map((artisan, idx) => (
                <div key={idx} className="top-item">
                  <span className="rank">#{idx + 1}</span>
                  <div className="item-info">
                    <p className="item-name">{artisan.name}</p>
                    <p className="item-meta">{artisan.productsSold} products sold</p>
                  </div>
                  <p className="item-revenue">{formatKES(artisan.revenue)}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <style jsx>{`
        .analytics-page {
          padding: 0;
        }

        .analytics-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--space-6) var(--gutter);
          border-bottom: 1px solid var(--border-light);
          gap: var(--space-4);
        }

        .analytics-header h1 {
          margin: 0 0 var(--space-1);
          font-size: 1.75rem;
          color: var(--text-primary);
        }

        .analytics-header p {
          margin: 0;
          color: var(--text-secondary);
        }

        .time-range-selector {
          display: flex;
          gap: var(--space-2);
        }

        .range-btn {
          padding: 8px 16px;
          border: 1px solid var(--border-default);
          background: white;
          color: var(--text-primary);
          border-radius: var(--radius-md);
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.2s;
        }

        .range-btn:hover {
          border-color: var(--color-terracotta);
          color: var(--color-terracotta);
        }

        .range-btn.active {
          background: var(--color-terracotta);
          color: white;
          border-color: var(--color-terracotta);
        }

        .metrics-section,
        .revenue-section,
        .top-section {
          padding: var(--space-6) var(--gutter);
        }

        .metrics-section h2,
        .revenue-section h2,
        .top-section h2 {
          font-size: 1.25rem;
          margin: 0 0 var(--space-4);
          color: var(--text-primary);
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--space-4);
        }

        .metric-card {
          display: flex;
          gap: var(--space-3);
          padding: var(--space-4);
          background: white;
          border: 1px solid var(--border-light);
          border-radius: var(--radius-md);
        }

        .metric-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 56px;
          height: 56px;
          background: var(--bg-card);
          border-radius: var(--radius-md);
          color: var(--color-terracotta);
          flex-shrink: 0;
        }

        .metric-content {
          flex: 1;
        }

        .metric-label {
          margin: 0;
          font-size: 0.875rem;
          color: var(--text-secondary);
          text-transform: uppercase;
          font-weight: 600;
          letter-spacing: 0.5px;
        }

        .metric-value {
          margin: var(--space-1) 0 var(--space-2);
          font-size: 1.75rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .metric-change {
          margin: 0;
          font-size: 0.8125rem;
          color: #10b981;
          font-weight: 500;
        }

        .revenue-section {
          background: var(--bg-page);
          margin: var(--space-6) 0 0;
        }

        .status-breakdown {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .status-item {
          display: grid;
          grid-template-columns: 80px 1fr 100px;
          align-items: center;
          gap: var(--space-3);
        }

        .status-label {
          text-transform: capitalize;
          font-weight: 500;
          color: var(--text-primary);
        }

        .status-bar {
          height: 32px;
          background: var(--bg-card);
          border-radius: var(--radius-md);
          overflow: hidden;
        }

        .status-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--color-terracotta), var(--color-accent));
          transition: width 0.3s;
        }

        .status-value {
          text-align: right;
          font-weight: 600;
          color: var(--text-primary);
        }

        .top-section {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: var(--space-6);
          padding: var(--space-6) var(--gutter);
        }

        .top-products,
        .top-artisans {
          background: white;
          border: 1px solid var(--border-light);
          border-radius: var(--radius-lg);
          padding: var(--space-5);
        }

        .top-products h2,
        .top-artisans h2 {
          font-size: 1.125rem;
          margin: 0 0 var(--space-4);
        }

        .top-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .top-item {
          display: grid;
          grid-template-columns: 32px 1fr auto;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-3);
          background: var(--bg-card);
          border-radius: var(--radius-md);
        }

        .rank {
          font-weight: 600;
          color: var(--color-terracotta);
          text-align: center;
        }

        .item-info {
          min-width: 0;
        }

        .item-name {
          margin: 0;
          font-weight: 500;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .item-meta {
          margin: 2px 0 0;
          font-size: 0.8125rem;
          color: var(--text-secondary);
        }

        .item-revenue {
          margin: 0;
          font-weight: 600;
          color: var(--color-terracotta);
          text-align: right;
        }

        @media (max-width: 768px) {
          .analytics-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .time-range-selector {
            width: 100%;
            flex-wrap: wrap;
          }

          .top-section {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </AdminLayout>
  );
}
