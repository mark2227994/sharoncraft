'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { DEFAULT_WHATSAPP_TEMPLATES, type WhatsappTemplateRecord } from '@/lib/order-management';

interface AdminUser {
  id: string;
  email: string;
  name: string;
}

type TemplateResponse = {
  templates?: WhatsappTemplateRecord[];
  error?: string;
};

export default function SettingsPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(true);
  const [savingStore, setSavingStore] = useState(false);
  const [savingTemplates, setSavingTemplates] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [storeInfo, setStoreInfo] = useState({
    store_name: 'SharonCraft',
    phone: '',
    email: '',
    address: '',
  });
  const [templates, setTemplates] = useState<WhatsappTemplateRecord[]>(DEFAULT_WHATSAPP_TEMPLATES);

  useEffect(() => {
    void fetchAdmins();
    void fetchStoreInfo();
    void fetchTemplates();
  }, []);

  async function fetchAdmins() {
    setLoadingAdmins(true);
    try {
      const { data, error } = await supabase.from('admin_users').select('*').order('created_at');

      if (error) {
        throw error;
      }

      setAdmins(
        Array.isArray(data)
          ? data.map((admin: any) => ({
              id: String(admin.user_id || admin.id || ''),
              email: String(admin.email || ''),
              name: String(admin.name || admin.email || 'Admin User'),
            }))
          : [],
      );
    } catch (error) {
      setFeedback('Unable to load admin users right now.');
    } finally {
      setLoadingAdmins(false);
    }
  }

  async function fetchStoreInfo() {
    const { data } = await supabase
      .from('homepage_content')
      .select('*')
      .eq('section', 'store_info')
      .single();

    if (data?.content) {
      setStoreInfo((currentStore) => ({
        ...currentStore,
        ...data.content,
      }));
    }
  }

  async function fetchTemplates() {
    try {
      const response = await fetch('/api/admin/whatsapp-templates');
      const data = (await response.json()) as TemplateResponse;

      if (response.ok && Array.isArray(data.templates) && data.templates.length > 0) {
        setTemplates(data.templates);
      }
    } catch {
      setFeedback('WhatsApp templates are using the default set until the table is available.');
    }
  }

  async function deleteAdmin(id: string) {
    if (!confirm('Remove this admin user?')) return;

    const { error } = await supabase.from('admin_users').delete().eq('id', id);

    if (!error) {
      setAdmins((currentAdmins) => currentAdmins.filter((admin) => admin.id !== id));
    }
  }

  async function updateStoreInfo() {
    setSavingStore(true);
    setFeedback('');

    try {
      const { error } = await supabase.from('homepage_content').upsert({
        section: 'store_info',
        content: storeInfo,
      });

      if (error) {
        throw error;
      }

      setFeedback('Store information updated.');
    } catch {
      setFeedback('Unable to update store information.');
    } finally {
      setSavingStore(false);
    }
  }

  async function saveTemplates() {
    setSavingTemplates(true);
    setFeedback('');

    try {
      const response = await fetch('/api/admin/whatsapp-templates', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ templates }),
      });

      const data = (await response.json()) as TemplateResponse;
      if (!response.ok) {
        throw new Error(data.error || 'Unable to save templates.');
      }

      if (Array.isArray(data.templates)) {
        setTemplates(data.templates);
      }

      setFeedback('WhatsApp templates saved.');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Unable to save templates.');
    } finally {
      setSavingTemplates(false);
    }
  }

  function updateTemplate(templateKey: string, partial: Partial<WhatsappTemplateRecord>) {
    setTemplates((currentTemplates) =>
      currentTemplates.map((template) =>
        template.template_key === templateKey
          ? {
              ...template,
              ...partial,
            }
          : template,
      ),
    );
  }

  return (
    <div className="space-y-8" style={{ maxWidth: '1040px', color: '#1c1c1c' }}>
      <div>
        <p className="text-[10px] uppercase" style={{ letterSpacing: '3px', color: '#8B5E3C', fontWeight: 400 }}>
          Admin Settings
        </p>
        <h2 className="text-[22px]" style={{ fontWeight: 300 }}>
          Store + WhatsApp Templates
        </h2>
      </div>

      {feedback ? (
        <div className="border px-4 py-3 text-xs" style={{ borderColor: '#ece7df', backgroundColor: '#fff', fontWeight: 400 }}>
          {feedback}
        </div>
      ) : null}

      <div className="grid gap-8 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <section className="space-y-8">
          <div className="border bg-white p-6" style={{ borderColor: '#ece7df' }}>
            <h3 className="text-sm" style={{ fontWeight: 500 }}>
              Store Information
            </h3>
            <div className="mt-4 space-y-3">
              {[
                { key: 'store_name', label: 'Store Name', type: 'text' },
                { key: 'phone', label: 'Phone', type: 'text' },
                { key: 'email', label: 'Email', type: 'email' },
              ].map((field) => (
                <label key={field.key} className="grid gap-1 text-[10px] uppercase" style={{ letterSpacing: '2px', color: '#8c8377', fontWeight: 400 }}>
                  <span>{field.label}</span>
                  <input
                    type={field.type}
                    value={storeInfo[field.key as keyof typeof storeInfo]}
                    onChange={(event) =>
                      setStoreInfo((currentStore) => ({
                        ...currentStore,
                        [field.key]: event.target.value,
                      }))
                    }
                    className="border px-3 py-3 text-xs"
                    style={{ borderColor: '#e0d8cf', borderRadius: '2px', fontWeight: 400 }}
                  />
                </label>
              ))}

              <label className="grid gap-1 text-[10px] uppercase" style={{ letterSpacing: '2px', color: '#8c8377', fontWeight: 400 }}>
                <span>Address</span>
                <textarea
                  value={storeInfo.address}
                  onChange={(event) =>
                    setStoreInfo((currentStore) => ({
                      ...currentStore,
                      address: event.target.value,
                    }))
                  }
                  rows={3}
                  className="border px-3 py-3 text-xs"
                  style={{ borderColor: '#e0d8cf', borderRadius: '2px', fontWeight: 400 }}
                />
              </label>

              <button
                type="button"
                onClick={updateStoreInfo}
                disabled={savingStore}
                className="px-4 py-3 text-[10px] uppercase"
                style={{
                  backgroundColor: '#1c1c1c',
                  color: '#fff',
                  borderRadius: '2px',
                  letterSpacing: '2px',
                  fontWeight: 400,
                }}
              >
                {savingStore ? 'Saving...' : 'Save Store Info'}
              </button>
            </div>
          </div>

          <div className="border bg-white p-6" style={{ borderColor: '#ece7df' }}>
            <h3 className="text-sm" style={{ fontWeight: 500 }}>
              Admin Users
            </h3>
            <p className="mt-2 text-xs" style={{ color: '#777', fontWeight: 400 }}>
              Admin access is still managed in Supabase Auth. This list shows who is currently allowed into the panel.
            </p>

            <div className="mt-4 space-y-2">
              {loadingAdmins ? (
                <div className="text-xs" style={{ color: '#777', fontWeight: 400 }}>
                  Loading admins...
                </div>
              ) : admins.length === 0 ? (
                <div className="text-xs" style={{ color: '#777', fontWeight: 400 }}>
                  No admin users configured.
                </div>
              ) : (
                admins.map((admin) => (
                  <div
                    key={admin.id}
                    className="flex items-center justify-between gap-3 border px-3 py-3"
                    style={{ borderColor: '#f0ebe5' }}
                  >
                    <div>
                      <p className="text-sm" style={{ fontWeight: 400 }}>
                        {admin.name}
                      </p>
                      <p className="text-xs" style={{ color: '#777', fontWeight: 400 }}>
                        {admin.email}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteAdmin(admin.id)}
                      className="text-[10px] uppercase"
                      style={{ letterSpacing: '2px', color: '#C0392B', fontWeight: 400 }}
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        <section className="border bg-white p-6" style={{ borderColor: '#ece7df' }}>
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h3 className="text-sm" style={{ fontWeight: 500 }}>
                WhatsApp Templates
              </h3>
              <p className="mt-1 text-xs" style={{ color: '#777', fontWeight: 400 }}>
                These templates power the order-status messages from the orders dashboard.
              </p>
            </div>
            <button
              type="button"
              onClick={saveTemplates}
              disabled={savingTemplates}
              className="px-4 py-3 text-[10px] uppercase"
              style={{
                backgroundColor: '#1c1c1c',
                color: '#fff',
                borderRadius: '2px',
                letterSpacing: '2px',
                fontWeight: 400,
              }}
            >
              {savingTemplates ? 'Saving...' : 'Save Templates'}
            </button>
          </div>

          <div className="mt-5 space-y-4">
            {templates.map((template) => (
              <div key={template.template_key} className="border p-4" style={{ borderColor: '#f0ebe5' }}>
                <div className="flex flex-col gap-3">
                  <label className="grid gap-1 text-[10px] uppercase" style={{ letterSpacing: '2px', color: '#8c8377', fontWeight: 400 }}>
                    <span>Template Name</span>
                    <input
                      type="text"
                      value={template.name}
                      onChange={(event) => updateTemplate(template.template_key, { name: event.target.value })}
                      className="border px-3 py-3 text-xs"
                      style={{ borderColor: '#e0d8cf', borderRadius: '2px', fontWeight: 400 }}
                    />
                  </label>

                  <label className="grid gap-1 text-[10px] uppercase" style={{ letterSpacing: '2px', color: '#8c8377', fontWeight: 400 }}>
                    <span>Description</span>
                    <input
                      type="text"
                      value={template.description}
                      onChange={(event) => updateTemplate(template.template_key, { description: event.target.value })}
                      className="border px-3 py-3 text-xs"
                      style={{ borderColor: '#e0d8cf', borderRadius: '2px', fontWeight: 400 }}
                    />
                  </label>

                  <label className="grid gap-1 text-[10px] uppercase" style={{ letterSpacing: '2px', color: '#8c8377', fontWeight: 400 }}>
                    <span>Message Body</span>
                    <textarea
                      value={template.body}
                      onChange={(event) => updateTemplate(template.template_key, { body: event.target.value })}
                      rows={10}
                      className="border px-3 py-3 text-xs"
                      style={{ borderColor: '#e0d8cf', borderRadius: '2px', fontWeight: 400, whiteSpace: 'pre-wrap' }}
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
