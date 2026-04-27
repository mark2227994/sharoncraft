/**
 * Public Supabase utilities for fetching read-only data from the browser
 * No authentication required - uses public RLS policies
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const publicSupabase = createClient(supabaseUrl, supabaseAnonKey);

// ============================================
// PRODUCTS
// ============================================
export async function fetchVisibleProducts(category?: string) {
  let query = publicSupabase
    .from('products')
    .select('*')
    .eq('is_visible', true)
    .order('created_at', { ascending: false });

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query;
  if (error) console.error('Error fetching products:', error);
  return data || [];
}

export async function fetchProductById(id: string) {
  const { data, error } = await publicSupabase
    .from('products')
    .select('*')
    .eq('id', id)
    .eq('is_visible', true)
    .single();

  if (error) console.error('Error fetching product:', error);
  return data;
}

export async function fetchFeaturedProducts(limit = 6) {
  const { data, error } = await publicSupabase
    .from('products')
    .select('*')
    .eq('is_visible', true)
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) console.error('Error fetching featured products:', error);
  return data || [];
}

export async function fetchNewProducts(limit = 6) {
  const { data, error } = await publicSupabase
    .from('products')
    .select('*')
    .eq('is_visible', true)
    .eq('is_new', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) console.error('Error fetching new products:', error);
  return data || [];
}

export async function searchProducts(query: string) {
  const { data, error } = await publicSupabase
    .from('products')
    .select('*')
    .eq('is_visible', true)
    .ilike('name', `%${query}%`)
    .order('created_at', { ascending: false });

  if (error) console.error('Error searching products:', error);
  return data || [];
}

// ============================================
// CATEGORIES
// ============================================
export async function fetchVisibleCategories() {
  const { data, error } = await publicSupabase
    .from('categories')
    .select('*')
    .eq('is_visible', true)
    .order('display_order');

  if (error) console.error('Error fetching categories:', error);
  return data || [];
}

export async function fetchCategoryByName(name: string) {
  const { data, error } = await publicSupabase
    .from('categories')
    .select('*')
    .eq('name', name)
    .eq('is_visible', true)
    .single();

  if (error) console.error('Error fetching category:', error);
  return data;
}

// ============================================
// HERO SLIDES
// ============================================
export async function fetchVisibleHeroSlides() {
  const { data, error } = await publicSupabase
    .from('hero_slides')
    .select('*')
    .eq('is_visible', true)
    .order('display_order');

  if (error) console.error('Error fetching hero slides:', error);
  return data || [];
}

// ============================================
// REVIEWS
// ============================================
export async function fetchProductReviews(productId: string) {
  const { data, error } = await publicSupabase
    .from('reviews')
    .select('*')
    .eq('product_id', productId)
    .eq('is_approved', true)
    .order('created_at', { ascending: false });

  if (error) console.error('Error fetching reviews:', error);
  return data || [];
}

export async function submitProductReview(review: {
  product_id: string;
  customer_name: string;
  rating: number;
  comment: string;
}) {
  const { error } = await publicSupabase
    .from('reviews')
    .insert([{ ...review, is_approved: false }]);

  if (error) console.error('Error submitting review:', error);
  return !error;
}

// ============================================
// NEWSLETTER
// ============================================
export async function subscribeToNewsletter(email: string) {
  const { error } = await publicSupabase
    .from('newsletter')
    .insert([{ email, is_active: true }]);

  if (error) {
    console.error('Error subscribing to newsletter:', error);
    // Check if email already subscribed
    if (error.code === '23505') return true; // Unique constraint violation - already subscribed
    return false;
  }
  return true;
}

// ============================================
// ANNOUNCEMENTS
// ============================================
export async function fetchAnnouncement() {
  const { data, error } = await publicSupabase
    .from('announcement')
    .select('*')
    .eq('is_visible', true)
    .order('updated_at', { ascending: false })
    .limit(1)
    .single();

  if (error) console.error('Error fetching announcement:', error);
  return data || null;
}

// ============================================
// HOMEPAGE CONTENT
// ============================================
export async function fetchHomepageSection(section: string) {
  const { data, error } = await publicSupabase
    .from('homepage_content')
    .select('content')
    .eq('section', section)
    .eq('is_visible', true)
    .single();

  if (error) console.error('Error fetching homepage section:', error);
  return data?.content || null;
}

// ============================================
// DISCOUNT CODES
// ============================================
export async function validateDiscountCode(code: string) {
  const { data, error } = await publicSupabase
    .from('discounts')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('is_active', true)
    .gt('expiry_date', new Date().toISOString())
    .single();

  if (error) return null;

  // Check usage limit
  if (data.usage_limit && data.times_used >= data.usage_limit) {
    return null;
  }

  return {
    type: data.type,
    amount: data.amount,
  };
}

// ============================================
// CUSTOM ORDERS
// ============================================
export async function submitCustomOrderRequest(order: {
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  description: string;
  budget: number;
}) {
  const { error } = await publicSupabase
    .from('custom_orders')
    .insert([{ ...order, status: 'pending' }]);

  if (error) {
    console.error('Error submitting custom order:', error);
    return false;
  }
  return true;
}
