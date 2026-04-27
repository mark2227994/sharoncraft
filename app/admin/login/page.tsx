'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Sign in with Supabase
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message || 'Invalid email or password');
        setLoading(false);
        return;
      }

      if (!data.session) {
        setError('Failed to create session');
        setLoading(false);
        return;
      }

      // Check if user is in admin_users table
      const { data: adminUser, error: adminError } = await supabase
        .from('admin_users')
        .select('id')
        .eq('id', data.user?.id)
        .single();

      if (adminError || !adminUser) {
        setError('You do not have admin access');
        setLoading(false);
        return;
      }

      // Store auth token in cookie (client-side)
      document.cookie = `auth-token=${data.session.access_token}; path=/; max-age=3600`;

      // Redirect to admin dashboard
      router.push('/admin');
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
      <div className="w-full max-w-md px-8">
        {/* Logo */}
        <div className="text-center mb-12">
          <h1 className="text-4xl tracking-widest uppercase font-normal mb-2" style={{ letterSpacing: '3px' }}>
            SHARONCRAFT
          </h1>
          <p className="text-xs tracking-widest uppercase" style={{ letterSpacing: '2px', color: '#999' }}>
            Admin
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-sm">
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email Input */}
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-gray-400"
              disabled={loading}
              required
            />
          </div>

          {/* Password Input */}
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-gray-400"
              disabled={loading}
              required
            />
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-black text-white text-xs font-normal tracking-widest uppercase rounded-sm hover:bg-gray-900 disabled:bg-gray-400 transition-colors"
            style={{ letterSpacing: '3px' }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Info Text */}
        <p className="text-center text-xs mt-8" style={{ color: '#999' }}>
          Admin access only
        </p>
      </div>
    </div>
  );
}
