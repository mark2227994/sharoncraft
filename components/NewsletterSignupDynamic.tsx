// Example: Newsletter signup component
// Use this in your footer or promotional sections

'use client';

import { useState } from 'react';
import { subscribeToNewsletter } from '@/lib/supabase/public';

export default function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const success = await subscribeToNewsletter(email);

    if (success) {
      setStatus('success');
      setMessage('Thank you for subscribing!');
      setEmail('');
    } else {
      setStatus('error');
      setMessage('Failed to subscribe. Please try again.');
    }

    setLoading(false);
    setTimeout(() => setStatus('idle'), 3000);
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        disabled={loading}
        className="flex-1 px-4 py-2 border border-gray-300 rounded"
      />
      <button
        type="submit"
        disabled={loading}
        className="px-6 py-2 bg-black text-white rounded disabled:opacity-50"
      >
        {loading ? 'Subscribing...' : 'Subscribe'}
      </button>
      {status !== 'idle' && (
        <div
          className={`text-sm px-4 py-2 rounded ${
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
