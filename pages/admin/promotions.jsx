'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import AdminLayout from '../../components/admin/AdminLayout';

export default function PromotionsManager() {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [editingId, setEditingId] = useState(null);
  const { register, handleSubmit, reset } = useForm();

  const promotionTypes = ['banner', 'badge', 'seasonal', 'flash_sale', 'discount_code'];

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/promotions');
      const data = await res.json();
      setPromotions(data);
    } catch (error) {
      console.error('Error fetching promotions:', error);
      setMessage('Error loading promotions');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setSaving(true);
      let updated;

      if (editingId) {
        updated = promotions.map(p => p.id === editingId ? { ...p, ...data } : p);
      } else {
        const newId = Math.max(...promotions.map(p => p.id || 0)) + 1;
        updated = [...promotions, { ...data, id: newId }];
      }

      const res = await fetch('/api/admin/promotions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });

      if (res.ok) {
        setPromotions(updated);
        setMessage(`✓ Promotion ${editingId ? 'updated' : 'created'}!`);
        reset();
        setEditingId(null);
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      setMessage('✗ Error saving');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this promotion?')) {
      const updated = promotions.filter(p => p.id !== id);
      await fetch('/api/admin/promotions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      setPromotions(updated);
      setMessage('✓ Promotion deleted');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const toggleActive = async (id) => {
    const updated = promotions.map(p =>
      p.id === id ? { ...p, active: !p.active } : p
    );
    await fetch('/api/admin/promotions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    });
    setPromotions(updated);
  };

  if (loading) return <AdminLayout><div className="loading">Loading...</div></AdminLayout>;

  const activePromos = promotions.filter(p => p.active).length;

  return (
    <AdminLayout>
      <div className="admin-container">
        <h1>🎉 Promotions Manager</h1>
        <p className="subtitle">Create and manage campaigns, discounts, and banners</p>

        {message && (
          <div className={`message ${message.includes('✓') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <div className="stats">
          <div className="stat-card">
            <div className="stat-value">{activePromos}</div>
            <div className="stat-label">Active Promotions</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{promotions.length}</div>
            <div className="stat-label">Total</div>
          </div>
        </div>

        <div className="two-section">
          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="form-section">
            <h2>{editingId ? 'Edit Promotion' : 'New Promotion'}</h2>

            <div className="form-group">
              <label>Title *</label>
              <input
                type="text"
                {...register('title', { required: true })}
                className="admin-input"
                placeholder="e.g., 20% OFF GIFTS"
              />
            </div>

            <div className="form-group">
              <label>Type *</label>
              <select {...register('type', { required: true })} className="admin-input">
                <option value="">Select type</option>
                {promotionTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                {...register('description')}
                rows={2}
                className="admin-input"
                placeholder="Brief description of the promotion..."
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Start Date</label>
                <input type="date" {...register('startDate')} className="admin-input" />
              </div>
              <div className="form-group">
                <label>End Date</label>
                <input type="date" {...register('endDate')} className="admin-input" />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Discount Code</label>
                <input
                  type="text"
                  {...register('discountCode')}
                  className="admin-input"
                  placeholder="PROMO20"
                />
              </div>
              <div className="form-group">
                <label>Discount %</label>
                <input
                  type="number"
                  {...register('discountPercentage')}
                  className="admin-input"
                  placeholder="20"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>CTA Button Text</label>
                <input
                  type="text"
                  {...register('cta')}
                  className="admin-input"
                  placeholder="Shop Now"
                />
              </div>
              <div className="form-group">
                <label>CTA Link</label>
                <input
                  type="text"
                  {...register('ctaLink')}
                  className="admin-input"
                  placeholder="/shop?collection=gifts"
                />
              </div>
            </div>

            <div className="form-group">
              <label>
                <input type="checkbox" {...register('active')} /> Active now
              </label>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? 'Saving...' : editingId ? '✏️ Update' : '✚ Create'}
              </button>
              {editingId && (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    reset();
                    setEditingId(null);
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          {/* Promotions List */}
          <div className="list-section">
            <h2>Active Promotions</h2>
            <div className="promos-list">
              {promotions
                .sort((a, b) => (b.active ? 1 : 0) - (a.active ? 1 : 0))
                .map(promo => (
                  <div key={promo.id} className={`promo-card ${!promo.active ? 'inactive' : ''}`}>
                    <div className="promo-header">
                      <h3>{promo.title}</h3>
                      <span className={`type-badge type-${promo.type}`}>{promo.type}</span>
                    </div>
                    {promo.description && (
                      <p className="promo-description">{promo.description}</p>
                    )}
                    {promo.discountCode && (
                      <div className="code-display">{promo.discountCode}</div>
                    )}
                    {promo.startDate && (
                      <p className="promo-dates">
                        {promo.startDate} to {promo.endDate}
                      </p>
                    )}
                    <div className="promo-actions">
                      <button
                        onClick={() => toggleActive(promo.id)}
                        className={`btn-status ${promo.active ? 'active' : 'inactive'}`}
                      >
                        {promo.active ? '✓ Live' : '○ Paused'}
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(promo.id);
                          reset(promo);
                        }}
                        className="btn-edit"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(promo.id)}
                        className="btn-delete"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .admin-container {
          padding: 20px;
          max-width: 1400px;
          margin: 0 auto;
        }

        h1 { margin-bottom: 8px; color: #0f0f0f; }
        .subtitle { color: #666; margin-bottom: 16px; }

        .stats {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }

        .stat-card {
          background: linear-gradient(135deg, #C04D29 0%, #a63f1f 100%);
          color: white;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
        }

        .stat-value { font-size: 28px; font-weight: bold; }
        .stat-label { font-size: 12px; text-transform: uppercase; margin-top: 4px; }

        .two-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        .form-section, .list-section {
          background: white;
          padding: 20px;
          border-radius: 8px;
          border: 1px solid #ddd;
        }

        .form-section h2, .list-section h2 {
          margin-top: 0;
          color: #0f0f0f;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-group label {
          display: block;
          margin-bottom: 6px;
          font-weight: 500;
          color: #0f0f0f;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .admin-input {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }

        .admin-input:focus {
          outline: none;
          border-color: #C04D29;
          box-shadow: 0 0 0 2px rgba(192, 77, 41, 0.1);
        }

        .form-actions {
          display: flex;
          gap: 10px;
          margin-top: 20px;
        }

        .btn-primary, .btn-secondary {
          padding: 10px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
        }

        .btn-primary {
          background: #C04D29;
          color: white;
          flex: 1;
        }

        .btn-primary:hover:not(:disabled) { background: #a63f1f; }

        .btn-secondary {
          background: #f5f5f5;
          color: #0f0f0f;
          border: 1px solid #ddd;
          flex: 1;
        }

        .promos-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .promo-card {
          padding: 16px;
          border: 1px solid #ddd;
          border-radius: 4px;
          background: white;
          transition: all 0.2s;
        }

        .promo-card.inactive {
          opacity: 0.6;
        }

        .promo-card:hover {
          border-color: #C04D29;
        }

        .promo-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .promo-header h3 {
          margin: 0;
          color: #0f0f0f;
          font-size: 15px;
        }

        .type-badge {
          font-size: 11px;
          padding: 4px 8px;
          border-radius: 12px;
          background: #f5f5f5;
          text-transform: uppercase;
          font-weight: 600;
        }

        .type-banner { background: #E3F2FD; color: #1976D2; }
        .type-badge { background: #F3E5F5; color: #7B1FA2; }
        .type-seasonal { background: #E8F5E9; color: #2E7D32; }
        .type-flash_sale { background: #FFEBEE; color: #D32F2F; }

        .promo-description {
          margin: 8px 0;
          font-size: 13px;
          color: #666;
        }

        .code-display {
          background: #f5f5f5;
          padding: 8px 12px;
          border-radius: 4px;
          font-family: monospace;
          font-weight: bold;
          color: #C04D29;
          margin: 8px 0;
          text-align: center;
        }

        .promo-dates {
          margin: 8px 0;
          font-size: 12px;
          color: #999;
        }

        .promo-actions {
          display: flex;
          gap: 6px;
          margin-top: 12px;
        }

        .btn-status, .btn-edit, .btn-delete {
          padding: 6px 12px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.2s;
        }

        .btn-status.active {
          background: #e8f5e9;
          color: #2e7d32;
        }

        .btn-status.inactive {
          background: #fff3e0;
          color: #f57c00;
        }

        .btn-edit {
          background: #E3F2FD;
          color: #1976D2;
        }

        .btn-delete {
          background: #FFEBEE;
          color: #D32F2F;
        }

        .message {
          padding: 12px;
          border-radius: 4px;
          margin-bottom: 16px;
        }

        .message.success {
          background: #e8f5e9;
          color: #2e7d32;
        }

        @media (max-width: 1024px) {
          .two-section {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </AdminLayout>
  );
}
