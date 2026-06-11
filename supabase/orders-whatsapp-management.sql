-- Run after the base schema to support the admin WhatsApp order management system.

create table if not exists public.whatsapp_templates (
  id uuid primary key default gen_random_uuid(),
  template_key text not null unique,
  name text not null default '',
  body text not null default '',
  description text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.whatsapp_templates enable row level security;

drop policy if exists "Admin read whatsapp templates" on public.whatsapp_templates;
create policy "Admin read whatsapp templates"
on public.whatsapp_templates
for select
to authenticated
using (
  exists (
    select 1
    from public.admin_users au
    where au.user_id = auth.uid()
  )
);

drop policy if exists "Admin insert whatsapp templates" on public.whatsapp_templates;
create policy "Admin insert whatsapp templates"
on public.whatsapp_templates
for insert
to authenticated
with check (
  exists (
    select 1
    from public.admin_users au
    where au.user_id = auth.uid()
  )
);

drop policy if exists "Admin update whatsapp templates" on public.whatsapp_templates;
create policy "Admin update whatsapp templates"
on public.whatsapp_templates
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

alter table public.orders add column if not exists order_id text;
alter table public.orders add column if not exists customer_location text not null default '';
alter table public.orders add column if not exists items jsonb not null default '[]'::jsonb;
alter table public.orders add column if not exists total_amount numeric not null default 0;
alter table public.orders add column if not exists designer_cost numeric not null default 0;
alter table public.orders add column if not exists profit numeric not null default 0;
alter table public.orders add column if not exists payment_status text not null default 'pending';
alter table public.orders add column if not exists order_status text not null default 'pending';
alter table public.orders add column if not exists notes text not null default '';
alter table public.orders add column if not exists rider_name text not null default '';
alter table public.orders add column if not exists rider_phone text not null default '';
alter table public.orders add column if not exists estimated_delivery date;
alter table public.orders add column if not exists delivered_at timestamptz;

update public.orders
set
  order_id = coalesce(order_id, id),
  total_amount = coalesce(total_amount, order_total, 0),
  profit = coalesce(profit, total_profit, 0),
  order_status = case
    when order_status is not null and char_length(order_status) > 0 then order_status
    when status = 'new' then 'pending'
    when status = 'paid' then 'confirmed'
    when status = 'delivered' then 'delivered'
    when status = 'cancelled' then 'cancelled'
    else 'pending'
  end,
  notes = case
    when notes is not null and char_length(notes) > 0 then notes
    else coalesce(note, '')
  end;

create unique index if not exists orders_order_id_idx on public.orders(order_id);
create index if not exists orders_order_status_v2_idx on public.orders(order_status);
create index if not exists orders_created_at_v2_idx on public.orders(created_at desc);

insert into public.whatsapp_templates (template_key, name, body, description)
values
  (
    'order_confirmation',
    'Order Confirmation',
    'Hi {{name}} 👋 Thank you for your order!\n\nI can confirm your pieces are available:\n\n{{items}}\n\nTotal: {{total}}\nPayment: {{payment_method}}\n\nPlease share:\n1. Delivery location\n2. Preferred delivery time\n3. Contact number for rider\n\n— Sharon | SharonCraft 💎',
    'Sent when an order is created or moved to pending.'
  ),
  (
    'deposit_request',
    'Deposit Request',
    'Hi {{name}} 😊\n\nTo confirm your order {{order_id}}\nI require a 50% deposit of\n{{deposit_amount}}.\n\nM-Pesa: {{mpesa_number}}\nName: Sharon\n\nOnce received I begin your\norder immediately 🙏\n\n— SharonCraft 💎',
    'Sent when an order is confirmed.'
  ),
  (
    'in_production',
    'In Production',
    'Hi {{name}} 👋 Great news!\n\nYour order {{order_id}} is now\nin production with our artisan.\n\nEstimated ready date: {{date}}\n\nI will send you photos as soon\nas it is complete 💎\n\n— Sharon | SharonCraft',
    'Sent when the artisan starts work.'
  ),
  (
    'ready',
    'Ready',
    'Hi {{name}} ✨ Your piece is ready!\n\n[Attach photos before sending]\n\n{{items}} ✓\n\nBalance due on delivery: {{balance}}\n\nReady to arrange delivery —\nwhat time works best for you? 😊\n\n— Sharon | SharonCraft 💎',
    'Sent when the order is complete.'
  ),
  (
    'dispatched',
    'Dispatched',
    'Hi {{name}} 🚀 Your order is\non the way!\n\nRider: {{rider}}\nContact: {{rider_phone}}\nETA: {{eta}}\n\nPlease have {{total}} ready\nif paying cash on delivery.\n\nTrack your order:\n{{track_url}}\n\n— SharonCraft 💎',
    'Sent when the rider has the order.'
  ),
  (
    'delivered',
    'Delivered',
    'Hi {{name}} 🙏 Thank you so much!\n\nWe hope you love your pieces 💎\n\nIf you are happy please leave\nus a review — it helps us grow:\nsharoncraft.co.ke\n\nTag us on Instagram @sharoncraft\nto show off your pieces! 📸\n\n— Sharon | SharonCraft',
    'Sent after delivery.'
  ),
  (
    'delay',
    'Delay',
    'Hi {{name}} 🙏 I sincerely\napologize for the delay on\nyour order {{order_id}}.\n\nNew expected date: {{date}}\n\nThank you for your patience —\nI promise it will be worth\nthe wait 💎\n\n— Sharon | SharonCraft',
    'Manual template for delays.'
  ),
  (
    'cancelled',
    'Cancelled',
    'Hi {{name}},\n\nYour order {{order_id}} has been cancelled.\nIf you would like, we can help you place a new order for:\n{{items}}\n\nPlease message us if you need any help.\n\n— Sharon | SharonCraft 💎',
    'Sent when an order is cancelled.'
  )
on conflict (template_key) do update
set
  name = excluded.name,
  body = excluded.body,
  description = excluded.description,
  updated_at = now();
