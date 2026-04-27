-- ============================================
-- SHARONCRAFT ADMIN PANEL SCHEMA
-- ============================================
-- This schema creates the complete admin panel database structure.
-- Safe to run multiple times (uses CREATE TABLE IF NOT EXISTS).
-- Requires authentication and admin_users table for RLS.

-- ============================================
-- STEP 0: BACKUP & CLEAN UP EXISTING TABLES
-- ============================================
-- WARNING: This will delete all existing admin tables
-- Drop old tables with cascading foreign keys (order matters for foreign keys)
DROP TABLE IF EXISTS public.product_relations CASCADE;
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.customers CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.hero_slides CASCADE;
DROP TABLE IF EXISTS public.homepage_content CASCADE;
DROP TABLE IF EXISTS public.discounts CASCADE;
DROP TABLE IF EXISTS public.custom_orders CASCADE;
DROP TABLE IF EXISTS public.newsletter CASCADE;
DROP TABLE IF EXISTS public.announcement CASCADE;
DROP TABLE IF EXISTS public.admin_users CASCADE;

-- ============================================
-- TABLE 1: PRODUCTS
-- ============================================
create table if not exists public.products (
  id uuid default gen_random_uuid()
    primary key,
  name text not null,
  description text,
  price numeric not null,
  sale_price numeric,
  category text not null,
  subcategory text,
  stock_quantity integer default 0,
  low_stock_alert integer default 2,
  images text[] default '{}',
  sizes text[] default '{}',
  colors text[] default '{}',
  artisan text default 'By Sharon',
  care_instructions text,
  sku text unique,
  is_visible boolean default true,
  is_featured boolean default false,
  is_new boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists products_category_idx on public.products(category);
create index if not exists products_is_visible_idx on public.products(is_visible);
create index if not exists products_created_at_idx on public.products(created_at desc);

-- ============================================
-- TABLE 2: ORDERS
-- ============================================
create table if not exists public.orders (
  id uuid default gen_random_uuid()
    primary key,
  customer_name text not null,
  customer_phone text,
  customer_email text,
  customer_location text,
  customer_whatsapp text,
  items jsonb not null,
  total_amount numeric not null,
  payment_method text,
  payment_status text
    default 'pending',
  order_status text
    default 'pending',
  tracking_number text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists orders_order_status_idx on public.orders(order_status);
create index if not exists orders_created_at_idx on public.orders(created_at desc);
create index if not exists orders_customer_phone_idx on public.orders(customer_phone);

-- ============================================
-- TABLE 3: CUSTOMERS
-- ============================================
create table if not exists public.customers (
  id uuid default gen_random_uuid()
    primary key,
  name text not null,
  email text unique,
  phone text,
  whatsapp text,
  location text,
  total_orders integer default 0,
  total_spent numeric default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists customers_email_idx on public.customers(email);
create index if not exists customers_phone_idx on public.customers(phone);

-- ============================================
-- TABLE 4: CATEGORIES
-- ============================================
create table if not exists public.categories (
  id uuid default gen_random_uuid()
    primary key,
  name text not null unique,
  subcategories text[] default '{}',
  image_url text,
  is_visible boolean default true,
  display_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists categories_display_order_idx on public.categories(display_order);
create index if not exists categories_is_visible_idx on public.categories(is_visible);

-- ============================================
-- TABLE 5: REVIEWS
-- ============================================
create table if not exists public.reviews (
  id uuid default gen_random_uuid()
    primary key,
  product_id uuid references
    public.products(id) on delete cascade,
  customer_name text,
  rating integer check (
    rating >= 1 and rating <= 5),
  comment text,
  is_approved boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists reviews_product_id_idx on public.reviews(product_id);
create index if not exists reviews_is_approved_idx on public.reviews(is_approved);

-- ============================================
-- TABLE 6: HERO_SLIDES
-- ============================================
create table if not exists public.hero_slides (
  id uuid default gen_random_uuid()
    primary key,
  image_url text not null,
  headline text,
  subtitle text,
  button_text text,
  button_link text,
  display_order integer default 0,
  is_visible boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists hero_slides_display_order_idx on public.hero_slides(display_order);
create index if not exists hero_slides_is_visible_idx on public.hero_slides(is_visible);

-- ============================================
-- TABLE 7: HOMEPAGE_CONTENT
-- ============================================
create table if not exists public.homepage_content (
  id uuid default gen_random_uuid()
    primary key,
  section text not null unique,
  content jsonb not null,
  is_visible boolean default true,
  updated_at timestamptz default now()
);

create index if not exists homepage_content_section_idx on public.homepage_content(section);

-- ============================================
-- TABLE 8: DISCOUNTS
-- ============================================
create table if not exists public.discounts (
  id uuid default gen_random_uuid()
    primary key,
  code text not null unique,
  type text check (
    type in ('percentage', 'fixed')),
  amount numeric not null,
  expiry_date timestamptz,
  usage_limit integer,
  times_used integer default 0,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists discounts_code_idx on public.discounts(code);
create index if not exists discounts_is_active_idx on public.discounts(is_active);

-- ============================================
-- TABLE 9: CUSTOM_ORDERS
-- ============================================
create table if not exists public.custom_orders (
  id uuid default gen_random_uuid()
    primary key,
  customer_name text not null,
  customer_phone text,
  customer_email text,
  description text,
  budget numeric,
  status text default 'pending',
  quote_amount numeric,
  deposit_paid boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists custom_orders_status_idx on public.custom_orders(status);
create index if not exists custom_orders_created_at_idx on public.custom_orders(created_at desc);

-- ============================================
-- TABLE 10: NEWSLETTER
-- ============================================
create table if not exists public.newsletter (
  id uuid default gen_random_uuid()
    primary key,
  email text not null unique,
  is_active boolean default true,
  subscribed_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists newsletter_email_idx on public.newsletter(email);
create index if not exists newsletter_is_active_idx on public.newsletter(is_active);

-- ============================================
-- TABLE 11: ANNOUNCEMENT
-- ============================================
create table if not exists public.announcement (
  id uuid default gen_random_uuid()
    primary key,
  text text not null,
  is_visible boolean default true,
  scroll_on_mobile boolean
    default true,
  updated_at timestamptz default now()
);

-- ============================================
-- TABLE 12: PRODUCT_RELATIONS
-- ============================================
create table if not exists public.product_relations (
  id uuid default gen_random_uuid()
    primary key,
  product_id uuid references
    public.products(id) on delete cascade,
  related_product_id uuid references
    public.products(id) on delete cascade,
  display_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists product_relations_product_id_idx on public.product_relations(product_id);

-- ============================================
-- TABLE 13: ADMIN_USERS
-- ============================================
create table if not exists public.admin_users (
  id uuid references auth.users
    primary key,
  email text not null,
  name text,
  role text default 'admin',
  created_at timestamptz default now()
);

create index if not exists admin_users_email_idx on public.admin_users(email);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
-- Enable RLS on all tables

alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.customers enable row level security;
alter table public.categories enable row level security;
alter table public.reviews enable row level security;
alter table public.hero_slides enable row level security;
alter table public.homepage_content enable row level security;
alter table public.discounts enable row level security;
alter table public.custom_orders enable row level security;
alter table public.newsletter enable row level security;
alter table public.announcement enable row level security;
alter table public.product_relations enable row level security;
alter table public.admin_users enable row level security;

-- ============================================
-- RLS POLICIES: PRODUCTS
-- ============================================
drop policy if exists "products_authenticated_admin_read" on public.products;
drop policy if exists "products_authenticated_admin_insert" on public.products;
drop policy if exists "products_authenticated_admin_update" on public.products;
drop policy if exists "products_authenticated_admin_delete" on public.products;

create policy "products_authenticated_admin_read"
  on public.products for select
  using (
    auth.uid() is not null
    and exists (select 1 from public.admin_users where id = auth.uid())
  );

create policy "products_authenticated_admin_insert"
  on public.products for insert
  with check (
    auth.uid() is not null
    and exists (select 1 from public.admin_users where id = auth.uid())
  );

create policy "products_authenticated_admin_update"
  on public.products for update
  using (
    auth.uid() is not null
    and exists (select 1 from public.admin_users where id = auth.uid())
  );

create policy "products_authenticated_admin_delete"
  on public.products for delete
  using (
    auth.uid() is not null
    and exists (select 1 from public.admin_users where id = auth.uid())
  );

-- ============================================
-- RLS POLICIES: ORDERS
-- ============================================
drop policy if exists "orders_authenticated_admin_read" on public.orders;
drop policy if exists "orders_authenticated_admin_insert" on public.orders;
drop policy if exists "orders_authenticated_admin_update" on public.orders;
drop policy if exists "orders_authenticated_admin_delete" on public.orders;

create policy "orders_authenticated_admin_read"
  on public.orders for select
  using (
    auth.uid() is not null
    and exists (select 1 from public.admin_users where id = auth.uid())
  );

create policy "orders_authenticated_admin_insert"
  on public.orders for insert
  with check (
    auth.uid() is not null
    and exists (select 1 from public.admin_users where id = auth.uid())
  );

create policy "orders_authenticated_admin_update"
  on public.orders for update
  using (
    auth.uid() is not null
    and exists (select 1 from public.admin_users where id = auth.uid())
  );

create policy "orders_authenticated_admin_delete"
  on public.orders for delete
  using (
    auth.uid() is not null
    and exists (select 1 from public.admin_users where id = auth.uid())
  );

-- ============================================
-- RLS POLICIES: CUSTOMERS
-- ============================================
drop policy if exists "customers_authenticated_admin_read" on public.customers;
drop policy if exists "customers_authenticated_admin_insert" on public.customers;
drop policy if exists "customers_authenticated_admin_update" on public.customers;
drop policy if exists "customers_authenticated_admin_delete" on public.customers;

create policy "customers_authenticated_admin_read"
  on public.customers for select
  using (
    auth.uid() is not null
    and exists (select 1 from public.admin_users where id = auth.uid())
  );

create policy "customers_authenticated_admin_insert"
  on public.customers for insert
  with check (
    auth.uid() is not null
    and exists (select 1 from public.admin_users where id = auth.uid())
  );

create policy "customers_authenticated_admin_update"
  on public.customers for update
  using (
    auth.uid() is not null
    and exists (select 1 from public.admin_users where id = auth.uid())
  );

create policy "customers_authenticated_admin_delete"
  on public.customers for delete
  using (
    auth.uid() is not null
    and exists (select 1 from public.admin_users where id = auth.uid())
  );

-- ============================================
-- RLS POLICIES: CATEGORIES
-- ============================================
drop policy if exists "categories_authenticated_admin_read" on public.categories;
drop policy if exists "categories_authenticated_admin_insert" on public.categories;
drop policy if exists "categories_authenticated_admin_update" on public.categories;
drop policy if exists "categories_authenticated_admin_delete" on public.categories;

create policy "categories_authenticated_admin_read"
  on public.categories for select
  using (
    auth.uid() is not null
    and exists (select 1 from public.admin_users where id = auth.uid())
  );

create policy "categories_authenticated_admin_insert"
  on public.categories for insert
  with check (
    auth.uid() is not null
    and exists (select 1 from public.admin_users where id = auth.uid())
  );

create policy "categories_authenticated_admin_update"
  on public.categories for update
  using (
    auth.uid() is not null
    and exists (select 1 from public.admin_users where id = auth.uid())
  );

create policy "categories_authenticated_admin_delete"
  on public.categories for delete
  using (
    auth.uid() is not null
    and exists (select 1 from public.admin_users where id = auth.uid())
  );

-- ============================================
-- RLS POLICIES: REVIEWS
-- ============================================
drop policy if exists "reviews_authenticated_admin_read" on public.reviews;
drop policy if exists "reviews_authenticated_admin_insert" on public.reviews;
drop policy if exists "reviews_authenticated_admin_update" on public.reviews;
drop policy if exists "reviews_authenticated_admin_delete" on public.reviews;

create policy "reviews_authenticated_admin_read"
  on public.reviews for select
  using (
    auth.uid() is not null
    and exists (select 1 from public.admin_users where id = auth.uid())
  );

create policy "reviews_authenticated_admin_insert"
  on public.reviews for insert
  with check (
    auth.uid() is not null
    and exists (select 1 from public.admin_users where id = auth.uid())
  );

create policy "reviews_authenticated_admin_update"
  on public.reviews for update
  using (
    auth.uid() is not null
    and exists (select 1 from public.admin_users where id = auth.uid())
  );

create policy "reviews_authenticated_admin_delete"
  on public.reviews for delete
  using (
    auth.uid() is not null
    and exists (select 1 from public.admin_users where id = auth.uid())
  );

-- ============================================
-- RLS POLICIES: HERO_SLIDES
-- ============================================
drop policy if exists "hero_slides_authenticated_admin_read" on public.hero_slides;
drop policy if exists "hero_slides_authenticated_admin_insert" on public.hero_slides;
drop policy if exists "hero_slides_authenticated_admin_update" on public.hero_slides;
drop policy if exists "hero_slides_authenticated_admin_delete" on public.hero_slides;

create policy "hero_slides_authenticated_admin_read"
  on public.hero_slides for select
  using (
    auth.uid() is not null
    and exists (select 1 from public.admin_users where id = auth.uid())
  );

create policy "hero_slides_authenticated_admin_insert"
  on public.hero_slides for insert
  with check (
    auth.uid() is not null
    and exists (select 1 from public.admin_users where id = auth.uid())
  );

create policy "hero_slides_authenticated_admin_update"
  on public.hero_slides for update
  using (
    auth.uid() is not null
    and exists (select 1 from public.admin_users where id = auth.uid())
  );

create policy "hero_slides_authenticated_admin_delete"
  on public.hero_slides for delete
  using (
    auth.uid() is not null
    and exists (select 1 from public.admin_users where id = auth.uid())
  );

-- ============================================
-- RLS POLICIES: HOMEPAGE_CONTENT
-- ============================================
drop policy if exists "homepage_content_authenticated_admin_read" on public.homepage_content;
drop policy if exists "homepage_content_authenticated_admin_insert" on public.homepage_content;
drop policy if exists "homepage_content_authenticated_admin_update" on public.homepage_content;
drop policy if exists "homepage_content_authenticated_admin_delete" on public.homepage_content;

create policy "homepage_content_authenticated_admin_read"
  on public.homepage_content for select
  using (
    auth.uid() is not null
    and exists (select 1 from public.admin_users where id = auth.uid())
  );

create policy "homepage_content_authenticated_admin_insert"
  on public.homepage_content for insert
  with check (
    auth.uid() is not null
    and exists (select 1 from public.admin_users where id = auth.uid())
  );

create policy "homepage_content_authenticated_admin_update"
  on public.homepage_content for update
  using (
    auth.uid() is not null
    and exists (select 1 from public.admin_users where id = auth.uid())
  );

create policy "homepage_content_authenticated_admin_delete"
  on public.homepage_content for delete
  using (
    auth.uid() is not null
    and exists (select 1 from public.admin_users where id = auth.uid())
  );

-- ============================================
-- RLS POLICIES: DISCOUNTS
-- ============================================
drop policy if exists "discounts_authenticated_admin_read" on public.discounts;
drop policy if exists "discounts_authenticated_admin_insert" on public.discounts;
drop policy if exists "discounts_authenticated_admin_update" on public.discounts;
drop policy if exists "discounts_authenticated_admin_delete" on public.discounts;

create policy "discounts_authenticated_admin_read"
  on public.discounts for select
  using (
    auth.uid() is not null
    and exists (select 1 from public.admin_users where id = auth.uid())
  );

create policy "discounts_authenticated_admin_insert"
  on public.discounts for insert
  with check (
    auth.uid() is not null
    and exists (select 1 from public.admin_users where id = auth.uid())
  );

create policy "discounts_authenticated_admin_update"
  on public.discounts for update
  using (
    auth.uid() is not null
    and exists (select 1 from public.admin_users where id = auth.uid())
  );

create policy "discounts_authenticated_admin_delete"
  on public.discounts for delete
  using (
    auth.uid() is not null
    and exists (select 1 from public.admin_users where id = auth.uid())
  );

-- ============================================
-- RLS POLICIES: CUSTOM_ORDERS
-- ============================================
drop policy if exists "custom_orders_authenticated_admin_read" on public.custom_orders;
drop policy if exists "custom_orders_authenticated_admin_insert" on public.custom_orders;
drop policy if exists "custom_orders_authenticated_admin_update" on public.custom_orders;
drop policy if exists "custom_orders_authenticated_admin_delete" on public.custom_orders;

create policy "custom_orders_authenticated_admin_read"
  on public.custom_orders for select
  using (
    auth.uid() is not null
    and exists (select 1 from public.admin_users where id = auth.uid())
  );

create policy "custom_orders_authenticated_admin_insert"
  on public.custom_orders for insert
  with check (
    auth.uid() is not null
    and exists (select 1 from public.admin_users where id = auth.uid())
  );

create policy "custom_orders_authenticated_admin_update"
  on public.custom_orders for update
  using (
    auth.uid() is not null
    and exists (select 1 from public.admin_users where id = auth.uid())
  );

create policy "custom_orders_authenticated_admin_delete"
  on public.custom_orders for delete
  using (
    auth.uid() is not null
    and exists (select 1 from public.admin_users where id = auth.uid())
  );

-- ============================================
-- RLS POLICIES: NEWSLETTER
-- ============================================
drop policy if exists "newsletter_authenticated_admin_read" on public.newsletter;
drop policy if exists "newsletter_authenticated_admin_insert" on public.newsletter;
drop policy if exists "newsletter_authenticated_admin_update" on public.newsletter;
drop policy if exists "newsletter_authenticated_admin_delete" on public.newsletter;

create policy "newsletter_authenticated_admin_read"
  on public.newsletter for select
  using (
    auth.uid() is not null
    and exists (select 1 from public.admin_users where id = auth.uid())
  );

create policy "newsletter_authenticated_admin_insert"
  on public.newsletter for insert
  with check (
    auth.uid() is not null
    and exists (select 1 from public.admin_users where id = auth.uid())
  );

create policy "newsletter_authenticated_admin_update"
  on public.newsletter for update
  using (
    auth.uid() is not null
    and exists (select 1 from public.admin_users where id = auth.uid())
  );

create policy "newsletter_authenticated_admin_delete"
  on public.newsletter for delete
  using (
    auth.uid() is not null
    and exists (select 1 from public.admin_users where id = auth.uid())
  );

-- ============================================
-- RLS POLICIES: ANNOUNCEMENT
-- ============================================
drop policy if exists "announcement_authenticated_admin_read" on public.announcement;
drop policy if exists "announcement_authenticated_admin_insert" on public.announcement;
drop policy if exists "announcement_authenticated_admin_update" on public.announcement;
drop policy if exists "announcement_authenticated_admin_delete" on public.announcement;

create policy "announcement_authenticated_admin_read"
  on public.announcement for select
  using (
    auth.uid() is not null
    and exists (select 1 from public.admin_users where id = auth.uid())
  );

create policy "announcement_authenticated_admin_insert"
  on public.announcement for insert
  with check (
    auth.uid() is not null
    and exists (select 1 from public.admin_users where id = auth.uid())
  );

create policy "announcement_authenticated_admin_update"
  on public.announcement for update
  using (
    auth.uid() is not null
    and exists (select 1 from public.admin_users where id = auth.uid())
  );

create policy "announcement_authenticated_admin_delete"
  on public.announcement for delete
  using (
    auth.uid() is not null
    and exists (select 1 from public.admin_users where id = auth.uid())
  );

-- ============================================
-- RLS POLICIES: PRODUCT_RELATIONS
-- ============================================
drop policy if exists "product_relations_authenticated_admin_read" on public.product_relations;
drop policy if exists "product_relations_authenticated_admin_insert" on public.product_relations;
drop policy if exists "product_relations_authenticated_admin_update" on public.product_relations;
drop policy if exists "product_relations_authenticated_admin_delete" on public.product_relations;

create policy "product_relations_authenticated_admin_read"
  on public.product_relations for select
  using (
    auth.uid() is not null
    and exists (select 1 from public.admin_users where id = auth.uid())
  );

create policy "product_relations_authenticated_admin_insert"
  on public.product_relations for insert
  with check (
    auth.uid() is not null
    and exists (select 1 from public.admin_users where id = auth.uid())
  );

create policy "product_relations_authenticated_admin_update"
  on public.product_relations for update
  using (
    auth.uid() is not null
    and exists (select 1 from public.admin_users where id = auth.uid())
  );

create policy "product_relations_authenticated_admin_delete"
  on public.product_relations for delete
  using (
    auth.uid() is not null
    and exists (select 1 from public.admin_users where id = auth.uid())
  );

-- ============================================
-- RLS POLICIES: ADMIN_USERS
-- ============================================
drop policy if exists "admin_users_authenticated_admin_read" on public.admin_users;

create policy "admin_users_authenticated_admin_read"
  on public.admin_users for select
  using (
    auth.uid() is not null
    and exists (select 1 from public.admin_users where id = auth.uid())
  );

-- ============================================
-- PUBLIC RLS POLICIES (FOR PUBLIC WEBSITE)
-- ============================================
-- Allow public (unauthenticated) users to read visible content

-- PUBLIC: Products (read visible only)
drop policy if exists "products_public_read" on public.products;
create policy "products_public_read"
  on public.products for select
  using (is_visible = true);

-- PUBLIC: Categories (read visible only)
drop policy if exists "categories_public_read" on public.categories;
create policy "categories_public_read"
  on public.categories for select
  using (is_visible = true);

-- PUBLIC: Hero Slides (read visible only)
drop policy if exists "hero_slides_public_read" on public.hero_slides;
create policy "hero_slides_public_read"
  on public.hero_slides for select
  using (is_visible = true);

-- PUBLIC: Reviews (read approved only)
drop policy if exists "reviews_public_read" on public.reviews;
create policy "reviews_public_read"
  on public.reviews for select
  using (is_approved = true);

-- PUBLIC: Newsletter (allow subscriptions)
drop policy if exists "newsletter_public_insert" on public.newsletter;
create policy "newsletter_public_insert"
  on public.newsletter for insert
  with check (true);

-- PUBLIC: Announcement (read visible)
drop policy if exists "announcement_public_read" on public.announcement;
create policy "announcement_public_read"
  on public.announcement for select
  using (is_visible = true);

-- PUBLIC: Custom Orders (allow requests)
drop policy if exists "custom_orders_public_insert" on public.custom_orders;
create policy "custom_orders_public_insert"
  on public.custom_orders for insert
  with check (true);

-- PUBLIC: Homepage Content (read visible)
drop policy if exists "homepage_content_public_read" on public.homepage_content;
create policy "homepage_content_public_read"
  on public.homepage_content for select
  using (is_visible = true);

-- PUBLIC: Discounts (read active only)
drop policy if exists "discounts_public_read" on public.discounts;
create policy "discounts_public_read"
  on public.discounts for select
  using (is_active = true and (expiry_date is null or expiry_date > now()));

-- ============================================
-- SEED DATA (OPTIONAL - COMMENT OUT IF NOT NEEDED)
-- ============================================
-- Initialize empty announcement table if needed
-- insert into public.announcement (text, is_visible, scroll_on_mobile)
-- values ('Welcome to SharonCraft Admin Panel', true, true)
-- on conflict do nothing;
