import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';

export default function FollowUpDashboard() {
  const [followUps, setFollowUps] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAction, setSelectedAction] = useState(null);

  useEffect(() => {
    loadFollowUps();
    // Refresh every 5 minutes
    const interval = setInterval(loadFollowUps, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const loadFollowUps = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch('/api/admin/follow-up-dashboard');
      if (!res.ok) throw new Error('Failed to load follow-ups');
      const data = await res.json();
      setFollowUps(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openWhatsApp = (link) => {
    if (link) window.open(link, '_blank');
  };

  const actionConfig = {
    'follow-up': {
      title: '⏰ Follow-up Needed',
      description: 'Customers with no response in 24+ hours',
      color: '#ff6b6b',
      icon: '📱',
      action: 'Send Follow-up Message'
    },
    'collect-deposit': {
      title: '💰 Pending Deposits',
      description: 'Awaiting deposit payment for custom orders',
      color: '#ffa500',
      icon: '💳',
      action: 'Request Payment'
    },
    'ship-delivery': {
      title: '📦 Ready to Ship',
      description: 'Orders paid and ready to send out',
      color: '#4ecdc4',
      icon: '🚚',
      action: 'Send Delivery Details'
    },
    'deliver-product': {
      title: '🎁 Ready to Deliver',
      description: 'Completed custom orders awaiting delivery',
      color: '#95e1d3',
      icon: '✨',
      action: 'Send Delivery Info'
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="container">
          <p className="loading">Loading follow-ups...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="container">
          <div className="errorBanner">{error}</div>
          <button onClick={loadFollowUps} className="retryBtn">
            Retry
          </button>
        </div>
      </AdminLayout>
    );
  }

  if (!followUps) {
    return (
      <AdminLayout>
        <div className="container">
          <p>No follow-ups data</p>
        </div>
      </AdminLayout>
    );
  }

  const { summary, groupedByAction } = followUps;

  return (
    <AdminLayout>
      <div className="container">
        <div className="header">
          <h1>📊 Follow-up Dashboard</h1>
          <p>Quick view of customers needing attention</p>
        </div>

        {/* Summary Cards */}
        <div className="summaryGrid">
          <div className="summaryCard red">
            <div className="summaryNumber">{summary.noResponse}</div>
            <div className="summaryLabel">No Response</div>
            <div className="summaryDesc">24+ hours</div>
          </div>
          <div className="summaryCard orange">
            <div className="summaryNumber">{summary.pendingDeposits}</div>
            <div className="summaryLabel">Pending Deposits</div>
            <div className="summaryDesc">Waiting payment</div>
          </div>
          <div className="summaryCard teal">
            <div className="summaryNumber">{summary.readyToShip}</div>
            <div className="summaryLabel">Ready to Ship</div>
            <div className="summaryDesc">Paid orders</div>
          </div>
          <div className="summaryCard mint">
            <div className="summaryNumber">{summary.readyToDeliver}</div>
            <div className="summaryLabel">Ready to Deliver</div>
            <div className="summaryDesc">Completed custom</div>
          </div>
        </div>

        {/* Action Groups */}
        <div className="actionGroups">
          {['follow-up', 'collect-deposit', 'ship-delivery', 'deliver-product'].map(actionType => {
            const config = actionConfig[actionType];
            const items = groupedByAction[actionType] || [];
            const isSelected = selectedAction === actionType;

            return (
              <div key={actionType} className="actionGroup">
                <div
                  className={`groupHeader ${isSelected ? 'active' : ''}`}
                  onClick={() => setSelectedAction(isSelected ? null : actionType)}
                  style={{ borderLeftColor: config.color }}
                >
                  <div className="headerInfo">
                    <h2>{config.title}</h2>
                    <p>{config.description}</p>
                  </div>
                  <div className="headerCount">
                    <span className="count">{items.length}</span>
                    <span className="arrow">{isSelected ? '▼' : '▶'}</span>
                  </div>
                </div>

                {isSelected && items.length > 0 && (
                  <div className="itemsList">
                    {items.map((item, idx) => (
                      <div key={idx} className="followUpItem">
                        <div className="itemHeader">
                          <div className="itemTitle">
                            <span className="icon">{config.icon}</span>
                            <span className="name">{item.customerName}</span>
                            <span className="priority" style={{ 
                              background: item.priority === 'high' ? '#ff6b6b' : '#ffa500' 
                            }}>
                              {item.priority.toUpperCase()}
                            </span>
                          </div>
                          <div className="itemMeta">
                            <span className="phone">{item.phone}</span>
                            <span className="time">
                              {actionType === 'follow-up' ? `${item.hoursSince}h ago` : 
                               actionType === 'collect-deposit' ? `${item.daysSince}d ago` :
                               `${item.daysSinceOrder}d`}
                            </span>
                          </div>
                        </div>

                        <div className="itemDetails">
                          <div className="detailRow">
                            <span className="label">Order:</span>
                            <span className="value">{item.orderReference}</span>
                          </div>
                          
                          {item.depositAmount && (
                            <div className="detailRow">
                              <span className="label">Deposit:</span>
                              <span className="value">KES {item.depositAmount.toLocaleString()}</span>
                            </div>
                          )}
                          
                          {item.orderTotal && (
                            <div className="detailRow">
                              <span className="label">Total:</span>
                              <span className="value">KES {item.orderTotal.toLocaleString()}</span>
                            </div>
                          )}

                          {item.estimatedCompletion && (
                            <div className="detailRow">
                              <span className="label">Est. Ready:</span>
                              <span className="value">
                                {new Date(item.estimatedCompletion).toLocaleDateString()}
                              </span>
                            </div>
                          )}

                          <div className="detailRow message">
                            <span className="messageText">{item.message}</span>
                          </div>
                        </div>

                        <button
                          className="whatsappBtn"
                          onClick={() => openWhatsApp(item.whatsappLink)}
                        >
                          💬 {config.action}
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {isSelected && items.length === 0 && (
                  <div className="emptyState">
                    <p>✨ No {config.title.toLowerCase()} needed!</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {summary.total === 0 && (
          <div className="allClear">
            <h2>✨ All Clear!</h2>
            <p>No follow-ups needed right now. Great job!</p>
          </div>
        )}

        <div className="footer">
          <button onClick={loadFollowUps} className="refreshBtn">
            🔄 Refresh
          </button>
          <span className="timestamp">
            Last updated: {new Date(followUps.timestamp).toLocaleTimeString()}
          </span>
        </div>
      </div>

      <style jsx>{`
        .container {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .header {
          margin-bottom: 30px;
        }

        .header h1 {
          font-size: 28px;
          margin: 0 0 8px 0;
          color: #333;
        }

        .header p {
          color: #666;
          margin: 0;
        }

        .errorBanner {
          background: #fee;
          border: 1px solid #fcc;
          color: #c33;
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .retryBtn, .refreshBtn {
          padding: 10px 16px;
          background: #8B4513;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          transition: background 0.2s;
        }

        .retryBtn:hover, .refreshBtn:hover {
          background: #6b3410;
        }

        .loading {
          text-align: center;
          color: #999;
          padding: 40px;
        }

        /* Summary Cards */
        .summaryGrid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 16px;
          margin-bottom: 40px;
        }

        .summaryCard {
          padding: 20px;
          border-radius: 8px;
          color: white;
          text-align: center;
        }

        .summaryCard.red {
          background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
        }

        .summaryCard.orange {
          background: linear-gradient(135deg, #ffa500 0%, #ff8c00 100%);
        }

        .summaryCard.teal {
          background: linear-gradient(135deg, #4ecdc4 0%, #44b0aa 100%);
        }

        .summaryCard.mint {
          background: linear-gradient(135deg, #95e1d3 0%, #78d4c6 100%);
          color: #333;
        }

        .summaryNumber {
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .summaryLabel {
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 2px;
        }

        .summaryDesc {
          font-size: 12px;
          opacity: 0.9;
        }

        /* Action Groups */
        .actionGroups {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 30px;
        }

        .actionGroup {
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          overflow: hidden;
        }

        .groupHeader {
          padding: 16px;
          border-left: 4px solid #999;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #f9f9f9;
          transition: all 0.2s;
        }

        .groupHeader:hover {
          background: #f0f0f0;
        }

        .groupHeader.active {
          background: #f5f0eb;
        }

        .headerInfo {
          flex: 1;
        }

        .groupHeader h2 {
          font-size: 16px;
          margin: 0 0 4px 0;
          color: #333;
        }

        .groupHeader p {
          font-size: 12px;
          color: #999;
          margin: 0;
        }

        .headerCount {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .count {
          background: rgba(0, 0, 0, 0.1);
          padding: 4px 8px;
          border-radius: 4px;
          font-weight: 600;
          font-size: 14px;
        }

        .arrow {
          font-size: 12px;
          transition: transform 0.2s;
        }

        .groupHeader.active .arrow {
          transform: rotate(90deg);
        }

        /* Items List */
        .itemsList {
          padding: 12px;
          background: #fafafa;
        }

        .followUpItem {
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          padding: 12px;
          margin-bottom: 12px;
          transition: all 0.2s;
        }

        .followUpItem:hover {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .followUpItem:last-child {
          margin-bottom: 0;
        }

        .itemHeader {
          margin-bottom: 8px;
        }

        .itemTitle {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 6px;
        }

        .icon {
          font-size: 16px;
        }

        .name {
          font-weight: 600;
          color: #333;
          flex: 1;
        }

        .priority {
          font-size: 10px;
          padding: 2px 6px;
          border-radius: 3px;
          color: white;
          font-weight: 600;
        }

        .itemMeta {
          display: flex;
          gap: 12px;
          font-size: 12px;
          color: #999;
        }

        .phone {
          font-weight: 500;
          color: #666;
        }

        .time {
          font-style: italic;
        }

        /* Details */
        .itemDetails {
          margin: 8px 0;
          padding: 8px 0;
          border-top: 1px solid #f0f0f0;
          border-bottom: 1px solid #f0f0f0;
        }

        .detailRow {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          padding: 4px 0;
        }

        .label {
          color: #999;
          font-weight: 500;
        }

        .value {
          color: #333;
          font-weight: 600;
        }

        .detailRow.message {
          margin-top: 8px;
          padding-top: 8px;
          border-top: 1px solid #f0f0f0;
        }

        .messageText {
          background: #fff3cd;
          padding: 6px 8px;
          border-radius: 4px;
          display: inline-block;
          font-size: 12px;
          color: #856404;
          font-weight: 500;
        }

        /* Buttons */
        .whatsappBtn {
          width: 100%;
          padding: 8px;
          background: #25d366;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
          margin-top: 8px;
        }

        .whatsappBtn:hover {
          background: #20ba5c;
        }

        .emptyState {
          padding: 20px;
          text-align: center;
          color: #999;
          font-size: 14px;
        }

        /* Footer */
        .footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          background: #f9f9f9;
          border-radius: 8px;
          border: 1px solid #e0e0e0;
        }

        .timestamp {
          font-size: 12px;
          color: #999;
        }

        .allClear {
          text-align: center;
          padding: 40px;
          background: #f0f9f7;
          border: 2px solid #4ecdc4;
          border-radius: 8px;
          margin: 20px 0;
        }

        .allClear h2 {
          color: #4ecdc4;
          margin: 0 0 8px 0;
        }

        .allClear p {
          color: #666;
          margin: 0;
        }

        @media (max-width: 768px) {
          .summaryGrid {
            grid-template-columns: repeat(2, 1fr);
          }

          .groupHeader {
            flex-direction: column;
            align-items: flex-start;
          }

          .headerCount {
            align-self: flex-end;
            margin-top: 8px;
          }

          .itemMeta {
            flex-direction: column;
            gap: 2px;
          }

          .footer {
            flex-direction: column;
            gap: 12px;
            text-align: center;
          }
        }
      `}</style>
    </AdminLayout>
  );
}
