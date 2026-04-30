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
    name: 'Jewellery',
    subcategories: ['Necklaces', 'Earrings', 'Bracelets', 'Bangles', 'Anklets', 'Rings', 'Hair Accessories'],
    is_visible: true,
    display_order: 1,
  },
  {
    name: 'African Wear',
    subcategories: ['T-Shirts', 'Embroidered Tops', 'Maasai Shuka Wraps', 'Jumpsuit Suits', 'Sudanese Occasion Sets'],
    is_visible: true,
    display_order: 2,
  },
  {
    name: 'Accessories',
    subcategories: ['Beaded Sandals', 'Kiondos', 'Belts', 'Bags & Pouches', 'Key Holders'],
    is_visible: true,
    display_order: 3,
  },
  {
    name: 'Art & Craft',
    subcategories: ['Wood Carvings', 'Soapstone', 'Mixed Media'],
    is_visible: true,
    display_order: 4,
  },
  {
    name: 'Home & Living',
    subcategories: ['Kitchen & Serving', 'Baskets & Storage', 'Wall & Table Decor'],
    is_visible: true,
    display_order: 5,
  },
  {
    name: 'Gifted Carry',
    subcategories: ['Gift Sets', 'Gift Wrapping', 'Custom Gift Boxes'],
    is_visible: true,
    display_order: 6,
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
