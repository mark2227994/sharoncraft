import { ReactNode } from "react";
import { cookies } from "next/headers";
import AdminFrame from "@/components/admin/AdminFrame";
import { getAdminIdentityFromToken } from "@/lib/supabase/middleware";
import { supabaseAdmin } from "@/lib/supabase/server";

async function getChromeCounts() {
  const [{ data: orders }, { data: products }] = await Promise.all([
    supabaseAdmin.from("orders").select("order_status"),
    supabaseAdmin.from("products").select("stock_quantity, low_stock_alert"),
  ]);

  const pendingOrderCount = (orders || []).filter((order) => order.order_status === "pending").length;
  const lowStockCount = (products || []).filter(
    (product) => Number(product.stock_quantity || 0) <= Number(product.low_stock_alert || 0),
  ).length;

  return {
    pendingOrderCount,
    lowStockCount,
  };
}

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;
  const adminIdentity = await getAdminIdentityFromToken(token);
  const { pendingOrderCount, lowStockCount } = await getChromeCounts();

  return (
    <AdminFrame
      adminEmail={adminIdentity?.email || ""}
      adminName={adminIdentity?.name || ""}
      lowStockCount={lowStockCount}
      pendingOrderCount={pendingOrderCount}
    >
      {children}
    </AdminFrame>
  );
}
