'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import AdminLayout from '../../components/admin/AdminLayout';

export default function NavigationManager() {
  const [navigation, setNavigation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [editingLink, setEditingLink] = useState(null);
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    fetchNavigation();
  }, []);

  const fetchNavigation = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/navigation');
      const data = await res.json();
      setNavigation(data);
    } catch (error) {
      console.error('Error fetching navigation:', error);
      setMessage('Error loading navigation');
    } finally {
      setLoading(false);
    }
  };

  const handleAddLink = async (section, data) => {
    const updated = { ...navigation };
    if (section === 'header') {
      const newId = Math.max(...updated.header.map(h => h.id || 0)) + 1;
      updated.header.push({ ...data, id: newId, order: updated.header.length + 1 });
    }
    await saveNavigation(updated);
  };

  const handleDeleteLink = async (section, id) => {
    const updated = { ...navigation };
    if (section === 'header') {
      updated.header = updated.header.filter(h => h.id !== id);
    }
    await saveNavigation(updated);
  };

  const handleReorder = (section, fromIndex, toIndex) => {
    const updated = { ...navigation };
    if (section === 'header') {
      const [item] = updated.header.splice(fromIndex, 1);
      updated.header.splice(toIndex, 0, item);
      updated.header.forEach((h, idx) => h.order = idx + 1);
      saveNavigation(updated);
    }
  };

  const saveNavigation = async (data) => {
    try {
      setSaving(true);
      const res = await fetch('/api/admin/navigation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        setNavigation(data);
        setMessage('✓ Navigation saved!');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error saving navigation:', error);
      setMessage('✗ Error saving');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !navigation) return <AdminLayout><div className="loading">Loading...</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="admin-container">
        <h1>🗂️ Navigation Manager</h1>
        <p className="subtitle">Manage header and footer menus</p>

        {message && (
          <div className={`message ${message.includes('✓') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        {/* Header Navigation */}
        <div className="section">
          <h2>Header Menu</h2>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Label</th>
                <th>URL</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {navigation.header.map((link) => (
                <tr key={link.id}>
                  <td>{link.order}</td>
                  <td>{link.label}</td>
                  <td className="url">{link.url}</td>
                  <td>
                    <button
                      onClick={() => handleDeleteLink('header', link.id)}
                      className="btn-delete"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="add-form">
            <h3>Add New Link</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '10px' }}>
              <input
                type="text"
                placeholder="Label"
                id="header-label"
                className="admin-input"
              />
              <input
                type="text"
                placeholder="URL (e.g., /shop)"
                id="header-url"
                className="admin-input"
              />
              <button
                onClick={() => {
                  const label = document.getElementById('header-label').value;
                  const url = document.getElementById('header-url').value;
                  if (label && url) {
                    handleAddLink('header', { label, url });
                    document.getElementById('header-label').value = '';
                    document.getElementById('header-url').value = '';
                  }
                }}
                className="btn-primary"
              >
                Add Link
              </button>
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="section">
          <h2>Footer Columns</h2>
          {navigation.footer.map((column, idx) => (
            <div key={idx} className="footer-column">
              <h3>{column.section}</h3>
              <ul className="link-list">
                {column.items.map((item, itemIdx) => (
                  <li key={itemIdx}>
                    <a href={item.url}>{item.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <p className="note">Footer navigation is currently managed via JSON. Use the API to edit footer structure.</p>
        </div>
      </div>

      <style jsx>{`
        .admin-container {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        h1 {
          margin-bottom: 8px;
          color: #0f0f0f;
        }

        .subtitle {
          color: #666;
          margin-bottom: 24px;
        }

        .section {
          margin-bottom: 32px;
          background: white;
          padding: 20px;
          border-radius: 8px;
          border: 1px solid #ddd;
        }

        h2 {
          margin-top: 0;
          color: #0f0f0f;
          margin-bottom: 16px;
        }

        h3 {
          color: #0f0f0f;
          font-size: 14px;
          text-transform: uppercase;
          margin: 0 0 12px 0;
        }

        .admin-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 16px;
        }

        .admin-table thead tr {
          background: #f5f5f5;
          border-bottom: 2px solid #ddd;
        }

        .admin-table th {
          padding: 12px;
          text-align: left;
          font-weight: 600;
          color: #0f0f0f;
        }

        .admin-table td {
          padding: 12px;
          border-bottom: 1px solid #eee;
        }

        .admin-table tr:hover {
          background: #f9f9f9;
        }

        .url {
          color: #C04D29;
          font-family: monospace;
          font-size: 13px;
        }

        .btn-delete {
          background: #f44336;
          color: white;
          padding: 6px 12px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.2s;
        }

        .btn-delete:hover {
          background: #d32f2f;
        }

        .add-form {
          background: #f9f6ee;
          padding: 16px;
          border-radius: 4px;
          margin-top: 16px;
        }

        .admin-input {
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }

        .btn-primary {
          background: #C04D29;
          color: white;
          padding: 10px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
        }

        .btn-primary:hover {
          background: #a63f1f;
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

        .footer-column {
          margin-bottom: 24px;
        }

        .link-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .link-list li {
          padding: 8px 0;
          border-bottom: 1px solid #eee;
        }

        .link-list a {
          color: #C04D29;
          text-decoration: none;
        }

        .note {
          color: #666;
          font-size: 13px;
          margin-top: 16px;
          padding: 12px;
          background: #f5f5f5;
          border-radius: 4px;
        }
      `}</style>
    </AdminLayout>
  );
}
