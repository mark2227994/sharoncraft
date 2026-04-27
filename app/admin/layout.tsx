'use client';

import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    document.cookie = 'auth-token=; path=/; max-age=0';
    router.push('/admin/login');
  }

  return (
    <div className="flex h-screen bg-gray-100" style={{ backgroundColor: '#f8f8f6' }}>
      {/* SIDEBAR */}
      <aside className="w-56 bg-black text-white fixed h-full overflow-y-auto" style={{ backgroundColor: '#1c1c1c' }}>
        <div className="p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <h2 className="text-sm font-normal tracking-wider uppercase mb-1" style={{ letterSpacing: '2px' }}>
            SHARONCRAFT
          </h2>
          <p className="text-xs tracking-wider uppercase" style={{ letterSpacing: '2px', color: 'rgba(255,255,255,0.3)' }}>
            Admin Panel
          </p>
        </div>

        {/* MAIN Section */}
        <nav className="pt-6">
          <label className="px-4 text-xs tracking-wider uppercase font-normal" style={{ letterSpacing: '2px', color: 'rgba(255,255,255,0.3)' }}>
            MAIN
          </label>
          <ul className="space-y-1 mt-3">
            <li>
              <Link
                href="/admin"
                className="px-4 py-2 text-xs flex items-center gap-3 hover:bg-white hover:bg-opacity-5 transition-colors"
                style={{ color: 'rgba(255,255,255,0.6)' }}
              >
                <span>📊</span>
                <span>Dashboard</span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin/orders"
                className="px-4 py-2 text-xs flex items-center gap-3 hover:bg-white hover:bg-opacity-5 transition-colors"
                style={{ color: 'rgba(255,255,255,0.6)' }}
              >
                <span>📦</span>
                <span>Orders</span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin/products"
                className="px-4 py-2 text-xs flex items-center gap-3 hover:bg-white hover:bg-opacity-5 transition-colors"
                style={{ color: 'rgba(255,255,255,0.6)' }}
              >
                <span>🛍️</span>
                <span>Products</span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin/customers"
                className="px-4 py-2 text-xs flex items-center gap-3 hover:bg-white hover:bg-opacity-5 transition-colors"
                style={{ color: 'rgba(255,255,255,0.6)' }}
              >
                <span>👥</span>
                <span>Customers</span>
              </Link>
            </li>
          </ul>
        </nav>

        {/* STORE Section */}
        <nav className="pt-6">
          <label className="px-4 text-xs tracking-wider uppercase font-normal" style={{ letterSpacing: '2px', color: 'rgba(255,255,255,0.3)' }}>
            STORE
          </label>
          <ul className="space-y-1 mt-3">
            <li>
              <Link
                href="/admin/categories"
                className="px-4 py-2 text-xs flex items-center gap-3 hover:bg-white hover:bg-opacity-5 transition-colors"
                style={{ color: 'rgba(255,255,255,0.6)' }}
              >
                <span>🗂️</span>
                <span>Categories</span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin/inventory"
                className="px-4 py-2 text-xs flex items-center gap-3 hover:bg-white hover:bg-opacity-5 transition-colors"
                style={{ color: 'rgba(255,255,255,0.6)' }}
              >
                <span>📦</span>
                <span>Inventory</span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin/media"
                className="px-4 py-2 text-xs flex items-center gap-3 hover:bg-white hover:bg-opacity-5 transition-colors"
                style={{ color: 'rgba(255,255,255,0.6)' }}
              >
                <span>🖼️</span>
                <span>Media</span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin/discounts"
                className="px-4 py-2 text-xs flex items-center gap-3 hover:bg-white hover:bg-opacity-5 transition-colors"
                style={{ color: 'rgba(255,255,255,0.6)' }}
              >
                <span>🎯</span>
                <span>Discounts</span>
              </Link>
            </li>
          </ul>
        </nav>

        {/* OTHER Section */}
        <nav className="pt-6">
          <label className="px-4 text-xs tracking-wider uppercase font-normal" style={{ letterSpacing: '2px', color: 'rgba(255,255,255,0.3)' }}>
            OTHER
          </label>
          <ul className="space-y-1 mt-3">
            <li>
              <Link
                href="/admin/migration"
                className="px-4 py-2 text-xs flex items-center gap-3 hover:bg-white hover:bg-opacity-5 transition-colors"
                style={{ color: 'rgba(255,255,255,0.6)' }}
              >
                <span>🔄</span>
                <span>Migration</span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin/reviews"
                className="px-4 py-2 text-xs flex items-center gap-3 hover:bg-white hover:bg-opacity-5 transition-colors"
                style={{ color: 'rgba(255,255,255,0.6)' }}
              >
                <span>⭐</span>
                <span>Reviews</span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin/custom-orders"
                className="px-4 py-2 text-xs flex items-center gap-3 hover:bg-white hover:bg-opacity-5 transition-colors"
                style={{ color: 'rgba(255,255,255,0.6)' }}
              >
                <span>🎁</span>
                <span>Custom Orders</span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin/settings"
                className="px-4 py-2 text-xs flex items-center gap-3 hover:bg-white hover:bg-opacity-5 transition-colors"
                style={{ color: 'rgba(255,255,255,0.6)' }}
              >
                <span>⚙️</span>
                <span>Settings</span>
              </Link>
            </li>
          </ul>
        </nav>

        {/* Bottom Sign Out */}
        <div className="absolute bottom-0 w-56 p-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>
            Admin User
          </p>
          <p className="text-xs mb-3" style={{ color: 'rgba(255,255,255,0.3)' }}>
            admin@example.com
          </p>
          <button
            onClick={handleLogout}
            className="text-xs tracking-wider uppercase hover:text-white transition-colors"
            style={{ letterSpacing: '1px', color: 'rgba(255,255,255,0.3)' }}
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="ml-56 flex-1 flex flex-col">
        {/* TOP BAR */}
        <header className="h-13 bg-white border-b" style={{ height: '52px', borderColor: '#f0f0f0' }}>
          <div className="px-6 h-full flex items-center justify-between">
            <h1 className="text-sm font-medium" style={{ fontSize: '13px', fontWeight: 500, color: '#1c1c1c' }}>
              Admin Dashboard
            </h1>
            <div className="flex items-center gap-4">
              <button className="w-8 h-8 flex items-center justify-center text-lg hover:bg-gray-100 rounded transition-colors">
                🔔
              </button>
              <div className="w-8 h-8 flex items-center justify-center text-xs font-medium text-white rounded" style={{ backgroundColor: '#8B5E3C' }}>
                SK
              </div>
            </div>
          </div>
        </header>

        {/* CONTENT AREA */}
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
