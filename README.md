# SharonCraft Website

SharonCraft is a mobile-friendly handcrafted beadwork storefront built as a static website with Supabase for live catalog data, auth, storage, analytics, and admin publishing.

## What this repo contains

- Public storefront pages like `index.html`, `shop.html`, `product.html`, and `contact.html`
- Customer account and auth pages like `account.html` and `login.html`
- Admin publishing flow in `admin.html`
- Shared JS and CSS in `assets/js` and `assets/css`
- Supabase configuration, SQL, and helper files in `supabase/`
- Project notes and operational docs in `docs/`

## Key folders

- `assets/css`
  Global site styling and smaller feature stylesheets
- `assets/js`
  Shared storefront logic, page scripts, admin logic, and auth helpers
- `assets/js/auth`
  Auth state, user controller, session checks, and password reset helpers
- `assets/images`
  Website images used across pages and product content
- `supabase`
  Supabase config, catalog helpers, admin SQL, and schema
- `docs`
  Setup, backup, and deployment notes

## Important files

- `index.html`
  Homepage
- `shop.html`
  Product listing and filter experience
- `product.html`
  Product detail page
- `account.html`
  Customer account page for sign-up and login
- `admin.html`
  Admin publishing and management dashboard
- `404.html`
  Custom not found page
- `privacy.html`
  Customer-facing privacy page

## Supabase files

- `supabase/supabase-config.js`
  Public project URL/key configuration used by the frontend
- `supabase/supabase-catalog.js`
  Shared catalog, auth, analytics, and data helper methods
- `supabase/supabase-schema.sql`
  Main SQL schema for the project
- `supabase/add_admin.sql`
  Helper SQL for adding admin access

## Local editing

This project is static HTML/CSS/JS, so a simple local server is enough.

Recommended options:

- VS Code Live Server
- Node.js with `npm run dev`
- Any local static file server that serves the repo root

If you want a lightweight Node workflow:

1. Install Node.js.
2. Run `npm run dev`
3. Open `http://127.0.0.1:5500`

Available scripts:

- `npm run dev`
  Starts the local static server on the default port
- `npm run dev:open`
  Starts the server and opens the browser
- `npm run serve:5500`
  Starts the server explicitly on port `5500`
- `npm run build:seo`
  Rebuilds both `sitemap.xml` and `google-merchant-feed.xml`
- `npm run build:release`
  Runs the SEO build, then checks critical storefront pages and local HTML asset references before release
- `npm run notify:indexnow`
  Submits SharonCraft URLs to the IndexNow API after a live deploy so Bing/Copilot can discover updates faster
- `npm run notify:indexnow:changed`
  Submits only the URLs changed in the latest git diff so post-deploy indexing is faster and more focused
- `npm run notify:indexnow:dry`
  Preview which URLs would be sent to IndexNow without making the live request
- `npm run notify:indexnow:changed:dry`
  Preview the changed-URL IndexNow payload before you send it
- `npm run generate:sitemap`
  Rebuilds `sitemap.xml` from public HTML pages, articles, and shared catalog products
- `npm run generate:merchant-feed`
  Rebuilds `google-merchant-feed.xml` from the shared catalog products

When testing locally, verify:

- homepage loads
- shop filters work
- product cards render cleanly
- account page loads auth controls
- admin page still loads its scripts

## Deployment

The current workflow is Git-based:

1. Make changes in the repo.
2. Test key pages locally.
3. Commit and push to `main`.
4. Let the hosting provider redeploy from GitHub.
5. Run `npm run notify:indexnow:changed` after the live deploy for a focused IndexNow update, or `npm run notify:indexnow` if you want to resubmit the whole sitemap.

See [DEPLOYMENT.md](/c:/Users/USER/Desktop/projects/bead%20VN2/docs/DEPLOYMENT.md) for the detailed checklist.

## Before changing Supabase

If you update schema, auth behavior, or storage rules:

1. Review `supabase/supabase-schema.sql`
2. Apply needed SQL in the Supabase dashboard
3. Verify live auth, products, and admin actions
4. Update docs if the workflow changes

## Related docs

- [SUPABASE_SETUP.md](/c:/Users/USER/Desktop/projects/bead%20VN2/docs/SUPABASE_SETUP.md)
- [SUPABASE_BACKUP_CHECKLIST.md](/c:/Users/USER/Desktop/projects/bead%20VN2/docs/SUPABASE_BACKUP_CHECKLIST.md)
- [WHATSAPP_SETUP.md](/c:/Users/USER/Desktop/projects/bead%20VN2/docs/WHATSAPP_SETUP.md)
- [SEO_VISIBILITY_CHECKLIST.md](/c:/Users/USER/Desktop/projects/bead%20VN2/docs/SEO_VISIBILITY_CHECKLIST.md)
- [DEPLOYMENT.md](/c:/Users/USER/Desktop/projects/bead%20VN2/docs/DEPLOYMENT.md)
- [ONLINE_VISIBILITY_PLAYBOOK.md](/c:/Users/USER/Desktop/projects/bead%20VN2/docs/ONLINE_VISIBILITY_PLAYBOOK.md)
