# SEO & Google Visibility Action Plan for SharonCraft

**Last Updated:** April 20, 2026  
**Status:** Website built, favicon fixed, ready for Google indexing

---

## 📊 Current SEO Setup Audit

### ✅ What You Have in Place:

**Technical Foundation:**
- ✅ `robots.txt` - Properly configured, allows all crawlers, disallows private pages
- ✅ `sitemap.xml` - 8+ key pages indexed, priorities correctly set
- ✅ Schema markup - Organization + LocalBusiness JSON-LD implemented
- ✅ Favicon - Fixed (favicon.ico + multiple sizes for mobile)
- ✅ Manifest file - Android/iOS app install ready
- ✅ Open Graph tags - Social sharing enabled with logo-og.png
- ✅ Meta descriptions - Configured on all pages via SeoHead component
- ✅ Mobile responsive - Next.js 16 responsive design
- ✅ Canonical URLs - Set on all pages
- ✅ Image optimization - Using WebP format

**E-commerce Foundation:**
- ✅ Google Merchant Feed - 6+ products with images, prices, availability
- ✅ Product links - Properly formatted product.html?id={productId}
- ✅ Brand markup - "SharonCraft" consistent across all products
- ✅ Categories - Gift Sets, Necklaces, Bracelets, Earrings properly tagged

**Content:**
- ✅ Homepage - Primary entry point
- ✅ Shop page - Product listing
- ✅ 8 keyword landing pages:
  - kenyan-artifacts.html
  - beaded-earrings-kenya.html
  - maasai-jewelry-kenya.html
  - handmade-kenyan-gifts.html
  - african-home-decor-nairobi.html
  - bridal-bead-sets-kenya.html
  - gift-sets-kenya.html
  - maasai-inspired-bracelets-kenya.html
- ✅ Journal/Blog - Article section for authority building
- ✅ Trust page - why-trust-sharoncraft.html

---

## 🎯 Three Priority Tasks (This Week)

### Task #1: Verify Google Business Profile
**Time Required:** 10 minutes  
**Impact:** ⭐⭐⭐⭐⭐ (50% of Google visibility)

**Steps:**
1. Go to https://business.google.com
2. Search for "SharonCraft" or "SharonCraft Nairobi"
3. Click "Manage this business" → Click "Claim this business"
4. Verify using phone call (fastest) or email
5. Once verified, edit:
   - **Logo:** Upload 300x300px square PNG (your logo)
   - **Cover Photo:** 1200x500px shop/product photo
   - **Business Hours:** Set your WhatsApp hours
   - **Category:** "Jewelry Store" or "Gift Shop"
   - **Phone:** +254112222572 (already correct)
   - **Website:** https://www.sharoncraft.co.ke
   - **Location:** Nairobi, Kenya
6. Request 5-10 customer reviews (ask your loyal customers)
7. Add 10-15 high-quality product photos

**Why This Matters:**
- Google shows a "knowledge card" when people search "SharonCraft"
- Your logo appears in search results
- Customers see reviews, photos, hours, direct WhatsApp link
- Copilot and other AI assistants use this data

---

### Task #2: Submit to Google Search Console
**Time Required:** 15 minutes  
**Impact:** ⭐⭐⭐⭐ (Google indexing control)

**Steps:**
1. Go to https://search.google.com/search-console
2. Click "Start now" → Sign in with Google
3. Choose "URL prefix" (enter: `https://www.sharoncraft.co.ke`)
4. Select "HTML file" verification method (easiest)
5. Download the verification file and save to `/public` folder:
   ```
   Add file named: google[verification-code].html
   Add to: public/
   ```
6. Deploy by running:
   ```bash
   npm run build
   git add -A
   git commit -m "Add Google Search Console verification"
   git push origin redesign/artisan-gallery-v2
   ```
7. Click "Verify" in Search Console
8. Once verified, go to "Sitemaps" → Add: `https://www.sharoncraft.co.ke/sitemap.xml`
9. Check "Coverage" tab to see:
   - How many pages are indexed
   - Any crawl errors
   - Mobile usability issues

**After Verification:**
- Check "Performance" tab monthly to see:
  - Which keywords are bringing traffic
  - Click-through rates (CTR)
  - Which pages need improvement
- Monitor "Core Web Vitals" for performance

---

### Task #3: Set Up Bing Webmaster Tools & IndexNow
**Time Required:** 10 minutes  
**Impact:** ⭐⭐⭐ (Bing/Copilot visibility)

**Steps:**
1. Go to https://www.bing.com/webmasters/
2. Sign in with Microsoft account (create one if needed)
3. Add site: `https://www.sharoncraft.co.ke`
4. Verify using DNS record or HTML file (use HTML file method):
   ```
   Add file to: public/BingSiteAuth.xml
   ```
5. Deploy and verify (same as Google Console above)
6. Submit sitemap: `https://www.sharoncraft.co.ke/sitemap.xml`

**Bonus - IndexNow (Instant Update Notification):**
After verification, you can use IndexNow to tell Bing/Google instantly when you add/update pages:
```bash
# Example: After deploying new products, run:
npm run notify:indexnow
```
This tells search engines to re-crawl immediately instead of waiting 1-2 weeks.

---

## 📅 Expected Timeline for Logo Appearance

| Channel | Timeline | What Appears | What You Do |
|---------|----------|-------------|-----------|
| **Browser Tab** | ✅ Immediate | Favicon in browser tab | Done - favicon fixed today |
| **WhatsApp/Social** | ✅ Immediate | Logo when sharing link | og:image meta tag active |
| **Google Business** | 1-3 days | Logo card on right side | Task #1: Claim & verify |
| **Google Search** | 1-3 weeks | Logo + sitelinks below result | Task #2: Submit to Search Console |
| **Google Knowledge Panel** | 1-3 months | Full info box with logo | Keep Business Profile updated |
| **Bing Search** | 1-2 weeks | Logo + snippets | Task #3: Bing Webmaster Tools |
| **Copilot & AI Assistants** | 2-4 weeks | AI can see your brand | Happens after Bing/Google index |
| **Google Images** | 2-4 weeks | Logo + product images | Auto happens from merchant feed |

---

## 🚀 Quick Reference Links

### To Complete This Week:
- **Google Business Profile:** https://business.google.com
- **Google Search Console:** https://search.google.com/search-console
- **Bing Webmaster Tools:** https://www.bing.com/webmasters/
- **Your Sitemap:** https://www.sharoncraft.co.ke/sitemap.xml
- **Your Merchant Feed:** https://www.sharoncraft.co.ke/google-merchant-feed.xml

### Your Site Info:
- **Domain:** https://www.sharoncraft.co.ke
- **Brand Name:** SharonCraft
- **Phone:** +254112222572
- **Location:** Nairobi, Kenya
- **Category:** Jewelry Store / Gift Shop
- **Logo File:** `/public/logo-og.png` (1200x630px)

---

## 📈 Monthly Monitoring Checklist

Every month, check:

**Google Search Console:**
```
1. Performance tab:
   - Top keywords bringing traffic
   - Click-through rate (CTR)
   - Average ranking position
   
2. Coverage tab:
   - All pages indexed?
   - Any new crawl errors?
   
3. Mobile Usability:
   - Any mobile issues reported?
```

**Google Business Profile:**
```
1. Insights tab:
   - How many people searched for you?
   - How many clicked to website?
   - How many requested directions?
   
2. Photos:
   - Add new product photos
   - Update seasonal photos
   
3. Reviews:
   - Respond to all reviews (good and bad)
   - Ask customers for reviews
```

**Bing Webmaster Tools:**
```
1. Check indexing status
2. Review any crawl errors
3. Check which keywords are performing
```

---

## 🎁 Bonus: Improve Rankings Further

Once the above 3 tasks are done, improve your keyword rankings:

**Easy Wins (1-2 weeks):**
- Add customer testimonials/reviews to pages
- Update product descriptions with long-tail keywords
- Add FAQ section (people ask "how to..." questions)
- Internal linking: Link keyword pages to homepage

**Medium Effort (2-4 weeks):**
- Write 3-4 journal articles about:
  - "Top 5 Maasai jewelry trends 2026"
  - "How to care for handmade beadwork"
  - "Where to buy authentic Kenyan artifacts"
- Add schema markup for articles
- Link to these from Facebook/Instagram

**Ongoing:**
- Ask for Google reviews consistently
- Keep Google Business Profile photos fresh
- Update prices/availability in merchant feed
- Monitor Search Console for new opportunities

---

## ❓ FAQ

**Q: How long until I rank #1 for "kenyan jewelry"?**  
A: 3-6 months typically. You have good content foundation. Focus on getting customer reviews + backlinks from Kenyan lifestyle sites.

**Q: Does my website need SSL (https)?**  
A: You're already using https - ✅ good!

**Q: Do I need to add my site to every search engine?**  
A: Google + Bing cover 95%+ of searches. Yandex and Baidu are less relevant for Kenya.

**Q: Will adding more products help my rankings?**  
A: Yes! Products with images rank well in Google Images and Google Shopping. Keep adding!

**Q: Should I advertise on Google Ads?**  
A: Not required for organic visibility, but $10-20/month could get immediate sales while you build organic presence.

---

## 📝 Task Completion Checklist

When you finish each task, check it off:

- [ ] Task #1: Google Business Profile claimed & verified
  - [ ] Logo uploaded
  - [ ] Hours set
  - [ ] 5+ reviews requested
  
- [ ] Task #2: Google Search Console set up
  - [ ] Site verified
  - [ ] Sitemap submitted
  - [ ] Checked Performance tab
  
- [ ] Task #3: Bing Webmaster Tools set up
  - [ ] Site verified
  - [ ] Sitemap submitted
  - [ ] IndexNow enabled

**After All 3 Done:**
- [ ] Check back in 1 week: Search "SharonCraft" in Google
- [ ] Check in 2 weeks: Search "maasai jewelry" in Google
- [ ] Check in 1 month: Review Search Console data
