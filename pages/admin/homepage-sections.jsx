'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';

export default function HomepageSectionsBuilder() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/homepage-sections');
      const data = await res.json();
      setSections(data);
    } catch (error) {
      console.error('Error fetching sections:', error);
      setMessage('Error loading sections');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id) => {
    const updated = sections.map(s =>
      s.id === id ? { ...s, enabled: !s.enabled } : s
    );
    await saveSections(updated);
  };

  const handleReorder = (fromIndex, toIndex) => {
    const updated = [...sections];
    const [item] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, item);
    updated.forEach((s, idx) => s.order = idx + 1);
    saveSections(updated);
  };

  const saveSections = async (data) => {
    try {
      setSaving(true);
      const res = await fetch('/api/admin/homepage-sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        setSections(data);
        setMessage('✓ Homepage saved!');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      setMessage('✗ Error saving');
    } finally {
      setSaving(false);
    }
  };

  const handleEditSection = (section) => {
    setEditingId(section.id);
    setFormData(section);
  };

  const handleSaveEdit = async () => {
    const updated = sections.map(s =>
      s.id === editingId ? { ...s, ...formData } : s
    );
    await saveSections(updated);
    setEditingId(null);
    setFormData({});
  };

  if (loading) return <AdminLayout><div className="loading">Loading...</div></AdminLayout>;

  const enabledCount = sections.filter(s => s.enabled).length;

  return (
    <AdminLayout>
      <div className="admin-container">
        <h1>🏠 Homepage Sections Builder</h1>
        <p className="subtitle">Compose your homepage - reorder sections, enable/disable, and edit copy</p>

        {message && (
          <div className={`message ${message.includes('✓') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <div className="header-stats">
          <div className="stat">
            <span className="stat-label">Active Sections:</span>
            <span className="stat-value">{enabledCount}/{sections.length}</span>
          </div>
        </div>

        <div className="two-section">
          {/* Edit Panel */}
          {editingId && (
            <div className="edit-panel">
              <h2>Edit Section</h2>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="admin-input"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="admin-input"
                />
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.enabled || false}
                    onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                  />
                  Enable section
                </label>
              </div>
              <div className="form-actions">
                <button onClick={handleSaveEdit} className="btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : '✓ Save'}
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Sections List */}
          <div className="sections-list">
            <h2>Homepage Sections</h2>
            <div className="list">
              {sections.map((section, idx) => (
                <div key={section.id} className={`section-item ${!section.enabled ? 'disabled' : ''}`}>
                  <div className="section-order">{section.order}</div>
                  <div className="section-info">
                    <h3>{section.name}</h3>
                    <p className="section-type">{section.type}</p>
                  </div>
                  <div className="section-controls">
                    <button
                      onClick={() => handleToggle(section.id)}
                      className={`btn-toggle ${section.enabled ? 'enabled' : 'disabled'}`}
                    >
                      {section.enabled ? '✓ On' : '✗ Off'}
                    </button>
                    <button
                      onClick={() => handleEditSection(section)}
                      className="btn-edit"
                    >
                      Edit
                    </button>
                    {idx > 0 && (
                      <button
                        onClick={() => handleReorder(idx, idx - 1)}
                        className="btn-reorder"
                        title="Move up"
                      >
                        ↑
                      </button>
                    )}
                    {idx < sections.length - 1 && (
                      <button
                        onClick={() => handleReorder(idx, idx + 1)}
                        className="btn-reorder"
                        title="Move down"
                      >
                        ↓
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Preview Info */}
        <div className="preview-info">
          <h3>Homepage Preview Order</h3>
          <ol>
            {sections
              .filter(s => s.enabled)
              .sort((a, b) => a.order - b.order)
              .map((s, idx) => (
                <li key={s.id}>{s.name}</li>
              ))}
          </ol>
        </div>
      </div>

      <style jsx>{`
        .admin-container {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        h1 { margin-bottom: 8px; color: #0f0f0f; }
        .subtitle { color: #666; margin-bottom: 16px; }

        .header-stats {
          background: white;
          padding: 16px;
          border-radius: 8px;
          border: 1px solid #ddd;
          margin-bottom: 24px;
        }

        .stat {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .stat-label { font-weight: 500; color: #0f0f0f; }
        .stat-value { font-size: 20px; font-weight: bold; color: #C04D29; }

        .two-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          margin-bottom: 24px;
        }

        .edit-panel, .sections-list {
          background: white;
          padding: 20px;
          border-radius: 8px;
          border: 1px solid #ddd;
        }

        .edit-panel h2, .sections-list h2 {
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
        }

        .btn-primary, .btn-secondary, .btn-toggle, .btn-edit, .btn-reorder {
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
          flex: 1;
        }

        .btn-primary:hover:not(:disabled) { background: #a63f1f; }

        .btn-secondary {
          background: #f5f5f5;
          color: #0f0f0f;
          border: 1px solid #ddd;
          flex: 1;
        }

        .list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .section-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: #f9f6ee;
          border-radius: 4px;
          border: 1px solid #ddd;
          transition: all 0.2s;
        }

        .section-item.disabled {
          opacity: 0.5;
        }

        .section-item:hover {
          border-color: #C04D29;
          background: white;
        }

        .section-order {
          width: 32px;
          height: 32px;
          background: #C04D29;
          color: white;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 14px;
        }

        .section-info {
          flex: 1;
        }

        .section-info h3 {
          margin: 0;
          color: #0f0f0f;
          font-size: 14px;
        }

        .section-type {
          margin: 4px 0 0 0;
          font-size: 12px;
          color: #999;
        }

        .section-controls {
          display: flex;
          gap: 6px;
        }

        .btn-toggle {
          padding: 6px 12px;
          font-size: 12px;
        }

        .btn-toggle.enabled {
          background: #e8f5e9;
          color: #2e7d32;
        }

        .btn-toggle.disabled {
          background: #ffebee;
          color: #d32f2f;
        }

        .btn-edit {
          padding: 6px 12px;
          font-size: 12px;
          background: #E3F2FD;
          color: #1976D2;
        }

        .btn-reorder {
          padding: 6px 10px;
          font-size: 12px;
          background: #f5f5f5;
          color: #0f0f0f;
        }

        .preview-info {
          background: white;
          padding: 20px;
          border-radius: 8px;
          border: 1px solid #ddd;
        }

        .preview-info h3 {
          margin-top: 0;
          color: #0f0f0f;
        }

        .preview-info ol {
          margin: 0;
          padding-left: 24px;
        }

        .preview-info li {
          padding: 4px 0;
          color: #0f0f0f;
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
