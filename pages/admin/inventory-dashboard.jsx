import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import Icon from '../../components/icons';
import { formatKES } from '../../lib/formatters';

export default function InventoryDashboardPage() {
  const [inventory, setInventory] = useState({
    lowStockItems: [],
    totalValue: 0,
    itemCount: 0,
    categories: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInventory();
  }, []);

  async function fetchInventory() {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/inventory-dashboard', {
        credentials: 'same-origin',
      });
      const data = await res.json();
      setInventory(data);
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminLayout>
      <div className="inventory-dashboard">
        <div className="inventory-header">
          <div>
            <h1>Inventory Management</h1>
            <p>Monitor stock levels and product availability</p>
          </div>
          <button className="refresh-btn" onClick={fetchInventory}>
            <Icon name="refresh" size={18} /> Refresh
          </button>
        </div>

        {/* Key Metrics */}
        <section className="inventory-metrics">
          <div className="metric-card">
            <Icon name="package" size={24} />
            <div>
              <p className="metric-label">Total Items</p>
              <p className="metric-value">{inventory.itemCount}</p>
            </div>
          </div>

          <div className="metric-card">
            <Icon name="dollar" size={24} />
            <div>
              <p className="metric-label">Inventory Value</p>
              <p className="metric-value">{formatKES(inventory.totalValue)}</p>
            </div>
          </div>

          <div className="metric-card">
            <Icon name="alert" size={24} />
            <div>
              <p className="metric-label">Low Stock Items</p>
              <p className="metric-value">{inventory.lowStockItems.length}</p>
            </div>
          </div>
        </section>

        {/* Low Stock Alert */}
        {inventory.lowStockItems.length > 0 && (
          <section className="low-stock-section">
            <h2>Low Stock Alert</h2>
            <div className="low-stock-list">
              {inventory.lowStockItems.map((item, idx) => (
                <div key={idx} className="low-stock-item">
                  <div className="item-info">
                    <p className="item-name">{item.name}</p>
                    <p className="item-sku">SKU: {item.sku}</p>
                  </div>
                  <div className="item-stock">
                    <span className="stock-level">{item.quantity} units</span>
                    <span className="reorder-point">Reorder at: {item.reorderPoint}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Category Breakdown */}
        <section className="category-section">
          <h2>Stock by Category</h2>
          <div className="category-grid">
            {inventory.categories.map((cat, idx) => (
              <div key={idx} className="category-card">
                <p className="category-name">{cat.name}</p>
                <p className="category-count">{cat.itemCount} items</p>
                <p className="category-value">{formatKES(cat.value)}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <style jsx>{`
        .inventory-dashboard {
          padding: 0;
        }

        .inventory-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--space-6) var(--gutter);
          border-bottom: 1px solid var(--border-light);
        }

        .inventory-header h1 {
          margin: 0 0 var(--space-1);
          font-size: 1.75rem;
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
        }

        .inventory-metrics {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: var(--space-4);
          padding: var(--space-6) var(--gutter);
        }

        .metric-card {
          display: flex;
          gap: var(--space-3);
          padding: var(--space-4);
          background: white;
          border: 1px solid var(--border-light);
          border-radius: var(--radius-md);
        }

        .metric-card svg {
          color: var(--color-terracotta);
        }

        .metric-label {
          margin: 0;
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .metric-value {
          margin: var(--space-1) 0 0;
          font-size: 1.5rem;
          font-weight: 600;
        }

        .low-stock-section,
        .category-section {
          padding: var(--space-6) var(--gutter);
        }

        .low-stock-section h2,
        .category-section h2 {
          font-size: 1.25rem;
          margin: 0 0 var(--space-4);
        }

        .low-stock-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .low-stock-item {
          display: flex;
          justify-content: space-between;
          padding: var(--space-3);
          background: #fff3cd;
          border-left: 4px solid #ffc107;
          border-radius: var(--radius-md);
        }

        .item-name {
          margin: 0;
          font-weight: 600;
        }

        .item-sku {
          margin: 4px 0 0;
          font-size: 0.8125rem;
          color: var(--text-secondary);
        }

        .stock-level {
          display: block;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .reorder-point {
          display: block;
          font-size: 0.8125rem;
          color: var(--text-secondary);
        }

        .category-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: var(--space-4);
        }

        .category-card {
          padding: var(--space-4);
          background: white;
          border: 1px solid var(--border-light);
          border-radius: var(--radius-md);
          text-align: center;
        }

        .category-name {
          margin: 0 0 var(--space-2);
          font-weight: 600;
        }

        .category-count,
        .category-value {
          margin: var(--space-1) 0;
          font-size: 0.875rem;
          color: var(--text-secondary);
        }
      `}</style>
    </AdminLayout>
  );
}
