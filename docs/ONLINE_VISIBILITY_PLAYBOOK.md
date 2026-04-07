# Online Visibility Playbook

Use this guide for the parts of search visibility that need both website changes and off-site setup.

## What the website already supports

- `sitemap.xml` generated from public pages, articles, and product URLs
- `google-merchant-feed.xml` generated from the storefront catalog
- `robots.txt`, `llms.txt`, and a live IndexNow key file
- structured data for the organization, store, homepage, shop, product pages, and landing pages
- `npm run notify:indexnow:changed` for focused post-deploy IndexNow submissions

## Weekly visibility workflow

1. Ship website updates and deploy them.
2. Run `npm run notify:indexnow:changed`.
3. Check Google Search Console for:
   - top pages by impressions
   - queries with high impressions but low CTR
   - pages with indexing issues
4. Check Merchant Center for:
   - product disapprovals
   - missing attribute warnings
   - image, price, or availability mismatches
5. Add or improve internal links from the homepage, shop, articles, and landing pages.

## Search Console tasks

- Verify the full domain property for `https://www.sharoncraft.co.ke`
- Submit `https://www.sharoncraft.co.ke/sitemap.xml`
- Review indexing, coverage, and search performance weekly
- Use the query report to identify:
  - product keywords that deserve stronger landing pages
  - pages with impressions but poor CTR
  - pages that should be linked more prominently from the homepage or shop

## Merchant Center tasks

- Claim and verify the website in Merchant Center
- Upload or fetch `https://www.sharoncraft.co.ke/google-merchant-feed.xml`
- Review diagnostics after each catalog or pricing update
- Keep product titles, price, and availability aligned with the live storefront

## Google Business Profile tasks

- Verify the SharonCraft business profile
- Keep the brand name, phone, location, and website consistent with the site
- Add product photos and recent business photos regularly
- Encourage reviews from real customers and answer them

## Best page types to keep growing

- keyword landing pages for strong buyer intent
- helpful buying guides that answer repeated customer questions
- product pages with clean titles, images, price, and review signals
- internal link hubs from the homepage into priority landing pages

## Good triggers for IndexNow

Run `npm run notify:indexnow:changed` after:

- homepage edits
- new or updated landing pages
- new or updated article pages
- catalog changes that affect product URLs or shop visibility

Run `npm run notify:indexnow` when:

- the sitemap changes substantially
- many shared templates changed
- you want to refresh the full public inventory
