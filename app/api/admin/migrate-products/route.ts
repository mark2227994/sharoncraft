/**
 * Product Migration API Route
 * POST /api/admin/migrate-products
 * 
 * Migrates products from data/products.json to Supabase
 * Protected by admin authentication via middleware
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import * as fs from 'fs';
import * as path from 'path';

interface LegacyProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  featured?: boolean;
  newArrival?: boolean;
  shortDescription?: string;
  description?: string;
  details?: string[];
  images?: string[];
}

export async function POST(request: NextRequest) {
  try {
    // Read products.json
    const productsPath = path.join(process.cwd(), 'data/products.json');

    if (!fs.existsSync(productsPath)) {
      return NextResponse.json(
        { error: 'Products file not found' },
        { status: 404 }
      );
    }

    const productsData = fs.readFileSync(productsPath, 'utf-8');
    const legacyProducts: LegacyProduct[] = JSON.parse(productsData);

    console.log(`🚀 Starting migration of ${legacyProducts.length} products...`);

    const results = {
      successful: [] as string[],
      failed: [] as { name: string; error: string }[],
    };

    // Migrate each product
    for (const legacyProduct of legacyProducts) {
      try {
        // Map legacy product to new schema
        const migratedProduct = {
          name: legacyProduct.name,
          description:
            legacyProduct.description || legacyProduct.shortDescription || '',
          price: legacyProduct.price,
          category: legacyProduct.category,
          subcategory: '',
          stock_quantity: 10,
          images: legacyProduct.images || [],
          artisan: 'By Sharon',
          care_instructions: legacyProduct.details?.join(' | ') || '',
          is_visible: true,
          is_featured: legacyProduct.featured || false,
          is_new: legacyProduct.newArrival || false,
        };

        // Insert into Supabase
        const { error } = await supabaseAdmin
          .from('products')
          .insert([migratedProduct]);

        if (error) {
          results.failed.push({
            name: legacyProduct.name,
            error: error.message,
          });
          console.error(`❌ ${legacyProduct.name}: ${error.message}`);
        } else {
          results.successful.push(legacyProduct.name);
          console.log(`✅ ${legacyProduct.name}`);
        }
      } catch (err: any) {
        results.failed.push({
          name: legacyProduct.name,
          error: err.message,
        });
        console.error(`❌ ${legacyProduct.name}: ${err.message}`);
      }
    }

    console.log(
      `\n📊 Migration complete: ${results.successful.length} successful, ${results.failed.length} failed`
    );

    return NextResponse.json(
      {
        message: 'Migration completed',
        summary: {
          total: legacyProducts.length,
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
