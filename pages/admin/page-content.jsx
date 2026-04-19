'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import AdminLayout from '../../components/admin/AdminLayout';

export default function PageContentManager() {
  const [pages, setPages] = useState({});
  const [selectedPage, setSelectedPage] = useState('about');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const { register, handleSubmit, reset, watch } = useForm();

  const pageList = [
    { id: 'about', name: 'About Page' },
    { id: 'faq', name: 'FAQ Page' },
    { id: 'privacy', name: 'Privacy Policy' },
    { id: 'terms', name: 'Terms & Conditions' },
    { id: 'shipping', name: 'Shipping Info' },
    { id: 'contact', name: 'Contact Info' }
  ];

  useEffect(() => {
    fetchContent();
  }, []);

  useEffect(() => {
    if (pages[selectedPage]) {
      reset(pages[selectedPage]);
    }
  }, [selectedPage, pages, reset]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/page-content');
      const data = await res.json();
      setPages(data);
      setSelectedPage('about');
    } catch (error) {
      console.error('Error fetching page content:', error);
      setMessage('Error loading page content');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setSaving(true);
      const updated = { ...pages, [selectedPage]: data };
      const res = await fetch('/api/admin/page-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      if (res.ok) {
        setPages(updated);
        setMessage('✓ Page content saved successfully!');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error saving page content:', error);
      setMessage('✗ Error saving page content');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <AdminLayout><div className="loading">Loading...</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="admin-container">
        <h1>📄 Page Content Editor</h1>
        <p className="subtitle">Edit all static page content without touching code</p>

        <div className="two-column">
          {/* Page Selector */}
          <div className="sidebar">
            <h3>Pages</h3>
            {pageList.map(page => (
              <button
                key={page.id}
                className={`page-button ${selectedPage === page.id ? 'active' : ''}`}
                onClick={() => setSelectedPage(page.id)}
              >
                {page.name}
              </button>
            ))}
          </div>

          {/* Content Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="form-section">
            <h2>{pageList.find(p => p.id === selectedPage)?.name}</h2>

            {message && (
              <div className={`message ${message.includes('✓') ? 'success' : 'error'}`}>
                {message}
              </div>
            )}

            {selectedPage === 'about' && (
              <>
                <div className="form-group">
                  <label>Page Title</label>
                  <input type="text" {...register('title')} className="admin-input" />
                </div>
                <div className="form-group">
                  <label>Hero Subtitle</label>
                  <input type="text" {...register('heroSubtitle')} className="admin-input" />
                </div>
                <div className="form-group">
                  <label>Hero Description</label>
                  <textarea {...register('heroDescription')} rows={3} className="admin-input" />
                </div>
              </>
            )}

            {selectedPage === 'contact' && (
              <>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" {...register('email')} className="admin-input" />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input type="text" {...register('phone')} className="admin-input" />
                </div>
                <div className="form-group">
                  <label>WhatsApp</label>
                  <input type="text" {...register('whatsapp')} className="admin-input" />
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <input type="text" {...register('address')} className="admin-input" />
                </div>
                <div className="form-group">
                  <label>Business Hours</label>
                  <input type="text" {...register('hours')} className="admin-input" />
                </div>
              </>
            )}

            {['privacy', 'terms', 'shipping'].includes(selectedPage) && (
              <>
                <div className="form-group">
                  <label>Title</label>
                  <input type="text" {...register('title')} className="admin-input" />
                </div>
                <div className="form-group">
                  <label>Content</label>
                  <textarea {...register('content')} rows={6} className="admin-input" placeholder="Enter content here..." />
                </div>
              </>
            )}

            {selectedPage === 'faq' && (
              <>
                <div className="form-group">
                  <label>Page Title</label>
                  <input type="text" {...register('title')} className="admin-input" />
                </div>
                <div className="form-group">
                  <label>Subtitle</label>
                  <input type="text" {...register('subtitle')} className="admin-input" />
                </div>
              </>
            )}

            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving...' : '💾 Save Changes'}
            </button>
          </form>
        </div>
      </div>

      <style jsx>{`
        .admin-container {
          padding: 20px;
        }

        h1 {
          margin-bottom: 8px;
          color: #0f0f0f;
        }

        .subtitle {
          color: #666;
          margin-bottom: 24px;
        }

        .two-column {
          display: grid;
          grid-template-columns: 200px 1fr;
          gap: 24px;
        }

        .sidebar {
          background: #f5f5f5;
          padding: 16px;
          border-radius: 8px;
        }

        .sidebar h3 {
          margin: 0 0 12px 0;
          font-size: 14px;
          text-transform: uppercase;
          color: #666;
        }

        .page-button {
          width: 100%;
          padding: 10px 12px;
          margin-bottom: 8px;
          border: 1px solid #ddd;
          background: white;
          cursor: pointer;
          border-radius: 4px;
          text-align: left;
          font-size: 14px;
          transition: all 0.2s;
        }

        .page-button:hover {
          background: #f9f6ee;
          border-color: #C04D29;
        }

        .page-button.active {
          background: #C04D29;
          color: white;
          border-color: #C04D29;
        }

        .form-section {
          background: white;
          padding: 20px;
          border-radius: 8px;
          border: 1px solid #ddd;
        }

        .form-section h2 {
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

        .message {
          padding: 12px;
          border-radius: 4px;
          margin-bottom: 16px;
          font-size: 14px;
        }

        .message.success {
          background: #e8f5e9;
          color: #2e7d32;
          border-left: 4px solid #4caf50;
        }

        .message.error {
          background: #ffebee;
          color: #c62828;
          border-left: 4px solid #f44336;
        }

        .btn-primary {
          background: #C04D29;
          color: white;
          padding: 10px 20px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
        }

        .btn-primary:hover:not(:disabled) {
          background: #a63f1f;
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .two-column {
            grid-template-columns: 1fr;
          }

          .sidebar {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
          }

          .page-button {
            margin-bottom: 0;
          }
        }
      `}</style>
    </AdminLayout>
  );
}
