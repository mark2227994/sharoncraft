# SEO Visibility Checklist

Use this checklist when you want SharonCraft to show up more often in Google, Gemini, Bing, Copilot, Maps, and shopping surfaces.

## 1. Keep the site crawlable

- Run `npm run build:release`
- Make sure `robots.txt` still points to `sitemap.xml`
- Make sure `robots.txt` still allows `OAI-SearchBot` and public search crawlers to access the storefront
- Confirm new public pages are linked from the homepage or footer
- Avoid adding important content only inside JavaScript widgets with no HTML fallback

## 2. Submit and monitor Google Search Console

- Add and verify `https://www.sharoncraft.co.ke/`
- Submit `https://www.sharoncraft.co.ke/sitemap.xml`
- Check indexing for:
  - homepage
  - shop page
  - product pages
  - keyword landing pages
  - articles
- Review queries, clicks, and pages with low CTR

## 3. Keep Google Merchant Center active

- Upload or refresh `google-merchant-feed.xml`
- Confirm products are eligible for free listings
- Check for image, price, availability, or destination errors
- Review which products are getting impressions and clicks

## 4. Optimize Google Business Profile

- Verify the business profile
- Keep the name, phone, website, and location accurate
- Add recent product and decor photos
- Ask real customers for reviews consistently
- Reply to reviews to keep the profile active

## 5. Set up Bing discovery channels

- Verify the site in Bing Webmaster Tools
- Submit the sitemap there too
- Claim or import the listing in Bing Places
- Run `npm run notify:indexnow` after major live updates so Bing/Copilot can discover changes faster

## 6. Publish search-intent pages

These pages already exist in the site and should be kept updated:

- `kenyan-artifacts.html`
- `beaded-earrings-kenya.html`
- `maasai-jewelry-kenya.html`
- `handmade-kenyan-gifts.html`
- `african-home-decor-nairobi.html`
- `bridal-bead-sets-kenya.html`
- `gift-sets-kenya.html`
- `maasai-inspired-bracelets-kenya.html`

## 7. Improve trust signals

- Keep product prices current
- Keep product images valid and high quality
- Make returns information visible
- Keep WhatsApp and contact details consistent across the site
- Make sure category and product pages load cleanly on mobile

## 8. Build authority off-site

- Get mentioned by Kenyan lifestyle, decor, fashion, or wedding sites
- Add SharonCraft to reputable local business directories
- Link to exact landing pages from Instagram, TikTok, and Facebook bios or posts
- Encourage creators or event vendors to mention and link the site

## 9. Measure what is working

Track these every month:

- branded searches for `SharonCraft`
- non-branded searches like `kenyan artifacts`, `maasai jewelry kenya`, `handmade kenyan gifts`
- product page impressions
- keyword landing page clicks
- Merchant Center product performance
- Google Business Profile calls, messages, and direction requests

## 10. Update content regularly

- Add new product pages when you launch new lines
- Add new article pages when customers ask repeated questions
- Refresh landing page copy when search trends change
- Rebuild SEO files with `npm run build:seo` or `npm run build:release`
- Keep `llms.txt` accurate when the brand story, contact details, or trust pages change
