"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

type NavItem = {
  href: string;
  label: string;
  icon: string;
  badge?: number;
};

type SidebarProps = {
  adminEmail: string;
  adminName: string;
  lowStockCount: number;
  pendingOrderCount: number;
};

const sections: Array<{ label: string; items: NavItem[] }> = [
  {
    label: "MAIN",
    items: [
      { href: "/admin", label: "Dashboard", icon: "📊" },
      { href: "/admin/orders", label: "Orders", icon: "📦" },
      { href: "/admin/products", label: "Products", icon: "🛍️" },
      { href: "/admin/customers", label: "Customers", icon: "👥" },
    ],
  },
  {
    label: "STORE",
    items: [
      { href: "/admin/categories", label: "Categories", icon: "🗂️" },
      { href: "/admin/inventory", label: "Inventory", icon: "📦" },
      { href: "/admin/media", label: "Media", icon: "🖼️" },
      { href: "/admin/discounts", label: "Discounts", icon: "🎯" },
    ],
  },
  {
    label: "OTHER",
    items: [
      { href: "/admin/reviews", label: "Reviews", icon: "⭐" },
      { href: "/admin/custom-orders", label: "Custom Orders", icon: "🎁" },
      { href: "/admin/settings", label: "Settings", icon: "⚙️" },
    ],
  },
];

function formatAdminName(adminName: string, adminEmail: string) {
  if (adminName.trim()) return adminName.trim();
  const [local] = adminEmail.split("@");
  return local || "Admin";
}

export default function Sidebar({
  adminEmail,
  adminName,
  lowStockCount,
  pendingOrderCount,
}: SidebarProps) {
  const pathname = usePathname() || "";
  const displayName = formatAdminName(adminName, adminEmail);

  async function handleSignOut() {
    await supabase.auth.signOut();
    document.cookie = "auth-token=; path=/; max-age=0; samesite=lax";
    window.location.href = "/admin/login";
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-[220px] min-w-[220px] flex-col bg-[#1c1c1c]">
      <div className="border-b border-white/10 px-4 py-5">
        <p className="text-[13px] uppercase tracking-[2px] text-white">SHARONCRAFT</p>
        <p className="mt-1 text-[9px] uppercase tracking-[2px] text-white/30">Admin Panel</p>
      </div>

      <div className="flex-1 overflow-y-auto pb-6">
        {sections.map((section) => (
          <div key={section.label} className="pt-3">
            <p className="px-4 pb-1 text-[9px] uppercase tracking-[2px] text-white/30">
              {section.label}
            </p>
            <nav className="space-y-1">
              {section.items.map((item) => {
                const isActive =
                  pathname === item.href || (item.href !== "/admin" && pathname.startsWith(`${item.href}/`));
                const badge =
                  item.href === "/admin/orders"
                    ? pendingOrderCount
                    : item.href === "/admin/inventory"
                      ? lowStockCount
                      : 0;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={[
                      "flex items-center gap-[10px] border-l-2 px-4 py-[9px] text-[11px] tracking-[0.5px] transition-all duration-200 ease-in-out",
                      isActive
                        ? "border-l-[#8B5E3C] bg-white/10 text-white"
                        : "border-l-transparent text-white/60 hover:bg-white/5 hover:text-white/90",
                    ].join(" ")}
                  >
                    <span aria-hidden="true">{item.icon}</span>
                    <span>{item.label}</span>
                    {badge > 0 ? (
                      <span className="ml-auto rounded-[10px] bg-[#C0392B] px-[5px] py-[1px] text-[9px] text-white">
                        {badge}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10 px-4 py-3">
        <p className="text-[11px] text-white/70">{displayName}</p>
        <p className="mt-1 text-[10px] text-white/30">{adminEmail}</p>
        <div className="mt-3">
          <button
            type="button"
            onClick={handleSignOut}
            className="text-[10px] uppercase tracking-[1px] text-white/30 transition-colors duration-200 ease-in-out hover:text-white/60"
          >
            Sign out
          </button>
        </div>
      </div>
    </aside>
  );
}
