'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  Grid3X3,
  Archive,
  Image as ImageIcon,
  Tag,
  Star,
  ClipboardList,
  Settings,
  Bell,
} from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const currentPath = pathname ?? '';
  const [adminEmail, setAdminEmail] = useState<string>('Admin');

  useEffect(() => {
    async function fetchSession() {
      try {
        const response = await supabase.auth.getSession();
        if (response && response.data && response.data.session) {
          setAdminEmail(response.data.session.user?.email ?? 'Admin');
        } else {
          setAdminEmail('Admin');
        }
      } catch (error) {
        console.error('Session fetch error:', error);
        setAdminEmail('Admin');
      }
    }
    fetchSession();
  }, []);

  const isActive = (href: string) => 
    href === '/admin-v2' ? currentPath === '/admin-v2' : currentPath.startsWith(href);

  async function handleLogout() {
    await supabase.auth.signOut();
    document.cookie = 'auth-token=; path=/; max-age=0';
    router.push('/admin-v2/login');
  }

  const iconProps = {
    size: 14,
    strokeWidth: 1.5,
    style: { opacity: 0.7 },
  };

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
                href="/admin-v2"
                className="px-4 py-2 text-xs flex items-center gap-3 hover:bg-white hover:bg-opacity-5 transition-colors border-l-2"
                style={{
                  color: isActive('/admin-v2') ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.6)',
                  borderLeftColor: isActive('/admin-v2') ? '#8B5E3C' : 'transparent',
                  backgroundColor: isActive('/admin-v2') ? 'rgba(255,255,255,0.03)' : 'transparent',
                }}
              >
                <LayoutDashboard {...iconProps} />
                <span>Dashboard</span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin-v2/orders"
                className="px-4 py-2 text-xs flex items-center gap-3 hover:bg-white hover:bg-opacity-5 transition-colors border-l-2"
                style={{
                  color: isActive('/admin-v2/orders') ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.6)',
                  borderLeftColor: isActive('/admin-v2/orders') ? '#8B5E3C' : 'transparent',
                  backgroundColor: isActive('/admin-v2/orders') ? 'rgba(255,255,255,0.03)' : 'transparent',
                }}
              >
                <ShoppingBag {...iconProps} />
                <span>Orders</span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin-v2/products"
                className="px-4 py-2 text-xs flex items-center gap-3 hover:bg-white hover:bg-opacity-5 transition-colors border-l-2"
                style={{
                  color: isActive('/admin-v2/products') ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.6)',
                  borderLeftColor: isActive('/admin-v2/products') ? '#8B5E3C' : 'transparent',
                  backgroundColor: isActive('/admin-v2/products') ? 'rgba(255,255,255,0.03)' : 'transparent',
                }}
              >
                <Package {...iconProps} />
                <span>Products</span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin-v2/customers"
                className="px-4 py-2 text-xs flex items-center gap-3 hover:bg-white hover:bg-opacity-5 transition-colors border-l-2"
                style={{
                  color: isActive('/admin-v2/customers') ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.6)',
                  borderLeftColor: isActive('/admin-v2/customers') ? '#8B5E3C' : 'transparent',
                  backgroundColor: isActive('/admin-v2/customers') ? 'rgba(255,255,255,0.03)' : 'transparent',
                }}
              >
                <Users {...iconProps} />
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
                href="/admin-v2/categories"
                className="px-4 py-2 text-xs flex items-center gap-3 hover:bg-white hover:bg-opacity-5 transition-colors border-l-2"
                style={{
                  color: isActive('/admin-v2/categories') ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.6)',
                  borderLeftColor: isActive('/admin-v2/categories') ? '#8B5E3C' : 'transparent',
                  backgroundColor: isActive('/admin-v2/categories') ? 'rgba(255,255,255,0.03)' : 'transparent',
                }}
              >
                <Grid3X3 {...iconProps} />
                <span>Categories</span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin-v2/inventory"
                className="px-4 py-2 text-xs flex items-center gap-3 hover:bg-white hover:bg-opacity-5 transition-colors border-l-2"
                style={{
                  color: isActive('/admin-v2/inventory') ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.6)',
                  borderLeftColor: isActive('/admin-v2/inventory') ? '#8B5E3C' : 'transparent',
                  backgroundColor: isActive('/admin-v2/inventory') ? 'rgba(255,255,255,0.03)' : 'transparent',
                }}
              >
                <Archive {...iconProps} />
                <span>Inventory</span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin-v2/media"
                className="px-4 py-2 text-xs flex items-center gap-3 hover:bg-white hover:bg-opacity-5 transition-colors border-l-2"
                style={{
                  color: isActive('/admin-v2/media') ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.6)',
                  borderLeftColor: isActive('/admin-v2/media') ? '#8B5E3C' : 'transparent',
                  backgroundColor: isActive('/admin-v2/media') ? 'rgba(255,255,255,0.03)' : 'transparent',
                }}
              >
                <ImageIcon {...iconProps} />
                <span>Media</span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin-v2/discounts"
                className="px-4 py-2 text-xs flex items-center gap-3 hover:bg-white hover:bg-opacity-5 transition-colors border-l-2"
                style={{
                  color: isActive('/admin-v2/discounts') ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.6)',
                  borderLeftColor: isActive('/admin-v2/discounts') ? '#8B5E3C' : 'transparent',
                  backgroundColor: isActive('/admin-v2/discounts') ? 'rgba(255,255,255,0.03)' : 'transparent',
                }}
              >
                <Tag {...iconProps} />
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
                href="/admin-v2/reviews"
                className="px-4 py-2 text-xs flex items-center gap-3 hover:bg-white hover:bg-opacity-5 transition-colors border-l-2"
                style={{
                  color: isActive('/admin-v2/reviews') ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.6)',
                  borderLeftColor: isActive('/admin-v2/reviews') ? '#8B5E3C' : 'transparent',
                  backgroundColor: isActive('/admin-v2/reviews') ? 'rgba(255,255,255,0.03)' : 'transparent',
                }}
              >
                <Star {...iconProps} />
                <span>Reviews</span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin-v2/custom-orders"
                className="px-4 py-2 text-xs flex items-center gap-3 hover:bg-white hover:bg-opacity-5 transition-colors border-l-2"
                style={{
                  color: isActive('/admin-v2/custom-orders') ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.6)',
                  borderLeftColor: isActive('/admin-v2/custom-orders') ? '#8B5E3C' : 'transparent',
                  backgroundColor: isActive('/admin-v2/custom-orders') ? 'rgba(255,255,255,0.03)' : 'transparent',
                }}
              >
                <ClipboardList {...iconProps} />
                <span>Custom Orders</span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin-v2/settings"
                className="px-4 py-2 text-xs flex items-center gap-3 hover:bg-white hover:bg-opacity-5 transition-colors border-l-2"
                style={{
                  color: isActive('/admin-v2/settings') ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.6)',
                  borderLeftColor: isActive('/admin-v2/settings') ? '#8B5E3C' : 'transparent',
                  backgroundColor: isActive('/admin-v2/settings') ? 'rgba(255,255,255,0.03)' : 'transparent',
                }}
              >
                <Settings {...iconProps} />
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
          <p className="text-xs mb-3 truncate max-w-[160px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {adminEmail}
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
              <button className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors" style={{ borderRadius: '2px' }}>
                <Bell size={16} strokeWidth={1.5} style={{ color: '#999' }} />
              </button>
              <div className="w-8 h-8 flex items-center justify-center text-xs font-medium text-white" style={{ backgroundColor: '#8B5E3C', borderRadius: '2px' }}>
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
