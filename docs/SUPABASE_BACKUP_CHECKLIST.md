# Supabase Backup Checklist

Use this checklist for the SharonCraft website before a project is paused, migrated, or replaced.

## 1. Confirm the correct project first

- Check the project ref in the Supabase dashboard email.
- Compare it with [supabase-config.js](/c:/Users/USER/Desktop/projects/bead%20VN2/supabase/supabase-config.js).
- This repo currently points at `https://vonzscriztdcdhobulhy.supabase.co`.
- If the email mentions a different project ref, back up that project too. Do not assume the email refers to the project this repo is using.

## 2. Save the database schema

- Keep [supabase-schema.sql](/c:/Users/USER/Desktop/projects/bead%20VN2/supabase/supabase-schema.sql) in git.
- If the live database has changed since this file was last updated, export a fresh schema with the Supabase CLI.
- Store the exported schema in the repo or in an off-site backup folder.

Suggested command:

```bash
supabase db dump --linked -f backups/schema.sql
```

## 3. Export the app data tables

Export the tables this project depends on:

- `public.products`
- `public.site_settings`
- `public.analytics_events`
- `public.admin_users`
- `public.orders`
- `public.order_tracking`

Also note:

- customer details are now stored in Supabase Auth metadata rather than `public.customer_profiles`

Suggested command:

```bash
supabase db dump --linked --data-only -f backups/data.sql
```

## 4. Preserve admin access details

- Record the admin email addresses used for dashboard/login access.
- Keep a copy of [add_admin.sql](/c:/Users/USER/Desktop/projects/bead%20VN2/supabase/add_admin.sql).
- After any restore or migration, verify that `public.admin_users` still contains the expected admin row(s).

## 5. Back up Storage files

- This project uses the public bucket `product-images`.
- Database backups do not include the actual files stored in Supabase Storage.
- Download the bucket contents separately from the dashboard or with your preferred script/tooling.
- Keep the exported file list together with the database backup so product rows can still point to valid images after a restore.

## 6. Save important project settings

Capture screenshots or notes for:

- Auth email/password settings
- Site URL and redirect URLs
- Storage bucket name and public/private setting
- RLS policies if they were changed in the dashboard after [supabase-schema.sql](/c:/Users/USER/Desktop/projects/bead%20VN2/supabase/supabase-schema.sql)
- API URL and publishable key from the current project

## 7. Keep a copy of local app config

- Back up [supabase-config.js](/c:/Users/USER/Desktop/projects/bead%20VN2/supabase/supabase-config.js).
- Back up [supabase-catalog.js](/c:/Users/USER/Desktop/projects/bead%20VN2/supabase/supabase-catalog.js).
- Back up [SUPABASE_SETUP.md](/c:/Users/USER/Desktop/projects/bead%20VN2/docs/SUPABASE_SETUP.md).

## 8. Do a quick restore test

Before relying on the backup, make sure you can restore or reconnect and confirm:

- products load on the storefront
- homepage visuals load
- social links load
- order tracking works
- admin login works
- analytics events can still be inserted from the live site

## 9. Minimum safe fallback

If you are short on time, do these first:

- save the schema
- export the table data
- download the `product-images` bucket
- record admin emails and project ref
- verify which project ref the live site actually uses
