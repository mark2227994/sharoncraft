# Phase 4: Public Website Integration Guide

This document explains how to connect your existing public website pages to Supabase for dynamic data fetching.

## Overview

The public website fetches data through **read-only RLS policies** that allow unauthenticated users to see only visible/approved content. No authentication required.

## Architecture

```
Public Website Pages
    ↓
useEffect/Server Components
    ↓
lib/supabase/public.ts (utilities)
    ↓
publicSupabase client (NEXT_PUBLIC keys)
    ↓
Supabase Tables (with RLS)
```

## Setup Steps

### 1. Update Database Schema (Already Done)

The `supabase/admin-schema.sql` now includes public RLS policies:

```sql
-- Products: visible = true
-- Categories: visible = true
-- Reviews: approved = true
-- Hero Slides: visible = true
-- Newsletter: allow inserts
-- Announcements: visible = true
-- Custom Orders: allow inserts
-- Discounts: active = true AND not expired
```

**Action**: Re-run the schema SQL in Supabase to apply public policies.

### 2. Test Public Access

In Supabase SQL Editor, run:

```sql
-- This simulates unauthenticated access (should return visible products only)
SELECT * FROM products WHERE is_visible = true LIMIT 5;

-- This should fail (would need auth)
-- SELECT * FROM admin_users;
```

### 3. Replace Static Data with Supabase

#### **Option A: Shop Page (Client Component)**

Replace your existing `/pages/shop.js` or `/app/shop/page.tsx`:

```tsx
'use client';

import { useEffect, useState } from 'react';
import { fetchVisibleProducts, fetchVisibleCategories } from '@/lib/supabase/public';

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    async function load() {
      const [prods, cats] = await Promise.all([
        fetchVisibleProducts(),
        fetchVisibleCategories(),
      ]);
      setProducts(prods);
      setCategories(cats);
    }
    load();
  }, []);

  // Rest of your shop UI...
}
```

#### **Option B: Product Detail (Server Component)**

Use async server components for better performance:

```tsx
// app/shop/[id]/page.tsx
export default async function ProductPage({ params }) {
  const product = await fetchProductById(params.id);
  const reviews = await fetchProductReviews(params.id);

  if (!product) return <div>Not found</div>;

  return (
    <div>
      <h1>{product.name}</h1>
      <p>KES {product.price}</p>
      {/* Render product details */}
    </div>
  );
}
```

#### **Option C: Homepage (Mixed)**

Use server components for initial load, client for interactivity:

```tsx
// app/page.tsx
export default async function HomePage() {
  const heroSlides = await fetchVisibleHeroSlides();
  const featuredProducts = await fetchFeaturedProducts(6);
  const announcement = await fetchAnnouncement();

  return (
    <>
      {announcement && <AnnouncementBar text={announcement.text} />}
      <HeroSlideshow slides={heroSlides} /> {/* Client component */}
      <FeaturedProducts products={featuredProducts} />
    </>
  );
}
```

### 4. Available Utilities (lib/supabase/public.ts)

#### Products

```ts
fetchVisibleProducts(category?: string)          // All visible products
fetchProductById(id: string)                     // Single product (visible only)
fetchFeaturedProducts(limit?: number)            // Featured products
fetchNewProducts(limit?: number)                 // New arrivals
searchProducts(query: string)                    // Search visible products
```

#### Categories

```ts
fetchVisibleCategories()                         // All visible categories
fetchCategoryByName(name: string)                // Single category
```

#### Content

```ts
fetchVisibleHeroSlides()                         // Slideshow images
fetchAnnouncement()                              // Banner announcement
fetchHomepageSection(section: string)            // Custom sections (JSON)
```

#### Reviews

```ts
fetchProductReviews(productId: string)           // Approved reviews only
submitProductReview(review)                      // User submissions (pending)
```

#### Customer Actions

```ts
subscribeToNewsletter(email: string)             // Newsletter signup
submitCustomOrderRequest(order)                  // Custom order requests
validateDiscountCode(code: string)               // Check discount validity
```

### 5. Example: Newsletter Signup

```tsx
// components/NewsletterSignup.tsx
'use client';

import { useState } from 'react';
import { subscribeToNewsletter } from '@/lib/supabase/public';

export default function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const success = await subscribeToNewsletter(email);
    setLoading(false);
    if (success) {
      alert('Subscribed!');
      setEmail('');
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
      />
      <button type="submit" disabled={loading}>
        Subscribe
      </button>
    </form>
  );
}
```

### 6. Example: Product Grid with Filters

```tsx
'use client';

import { useState, useEffect } from 'react';
import {
  fetchVisibleProducts,
  fetchVisibleCategories,
  searchProducts,
} from '@/lib/supabase/public';

export default function ProductGrid() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    async function load() {
      const cats = await fetchVisibleCategories();
      setCategories(cats);

      let prods;
      if (search) {
        prods = await searchProducts(search);
      } else if (category) {
        prods = await fetchVisibleProducts(category);
      } else {
        prods = await fetchVisibleProducts();
      }
      setProducts(prods);
    }

    const debounce = setTimeout(load, 300);
    return () => clearTimeout(debounce);
  }, [search, category]);

  return (
    <div>
      <input
        type="text"
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="">All Categories</option>
        {categories.map((c) => (
          <option key={c.id} value={c.name}>
            {c.name}
          </option>
        ))}
      </select>

      <div className="grid grid-cols-3 gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
```

### 7. Migration Checklist

- [ ] Run updated `admin-schema.sql` in Supabase to add public RLS policies
- [ ] Test: Can unauthenticated user fetch visible products? (Supabase SQL)
- [ ] Create `/lib/supabase/public.ts` with utility functions
- [ ] Update Shop page to use `fetchVisibleProducts()`
- [ ] Update Product detail page to use `fetchProductById(id)`
- [ ] Update Homepage to use `fetchVisibleHeroSlides()`
- [ ] Update Footer to use `subscribeToNewsletter()` in newsletter form
- [ ] Add Custom Order page using `submitCustomOrderRequest()`
- [ ] Remove `data/products.json` imports from pages (no longer needed)
- [ ] Test each page in browser - verify data loads from Supabase
- [ ] Check Network tab - confirm XHR requests to Supabase
- [ ] Test filters/search - confirm real-time Supabase queries

### 8. Troubleshooting

**"No products found" on shop page?**
- Verify products have `is_visible = true` in admin panel
- Check RLS policies: Run `SELECT * FROM products WHERE is_visible = true` in Supabase SQL Editor
- Confirm NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in `.env.local`

**Newsletter signup fails?**
- Check if email already exists (constraint violation returns success)
- Verify `newsletter` table has RLS policy allowing inserts
- Check browser console for Supabase error messages

**Slow initial load?**
- Use server components (async/await) instead of client useEffect for initial data
- Add caching with `revalidate` in server components
- Implement pagination for large product lists

**Custom order requests not appearing in admin?**
- Verify form submits to correct table: `custom_orders`
- Check RLS policy allows inserts (no auth required)
- View in admin dashboard under Custom Orders page

### 9. Performance Tips

1. **Use Server Components** for data fetching on initial load
   ```tsx
   export default async function Page() {
     const products = await fetchVisibleProducts();
     return <ProductList products={products} />;
   }
   ```

2. **Cache Server Data**
   ```tsx
   export const revalidate = 60; // Revalidate every 60 seconds
   ```

3. **Defer non-critical data**
   ```tsx
   import { Suspense } from 'react';
   <Suspense fallback={<div>Loading reviews...</div>}>
     <ReviewsSection productId={id} />
   </Suspense>
   ```

4. **Paginate large lists**
   ```tsx
   const { data } = await publicSupabase
     .from('products')
     .select('*')
     .eq('is_visible', true)
     .range(0, 19) // First 20
   ```

### 10. Example Files

Reference these example files for implementation patterns:
- `app/layout-example.tsx` - Using hero slides server-side
- `app/shop-example.tsx` - Product grid with filters
- `app/shop-detail-example.tsx` - Product detail page
- `components/NewsletterSignupDynamic.tsx` - Newsletter form
- `components/CustomOrderFormDynamic.tsx` - Custom order requests

## Next Steps

1. **Run Schema Update**: Execute the updated `admin-schema.sql` in Supabase
2. **Add Products**: Use admin dashboard to add 5-10 test products with `is_visible = true`
3. **Test Public Access**: Verify you can fetch products via `lib/supabase/public.ts`
4. **Update First Page**: Replace one page (shop or homepage) to use Supabase
5. **Verify End-to-End**: Test as unauthenticated user in browser
6. **Iterate**: Update remaining pages one by one

## Admin vs Public Access

| Feature | Admin | Public |
|---------|-------|--------|
| View Products | All (visible + hidden) | Visible only |
| View Categories | All | Visible only |
| View Reviews | All (approved + pending) | Approved only |
| Manage Data | Full CRUD | Read only |
| See Discounts | All | Active & non-expired |
| View Orders | Own orders | No access |

---

**Phase 4 Complete**: Public website now fetches dynamic data from Supabase!
