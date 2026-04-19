'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import AdminLayout from '../../components/admin/AdminLayout';

export default function SiteMetadataManager() {
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    fetchMetadata();
  }, []);

  const fetchMetadata = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/site-metadata');
      const data = await res.json();
      setMetadata(data);
      reset(data);
    } catch (error) {
      console.error('Error fetching metadata:', error);
      setMessage('Error loading metadata');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setSaving(true);
      const res = await fetch('/api/admin/site-metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        setMessage('✓ Site metadata updated!');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      setMessage('✗ Error saving metadata');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !metadata) return <AdminLayout><div className="loading">Loading...</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="admin-container">
        <h1>⚙️ Site Metadata Manager</h1>
        <p className="subtitle">Manage global branding, SEO, and contact information</p>

        {message && (
          <div className={`message ${message.includes('✓') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Branding Section */}
          <div className="form-section">
            <h2>🎨 Branding</h2>
            <div className="form-row">
              <div className="form-group">
                <label>Site Title</label>
                <input
                  type="text"
                  {...register('branding.siteTitle')}
                  className="admin-input"
                />
              </div>
              <div className="form-group">
                <label>Tagline</label>
                <input
                  type="text"
                  {...register('branding.tagline')}
                  className="admin-input"
                />
              </div>
            </div>
            <div className="form-group">
              <label>Site Description</label>
              <textarea
                {...register('branding.siteDescription')}
                rows={2}
                className="admin-input"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Logo URL</label>
                <input
                  type="text"
                  {...register('branding.logoUrl')}
                  className="admin-input"
                  placeholder="https://..."
                />
              </div>
              <div className="form-group">
                <label>Favicon URL</label>
                <input
                  type="text"
                  {...register('branding.faviconUrl')}
                  className="admin-input"
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>

          {/* Colors Section */}
          <div className="form-section">
            <h2>🎨 Brand Colors</h2>
            <div className="form-row">
              <div className="form-group">
                <label>Primary Color</label>
                <div className="color-input">
                  <input
                    type="color"
                    {...register('colors.primary')}
                    className="color-picker"
                  />
                  <input
                    type="text"
                    {...register('colors.primary')}
                    className="admin-input"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Secondary Color</label>
                <div className="color-input">
                  <input
                    type="color"
                    {...register('colors.secondary')}
                    className="color-picker"
                  />
                  <input
                    type="text"
                    {...register('colors.secondary')}
                    className="admin-input"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="form-section">
            <h2>📱 Social Media</h2>
            <div className="form-row">
              <div className="form-group">
                <label>Instagram</label>
                <input
                  type="text"
                  {...register('social.instagram')}
                  className="admin-input"
                  placeholder="https://instagram.com/..."
                />
              </div>
              <div className="form-group">
                <label>TikTok</label>
                <input
                  type="text"
                  {...register('social.tiktok')}
                  className="admin-input"
                  placeholder="https://tiktok.com/..."
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Facebook</label>
                <input
                  type="text"
                  {...register('social.facebook')}
                  className="admin-input"
                  placeholder="https://facebook.com/..."
                />
              </div>
              <div className="form-group">
                <label>Twitter/X</label>
                <input
                  type="text"
                  {...register('social.twitter')}
                  className="admin-input"
                  placeholder="https://twitter.com/..."
                />
              </div>
            </div>
            <div className="form-group">
              <label>WhatsApp</label>
              <input
                type="text"
                {...register('social.whatsapp')}
                className="admin-input"
                placeholder="+254700000000"
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="form-section">
            <h2>📞 Contact Information</h2>
            <div className="form-row">
              <div className="form-group">
                <label>Support Email</label>
                <input
                  type="email"
                  {...register('contact.supportEmail')}
                  className="admin-input"
                />
              </div>
              <div className="form-group">
                <label>Business Email</label>
                <input
                  type="email"
                  {...register('contact.businessEmail')}
                  className="admin-input"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>WhatsApp Number</label>
                <input
                  type="text"
                  {...register('contact.whatsappNumber')}
                  className="admin-input"
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="text"
                  {...register('contact.phone')}
                  className="admin-input"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Address</label>
                <input
                  type="text"
                  {...register('contact.address')}
                  className="admin-input"
                />
              </div>
              <div className="form-group">
                <label>Business Hours</label>
                <input
                  type="text"
                  {...register('contact.businessHours')}
                  className="admin-input"
                  placeholder="Monday-Friday: 9AM-6PM EAT"
                />
              </div>
            </div>
          </div>

          {/* SEO Settings */}
          <div className="form-section">
            <h2>🔍 SEO & Analytics</h2>
            <div className="form-row">
              <div className="form-group">
                <label>Google Analytics ID</label>
                <input
                  type="text"
                  {...register('seo.googleAnalyticsId')}
                  className="admin-input"
                  placeholder="G-XXXXXXXXXX"
                />
              </div>
              <div className="form-group">
                <label>Sitemap URL</label>
                <input
                  type="text"
                  {...register('seo.sitemapUrl')}
                  className="admin-input"
                  placeholder="/sitemap.xml"
                />
              </div>
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Saving...' : '💾 Save Metadata'}
          </button>
        </form>
      </div>

      <style jsx>{`
        .admin-container {
          padding: 20px;
          max-width: 900px;
          margin: 0 auto;
        }

        h1 { margin-bottom: 8px; color: #0f0f0f; }
        .subtitle { color: #666; margin-bottom: 24px; }

        form {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .form-section {
          background: white;
          padding: 24px;
          border-radius: 8px;
          border: 1px solid #ddd;
        }

        .form-section h2 {
          margin: 0 0 16px 0;
          color: #0f0f0f;
          font-size: 16px;
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
          gap: 16px;
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

        .color-input {
          display: grid;
          grid-template-columns: 60px 1fr;
          gap: 10px;
          align-items: center;
        }

        .color-picker {
          width: 50px;
          height: 40px;
          border: 1px solid #ddd;
          border-radius: 4px;
          cursor: pointer;
        }

        .btn-primary {
          background: #C04D29;
          color: white;
          padding: 12px 24px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
          transition: all 0.2s;
        }

        .btn-primary:hover:not(:disabled) {
          background: #a63f1f;
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
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

        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </AdminLayout>
  );
}
