/**
 * Categories Migration API Route
 * POST /api/admin/migrate-categories
 * 
 * Seeds categories into Supabase
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

const CATEGORIES = [
  {
    name: 'Necklaces',
    subcategories: ['Collar Necklaces', 'Statement Necklaces', 'Cascading Necklaces'],
    is_visible: true,
    display_order: 1,
  },
  {
    name: 'Bracelets',
    subcategories: ['Stacked Bracelets', 'Statement Bracelets', 'Affordable Bracelets'],
    is_visible: true,
    display_order: 2,
  },
  {
    name: 'Earrings',
    subcategories: ['Drop Earrings', 'Statement Earrings', 'Daily Wear Earrings'],
    is_visible: true,
    display_order: 3,
  },
  {
    name: 'Home Decor',
    subcategories: ['Mirrors', 'Wall Art', 'Table Decor', 'Accents'],
    is_visible: true,
    display_order: 4,
  },
  {
    name: 'Gift Sets',
    subcategories: ['Jewelry Sets', 'Decor Sets', 'Themed Collections'],
    is_visible: true,
    display_order: 5,
  },
];

export async function POST(request: NextRequest) {
  try {
    const results = {
      successful: [] as string[],
      failed: [] as { name: string; error: string }[],
    };

    console.log(`🚀 Starting categories migration...`);

    // Insert categories
    for (const category of CATEGORIES) {
      try {
        const { error } = await supabaseAdmin
          .from('categories')
          .insert([category]);

        if (error) {
          if (error.code === '23505') {
            // Unique violation - category already exists
            console.log(`⚠️  ${category.name} already exists`);
            results.successful.push(category.name);
          } else {
            results.failed.push({
              name: category.name,
              error: error.message,
            });
            console.error(`❌ ${category.name}: ${error.message}`);
          }
        } else {
          results.successful.push(category.name);
          console.log(`✅ ${category.name}`);
        }
      } catch (err: any) {
        results.failed.push({
          name: category.name,
          error: err.message,
        });
        console.error(`❌ ${category.name}: ${err.message}`);
      }
    }

    console.log(
      `\n📊 Categories migration complete: ${results.successful.length} successful, ${results.failed.length} failed`
    );

    return NextResponse.json(
      {
        message: 'Categories migration completed',
        summary: {
          total: CATEGORIES.length,
          successful: results.successful.length,
          failed: results.failed.length,
        },
        results,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error(`❌ Migration error: ${err.message}`);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
