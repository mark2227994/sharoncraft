import Link from "next/link";
import OrderRow from "@/components/admin/OrderRow";
import StatCard from "@/components/admin/StatCard";
import StockAlert from "@/components/admin/StockAlert";
import { supabaseAdmin } from "@/lib/supabase/server";

type DashboardOrder = {
  id: string;
  customer_name: string | null;
  customer_phone: string | null;
  items: unknown;
  total_amount: number | null;
  order_status: string | null;
  created_at: string | null;
};

type DashboardProduct = {
  id: string;
  name: string | null;
  images: string[] | null;
  stock_quantity: number | null;
  low_stock_alert: number | null;
};

function formatCurrency(amount: number) {
  return `KES ${amount.toLocaleString("en-KE")}`;
}

function getNairobiDateKey(value: string | null | undefined) {
  if (!value) return "";
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Nairobi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

function parseItems(items: unknown): Array<{ name?: string; quantity?: number }> {
  if (Array.isArray(items)) {
    return items.map((item) => ({
      name: typeof item === "object" && item && "name" in item ? String((item as { name?: unknown }).name || "") : "Item",
      quantity:
        typeof item === "object" && item && "quantity" in item
          ? Number((item as { quantity?: unknown }).quantity || 1)
          : 1,
    }));
  }
  return [];
}

export default async function AdminDashboardPage() {
  const [{ data: orders }, { data: products }] = await Promise.all([
    supabaseAdmin
      .from("orders")
      .select("id, customer_name, customer_phone, items, total_amount, order_status, created_at")
      .order("created_at", { ascending: false })
      .limit(100),
    supabaseAdmin
      .from("products")
      .select("id, name, images, stock_quantity, low_stock_alert")
      .order("created_at", { ascending: false }),
  ]);

  const safeOrders = (orders || []) as DashboardOrder[];
  const safeProducts = (products || []) as DashboardProduct[];
  const todayKey = getNairobiDateKey(new Date().toISOString());

  const todaysOrders = safeOrders.filter((order) => getNairobiDateKey(order.created_at) === todayKey);
  const todaysRevenue = todaysOrders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
  const pendingOrders = safeOrders.filter((order) => order.order_status === "pending");
  const lowStockProducts = safeProducts.filter(
    (product) => Number(product.stock_quantity || 0) <= Number(product.low_stock_alert || 0),
  );

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="TODAY'S REVENUE" value={formatCurrency(todaysRevenue)} trend={`${todaysOrders.length} orders today`} trendTone="neutral" />
        <StatCard label="NEW ORDERS" value={String(todaysOrders.length)} trend="Orders created today" trendTone="neutral" />
        <StatCard label="LOW STOCK ITEMS" value={String(lowStockProducts.length)} trend={lowStockProducts.length ? "Needs attention" : "All healthy"} trendTone={lowStockProducts.length ? "danger" : "success"} />
        <StatCard label="PENDING ORDERS" value={String(pendingOrders.length)} trend={pendingOrders.length ? "Waiting for action" : "No pending orders"} trendTone={pendingOrders.length ? "danger" : "success"} />
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="rounded-[2px] border border-[#f0f0f0] bg-white">
          <div className="flex items-center justify-between border-b border-[#f0f0f0] px-4 py-4">
            <div>
              <p className="text-[10px] uppercase tracking-[2px] text-[#999]">Recent Orders</p>
              <p className="mt-1 text-[12px] text-[#555]">Latest WhatsApp-first order flow</p>
            </div>
            <Link
              href="/admin/orders"
              className="inline-flex h-9 items-center rounded-[2px] border border-[#e0e0e0] px-3 text-[11px] uppercase tracking-[1px] text-[#555] transition-colors duration-200 ease-in-out hover:bg-[#fafaf8]"
            >
              View All
            </Link>
          </div>

          {safeOrders.length === 0 ? (
            <div className="px-4 py-8 text-[11px] text-[#555]">No orders yet. Once orders arrive, this table will update automatically.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-[#fafafa]">
                  <tr className="text-left text-[9px] uppercase tracking-[2px] text-[#999]">
                    <th className="px-4 py-[10px]">Order ID</th>
                    <th className="px-4 py-[10px]">Customer</th>
                    <th className="px-4 py-[10px]">Items</th>
                    <th className="px-4 py-[10px]">Total</th>
                    <th className="px-4 py-[10px]">Status</th>
                    <th className="px-4 py-[10px]">WhatsApp</th>
                  </tr>
                </thead>
                <tbody>
                  {safeOrders.slice(0, 10).map((order) => (
                    <OrderRow
                      key={order.id}
                      id={order.id}
                      customerName={order.customer_name || "Customer"}
                      customerPhone={order.customer_phone || ""}
                      items={parseItems(order.items)}
                      totalAmount={Number(order.total_amount || 0)}
                      orderStatus={order.order_status || "pending"}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="rounded-[2px] border border-[#f0f0f0] bg-white">
          <div className="flex items-center justify-between border-b border-[#f0f0f0] px-4 py-4">
            <div>
              <p className="text-[10px] uppercase tracking-[2px] text-[#999]">Low Stock</p>
              <p className="mt-1 text-[12px] text-[#555]">Products at or below alert threshold</p>
            </div>
            <Link
              href="/admin/inventory"
              className="inline-flex h-9 items-center rounded-[2px] border border-[#e0e0e0] px-3 text-[11px] uppercase tracking-[1px] text-[#555] transition-colors duration-200 ease-in-out hover:bg-[#fafaf8]"
            >
              Inventory
            </Link>
          </div>

          <div className="px-4 py-2">
            {lowStockProducts.length === 0 ? (
              <div className="py-6 text-[11px] text-[#555]">No low-stock products right now.</div>
            ) : (
              lowStockProducts.slice(0, 6).map((product) => (
                <StockAlert
                  key={product.id}
                  id={product.id}
                  imageUrl={product.images?.[0] || null}
                  name={product.name || "Untitled Product"}
                  stockQuantity={Number(product.stock_quantity || 0)}
                  lowStockAlert={Number(product.low_stock_alert || 0)}
                />
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
