'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import AdminLayout from '../../components/admin/AdminLayout';

export default function FAQManager() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [editingId, setEditingId] = useState(null);
  const { register, handleSubmit, reset } = useForm();

  const categories = ['Shipping', 'Returns', 'Products', 'Artisans', 'Orders', 'Billing'];

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/faqs');
      const data = await res.json();
      setFaqs(data);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      setMessage('Error loading FAQs');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setSaving(true);
      let updated;

      if (editingId) {
        updated = faqs.map(f => f.id === editingId ? { ...f, ...data } : f);
      } else {
        const newId = Math.max(...faqs.map(f => f.id || 0)) + 1;
        updated = [...faqs, { ...data, id: newId, views: 0 }];
      }

      const res = await fetch('/api/admin/faqs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });

      if (res.ok) {
        setFaqs(updated);
        setMessage(`✓ FAQ ${editingId ? 'updated' : 'added'}!`);
        reset();
        setEditingId(null);
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error saving FAQ:', error);
      setMessage('✗ Error saving');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this FAQ?')) {
      const updated = faqs.filter(f => f.id !== id);
      await fetch('/api/admin/faqs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      setFaqs(updated);
      setMessage('✓ FAQ deleted');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const toggleFeatured = async (id) => {
    const updated = faqs.map(f =>
      f.id === id ? { ...f, featured: !f.featured } : f
    );
    await fetch('/api/admin/faqs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    });
    setFaqs(updated);
  };

  if (loading) return <AdminLayout><div className="loading">Loading...</div></AdminLayout>;

  const sortedFaqs = [...faqs].sort((a, b) => (b.views || 0) - (a.views || 0));
  const featuredCount = faqs.filter(f => f.featured).length;

  return (
    <AdminLayout>
      <div className="admin-container">
        <h1>❓ FAQ Manager</h1>
        <p className="subtitle">Create and organize frequently asked questions</p>

        {message && (
          <div className={`message ${message.includes('✓') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <div className="stats">
          <div className="stat-card">
            <div className="stat-value">{faqs.length}</div>
            <div className="stat-label">Total FAQs</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{featuredCount}</div>
            <div className="stat-label">Featured</div>
          </div>
        </div>

        <div className="two-section">
          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="form-section">
            <h2>{editingId ? 'Edit FAQ' : 'New FAQ'}</h2>

            <div className="form-group">
              <label>Category *</label>
              <select {...register('category', { required: true })} className="admin-input">
                <option value="">Select category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Question *</label>
              <input
                type="text"
                {...register('question', { required: true })}
                className="admin-input"
                placeholder="What should customers know?"
              />
            </div>

            <div className="form-group">
              <label>Answer *</label>
              <textarea
                {...register('answer', { required: true })}
                rows={4}
                className="admin-input"
                placeholder="Provide a clear, helpful answer..."
              />
            </div>

            <div className="form-group">
              <label>Keywords (comma-separated)</label>
              <input
                type="text"
                {...register('keywords')}
                className="admin-input"
                placeholder="e.g., shipping, delivery, time"
              />
            </div>

            <div className="form-group">
              <label>
                <input type="checkbox" {...register('featured')} /> Feature on homepage
              </label>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? 'Saving...' : editingId ? '✏️ Update FAQ' : '✚ Add FAQ'}
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

          {/* FAQs List */}
          <div className="list-section">
            <h2>FAQs by Popularity</h2>
            <div className="faqs-list">
              {sortedFaqs.map(faq => (
                <div key={faq.id} className="faq-card">
                  <div className="faq-header">
                    <div>
                      <span className="category-badge">{faq.category}</span>
                      {faq.featured && <span className="featured-badge">⭐ Featured</span>}
                    </div>
                    <span className="views">{faq.views || 0} views</span>
                  </div>
                  <h3>{faq.question}</h3>
                  <p className="answer">{faq.answer}</p>
                  <div className="faq-actions">
                    <button
                      onClick={() => toggleFeatured(faq.id)}
                      className={`btn-toggle ${faq.featured ? 'active' : ''}`}
                    >
                      {faq.featured ? '⭐ Unfeature' : '☆ Feature'}
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(faq.id);
                        reset(faq);
                      }}
                      className="btn-edit"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(faq.id)}
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
        }

        .btn-primary:hover:not(:disabled) { background: #a63f1f; }
        .btn-primary:disabled { opacity: 0.6; }

        .btn-secondary {
          background: #f5f5f5;
          color: #0f0f0f;
          border: 1px solid #ddd;
        }

        .faqs-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .faq-card {
          padding: 16px;
          border: 1px solid #ddd;
          border-radius: 4px;
          background: white;
        }

        .faq-card:hover {
          border-color: #C04D29;
          box-shadow: 0 2px 8px rgba(192, 77, 41, 0.1);
        }

        .faq-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .category-badge {
          display: inline-block;
          background: #f5f5f5;
          color: #0f0f0f;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .featured-badge {
          display: inline-block;
          margin-left: 8px;
          background: #fff3e0;
          color: #f57c00;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 11px;
        }

        .views {
          font-size: 12px;
          color: #999;
        }

        .faq-card h3 {
          margin: 8px 0;
          color: #0f0f0f;
          font-size: 15px;
        }

        .answer {
          margin: 8px 0 12px 0;
          font-size: 13px;
          color: #666;
          line-height: 1.5;
        }

        .faq-actions {
          display: flex;
          gap: 8px;
        }

        .btn-toggle, .btn-edit, .btn-delete {
          padding: 6px 12px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        }

        .btn-toggle {
          background: #f5f5f5;
          color: #666;
        }

        .btn-toggle.active {
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

          .stats {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </AdminLayout>
  );
}
