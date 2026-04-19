'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import AdminLayout from '../../components/admin/AdminLayout';

export default function FooterContentManager() {
  const [footer, setFooter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    fetchFooter();
  }, []);

  const fetchFooter = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/footer-content');
      const data = await res.json();
      setFooter(data);
      reset(data);
    } catch (error) {
      console.error('Error fetching footer:', error);
      setMessage('Error loading footer');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setSaving(true);
      const res = await fetch('/api/admin/footer-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        setMessage('✓ Footer updated!');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      setMessage('✗ Error saving footer');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !footer) return <AdminLayout><div className="loading">Loading...</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="admin-container">
        <h1>🔗 Footer Content Manager</h1>
        <p className="subtitle">Manage footer links, social media, and copyright information</p>

        {message && (
          <div className={`message ${message.includes('✓') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Column 1 */}
          <div className="form-section">
            <h2>Column 1: About</h2>
            <div className="form-group">
              <label>Column Title</label>
              <input
                type="text"
                defaultValue="SharonCraft"
                className="admin-input"
                disabled
              />
            </div>

            <div className="form-group">
              <label>Bio / Description</label>
              <textarea
                {...register('column1.bio')}
                rows={3}
                className="admin-input"
                placeholder="Brief company description..."
              />
            </div>

            <div className="form-group">
              <label>Newsletter Title</label>
              <input
                type="text"
                {...register('column1.newsletter.title')}
                className="admin-input"
              />
            </div>

            <div className="form-group">
              <label>Newsletter Placeholder</label>
              <input
                type="text"
                {...register('column1.newsletter.placeholder')}
                className="admin-input"
              />
            </div>

            <div className="form-group">
              <label>Newsletter Button Text</label>
              <input
                type="text"
                {...register('column1.newsletter.buttonText')}
                className="admin-input"
              />
            </div>

            <div className="form-group">
              <label>Social Links</label>
              <div className="social-links">
                <div className="social-input">
                  <label>Instagram</label>
                  <input
                    type="text"
                    {...register('column1.socialLinks.0.url')}
                    className="admin-input"
                    placeholder="https://instagram.com/..."
                  />
                </div>
                <div className="social-input">
                  <label>TikTok</label>
                  <input
                    type="text"
                    {...register('column1.socialLinks.1.url')}
                    className="admin-input"
                    placeholder="https://tiktok.com/..."
                  />
                </div>
                <div className="social-input">
                  <label>Facebook</label>
                  <input
                    type="text"
                    {...register('column1.socialLinks.2.url')}
                    className="admin-input"
                    placeholder="https://facebook.com/..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Customer Service */}
          <div className="form-section">
            <h2>Column 2: Customer Service</h2>
            <div className="links-section">
              <h3>Links</h3>
              {[0, 1, 2, 3].map(idx => (
                <div key={idx} className="link-input">
                  <input
                    type="text"
                    {...register(`column2.links.${idx}.label`)}
                    className="admin-input"
                    placeholder="Link label"
                  />
                  <input
                    type="text"
                    {...register(`column2.links.${idx}.url`)}
                    className="admin-input"
                    placeholder="URL"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Column 3: About */}
          <div className="form-section">
            <h2>Column 3: About</h2>
            <div className="links-section">
              <h3>Links</h3>
              {[0, 1, 2, 3].map(idx => (
                <div key={idx} className="link-input">
                  <input
                    type="text"
                    {...register(`column3.links.${idx}.label`)}
                    className="admin-input"
                    placeholder="Link label"
                  />
                  <input
                    type="text"
                    {...register(`column3.links.${idx}.url`)}
                    className="admin-input"
                    placeholder="URL"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Column 4: Legal */}
          <div className="form-section">
            <h2>Column 4: Legal</h2>
            <div className="links-section">
              <h3>Links</h3>
              {[0, 1, 2, 3].map(idx => (
                <div key={idx} className="link-input">
                  <input
                    type="text"
                    {...register(`column4.links.${idx}.label`)}
                    className="admin-input"
                    placeholder="Link label"
                  />
                  <input
                    type="text"
                    {...register(`column4.links.${idx}.url`)}
                    className="admin-input"
                    placeholder="URL"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Section */}
          <div className="form-section">
            <h2>Bottom Section</h2>
            <div className="form-group">
              <label>Copyright Text</label>
              <input
                type="text"
                {...register('bottom.copyright')}
                className="admin-input"
              />
            </div>

            <div className="form-group">
              <label>Payment Methods (comma-separated)</label>
              <input
                type="text"
                {...register('bottom.paymentMethods')}
                className="admin-input"
                placeholder="Visa, Mastercard, M-Pesa, Apple Pay"
              />
            </div>

            <div className="form-group">
              <label>Trust Badges (comma-separated)</label>
              <input
                type="text"
                {...register('bottom.trustBadges')}
                className="admin-input"
                placeholder="Handmade, Fair Trade, Secure"
              />
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Saving...' : '💾 Save Footer'}
          </button>
        </form>
      </div>

      <style jsx>{`
        .admin-container {
          padding: 20px;
          max-width: 1000px;
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
        }

        .form-section h3 {
          margin: 12px 0 8px 0;
          font-size: 14px;
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

        .admin-input:disabled {
          background: #f5f5f5;
          color: #999;
        }

        .social-links {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 12px;
        }

        .social-input {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .social-input label {
          font-size: 13px;
          font-weight: 500;
        }

        .links-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .link-input {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }

        .btn-primary {
          background: #C04D29;
          color: white;
          padding: 12px 24px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
          align-self: flex-start;
        }

        .btn-primary:hover:not(:disabled) {
          background: #a63f1f;
        }

        .btn-primary:disabled {
          opacity: 0.6;
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
          .social-links {
            grid-template-columns: 1fr;
          }

          .link-input {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </AdminLayout>
  );
}
