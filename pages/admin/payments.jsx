import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import Icon from '../../components/icons';
import { formatKES, formatShortDate } from '../../lib/formatters';

export default function PaymentTrackingPage() {
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({
    totalPending: 0,
    totalVerified: 0,
    totalFailed: 0,
    dailyAverage: 0,
  });
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, [filter]);

  async function fetchPayments() {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/payments?status=${filter}`, {
        credentials: 'same-origin',
      });
      const data = await res.json();
      setPayments(data.payments || []);
      setStats(data.stats || {});
    } catch (error) {
      console.error('Failed to fetch payments:', error);
    } finally {
      setLoading(false);
    }
  }

  const statusColor = {
    pending: '#f59e0b',
    verified: '#10b981',
    failed: '#ef4444',
    processing: '#3b82f6',
  };

  const statusIcon = {
    pending: 'clock',
    verified: 'check',
    failed: 'close',
    processing: 'package',
  };

  return (
    <AdminLayout>
      <div className="payment-tracking-page">
        <div className="payment-header">
          <div>
            <h1>Payment Tracking</h1>
            <p>Monitor M-Pesa and transaction reconciliation</p>
          </div>
          <button className="refresh-btn" onClick={fetchPayments}>
            <Icon name="refresh" size={18} /> Refresh
          </button>
        </div>

        {/* Payment Stats */}
        <section className="payment-stats">
          <div className="stat-card stat-card--pending">
            <div className="stat-icon">
              <Icon name="clock" size={20} />
            </div>
            <div className="stat-info">
              <p className="stat-label">Pending</p>
              <p className="stat-value">{formatKES(stats.totalPending)}</p>
              <p className="stat-meta">Awaiting verification</p>
            </div>
          </div>

          <div className="stat-card stat-card--verified">
            <div className="stat-icon">
              <Icon name="check" size={20} />
            </div>
            <div className="stat-info">
              <p className="stat-label">Verified</p>
              <p className="stat-value">{formatKES(stats.totalVerified)}</p>
              <p className="stat-meta">Successfully processed</p>
            </div>
          </div>

          <div className="stat-card stat-card--failed">
            <div className="stat-icon">
              <Icon name="close" size={20} />
            </div>
            <div className="stat-info">
              <p className="stat-label">Failed</p>
              <p className="stat-value">{formatKES(stats.totalFailed)}</p>
              <p className="stat-meta">Needs follow-up</p>
            </div>
          </div>

          <div className="stat-card stat-card--average">
            <div className="stat-icon">
              <Icon name="chart" size={20} />
            </div>
            <div className="stat-info">
              <p className="stat-label">Daily Average</p>
              <p className="stat-value">{formatKES(stats.dailyAverage)}</p>
              <p className="stat-meta">30-day average</p>
            </div>
          </div>
        </section>

        {/* Filter Tabs */}
        <section className="payment-filters">
          {['all', 'pending', 'verified', 'failed'].map((status) => (
            <button
              key={status}
              className={`filter-tab ${filter === status ? 'active' : ''}`}
              onClick={() => setFilter(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </section>

        {/* Payment Table */}
        <section className="payment-table-section">
          <table className="payment-table">
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th>Phone</th>
                <th>Order ID</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.length > 0 ? (
                payments.map((payment) => (
                  <tr key={payment.id} className={`payment-row payment-row--${payment.status}`}>
                    <td className="transaction-id">
                      <code>{payment.transactionId || payment.id}</code>
                    </td>
                    <td className="amount">{formatKES(payment.amount)}</td>
                    <td className="status">
                      <span
                        className="status-badge"
                        style={{ backgroundColor: statusColor[payment.status] }}
                      >
                        <Icon name={statusIcon[payment.status]} size={14} />
                        {payment.status}
                      </span>
                    </td>
                    <td className="date">{formatShortDate(payment.timestamp)}</td>
                    <td className="phone">{payment.phone || '-'}</td>
                    <td className="order-id">{payment.orderId || '-'}</td>
                    <td className="actions">
                      {payment.status === 'pending' && (
                        <button className="action-btn action-btn--verify">
                          Verify
                        </button>
                      )}
                      {payment.status === 'failed' && (
                        <button className="action-btn action-btn--retry">
                          Retry
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="empty-state">
                    No {filter === 'all' ? 'payments' : filter + ' payments'} found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </div>

      <style jsx>{`
        .payment-tracking-page {
          padding: 0;
        }

        .payment-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--space-6) var(--gutter);
          border-bottom: 1px solid var(--border-light);
          gap: var(--space-4);
        }

        .payment-header h1 {
          margin: 0 0 var(--space-1);
          font-size: 1.75rem;
          color: var(--text-primary);
        }

        .payment-header p {
          margin: 0;
          color: var(--text-secondary);
        }

        .refresh-btn {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: 10px 16px;
          background: var(--color-terracotta);
          color: white;
          border: none;
          border-radius: var(--radius-md);
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
        }

        .refresh-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(212, 165, 116, 0.2);
        }

        .payment-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--space-4);
          padding: var(--space-6) var(--gutter);
        }

        .stat-card {
          display: flex;
          gap: var(--space-3);
          padding: var(--space-4);
          background: white;
          border: 1px solid var(--border-light);
          border-radius: var(--radius-md);
        }

        .stat-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          border-radius: var(--radius-md);
          flex-shrink: 0;
        }

        .stat-card--pending .stat-icon {
          background: #fef3c7;
          color: #f59e0b;
        }

        .stat-card--verified .stat-icon {
          background: #d1fae5;
          color: #10b981;
        }

        .stat-card--failed .stat-icon {
          background: #fee2e2;
          color: #ef4444;
        }

        .stat-card--average .stat-icon {
          background: #dbeafe;
          color: #3b82f6;
        }

        .stat-info {
          flex: 1;
        }

        .stat-label {
          margin: 0;
          font-size: 0.8125rem;
          color: var(--text-secondary);
          text-transform: uppercase;
          font-weight: 600;
        }

        .stat-value {
          margin: 6px 0 4px;
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .stat-meta {
          margin: 0;
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .payment-filters {
          display: flex;
          gap: var(--space-2);
          padding: 0 var(--gutter) var(--space-4);
          border-bottom: 1px solid var(--border-light);
        }

        .filter-tab {
          padding: 8px 16px;
          background: transparent;
          border: 2px solid transparent;
          color: var(--text-secondary);
          border-radius: var(--radius-md);
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
        }

        .filter-tab:hover {
          color: var(--text-primary);
          border-color: var(--border-light);
        }

        .filter-tab.active {
          color: var(--color-terracotta);
          border-color: var(--color-terracotta);
          background: rgba(212, 165, 116, 0.08);
        }

        .payment-table-section {
          padding: var(--space-6) var(--gutter);
          overflow-x: auto;
        }

        .payment-table {
          width: 100%;
          border-collapse: collapse;
          background: white;
          border: 1px solid var(--border-light);
          border-radius: var(--radius-md);
          overflow: hidden;
        }

        .payment-table thead {
          background: var(--bg-card);
          border-bottom: 2px solid var(--border-light);
        }

        .payment-table th {
          padding: 12px 16px;
          text-align: left;
          font-weight: 600;
          color: var(--text-primary);
          font-size: 0.8125rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .payment-table td {
          padding: 12px 16px;
          border-bottom: 1px solid var(--border-light);
          color: var(--text-primary);
        }

        .payment-row:last-child td {
          border-bottom: none;
        }

        .transaction-id code {
          background: var(--bg-card);
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.75rem;
          font-family: monospace;
          color: var(--color-terracotta);
        }

        .amount {
          font-weight: 600;
          color: var(--text-primary);
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          border-radius: 12px;
          color: white;
          font-size: 0.8125rem;
          font-weight: 500;
        }

        .empty-state {
          text-align: center;
          padding: 40px 16px !important;
          color: var(--text-secondary);
        }

        .actions {
          text-align: right;
        }

        .action-btn {
          padding: 6px 12px;
          background: var(--bg-card);
          border: 1px solid var(--border-light);
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.75rem;
          font-weight: 500;
          transition: all 0.2s;
        }

        .action-btn:hover {
          background: var(--color-terracotta);
          color: white;
          border-color: var(--color-terracotta);
        }

        @media (max-width: 768px) {
          .payment-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .payment-table {
            font-size: 0.875rem;
          }

          .payment-table th,
          .payment-table td {
            padding: 8px;
          }
        }
      `}</style>
    </AdminLayout>
  );
}
