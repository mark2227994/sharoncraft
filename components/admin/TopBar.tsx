"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";

type TopBarProps = {
  adminEmail: string;
  adminName: string;
  hasNewOrders: boolean;
};

const titles: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/login": "Admin Login",
  "/admin/products": "Products",
  "/admin/orders": "Orders",
  "/admin/customers": "Customers",
  "/admin/categories": "Categories",
  "/admin/inventory": "Inventory",
  "/admin/media": "Media",
  "/admin/discounts": "Discounts",
  "/admin/reviews": "Reviews",
  "/admin/custom-orders": "Custom Orders",
  "/admin/settings": "Settings",
};

function getInitials(name: string, email: string) {
  const safeName = name.trim() || email.split("@")[0] || "Admin";
  const parts = safeName.split(/\s+/).filter(Boolean);
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() || "").join("") || "SC";
}

export default function TopBar({ adminEmail, adminName, hasNewOrders }: TopBarProps) {
  const pathname = usePathname() || "";
  const pageTitle = useMemo(() => {
    if (titles[pathname]) return titles[pathname];
    if (pathname.startsWith("/admin/products/")) return "Edit Product";
    if (pathname.startsWith("/admin/orders/")) return "Order Detail";
    return "Admin";
  }, [pathname]);

  const initials = getInitials(adminName, adminEmail);

  return (
    <header className="flex h-[52px] items-center justify-between border-b border-[#f0f0f0] bg-white px-6">
      <h1 className="text-[13px] font-medium text-[#1c1c1c]">{pageTitle}</h1>
      <div className="flex items-center gap-4">
        <button
          type="button"
          aria-label="Notifications"
          className="relative flex h-8 w-8 items-center justify-center border border-transparent text-[#1c1c1c] transition-all duration-200 ease-in-out hover:border-[#f0f0f0] hover:bg-[#fafaf8]"
        >
          <span aria-hidden="true" className="text-sm">🔔</span>
          {hasNewOrders ? <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[#C0392B]" /> : null}
        </button>
        <div className="flex h-8 w-8 items-center justify-center rounded-[2px] bg-[#8B5E3C] text-[11px] text-white">
          {initials}
        </div>
      </div>
    </header>
  );
}
