# Supabase Setup

Use this setup for:
- client account creation + login on storefront
- secure admin-only product publishing
- product image uploads to Supabase Storage

## 1. Create project

1. Create a Supabase project.
2. In `Project Settings -> API`, copy:
   - `Project URL`
   - `Project API keys -> publishable (anon) key`

## 2. Run schema

1. Open [supabase-schema.sql](/c:/Users/USER/Desktop/projects/beads/supabase-schema.sql).
2. Copy all SQL.
3. In Supabase `SQL Editor`, paste and run.

This creates:
- `public.products`
- `public.site_settings` (website settings like homepage visuals)
- `public.analytics_events` (shared storefront activity across devices)
- `public.admin_users` (admin allow-list)
- storage bucket `product-images`
- RLS policies so:
  - public can read products/images
  - public can read `public.site_settings`
  - only allow-listed admins can edit products/upload images

## 3. Configure Auth

In `Authentication -> Providers -> Email`:
1. Enable Email provider.
2. Enable email/password sign-in.
3. Decide confirmation behavior:
   - For easy testing: disable confirmation.
   - For production: keep confirmation enabled.

In `Authentication -> URL Configuration`:
1. Set `Site URL` to your live domain.
2. Add local dev URL (for example `http://localhost:5500`) to redirect allow-list.

## 4. Create your admin user

1. Create/sign up your admin user in `Authentication -> Users`.
2. Run this SQL (replace email):

```sql
insert into public.admin_users (user_id, email)
select id, email
from auth.users
where email = 'your-admin-email@example.com'
on conflict (user_id) do update
set email = excluded.email;
```

Without this, a logged-in user can still create a client account but cannot publish products/images.

## 5. Update local config

In [supabase-config.js](/c:/Users/USER/Desktop/projects/beads/supabase-config.js):
- set `url`
- set `anonKey`

Current project already has these fields; just verify values match your Supabase project.

## 6. Deploy files

Deploy these files:
- `index.html`
- `style.css`
- `script.js`
- `supabase-config.js`
- `supabase-catalog.js`
- `supabase-schema.sql`

## 7. Test checklist

1. Open storefront and go to `Client Account` section.
2. Create a new account.
3. Log in with that account.
4. Log out.
5. Confirm products still load.
6. Confirm admin-only publish/upload actions work only for allow-listed admin user.
7. Open the live storefront, trigger a few events, then check the admin `Analytics` tab while signed in to confirm Supabase analytics are arriving.

## Troubleshooting

- `Supabase is not configured yet.`
  - Check `supabase-config.js` URL/key and that scripts are deployed.

- `Email not confirmed`
  - Confirm email or disable confirmation while testing.

- Logged in but cannot publish/edit products
  - Ensure that user exists in `public.admin_users`.
