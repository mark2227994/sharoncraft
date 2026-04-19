'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import AdminLayout from '../../components/admin/AdminLayout';

export default function ArticlesManager() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [editingId, setEditingId] = useState(null);
  const { register, handleSubmit, reset, watch } = useForm();

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/articles');
      const data = await res.json();
      setArticles(data);
    } catch (error) {
      console.error('Error fetching articles:', error);
      setMessage('Error loading articles');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setSaving(true);
      let updated;

      if (editingId) {
        updated = articles.map(a => a.id === editingId ? { ...a, ...data } : a);
      } else {
        const newId = Math.max(...articles.map(a => a.id || 0)) + 1;
        updated = [...articles, {
          ...data,
          id: newId,
          createdAt: new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString().split('T')[0],
          readTime: Math.ceil(data.body.split(' ').length / 200)
        }];
      }

      const res = await fetch('/api/admin/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });

      if (res.ok) {
        setArticles(updated);
        setMessage(`✓ Article ${editingId ? 'updated' : 'created'}!`);
        reset();
        setEditingId(null);
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error saving article:', error);
      setMessage('✗ Error saving');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this article?')) {
      const updated = articles.filter(a => a.id !== id);
      await fetch('/api/admin/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      setArticles(updated);
      setMessage('✓ Article deleted');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  if (loading) return <AdminLayout><div className="loading">Loading...</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="admin-container">
        <h1>📰 Articles & Journal Manager</h1>
        <p className="subtitle">Create and manage blog posts linked to artisans & products</p>

        {message && (
          <div className={`message ${message.includes('✓') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <div className="two-section">
          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="form-section">
            <h2>{editingId ? 'Edit Article' : 'New Article'}</h2>

            <div className="form-group">
              <label>Title *</label>
              <input
                type="text"
                {...register('title', { required: true })}
                className="admin-input"
                placeholder="e.g., How to Care for Beaded Jewelry"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Author</label>
                <input
                  type="text"
                  {...register('author')}
                  className="admin-input"
                  placeholder="Artisan name or Admin"
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select {...register('category')} className="admin-input">
                  <option value="Culture">Culture</option>
                  <option value="Care">Care & Maintenance</option>
                  <option value="Artisan">Artisan Spotlight</option>
                  <option value="Tips">Tips & Guides</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Body Content *</label>
              <textarea
                {...register('body', { required: true })}
                rows={6}
                className="admin-input"
                placeholder="Write article content here..."
              />
              <small>Read time will be calculated automatically</small>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Featured Image URL</label>
                <input
                  type="text"
                  {...register('image')}
                  className="admin-input"
                  placeholder="https://..."
                />
              </div>
              <div className="form-group">
                <label>Published?</label>
                <input type="checkbox" {...register('published')} /> Publish
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? 'Saving...' : editingId ? '✏️ Update Article' : '✚ Create Article'}
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

          {/* Articles List */}
          <div className="list-section">
            <h2>Articles ({articles.filter(a => a.published).length} published)</h2>
            <div className="articles-list">
              {articles.map(article => (
                <div key={article.id} className={`article-card ${!article.published ? 'draft' : ''}`}>
                  <div className="article-header">
                    <h3>{article.title}</h3>
                    <span className={`status ${article.published ? 'published' : 'draft'}`}>
                      {article.published ? '📰 Published' : '📝 Draft'}
                    </span>
                  </div>
                  <p className="article-meta">
                    By {article.author} • {article.category} • {article.readTime} min read
                  </p>
                  <p className="article-preview">{article.body.substring(0, 100)}...</p>
                  <div className="article-actions">
                    <button
                      onClick={() => {
                        setEditingId(article.id);
                        reset(article);
                      }}
                      className="btn-edit"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(article.id)}
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
        .subtitle { color: #666; margin-bottom: 24px; }

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

        small {
          display: block;
          margin-top: 4px;
          color: #999;
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
          transition: all 0.2s;
        }

        .btn-primary {
          background: #C04D29;
          color: white;
        }

        .btn-primary:hover:not(:disabled) { background: #a63f1f; }
        .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

        .btn-secondary {
          background: #f5f5f5;
          color: #0f0f0f;
          border: 1px solid #ddd;
        }

        .btn-secondary:hover { background: #eee; }

        .articles-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .article-card {
          padding: 16px;
          border: 1px solid #ddd;
          border-radius: 4px;
          background: white;
          transition: all 0.2s;
        }

        .article-card.draft {
          background: #f9f6ee;
          opacity: 0.8;
        }

        .article-card:hover {
          border-color: #C04D29;
          box-shadow: 0 2px 8px rgba(192, 77, 41, 0.1);
        }

        .article-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 8px;
        }

        .article-header h3 {
          margin: 0;
          color: #0f0f0f;
          font-size: 15px;
        }

        .status {
          font-size: 12px;
          padding: 4px 8px;
          border-radius: 12px;
          background: #f5f5f5;
        }

        .status.published {
          background: #e8f5e9;
          color: #2e7d32;
        }

        .status.draft {
          background: #fff3e0;
          color: #f57c00;
        }

        .article-meta {
          margin: 8px 0;
          font-size: 12px;
          color: #666;
        }

        .article-preview {
          margin: 8px 0 12px 0;
          font-size: 13px;
          color: #666;
        }

        .article-actions {
          display: flex;
          gap: 8px;
        }

        .btn-edit, .btn-delete {
          padding: 6px 12px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.2s;
        }

        .btn-edit {
          background: #E3F2FD;
          color: #1976D2;
        }

        .btn-edit:hover { background: #BBDEFB; }

        .btn-delete {
          background: #FFEBEE;
          color: #D32F2F;
        }

        .btn-delete:hover { background: #FFCDD2; }

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
