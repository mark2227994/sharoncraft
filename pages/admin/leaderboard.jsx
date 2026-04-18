import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import Icon from '../../components/icons';
import { formatKES } from '../../lib/formatters';

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState({
    topArtisans: [],
    topProducts: [],
    topCustomers: [],
  });
  const [timeRange, setTimeRange] = useState('30days');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [timeRange]);

  async function fetchLeaderboard() {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/leaderboard?range=${timeRange}`, {
        credentials: 'same-origin',
      });
      const data = await res.json();
      setLeaderboard(data);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  }

  const LeaderboardList = ({ items, type }) => (
    <div className="leaderboard-list">
      {items.map((item, idx) => (
        <div key={idx} className="leaderboard-item">
          <div className="rank-badge">
            {idx === 0 ? '1st' : idx === 1 ? '2nd' : idx === 2 ? '3rd' : `${idx + 1}`}
          </div>
          <div className="item-details">
            <p className="item-name">{item.name}</p>
            <p className="item-meta">
              {type === 'artisan' && `${item.itemsSold} items sold`}
              {type === 'product' && `${item.unitsSold} units sold`}
              {type === 'customer' && `${item.orderCount} orders`}
            </p>
          </div>
          <div className="item-stats">
            <p className="revenue">{formatKES(item.revenue)}</p>
            {type !== 'customer' && (
              <p className="rate">
                <Icon name="chart" size={12} style={{ marginRight: '4px' }} />
                {item.growthRate}% {item.growthRate >= 0 ? '↑' : '↓'}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <AdminLayout>
      <div className="leaderboard-page">
        <div className="leaderboard-header">
          <div>
            <h1>Sales Leaderboard</h1>
            <p>See who's leading in sales performance</p>
          </div>
          <div className="time-selector">
            {['7days', '30days', '90days'].map((range) => (
              <button
                key={range}
                className={`time-btn ${timeRange === range ? 'active' : ''}`}
                onClick={() => setTimeRange(range)}
              >
                {range === '7days' ? '7 Days' : range === '30days' ? '30 Days' : '90 Days'}
              </button>
            ))}
          </div>
        </div>

        <div className="leaderboards-grid">
          <section className="leaderboard-section">
            <div className="section-header">
              <Icon name="star" size={20} />
              <h2>Top Artisans</h2>
            </div>
            {loading ? (
              <div className="loading">Loading...</div>
            ) : leaderboard.topArtisans?.length > 0 ? (
              <LeaderboardList items={leaderboard.topArtisans} type="artisan" />
            ) : (
              <div className="empty">No artisan data yet</div>
            )}
          </section>

          <section className="leaderboard-section">
            <div className="section-header">
              <Icon name="package" size={20} />
              <h2>Top Products</h2>
            </div>
            {loading ? (
              <div className="loading">Loading...</div>
            ) : leaderboard.topProducts?.length > 0 ? (
              <LeaderboardList items={leaderboard.topProducts} type="product" />
            ) : (
              <div className="empty">No product data yet</div>
            )}
          </section>

          <section className="leaderboard-section">
            <div className="section-header">
              <Icon name="heart" size={20} />
              <h2>Top Customers</h2>
            </div>
            {loading ? (
              <div className="loading">Loading...</div>
            ) : leaderboard.topCustomers?.length > 0 ? (
              <LeaderboardList items={leaderboard.topCustomers} type="customer" />
            ) : (
              <div className="empty">No customer data yet</div>
            )}
          </section>
        </div>
      </div>

      <style jsx>{`
        .leaderboard-page {
          padding: 0;
        }

        .leaderboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--space-6) var(--gutter);
          border-bottom: 1px solid var(--border-light);
          gap: var(--space-4);
        }

        .leaderboard-header h1 {
          margin: 0 0 var(--space-1);
          font-size: 1.75rem;
          color: var(--text-primary);
        }

        .leaderboard-header p {
          margin: 0;
          color: var(--text-secondary);
        }

        .time-selector {
          display: flex;
          gap: var(--space-2);
        }

        .time-btn {
          padding: 8px 16px;
          background: white;
          border: 1px solid var(--border-default);
          border-radius: var(--radius-md);
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.2s;
        }

        .time-btn:hover {
          border-color: var(--color-terracotta);
        }

        .time-btn.active {
          background: var(--color-terracotta);
          color: white;
          border-color: var(--color-terracotta);
        }

        .leaderboards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: var(--space-6);
          padding: var(--space-6) var(--gutter);
        }

        .leaderboard-section {
          background: white;
          border: 1px solid var(--border-light);
          border-radius: var(--radius-lg);
          padding: var(--space-5);
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          margin-bottom: var(--space-4);
        }

        .section-header h2 {
          margin: 0;
          font-size: 1.125rem;
          color: var(--text-primary);
        }

        .section-header svg {
          color: var(--color-terracotta);
        }

        .leaderboard-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .leaderboard-item {
          display: grid;
          grid-template-columns: 40px 1fr auto;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-3);
          background: var(--bg-card);
          border-radius: var(--radius-md);
          transition: all 0.2s;
        }

        .leaderboard-item:hover {
          background: var(--bg-page);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .rank-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          font-weight: 700;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--bg-page);
          color: var(--color-terracotta);
        }

        .item-details {
          min-width: 0;
        }

        .item-name {
          margin: 0;
          font-weight: 600;
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

        .item-stats {
          text-align: right;
        }

        .revenue {
          margin: 0;
          font-weight: 600;
          font-size: 1rem;
          color: var(--color-terracotta);
        }

        .rate {
          margin: 2px 0 0;
          font-size: 0.75rem;
          color: #10b981;
          display: flex;
          align-items: center;
          justify-content: flex-end;
        }

        .loading,
        .empty {
          padding: var(--space-6) var(--space-4);
          text-align: center;
          color: var(--text-secondary);
          font-size: 0.875rem;
        }

        @media (max-width: 768px) {
          .leaderboard-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .leaderboards-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </AdminLayout>
  );
}
