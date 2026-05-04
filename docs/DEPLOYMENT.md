# Deployment Guide

Use this checklist when you want to publish SharonCraft website updates safely.

## 1. Before you push

Check these locally first:

- homepage loads
- shop page loads and product cards look correct
- product detail page opens from the shop
- account page loads without console errors
- admin page still opens if you changed shared scripts or styling
- `404.html` and `privacy.html` open correctly
- `robots.txt`, `llms.txt`, and the IndexNow key file still exist if you changed SEO or AI-discovery files
- `npm run build:release` before pushing if you want one command that rebuilds SEO files and checks key storefront pages plus local HTML references

## 2. If you changed Supabase-related logic

Review whether you updated any of these:

- `supabase/supabase-config.js`
- `supabase/supabase-catalog.js`
- `supabase/supabase-schema.sql`
- auth flows in `assets/js/auth`
- admin auth or publish logic

If schema or policies changed, apply the relevant SQL in the Supabase dashboard before or alongside the deploy.

## 3. Review changed files

Recommended checks:

- HTML page references still point to `supabase/` files correctly
- new pages are linked where needed
- footer/header still render
- shop filters and product cards still behave well on mobile

## 4. Deploy flow

Current working flow:

1. Stage your changes.
2. Commit with a clear message.
3. Push to `main`.
4. Wait for the hosting platform to redeploy from GitHub.
5. Run `npm run notify:indexnow:changed` after the live deploy for a focused changed-URL IndexNow submission.
6. Use `npm run notify:indexnow` instead if you want to resubmit the whole sitemap.

Example:

```bash
git add -A
git commit -m "Describe the update clearly"
git push origin main
npm run notify:indexnow:changed
```

If you are deploying with the Vercel CLI instead of waiting for Git-based deploys:

- `npm run deploy:preview`
  Makes a preview/staged deployment
- `npm run deploy:prod`
  Makes a production deployment

Important:

- `vercel deploy` without `--prod` creates a preview deployment
- pushing a non-production branch also usually creates a preview deployment
- for a live deploy, either push to the configured Vercel production branch or use `npm run deploy:prod`

### Vercel: “Current” vs preview (why fixes look on the “wrong” site)

- In the Vercel **Deployments** list, **Current** (Production) is the build serving your **production domain** (e.g. `sharoncraft.co.ke`). That row only moves when Production gets a **new** build (production-branch push, **`npm run deploy:prod`**, or **Promote to Production**).
- **Preview** rows (and each unique `…-xxxxx-….vercel.app` URL) are **separate** builds. Pushing UI to a **feature branch** updates **preview** URLs, not **Current**, until you merge or promote.
- **Do not** bookmark every one-off preview URL if you want a stable test URL: use the **branch preview** hostname Vercel shows for your branch, or test on the **production domain** after you intentionally ship.

See **`AGENTS.md`** in the repo root for rules AI assistants should follow when “deploying.”

## 5. After deploy

Open the live website and check:

- `index.html`
- `shop.html`
- `product.html`
- `account.html`
- `contact.html`
- `404.html`
- `privacy.html`
- `robots.txt`
- `llms.txt`
- `6e8a6d86-fb64-4afc-a912-0a4c9ee7cb50.txt`

Then test:

- navigation
- product browsing
- WhatsApp buttons
- account sign-up/login
- admin access if relevant to the release

## 6. If something breaks

Start with these checks:

- browser hard refresh
- wrong script path after a moved file
- Supabase config mismatch
- missing SQL/schema update
- footer or header rendering issue from shared JS

If needed, roll back by reverting the bad commit and pushing again.

## 7. Good release habits

- keep commits focused
- avoid mixing unrelated UI and schema changes unless necessary
- update docs when workflows change
- keep `docs/` and `supabase/` organized so future fixes are faster
