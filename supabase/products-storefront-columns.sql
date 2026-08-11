-- Optional columns so admin and storefront share rich product details.
-- Safe to run multiple times.

alter table public.products add column if not exists slug text;
alter table public.products add column if not exists sale_price numeric;
alter table public.products add column if not exists full_description text;
alter table public.products add column if not exists heritage_story text;
alter table public.products add column if not exists materials text[] default '{}';
alter table public.products add column if not exists details text[] default '{}';
alter table public.products add column if not exists fulfillment_type text default 'ready_to_ship';
alter table public.products add column if not exists featured_order integer default 999;
alter table public.products add column if not exists story_text text;
alter table public.products add column if not exists story_cultural_note text;
alter table public.products add column if not exists badge text;
alter table public.products add column if not exists short_description text;

create index if not exists products_slug_idx on public.products(slug);
create index if not exists products_featured_order_idx on public.products(featured_order);
