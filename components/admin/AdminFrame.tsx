"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/admin/Sidebar";
import TopBar from "@/components/admin/TopBar";

type AdminFrameProps = {
  children: ReactNode;
  adminEmail: string;
  adminName: string;
  lowStockCount: number;
  pendingOrderCount: number;
};

export default function AdminFrame({
  children,
  adminEmail,
  adminName,
  lowStockCount,
  pendingOrderCount,
}: AdminFrameProps) {
  const pathname = usePathname();

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#f8f8f6]">
      <Sidebar
        adminEmail={adminEmail}
        adminName={adminName}
        lowStockCount={lowStockCount}
        pendingOrderCount={pendingOrderCount}
      />
      <div className="ml-[220px] min-h-screen">
        <TopBar
          adminEmail={adminEmail}
          adminName={adminName}
          hasNewOrders={pendingOrderCount > 0}
        />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
