'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  BookOpen,
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

export default function AdminV2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const currentPath = pathname ?? '';
  const isLoginRoute = currentPath === '/admin-v2/login';
  const [adminEmail, setAdminEmail] = useState('Admin');

  useEffect(() => {
    if (isLoginRoute) {
      setAdminEmail('Admin');
      return;
    }

    async function fetchSession() {
      try {
        const response = await supabase.auth.getSession();
        const nextEmail = response?.data?.session?.user?.email ?? 'Admin';
        setAdminEmail(nextEmail);
      } catch (error) {
        console.error('Session fetch error:', error);
        setAdminEmail('Admin');
      }
    }

    void fetchSession();
  }, [isLoginRoute]);

  if (isLoginRoute) {
    return <>{children}</>;
  }

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

  const navSections = [
    {
      label: 'MAIN',
      items: [
        { href: '/admin-v2', label: 'Dashboard', icon: <LayoutDashboard {...iconProps} /> },
        { href: '/admin-v2/orders', label: 'Orders', icon: <ShoppingBag {...iconProps} /> },
        { href: '/admin-v2/products', label: 'Products', icon: <Package {...iconProps} /> },
        { href: '/admin-v2/blog', label: 'Blog', icon: <BookOpen {...iconProps} /> },
        { href: '/admin-v2/images', label: 'Images', icon: <ImageIcon {...iconProps} /> },
        { href: '/admin-v2/customers', label: 'Customers', icon: <Users {...iconProps} /> },
      ],
    },
    {
      label: 'STORE',
      items: [
        { href: '/admin-v2/categories', label: 'Categories', icon: <Grid3X3 {...iconProps} /> },
        { href: '/admin-v2/inventory', label: 'Inventory', icon: <Archive {...iconProps} /> },
        { href: '/admin-v2/media', label: 'Media', icon: <ImageIcon {...iconProps} /> },
        { href: '/admin-v2/discounts', label: 'Discounts', icon: <Tag {...iconProps} /> },
      ],
    },
    {
      label: 'OTHER',
      items: [
        { href: '/admin-v2/reviews', label: 'Reviews', icon: <Star {...iconProps} /> },
        { href: '/admin-v2/custom-orders', label: 'Custom Orders', icon: <ClipboardList {...iconProps} /> },
        { href: '/admin-v2/settings', label: 'Settings', icon: <Settings {...iconProps} /> },
      ],
    },
  ];

  return (
    <div className="flex h-screen bg-gray-100" style={{ backgroundColor: '#f8f8f6' }}>
      <aside
        className="fixed flex h-full w-56 flex-col overflow-hidden bg-black text-white"
        style={{ backgroundColor: '#1c1c1c' }}
      >
        <div className="border-b p-4" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <h2
            className="mb-1 text-sm font-normal uppercase tracking-wider"
            style={{ letterSpacing: '2px' }}
          >
            SHARONCRAFT
          </h2>
          <p
            className="text-xs uppercase tracking-wider"
            style={{ letterSpacing: '2px', color: 'rgba(255,255,255,0.3)' }}
          >
            Admin Panel
          </p>
        </div>

        <div className="flex-1 overflow-y-auto pb-4">
          {navSections.map((section) => (
            <nav key={section.label} className="pt-6">
              <label
                className="px-4 text-xs font-normal uppercase tracking-wider"
                style={{ letterSpacing: '2px', color: 'rgba(255,255,255,0.3)' }}
              >
                {section.label}
              </label>
              <ul className="mt-3 space-y-1">
                {section.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="flex items-center gap-3 border-l-2 px-4 py-2 text-xs transition-colors hover:bg-white hover:bg-opacity-5"
                      style={{
                        color: isActive(item.href) ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.6)',
                        borderLeftColor: isActive(item.href) ? '#8B5E3C' : 'transparent',
                        backgroundColor: isActive(item.href) ? 'rgba(255,255,255,0.03)' : 'transparent',
                      }}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="w-56 shrink-0 border-t p-4" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <p className="mb-1 text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>
            Admin User
          </p>
          <p
            className="mb-3 max-w-[160px] truncate text-xs"
            style={{ color: 'rgba(255,255,255,0.4)' }}
          >
            {adminEmail}
          </p>
          <button
            onClick={handleLogout}
            className="text-xs uppercase tracking-wider transition-colors hover:text-white"
            style={{ letterSpacing: '1px', color: 'rgba(255,255,255,0.3)' }}
          >
            Sign Out
          </button>
        </div>
      </aside>

      <div className="ml-56 flex flex-1 flex-col">
        <header className="h-13 border-b bg-white" style={{ height: '52px', borderColor: '#f0f0f0' }}>
          <div className="flex h-full items-center justify-between px-6">
            <h1
              className="text-sm font-medium"
              style={{ fontSize: '13px', fontWeight: 500, color: '#1c1c1c' }}
            >
              Admin Dashboard
            </h1>
            <div className="flex items-center gap-4">
              <button
                className="flex h-8 w-8 items-center justify-center transition-colors hover:bg-gray-100"
                style={{ borderRadius: '2px' }}
              >
                <Bell size={16} strokeWidth={1.5} style={{ color: '#999' }} />
              </button>
              <div
                className="flex h-8 w-8 items-center justify-center text-xs font-medium text-white"
                style={{ backgroundColor: '#8B5E3C', borderRadius: '2px' }}
              >
                SK
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
