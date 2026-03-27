-- SharonCraft Supabase schema
-- Run this whole script in Supabase SQL Editor.

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

alter table public.products enable row level security;
alter table public.site_settings enable row level security;
alter table public.analytics_events enable row level security;
alter table public.admin_users enable row level security;

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
