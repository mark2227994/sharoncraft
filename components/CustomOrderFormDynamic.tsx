// Example: Custom order request form
// Use this on a dedicated page for customers to request custom pieces

'use client';

import { useState } from 'react';
import { submitCustomOrderRequest } from '@/lib/supabase/public';

export default function CustomOrderForm() {
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    description: '',
    budget: '',
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const success = await submitCustomOrderRequest({
      customer_name: formData.customer_name,
      customer_phone: formData.customer_phone,
      customer_email: formData.customer_email,
      description: formData.description,
      budget: parseFloat(formData.budget),
    });

    if (success) {
      setStatus('success');
      setMessage('Thank you! We will review your request and contact you soon.');
      setFormData({
        customer_name: '',
        customer_phone: '',
        customer_email: '',
        description: '',
        budget: '',
      });
    } else {
      setStatus('error');
      setMessage('Failed to submit request. Please try again.');
    }

    setLoading(false);
    setTimeout(() => setStatus('idle'), 5000);
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Full Name</label>
        <input
          type="text"
          value={formData.customer_name}
          onChange={(e) =>
            setFormData({ ...formData, customer_name: e.target.value })
          }
          required
          disabled={loading}
          className="w-full px-4 py-2 border border-gray-300 rounded"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Phone</label>
          <input
            type="tel"
            value={formData.customer_phone}
            onChange={(e) =>
              setFormData({ ...formData, customer_phone: e.target.value })
            }
            required
            disabled={loading}
            className="w-full px-4 py-2 border border-gray-300 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={formData.customer_email}
            onChange={(e) =>
              setFormData({ ...formData, customer_email: e.target.value })
            }
            required
            disabled={loading}
            className="w-full px-4 py-2 border border-gray-300 rounded"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Describe Your Custom Piece
        </label>
        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          required
          disabled={loading}
          rows={5}
          className="w-full px-4 py-2 border border-gray-300 rounded"
          placeholder="Tell us about the custom piece you'd like..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Budget (KES)</label>
        <input
          type="number"
          value={formData.budget}
          onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
          required
          disabled={loading}
          className="w-full px-4 py-2 border border-gray-300 rounded"
          placeholder="0"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full px-6 py-3 bg-black text-white rounded font-medium disabled:opacity-50"
      >
        {loading ? 'Submitting...' : 'Submit Request'}
      </button>

      {status !== 'idle' && (
        <div
          className={`p-4 rounded text-sm ${
            status === 'success'
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {message}
        </div>
      )}
    </form>
  );
}
