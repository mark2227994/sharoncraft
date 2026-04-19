'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import AdminLayout from '../../components/admin/AdminLayout';

export default function EmailTemplatesManager() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [editingId, setEditingId] = useState(null);
  const { register, handleSubmit, reset } = useForm();

  const emailTypes = ['order', 'shipping', 'review', 'newsletter', 'testimonial', 'welcome'];

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/email-templates');
      const data = await res.json();
      setTemplates(data);
    } catch (error) {
      console.error('Error fetching templates:', error);
      setMessage('Error loading templates');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setSaving(true);
      let updated;

      if (editingId) {
        updated = templates.map(t => t.id === editingId ? { ...t, ...data } : t);
      } else {
        const newId = Math.max(...templates.map(t => t.id || 0)) + 1;
        updated = [...templates, { ...data, id: newId, variables: data.variables?.split(',').map(v => v.trim()) || [] }];
      }

      const res = await fetch('/api/admin/email-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });

      if (res.ok) {
        setTemplates(updated);
        setMessage(`✓ Template ${editingId ? 'updated' : 'created'}!`);
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
    if (confirm('Delete this template?')) {
      const updated = templates.filter(t => t.id !== id);
      await fetch('/api/admin/email-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      setTemplates(updated);
      setMessage('✓ Template deleted');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  if (loading) return <AdminLayout><div className="loading">Loading...</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="admin-container">
        <h1>✉️ Email Templates Manager</h1>
        <p className="subtitle">Create and manage email templates for customer communications</p>

        {message && (
          <div className={`message ${message.includes('✓') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <div className="two-section">
          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="form-section">
            <h2>{editingId ? 'Edit Template' : 'New Template'}</h2>

            <div className="form-group">
              <label>Template Name *</label>
              <input
                type="text"
                {...register('name', { required: true })}
                className="admin-input"
                placeholder="e.g., Order Confirmation"
              />
            </div>

            <div className="form-group">
              <label>Email Type *</label>
              <select {...register('type', { required: true })} className="admin-input">
                <option value="">Select type</option>
                {emailTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Subject Line *</label>
              <input
                type="text"
                {...register('subject', { required: true })}
                className="admin-input"
                placeholder="e.g., Order Confirmed: {{orderId}}"
              />
              <small>Use {{variable}} for personalization</small>
            </div>

            <div className="form-group">
              <label>Email Body *</label>
              <textarea
                {...register('body', { required: true })}
                rows={8}
                className="admin-input"
                placeholder="Write email content here..."
              />
              <small>Use {{variable}} for dynamic content</small>
            </div>

            <div className="form-group">
              <label>Available Variables (comma-separated)</label>
              <input
                type="text"
                {...register('variables')}
                className="admin-input"
                placeholder="customerName, orderId, totalAmount"
              />
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

          {/* Templates List */}
          <div className="list-section">
            <h2>Email Templates ({templates.length})</h2>
            <div className="templates-list">
              {templates.map(template => (
                <div key={template.id} className="template-card">
                  <div className="template-header">
                    <h3>{template.name}</h3>
                    <span className="type-badge">{template.type}</span>
                  </div>
                  <p className="template-subject">
                    <strong>Subject:</strong> {template.subject}
                  </p>
                  <p className="template-preview">{template.body.substring(0, 80)}...</p>
                  {template.variables && template.variables.length > 0 && (
                    <div className="template-vars">
                      <strong>Variables:</strong>
                      <div className="vars">
                        {Array.isArray(template.variables) 
                          ? template.variables.map((v, i) => (
                              <span key={i} className="var-tag">{{v}}</span>
                            ))
                          : null
                        }
                      </div>
                    </div>
                  )}
                  <div className="template-actions">
                    <button
                      onClick={() => {
                        setEditingId(template.id);
                        reset({
                          ...template,
                          variables: Array.isArray(template.variables) 
                            ? template.variables.join(', ')
                            : template.variables
                        });
                      }}
                      className="btn-edit"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(template.id)}
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

        {/* Variables Reference */}
        <div className="reference">
          <h3>📖 Common Variables Reference</h3>
          <div className="reference-grid">
            <div className="ref-item">
              <code>{{customerName}}</code>
              <p>Customer's first name</p>
            </div>
            <div className="ref-item">
              <code>{{orderId}}</code>
              <p>Order ID number</p>
            </div>
            <div className="ref-item">
              <code>{{totalAmount}}</code>
              <p>Order total in KES</p>
            </div>
            <div className="ref-item">
              <code>{{trackingNumber}}</code>
              <p>Shipment tracking number</p>
            </div>
            <div className="ref-item">
              <code>{{deliveryDate}}</code>
              <p>Estimated delivery date</p>
            </div>
            <div className="ref-item">
              <code>{{productName}}</code>
              <p>Name of product ordered</p>
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
          margin-bottom: 24px;
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

        .templates-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .template-card {
          padding: 16px;
          border: 1px solid #ddd;
          border-radius: 4px;
          background: white;
          transition: all 0.2s;
        }

        .template-card:hover {
          border-color: #C04D29;
          box-shadow: 0 2px 8px rgba(192, 77, 41, 0.1);
        }

        .template-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .template-header h3 {
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

        .template-subject {
          margin: 8px 0;
          font-size: 13px;
          color: #666;
        }

        .template-preview {
          margin: 8px 0;
          font-size: 13px;
          color: #999;
        }

        .template-vars {
          margin: 8px 0;
          font-size: 12px;
        }

        .vars {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          margin-top: 4px;
        }

        .var-tag {
          background: #f5f5f5;
          padding: 2px 6px;
          border-radius: 3px;
          font-family: monospace;
          color: #666;
        }

        .template-actions {
          display: flex;
          gap: 8px;
          margin-top: 12px;
        }

        .btn-edit, .btn-delete {
          padding: 6px 12px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
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

        .reference {
          background: white;
          padding: 24px;
          border-radius: 8px;
          border: 1px solid #ddd;
        }

        .reference h3 {
          margin-top: 0;
          color: #0f0f0f;
        }

        .reference-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        .ref-item {
          padding: 16px;
          background: #f5f5f5;
          border-radius: 4px;
        }

        .ref-item code {
          display: block;
          background: #f9f6ee;
          padding: 8px;
          border-radius: 3px;
          font-family: monospace;
          color: #C04D29;
          margin-bottom: 8px;
          font-size: 13px;
        }

        .ref-item p {
          margin: 0;
          font-size: 13px;
          color: #666;
        }

        @media (max-width: 1024px) {
          .two-section {
            grid-template-columns: 1fr;
          }

          .reference-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </AdminLayout>
  );
}
