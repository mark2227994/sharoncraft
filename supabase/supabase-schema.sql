-- SharonCraft Supabase schema
-- Run this whole script in Supabase SQL Editor.
-- Safe to re-run: it uses create-if-missing and replace-style policies.

-- Cleanup from the older customer_profiles approach.
drop trigger if exists sync_customer_profile_from_auth on auth.users;
drop function if exists public.sync_customer_profile_from_auth();
drop table if exists public.customer_profiles;

-- Core products table used by storefront + publishing flows.
create table if not exists public.products (
  id text primary key,
  image text not null default '',
  name text not null,
  price integer not null default 0 check (price >= 0),
  material text not null default 'wood',
  story text not null default 'Handmade by SharonCraft artisans.',
  specs jsonb not null default '[]'::jsonb,
  gallery jsonb not null default '[]'::jsonb,
  sold_out boolean not null default false,
  spotlight_until timestamptz,
  spotlight_text text not null default '',
  notes text not null default '',
  updated_at timestamptz not null default now(),
  new_until timestamptz,
  sort_order integer not null default 0
);

create index if not exists products_sort_order_idx on public.products(sort_order);
create index if not exists products_updated_at_idx on public.products(updated_at desc);

-- Site settings table for small website-wide config payloads (e.g., homepage visuals).
create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Storefront analytics events synced from the live website.
create table if not exists public.analytics_events (
  id bigint generated always as identity primary key,
  name text not null check (char_length(name) > 0),
  page_type text not null default '',
  page_path text not null default '',
  page_title text not null default '',
  product_id text not null default '',
  product_name text not null default '',
  item_list_id text not null default '',
  item_list_name text not null default '',
  button_label text not null default '',
  destination text not null default '',
  value numeric not null default 0,
  currency text not null default '',
  visitor_id text not null default '',
  session_id text not null default '',
  event_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists analytics_events_created_at_idx on public.analytics_events(created_at desc);
create index if not exists analytics_events_name_idx on public.analytics_events(name);
create index if not exists analytics_events_product_id_idx on public.analytics_events(product_id);

-- Admin allow-list table: only these auth users can publish/edit products.
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  created_at timestamptz not null default now()
);

-- Full admin orders table. This keeps customer details private to admins.
create table if not exists public.orders (
  id text primary key,
  customer_name text not null default '',
  customer_phone text not null default '',
  product_id text not null default '',
  product_name text not null default '',
  quantity integer not null default 1 check (quantity > 0),
  delivery_area_id text not null default '',
  delivery_area text not null default '',
  status text not null default 'new' check (
    status = any (array['new', 'confirmed', 'paid', 'delivered', 'cancelled'])
  ),
  note text not null default '',
  total_profit integer not null default 0 check (total_profit >= 0),
  order_total integer not null default 0 check (order_total >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.orders add column if not exists checkout_reference text not null default '';
alter table public.orders add column if not exists payment_method text not null default '';
alter table public.orders add column if not exists payment_reference text not null default '';

create index if not exists orders_created_at_idx on public.orders(created_at desc);
create index if not exists orders_checkout_reference_idx on public.orders(checkout_reference);
create index if not exists orders_customer_phone_idx on public.orders(customer_phone);
create index if not exists orders_status_idx on public.orders(status);

-- Public-safe tracking table. Customers can look up status by order ID without seeing private contact data.
create table if not exists public.order_tracking (
  id text primary key references public.orders(id) on delete cascade,
  product_name text not null default '',
  quantity integer not null default 1 check (quantity > 0),
  delivery_area text not null default '',
  status text not null default 'new' check (
    status = any (array['new', 'confirmed', 'paid', 'delivered', 'cancelled'])
  ),
  note text not null default '',
  order_total integer not null default 0 check (order_total >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists order_tracking_status_idx on public.order_tracking(status);
create index if not exists order_tracking_updated_at_idx on public.order_tracking(updated_at desc);

-- M-Pesa checkout requests created from the storefront.
create table if not exists public.mpesa_checkouts (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  customer_name text not null default '',
  customer_email text not null default '',
  customer_phone text not null default '',
  delivery_area text not null default '',
  amount integer not null check (amount > 0),
  currency text not null default 'KES',
  items jsonb not null default '[]'::jsonb,
  status text not null default 'initiated' check (
    status = any (array['initiated', 'prompted', 'paid', 'failed', 'cancelled'])
  ),
  merchant_request_id text not null default '',
  checkout_request_id text not null default '',
  mpesa_receipt_number text not null default '',
  result_code integer,
  result_desc text not null default '',
  request_payload jsonb not null default '{}'::jsonb,
  response_payload jsonb not null default '{}'::jsonb,
  callback_payload jsonb not null default '{}'::jsonb,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.mpesa_checkouts add column if not exists order_ids jsonb not null default '[]'::jsonb;

create index if not exists mpesa_checkouts_created_at_idx on public.mpesa_checkouts(created_at desc);
create index if not exists mpesa_checkouts_reference_idx on public.mpesa_checkouts(reference);
create index if not exists mpesa_checkouts_status_idx on public.mpesa_checkouts(status);
create index if not exists mpesa_checkouts_checkout_request_idx on public.mpesa_checkouts(checkout_request_id);

create table if not exists public.whatsapp_notifications (
  id bigint generated always as identity primary key,
  event_type text not null default '',
  template_name text not null default '',
  template_language text not null default '',
  provider text not null default '',
  recipient_phone text not null default '',
  checkout_reference text not null default '',
  order_ids jsonb not null default '[]'::jsonb,
  status text not null default 'pending' check (
    status = any (array['pending', 'sent', 'failed', 'skipped'])
  ),
  provider_message_id text not null default '',
  error_message text not null default '',
  request_payload jsonb not null default '{}'::jsonb,
  response_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists whatsapp_notifications_created_at_idx on public.whatsapp_notifications(created_at desc);
create index if not exists whatsapp_notifications_checkout_reference_idx on public.whatsapp_notifications(checkout_reference);
create index if not exists whatsapp_notifications_status_idx on public.whatsapp_notifications(status);
create index if not exists whatsapp_notifications_event_type_idx on public.whatsapp_notifications(event_type);

alter table public.products enable row level security;
alter table public.site_settings enable row level security;
alter table public.analytics_events enable row level security;
alter table public.admin_users enable row level security;
alter table public.orders enable row level security;
alter table public.order_tracking enable row level security;
alter table public.mpesa_checkouts enable row level security;
alter table public.whatsapp_notifications enable row level security;

drop policy if exists "Public read products" on public.products;
create policy "Public read products"
on public.products
for select
to anon, authenticated
using (true);

drop policy if exists "Public read site settings" on public.site_settings;
create policy "Public read site settings"
on public.site_settings
for select
to anon, authenticated
using (true);

drop policy if exists "Public read order tracking" on public.order_tracking;
create policy "Public read order tracking"
on public.order_tracking
for select
to anon, authenticated
using (true);

drop policy if exists "Public insert analytics events" on public.analytics_events;
create policy "Public insert analytics events"
on public.analytics_events
for insert
to anon, authenticated
with check (
  name = any (
    array[
      'page_view',
      'product_view',
      'add_to_cart',
      'whatsapp_click',
      'view_item_list',
      'select_item'
    ]
  )
);

drop policy if exists "Admin read analytics events" on public.analytics_events;
create policy "Admin read analytics events"
on public.analytics_events
for select
to authenticated
using (
  exists (
    select 1
    from public.admin_users au
    where au.user_id = auth.uid()
  )
);

drop policy if exists "Admin delete analytics events" on public.analytics_events;
create policy "Admin delete analytics events"
on public.analytics_events
for delete
to authenticated
using (
  exists (
    select 1
    from public.admin_users au
    where au.user_id = auth.uid()
  )
);

drop policy if exists "Admin insert site settings" on public.site_settings;
create policy "Admin insert site settings"
on public.site_settings
for insert
to authenticated
with check (
  exists (
    select 1
    from public.admin_users au
    where au.user_id = auth.uid()
  )
);

drop policy if exists "Admin update site settings" on public.site_settings;
create policy "Admin update site settings"
on public.site_settings
for update
to authenticated
using (
  exists (
    select 1
    from public.admin_users au
    where au.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.admin_users au
    where au.user_id = auth.uid()
  )
);

drop policy if exists "Admin delete site settings" on public.site_settings;
create policy "Admin delete site settings"
on public.site_settings
for delete
to authenticated
using (
  exists (
    select 1
    from public.admin_users au
    where au.user_id = auth.uid()
  )
);

drop policy if exists "Admin insert products" on public.products;
create policy "Admin insert products"
on public.products
for insert
to authenticated
with check (
  exists (
    select 1
    from public.admin_users au
    where au.user_id = auth.uid()
  )
);

drop policy if exists "Admin update products" on public.products;
create policy "Admin update products"
on public.products
for update
to authenticated
using (
  exists (
    select 1
    from public.admin_users au
    where au.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.admin_users au
    where au.user_id = auth.uid()
  )
);

drop policy if exists "Admin delete products" on public.products;
create policy "Admin delete products"
on public.products
for delete
to authenticated
using (
  exists (
    select 1
    from public.admin_users au
    where au.user_id = auth.uid()
  )
);

drop policy if exists "Admin user can read own admin row" on public.admin_users;
create policy "Admin user can read own admin row"
on public.admin_users
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "Admin read orders" on public.orders;
create policy "Admin read orders"
on public.orders
for select
to authenticated
using (
  exists (
    select 1
    from public.admin_users au
    where au.user_id = auth.uid()
  )
);

drop policy if exists "Admin insert orders" on public.orders;
create policy "Admin insert orders"
on public.orders
for insert
to authenticated
with check (
  exists (
    select 1
    from public.admin_users au
    where au.user_id = auth.uid()
  )
);

drop policy if exists "Admin update orders" on public.orders;
create policy "Admin update orders"
on public.orders
for update
to authenticated
using (
  exists (
    select 1
    from public.admin_users au
    where au.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.admin_users au
    where au.user_id = auth.uid()
  )
);

drop policy if exists "Admin delete orders" on public.orders;
create policy "Admin delete orders"
on public.orders
for delete
to authenticated
using (
  exists (
    select 1
    from public.admin_users au
    where au.user_id = auth.uid()
  )
);

drop policy if exists "Admin read order tracking" on public.order_tracking;
create policy "Admin read order tracking"
on public.order_tracking
for select
to authenticated
using (
  exists (
    select 1
    from public.admin_users au
    where au.user_id = auth.uid()
  )
);

drop policy if exists "Admin insert order tracking" on public.order_tracking;
create policy "Admin insert order tracking"
on public.order_tracking
for insert
to authenticated
with check (
  exists (
    select 1
    from public.admin_users au
    where au.user_id = auth.uid()
  )
);

drop policy if exists "Admin update order tracking" on public.order_tracking;
create policy "Admin update order tracking"
on public.order_tracking
for update
to authenticated
using (
  exists (
    select 1
    from public.admin_users au
    where au.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.admin_users au
    where au.user_id = auth.uid()
  )
);

drop policy if exists "Admin delete order tracking" on public.order_tracking;
create policy "Admin delete order tracking"
on public.order_tracking
for delete
to authenticated
using (
  exists (
    select 1
    from public.admin_users au
    where au.user_id = auth.uid()
  )
);

drop policy if exists "Admin read mpesa checkouts" on public.mpesa_checkouts;
create policy "Admin read mpesa checkouts"
on public.mpesa_checkouts
for select
to authenticated
using (
  exists (
    select 1
    from public.admin_users au
    where au.user_id = auth.uid()
  )
);

drop policy if exists "Admin read whatsapp notifications" on public.whatsapp_notifications;
create policy "Admin read whatsapp notifications"
on public.whatsapp_notifications
for select
to authenticated
using (
  exists (
    select 1
    from public.admin_users au
    where au.user_id = auth.uid()
  )
);

drop policy if exists "Admin update mpesa checkouts" on public.mpesa_checkouts;
create policy "Admin update mpesa checkouts"
on public.mpesa_checkouts
for update
to authenticated
using (
  exists (
    select 1
    from public.admin_users au
    where au.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.admin_users au
    where au.user_id = auth.uid()
  )
);

-- Public image bucket used by product image uploads.
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update
set public = excluded.public;

drop policy if exists "Public view product images" on storage.objects;
create policy "Public view product images"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'product-images');

drop policy if exists "Admin upload product images" on storage.objects;
create policy "Admin upload product images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'product-images'
  and exists (
    select 1
    from public.admin_users au
    where au.user_id = auth.uid()
  )
);

drop policy if exists "Admin update product images" on storage.objects;
create policy "Admin update product images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'product-images'
  and exists (
    select 1
    from public.admin_users au
    where au.user_id = auth.uid()
  )
)
with check (
  bucket_id = 'product-images'
  and exists (
    select 1
    from public.admin_users au
    where au.user_id = auth.uid()
  )
);

drop policy if exists "Admin delete product images" on storage.objects;
create policy "Admin delete product images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'product-images'
  and exists (
    select 1
    from public.admin_users au
    where au.user_id = auth.uid()
  )
);

-- Optional: add first admin user after creating an Auth user.
-- Replace with your email address and run separately:
-- insert into public.admin_users (user_id, email)
-- select id, email
-- from auth.users
-- where email = 'your-admin-email@example.com'
-- on conflict (user_id) do update set email = excluded.email;
