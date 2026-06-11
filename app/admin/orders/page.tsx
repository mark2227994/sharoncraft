'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import {
  ORDER_STATUSES,
  ORDER_STATUS_META,
  PAYMENT_METHODS,
  PUBLIC_TRACKING_STEPS,
  buildStatusMessage,
  calculateProfit,
  formatKes,
  normalizeManagedOrder,
  type ManagedOrder,
  type ManagedOrderItem,
  type OrderStatus,
  type WhatsappTemplateRecord,
} from '@/lib/order-management';

type CatalogProduct = {
  id: string;
  name: string;
  price: number;
  image?: string | null;
  images?: Array<{ src?: string | null } | string> | null;
  is_visible?: boolean | null;
};

type OrderApiResponse = {
  orders?: ManagedOrder[];
  error?: string;
};

type TemplateApiResponse = {
  templates?: WhatsappTemplateRecord[];
  error?: string;
};

type CreateOrderForm = {
  customer_name: string;
  customer_phone: string;
  customer_location: string;
  items: ManagedOrderItem[];
  payment_method: string;
  designer_cost: string;
  notes: string;
};

const ORDER_FILTERS: Array<{ key: 'all' | OrderStatus; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'in_production', label: 'In Production' },
  { key: 'ready', label: 'Ready' },
  { key: 'dispatched', label: 'Dispatched' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'cancelled', label: 'Cancelled' },
];

const emptyCreateForm: CreateOrderForm = {
  customer_name: '',
  customer_phone: '',
  customer_location: '',
  items: [],
  payment_method: 'M-Pesa',
  designer_cost: '',
  notes: '',
};

const buttonBaseStyle = {
  borderRadius: '2px',
  letterSpacing: '2px',
  textTransform: 'uppercase' as const,
  fontSize: '10px',
  fontWeight: 400,
  boxShadow: 'none',
};

function isRemoteUrl(url: string) {
  return typeof url === 'string' && /^https?:\/\//i.test(url);
}

function getProductImage(product: CatalogProduct) {
  const firstGalleryImage = Array.isArray(product.images) ? product.images[0] : null;
  if (typeof firstGalleryImage === 'string' && firstGalleryImage) return firstGalleryImage;
  if (firstGalleryImage && typeof firstGalleryImage === 'object' && firstGalleryImage.src) return firstGalleryImage.src;
  return product.image || '/media/site/placeholder.svg';
}

function getOrderItemImage(item: ManagedOrderItem) {
  return item.image || '/media/site/placeholder.svg';
}

function formatDateLabel(value: string | null | undefined) {
  if (!value) return 'Not set';
  try {
    return new Date(value).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return value;
  }
}

function toDateInputValue(value: string | null | undefined) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function startOfWeek() {
  const date = new Date();
  const day = date.getDay();
  const diff = (day + 6) % 7;
  date.setDate(date.getDate() - diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function startOfMonth(offset = 0) {
  const date = new Date();
  date.setMonth(date.getMonth() + offset, 1);
  date.setHours(0, 0, 0, 0);
  return date;
}

function addDays(value: Date, days: number) {
  const next = new Date(value);
  next.setDate(next.getDate() + days);
  return next;
}

function normalizeOrderResponse(order: ManagedOrder) {
  return normalizeManagedOrder(order as unknown as Record<string, unknown>);
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<ManagedOrder[]>([]);
  const [templates, setTemplates] = useState<WhatsappTemplateRecord[]>([]);
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | OrderStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [panelOpen, setPanelOpen] = useState(false);
  const [form, setForm] = useState<CreateOrderForm>(emptyCreateForm);
  const [productSearch, setProductSearch] = useState('');
  const [customItemName, setCustomItemName] = useState('');
  const [customItemPrice, setCustomItemPrice] = useState('');
  const [savingOrderId, setSavingOrderId] = useState<string | null>(null);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [pageError, setPageError] = useState('');

  useEffect(() => {
    void Promise.all([fetchOrders(), fetchTemplates(), fetchProducts()]);
  }, []);

  async function fetchOrders() {
    setLoading(true);
    setPageError('');

    try {
      const response = await fetch('/api/admin/orders');
      const data = (await response.json()) as OrderApiResponse;

      if (!response.ok) {
        throw new Error(data.error || 'Unable to fetch orders.');
      }

      setOrders(Array.isArray(data.orders) ? data.orders.map(normalizeOrderResponse) : []);
    } catch (error) {
      setPageError(error instanceof Error ? error.message : 'Unable to fetch orders.');
    } finally {
      setLoading(false);
    }
  }

  async function fetchTemplates() {
    try {
      const response = await fetch('/api/admin/whatsapp-templates');
      const data = (await response.json()) as TemplateApiResponse;
      if (response.ok && Array.isArray(data.templates)) {
        setTemplates(data.templates);
      }
    } catch {
      // Fall back to default templates already bundled in helpers.
    }
  }

  async function fetchProducts() {
    const { data } = await supabase
      .from('products')
      .select('id, name, price, image, images, is_visible')
      .order('name', { ascending: true });

    setProducts(Array.isArray(data) ? (data as CatalogProduct[]) : []);
  }

  const filterCounts = useMemo(() => {
    return ORDER_FILTERS.reduce<Record<string, number>>((accumulator, filter) => {
      accumulator[filter.key] =
        filter.key === 'all'
          ? orders.length
          : orders.filter((order) => order.order_status === filter.key).length;
      return accumulator;
    }, {});
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesFilter = activeFilter === 'all' ? true : order.order_status === activeFilter;
      if (!matchesFilter) return false;

      if (!query) return true;

      return [order.customer_name, order.customer_phone, order.order_id]
        .map((value) => String(value || '').toLowerCase())
        .some((value) => value.includes(query));
    });
  }, [activeFilter, orders, searchQuery]);

  const dashboardStats = useMemo(() => {
    const today = startOfToday();
    const week = startOfWeek();
    const thisMonthStart = startOfMonth(0);
    const lastMonthStart = startOfMonth(-1);

    const todaysOrders = orders.filter((order) => new Date(order.created_at) >= today).length;
    const pendingOrders = orders.filter((order) => order.order_status === 'pending').length;
    const inProductionOrders = orders.filter((order) => order.order_status === 'in_production').length;
    const thisWeekRevenue = orders
      .filter((order) => order.order_status === 'delivered' && new Date(order.created_at) >= week)
      .reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
    const thisMonthProfit = orders
      .filter((order) => new Date(order.created_at) >= thisMonthStart)
      .reduce((sum, order) => sum + Number(order.profit || 0), 0);
    const lastMonthProfit = orders
      .filter((order) => {
        const createdAt = new Date(order.created_at);
        return createdAt >= lastMonthStart && createdAt < thisMonthStart;
      })
      .reduce((sum, order) => sum + Number(order.profit || 0), 0);

    return {
      todaysOrders,
      pendingOrders,
      inProductionOrders,
      thisWeekRevenue,
      thisMonthProfit,
      lastMonthProfit,
    };
  }, [orders]);

  const formTotal = useMemo(() => {
    return form.items.reduce((sum, item) => sum + Number(item.price || 0) * Math.max(1, Number(item.quantity || 1)), 0);
  }, [form.items]);

  const productResults = useMemo(() => {
    const query = productSearch.trim().toLowerCase();
    const visibleProducts = products.filter((product) => product.is_visible !== false);

    if (!query) return visibleProducts.slice(0, 12);
    return visibleProducts.filter((product) => product.name.toLowerCase().includes(query)).slice(0, 12);
  }, [productSearch, products]);

  function updateLocalOrder(id: string, partial: Partial<ManagedOrder>) {
    setOrders((currentOrders) =>
      currentOrders.map((order) => {
        if (order.id !== id) return order;
        const nextOrder = { ...order, ...partial };
        if (partial.designer_cost !== undefined || partial.total_amount !== undefined) {
          nextOrder.profit = calculateProfit(nextOrder.total_amount, nextOrder.designer_cost);
        }
        return nextOrder;
      }),
    );
  }

  function addProductToForm(product: CatalogProduct) {
    const image = getProductImage(product);

    setForm((currentForm) => {
      const existingIndex = currentForm.items.findIndex((item) => item.product_id === product.id);
      if (existingIndex >= 0) {
        return {
          ...currentForm,
          items: currentForm.items.map((item, index) =>
            index === existingIndex
              ? { ...item, quantity: Math.max(1, Number(item.quantity || 1)) + 1 }
              : item,
          ),
        };
      }

      return {
        ...currentForm,
        items: [
          ...currentForm.items,
          {
            product_id: product.id,
            name: product.name,
            quantity: 1,
            price: Number(product.price || 0),
            image,
          },
        ],
      };
    });
  }

  function addCustomItem() {
    if (!customItemName.trim() || !customItemPrice.trim()) return;

    setForm((currentForm) => ({
      ...currentForm,
      items: [
        ...currentForm.items,
        {
          name: customItemName.trim(),
          quantity: 1,
          price: Number(customItemPrice || 0),
          image: '/media/site/placeholder.svg',
        },
      ],
    }));

    setCustomItemName('');
    setCustomItemPrice('');
  }

  function updateFormItem(index: number, partial: Partial<ManagedOrderItem>) {
    setForm((currentForm) => ({
      ...currentForm,
      items: currentForm.items.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              ...partial,
            }
          : item,
      ),
    }));
  }

  function removeFormItem(index: number) {
    setForm((currentForm) => ({
      ...currentForm,
      items: currentForm.items.filter((_, itemIndex) => itemIndex !== index),
    }));
  }

  async function handleCreateOrder() {
    if (!form.customer_name.trim() || !form.customer_phone.trim() || form.items.length === 0) {
      setPageError('Client name, phone, and at least one item are required.');
      return;
    }

    setCreatingOrder(true);
    setPageError('');

    try {
      const response = await fetch('/api/admin/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_name: form.customer_name,
          customer_phone: form.customer_phone,
          customer_location: form.customer_location,
          items: form.items,
          total_amount: formTotal,
          designer_cost: Number(form.designer_cost || 0),
          payment_method: form.payment_method,
          payment_status: 'pending',
          order_status: 'pending',
          notes: form.notes,
          estimated_delivery: addDays(new Date(), 3).toISOString().slice(0, 10),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Unable to create order.');
      }

      if (data.order) {
        setOrders((currentOrders) => [normalizeOrderResponse(data.order), ...currentOrders]);
      }

      if (data.whatsapp?.whatsappUrl && typeof window !== 'undefined') {
        window.open(data.whatsapp.whatsappUrl, '_blank', 'noopener,noreferrer');
      }

      setForm(emptyCreateForm);
      setPanelOpen(false);
    } catch (error) {
      setPageError(error instanceof Error ? error.message : 'Unable to create order.');
    } finally {
      setCreatingOrder(false);
    }
  }

  async function saveOrderDetails(order: ManagedOrder) {
    setSavingOrderId(order.id);
    setPageError('');

    try {
      const response = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_name: order.customer_name,
          customer_phone: order.customer_phone,
          customer_location: order.customer_location,
          items: order.items,
          total_amount: order.total_amount,
          designer_cost: order.designer_cost,
          payment_method: order.payment_method,
          payment_status: order.payment_status,
          notes: order.notes,
          rider_name: order.rider_name,
          rider_phone: order.rider_phone,
          estimated_delivery: order.estimated_delivery,
          delivered_at: order.delivered_at,
          order_status: order.order_status,
          send_whatsapp: false,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Unable to save order.');
      }

      if (data.order) {
        updateLocalOrder(order.id, normalizeOrderResponse(data.order));
      }
    } catch (error) {
      setPageError(error instanceof Error ? error.message : 'Unable to save order.');
    } finally {
      setSavingOrderId(null);
    }
  }

  async function handleStatusChange(order: ManagedOrder, nextStatus: OrderStatus) {
    setSavingOrderId(order.id);
    setPageError('');

    try {
      const response = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order_status: nextStatus,
          send_whatsapp: true,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Unable to update order status.');
      }

      if (data.order) {
        updateLocalOrder(order.id, normalizeOrderResponse(data.order));
      }

      if (data.whatsapp?.whatsappUrl && typeof window !== 'undefined') {
        window.open(data.whatsapp.whatsappUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      setPageError(error instanceof Error ? error.message : 'Unable to update order status.');
    } finally {
      setSavingOrderId(null);
    }
  }

  function openWhatsappClient(order: ManagedOrder) {
    const { whatsappUrl } = buildStatusMessage(order, templates, {
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
      whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER,
    });

    if (typeof window !== 'undefined') {
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    }
  }

  return (
    <div className="space-y-6" style={{ color: '#1c1c1c' }}>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p
            className="text-[10px] uppercase"
            style={{ letterSpacing: '3px', color: '#8B5E3C', fontWeight: 400 }}
          >
            WhatsApp Order Desk
          </p>
          <h2 className="text-[22px]" style={{ fontWeight: 300 }}>
            Order Management
          </h2>
          <p className="text-xs" style={{ color: '#777', fontWeight: 400 }}>
            Manage statuses, private designer costs, profit, and client WhatsApp updates in one place.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setPanelOpen(true)}
          className="px-4 py-3 transition-colors"
          style={{
            ...buttonBaseStyle,
            backgroundColor: '#1c1c1c',
            color: '#ffffff',
          }}
          onMouseEnter={(event) => {
            event.currentTarget.style.backgroundColor = '#8B5E3C';
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.backgroundColor = '#1c1c1c';
          }}
        >
          New Order
        </button>
      </div>

      {pageError ? (
        <div
          className="border px-4 py-3 text-xs"
          style={{ borderColor: '#C0392B', color: '#C0392B', backgroundColor: '#fff7f7' }}
        >
          {pageError}
        </div>
      ) : null}

      <div className="grid gap-3 lg:grid-cols-4">
        {[
          { label: "Today's Orders", value: dashboardStats.todaysOrders },
          { label: 'Pending', value: dashboardStats.pendingOrders },
          { label: 'In Production', value: dashboardStats.inProductionOrders },
          { label: 'This Week Revenue', value: formatKes(dashboardStats.thisWeekRevenue) },
        ].map((stat) => (
          <div
            key={stat.label}
            className="border bg-white px-4 py-4"
            style={{ borderColor: '#ece7df' }}
          >
            <p className="text-[10px] uppercase" style={{ letterSpacing: '2px', color: '#8c8377', fontWeight: 400 }}>
              {stat.label}
            </p>
            <p className="mt-2 text-2xl" style={{ fontWeight: 300 }}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="border bg-white px-4 py-4" style={{ borderColor: '#ece7df' }}>
          <p className="text-[10px] uppercase" style={{ letterSpacing: '2px', color: '#8c8377', fontWeight: 400 }}>
            This Month Profit
          </p>
          <p className="mt-2 text-xl" style={{ fontWeight: 300, color: dashboardStats.thisMonthProfit >= 0 ? '#2E7D32' : '#C0392B' }}>
            {formatKes(dashboardStats.thisMonthProfit)}
          </p>
        </div>
        <div className="border bg-white px-4 py-4" style={{ borderColor: '#ece7df' }}>
          <p className="text-[10px] uppercase" style={{ letterSpacing: '2px', color: '#8c8377', fontWeight: 400 }}>
            Last Month Profit
          </p>
          <p className="mt-2 text-xl" style={{ fontWeight: 300, color: dashboardStats.lastMonthProfit >= 0 ? '#2E7D32' : '#C0392B' }}>
            {formatKes(dashboardStats.lastMonthProfit)}
          </p>
        </div>
      </div>

      <div className="border bg-white p-4" style={{ borderColor: '#ece7df' }}>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {ORDER_FILTERS.map((filter) => {
              const isActive = activeFilter === filter.key;
              return (
                <button
                  key={filter.key}
                  type="button"
                  onClick={() => setActiveFilter(filter.key)}
                  className="inline-flex items-center gap-2 border px-3 py-2 text-[10px] uppercase transition-colors"
                  style={{
                    borderColor: isActive ? '#8B5E3C' : '#ece7df',
                    backgroundColor: isActive ? '#8B5E3C' : '#ffffff',
                    color: isActive ? '#ffffff' : '#1c1c1c',
                    borderRadius: '2px',
                    letterSpacing: '2px',
                    fontWeight: 400,
                  }}
                >
                  <span>{filter.label}</span>
                  <span
                    className="inline-flex min-w-6 items-center justify-center px-1"
                    style={{
                      backgroundColor: isActive ? 'rgba(255,255,255,0.18)' : '#f2ede7',
                      color: isActive ? '#ffffff' : '#8B5E3C',
                      borderRadius: '999px',
                    }}
                  >
                    {filterCounts[filter.key] || 0}
                  </span>
                </button>
              );
            })}
          </div>
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search name, phone or order ID"
            className="w-full border px-3 py-3 text-xs lg:max-w-sm"
            style={{
              borderColor: '#e0d8cf',
              borderRadius: '2px',
              fontWeight: 400,
            }}
          />
        </div>
      </div>

      {loading ? (
        <div className="text-xs" style={{ color: '#777' }}>
          Loading orders...
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="border bg-white px-4 py-8 text-center text-xs" style={{ borderColor: '#ece7df', color: '#777' }}>
          No orders match the current filter.
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredOrders.map((order) => {
            const statusMeta = ORDER_STATUS_META[order.order_status];
            const isSaving = savingOrderId === order.id;

            return (
              <article key={order.id} className="border bg-white p-4" style={{ borderColor: '#ece7df' }}>
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className="border px-2 py-1 text-[10px] uppercase"
                        style={{
                          borderColor: '#ece7df',
                          borderRadius: '2px',
                          letterSpacing: '2px',
                          fontWeight: 500,
                        }}
                      >
                        {order.order_id}
                      </span>
                      <span
                        className="px-2 py-1 text-[10px] uppercase"
                        style={{
                          backgroundColor: statusMeta.color,
                          color: statusMeta.textColor,
                          borderRadius: '2px',
                          letterSpacing: '2px',
                          fontWeight: 400,
                        }}
                      >
                        {statusMeta.label}
                      </span>
                    </div>

                    <div className="grid gap-1 text-xs" style={{ color: '#5f584f', fontWeight: 400 }}>
                      <p>
                        <span style={{ color: '#1c1c1c', fontWeight: 500 }}>{order.customer_name}</span>
                      </p>
                      <p>{order.customer_phone}</p>
                      <p>{order.customer_location || 'Location not added yet'}</p>
                      <p>Created {formatDateLabel(order.created_at)}</p>
                    </div>
                  </div>

                  <div className="grid gap-2 md:grid-cols-2 xl:w-[360px]">
                    <label className="grid gap-1 text-[10px] uppercase" style={{ letterSpacing: '2px', color: '#8c8377', fontWeight: 400 }}>
                      <span>Status</span>
                      <select
                        value={order.order_status}
                        onChange={(event) => handleStatusChange(order, event.target.value as OrderStatus)}
                        disabled={isSaving}
                        className="border px-3 py-3 text-xs"
                        style={{
                          borderColor: '#e0d8cf',
                          borderRadius: '2px',
                          fontWeight: 400,
                          color: '#1c1c1c',
                        }}
                      >
                        {ORDER_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {ORDER_STATUS_META[status].label}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="grid gap-1 text-[10px] uppercase" style={{ letterSpacing: '2px', color: '#8c8377', fontWeight: 400 }}>
                      <span>Payment Method</span>
                      <select
                        value={order.payment_method || ''}
                        onChange={(event) => updateLocalOrder(order.id, { payment_method: event.target.value })}
                        className="border px-3 py-3 text-xs"
                        style={{
                          borderColor: '#e0d8cf',
                          borderRadius: '2px',
                          fontWeight: 400,
                        }}
                      >
                        {PAYMENT_METHODS.map((method) => (
                          <option key={method} value={method}>
                            {method}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
                  <div className="grid gap-3">
                    {order.items.map((item, index) => (
                      <div
                        key={`${order.id}-item-${index}`}
                        className="grid grid-cols-[56px_minmax(0,1fr)_auto] items-center gap-3 border px-3 py-3"
                        style={{ borderColor: '#f0ebe5' }}
                      >
                        <div className="relative h-14 w-14 overflow-hidden" style={{ backgroundColor: '#f6f1ea' }}>
                          <Image
                            src={getOrderItemImage(item)}
                            alt={item.name}
                            fill
                            unoptimized={isRemoteUrl(getOrderItemImage(item))}
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm" style={{ fontWeight: 400, color: '#1c1c1c' }}>
                            {item.name}
                          </p>
                          <p className="text-xs" style={{ color: '#777', fontWeight: 400 }}>
                            Qty {item.quantity}
                          </p>
                        </div>
                        <p className="text-xs" style={{ fontWeight: 500 }}>
                          {formatKes(Number(item.price || 0) * Math.max(1, Number(item.quantity || 1)))}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="grid gap-3 border p-4" style={{ borderColor: '#f0ebe5' }}>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <label className="grid gap-1 text-[10px] uppercase" style={{ letterSpacing: '2px', color: '#8c8377', fontWeight: 400 }}>
                        <span>Total</span>
                        <input
                          type="number"
                          min="0"
                          value={order.total_amount}
                          onChange={(event) => updateLocalOrder(order.id, { total_amount: Number(event.target.value || 0) })}
                          className="border px-3 py-3 text-xs"
                          style={{ borderColor: '#e0d8cf', borderRadius: '2px', fontWeight: 400 }}
                        />
                      </label>
                      <label className="grid gap-1 text-[10px] uppercase" style={{ letterSpacing: '2px', color: '#8c8377', fontWeight: 400 }}>
                        <span>Designer Cost (Private)</span>
                        <input
                          type="number"
                          min="0"
                          value={order.designer_cost}
                          onChange={(event) => updateLocalOrder(order.id, { designer_cost: Number(event.target.value || 0) })}
                          className="border px-3 py-3 text-xs"
                          style={{ borderColor: '#e0d8cf', borderRadius: '2px', fontWeight: 400 }}
                        />
                      </label>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2">
                      <label className="grid gap-1 text-[10px] uppercase" style={{ letterSpacing: '2px', color: '#8c8377', fontWeight: 400 }}>
                        <span>Rider Name</span>
                        <input
                          type="text"
                          value={order.rider_name || ''}
                          onChange={(event) => updateLocalOrder(order.id, { rider_name: event.target.value })}
                          className="border px-3 py-3 text-xs"
                          style={{ borderColor: '#e0d8cf', borderRadius: '2px', fontWeight: 400 }}
                        />
                      </label>
                      <label className="grid gap-1 text-[10px] uppercase" style={{ letterSpacing: '2px', color: '#8c8377', fontWeight: 400 }}>
                        <span>Rider Phone</span>
                        <input
                          type="text"
                          value={order.rider_phone || ''}
                          onChange={(event) => updateLocalOrder(order.id, { rider_phone: event.target.value })}
                          className="border px-3 py-3 text-xs"
                          style={{ borderColor: '#e0d8cf', borderRadius: '2px', fontWeight: 400 }}
                        />
                      </label>
                    </div>

                    <label className="grid gap-1 text-[10px] uppercase" style={{ letterSpacing: '2px', color: '#8c8377', fontWeight: 400 }}>
                      <span>Estimated Delivery</span>
                      <input
                        type="date"
                        value={toDateInputValue(order.estimated_delivery)}
                        onChange={(event) => updateLocalOrder(order.id, { estimated_delivery: event.target.value })}
                        className="border px-3 py-3 text-xs"
                        style={{ borderColor: '#e0d8cf', borderRadius: '2px', fontWeight: 400 }}
                      />
                    </label>

                    <label className="grid gap-1 text-[10px] uppercase" style={{ letterSpacing: '2px', color: '#8c8377', fontWeight: 400 }}>
                      <span>Notes</span>
                      <textarea
                        value={order.notes || ''}
                        onChange={(event) => updateLocalOrder(order.id, { notes: event.target.value })}
                        rows={3}
                        className="border px-3 py-3 text-xs"
                        style={{ borderColor: '#e0d8cf', borderRadius: '2px', fontWeight: 400 }}
                      />
                    </label>

                    <div className="grid gap-1 border-t pt-3 text-xs" style={{ borderColor: '#f0ebe5' }}>
                      <div className="flex items-center justify-between">
                        <span style={{ color: '#777', fontWeight: 400 }}>Profit</span>
                        <span style={{ color: order.profit >= 0 ? '#2E7D32' : '#C0392B', fontWeight: 500 }}>
                          {formatKes(order.profit)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span style={{ color: '#777', fontWeight: 400 }}>Tracking Stages</span>
                        <span style={{ color: '#1c1c1c', fontWeight: 400 }}>
                          {PUBLIC_TRACKING_STEPS.map((step) => ORDER_STATUS_META[step].label).join(' · ')}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row">
                      <button
                        type="button"
                        onClick={() => saveOrderDetails(order)}
                        disabled={isSaving}
                        className="px-4 py-3 transition-colors"
                        style={{
                          ...buttonBaseStyle,
                          backgroundColor: '#ffffff',
                          color: '#1c1c1c',
                          border: '1px solid #1c1c1c',
                        }}
                      >
                        {isSaving ? 'Saving...' : 'Save Order'}
                      </button>
                      <button
                        type="button"
                        onClick={() => openWhatsappClient(order)}
                        className="px-4 py-3 transition-colors"
                        style={{
                          ...buttonBaseStyle,
                          backgroundColor: '#1c1c1c',
                          color: '#ffffff',
                        }}
                        onMouseEnter={(event) => {
                          event.currentTarget.style.backgroundColor = '#8B5E3C';
                        }}
                        onMouseLeave={(event) => {
                          event.currentTarget.style.backgroundColor = '#1c1c1c';
                        }}
                      >
                        WhatsApp Client
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <div
        className={`fixed inset-y-0 right-0 z-40 w-full max-w-xl border-l bg-[#fbf8f3] transition-transform ${panelOpen ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ borderColor: '#ece7df' }}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: '#ece7df' }}>
            <div>
              <p className="text-[10px] uppercase" style={{ letterSpacing: '2px', color: '#8c8377', fontWeight: 400 }}>
                Manual Order Creation
              </p>
              <h3 className="text-lg" style={{ fontWeight: 300 }}>
                New Order
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setPanelOpen(false)}
              className="border px-3 py-2 text-[10px] uppercase"
              style={{ borderColor: '#1c1c1c', borderRadius: '2px', letterSpacing: '2px', fontWeight: 400 }}
            >
              Close
            </button>
          </div>

          <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1 text-[10px] uppercase" style={{ letterSpacing: '2px', color: '#8c8377', fontWeight: 400 }}>
                <span>Client Name *</span>
                <input
                  type="text"
                  value={form.customer_name}
                  onChange={(event) => setForm((currentForm) => ({ ...currentForm, customer_name: event.target.value }))}
                  className="border px-3 py-3 text-xs"
                  style={{ borderColor: '#e0d8cf', borderRadius: '2px', fontWeight: 400 }}
                />
              </label>
              <label className="grid gap-1 text-[10px] uppercase" style={{ letterSpacing: '2px', color: '#8c8377', fontWeight: 400 }}>
                <span>Client Phone *</span>
                <input
                  type="text"
                  value={form.customer_phone}
                  onChange={(event) => setForm((currentForm) => ({ ...currentForm, customer_phone: event.target.value }))}
                  className="border px-3 py-3 text-xs"
                  style={{ borderColor: '#e0d8cf', borderRadius: '2px', fontWeight: 400 }}
                />
              </label>
            </div>

            <label className="grid gap-1 text-[10px] uppercase" style={{ letterSpacing: '2px', color: '#8c8377', fontWeight: 400 }}>
              <span>Client Location</span>
              <input
                type="text"
                value={form.customer_location}
                onChange={(event) => setForm((currentForm) => ({ ...currentForm, customer_location: event.target.value }))}
                className="border px-3 py-3 text-xs"
                style={{ borderColor: '#e0d8cf', borderRadius: '2px', fontWeight: 400 }}
              />
            </label>

            <div className="space-y-3 border p-4" style={{ borderColor: '#ece7df' }}>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm" style={{ fontWeight: 400 }}>
                    Items
                  </p>
                  <p className="text-xs" style={{ color: '#777', fontWeight: 400 }}>
                    Search from products or add a custom line item.
                  </p>
                </div>
                <input
                  type="search"
                  value={productSearch}
                  onChange={(event) => setProductSearch(event.target.value)}
                  placeholder="Search products"
                  className="border px-3 py-3 text-xs sm:w-64"
                  style={{ borderColor: '#e0d8cf', borderRadius: '2px', fontWeight: 400 }}
                />
              </div>

              <div className="grid gap-2">
                {productResults.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => addProductToForm(product)}
                    className="grid grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-3 border px-3 py-2 text-left"
                    style={{ borderColor: '#f0ebe5', borderRadius: '2px' }}
                  >
                    <div className="relative h-11 w-11 overflow-hidden" style={{ backgroundColor: '#f4eee6' }}>
                      <Image
                        src={getProductImage(product)}
                        alt={product.name}
                        fill
                        unoptimized={isRemoteUrl(getProductImage(product))}
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm" style={{ fontWeight: 400 }}>
                        {product.name}
                      </p>
                      <p className="text-xs" style={{ color: '#777', fontWeight: 400 }}>
                        {formatKes(product.price)}
                      </p>
                    </div>
                    <span className="text-[10px] uppercase" style={{ letterSpacing: '2px', color: '#8B5E3C', fontWeight: 500 }}>
                      Add
                    </span>
                  </button>
                ))}
              </div>

              <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_120px_auto]">
                <input
                  type="text"
                  value={customItemName}
                  onChange={(event) => setCustomItemName(event.target.value)}
                  placeholder="Custom item"
                  className="border px-3 py-3 text-xs"
                  style={{ borderColor: '#e0d8cf', borderRadius: '2px', fontWeight: 400 }}
                />
                <input
                  type="number"
                  min="0"
                  value={customItemPrice}
                  onChange={(event) => setCustomItemPrice(event.target.value)}
                  placeholder="Price"
                  className="border px-3 py-3 text-xs"
                  style={{ borderColor: '#e0d8cf', borderRadius: '2px', fontWeight: 400 }}
                />
                <button
                  type="button"
                  onClick={addCustomItem}
                  className="px-4 py-3"
                  style={{
                    ...buttonBaseStyle,
                    backgroundColor: '#1c1c1c',
                    color: '#ffffff',
                  }}
                >
                  Add Custom
                </button>
              </div>

              <div className="grid gap-3">
                {form.items.map((item, index) => (
                  <div key={`${item.name}-${index}`} className="border p-3" style={{ borderColor: '#f0ebe5' }}>
                    <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_88px_120px_auto]">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(event) => updateFormItem(index, { name: event.target.value })}
                        className="border px-3 py-3 text-xs"
                        style={{ borderColor: '#e0d8cf', borderRadius: '2px', fontWeight: 400 }}
                      />
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(event) => updateFormItem(index, { quantity: Math.max(1, Number(event.target.value || 1)) })}
                        className="border px-3 py-3 text-xs"
                        style={{ borderColor: '#e0d8cf', borderRadius: '2px', fontWeight: 400 }}
                      />
                      <input
                        type="number"
                        min="0"
                        value={item.price}
                        onChange={(event) => updateFormItem(index, { price: Number(event.target.value || 0) })}
                        className="border px-3 py-3 text-xs"
                        style={{ borderColor: '#e0d8cf', borderRadius: '2px', fontWeight: 400 }}
                      />
                      <button
                        type="button"
                        onClick={() => removeFormItem(index)}
                        className="border px-3 py-3 text-[10px] uppercase"
                        style={{
                          borderColor: '#C0392B',
                          color: '#C0392B',
                          borderRadius: '2px',
                          letterSpacing: '2px',
                          fontWeight: 400,
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1 text-[10px] uppercase" style={{ letterSpacing: '2px', color: '#8c8377', fontWeight: 400 }}>
                <span>Payment Method</span>
                <select
                  value={form.payment_method}
                  onChange={(event) => setForm((currentForm) => ({ ...currentForm, payment_method: event.target.value }))}
                  className="border px-3 py-3 text-xs"
                  style={{ borderColor: '#e0d8cf', borderRadius: '2px', fontWeight: 400 }}
                >
                  {PAYMENT_METHODS.map((method) => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1 text-[10px] uppercase" style={{ letterSpacing: '2px', color: '#8c8377', fontWeight: 400 }}>
                <span>Designer Cost (Private)</span>
                <input
                  type="number"
                  min="0"
                  value={form.designer_cost}
                  onChange={(event) => setForm((currentForm) => ({ ...currentForm, designer_cost: event.target.value }))}
                  className="border px-3 py-3 text-xs"
                  style={{ borderColor: '#e0d8cf', borderRadius: '2px', fontWeight: 400 }}
                />
              </label>
            </div>

            <label className="grid gap-1 text-[10px] uppercase" style={{ letterSpacing: '2px', color: '#8c8377', fontWeight: 400 }}>
              <span>Notes</span>
              <textarea
                value={form.notes}
                onChange={(event) => setForm((currentForm) => ({ ...currentForm, notes: event.target.value }))}
                rows={4}
                className="border px-3 py-3 text-xs"
                style={{ borderColor: '#e0d8cf', borderRadius: '2px', fontWeight: 400 }}
              />
            </label>
          </div>

          <div className="border-t px-5 py-4" style={{ borderColor: '#ece7df' }}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] uppercase" style={{ letterSpacing: '2px', color: '#8c8377', fontWeight: 400 }}>
                  Order Total
                </p>
                <p className="text-xl" style={{ fontWeight: 300 }}>
                  {formatKes(formTotal)}
                </p>
              </div>
              <button
                type="button"
                onClick={handleCreateOrder}
                disabled={creatingOrder}
                className="px-4 py-3"
                style={{
                  ...buttonBaseStyle,
                  backgroundColor: '#1c1c1c',
                  color: '#ffffff',
                }}
              >
                {creatingOrder ? 'Creating...' : 'Save Order'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {panelOpen ? (
        <button
          type="button"
          aria-label="Close order panel overlay"
          className="fixed inset-0 z-30 bg-black/20"
          onClick={() => setPanelOpen(false)}
        />
      ) : null}
    </div>
  );
}
