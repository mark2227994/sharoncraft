/**
 * SHARONCRAFT PRODUCT MIGRATION SCRIPT
 * Migrates products from data/products.json to Supabase database
 * Usage: ts-node scripts/migrate-products.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const BUCKET_NAME = 'product-images';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error(
    '❌ Missing environment variables: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY'
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

interface LegacyProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  badge?: string;
  featured?: boolean;
  newArrival?: boolean;
  shortDescription?: string;
  description?: string;
  details?: string[];
  images?: string[];
  heritageStory?: string;
}

interface MigratedProduct {
  name: string;
  description: string;
  price: string;
  category: string;
  subcategory: string;
  stock_quantity: number;
  images: string[];
  artisan: string;
  care_instructions: string;
  is_visible: boolean;
  is_featured: boolean;
  is_new: boolean;
}

async function uploadImageToStorage(imagePath: string): Promise<string | null> {
  try {
    // Read image file
    const fullPath = path.join(process.cwd(), imagePath);
    if (!fs.existsSync(fullPath)) {
      console.warn(`⚠️  Image file not found: ${imagePath}`);
      return null;
    }

    const fileData = fs.readFileSync(fullPath);
    const filename = path.basename(imagePath);
    const storagePath = `products/${filename}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(storagePath, fileData, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) {
      console.warn(`⚠️  Failed to upload ${filename}: ${error.message}`);
      return null;
    }

    // Return public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET_NAME).getPublicUrl(storagePath);

    return publicUrl;
  } catch (err: any) {
    console.warn(`⚠️  Error uploading image: ${err.message}`);
    return null;
  }
}

async function migrateProducts() {
  console.log('🚀 Starting product migration...\n');

  try {
    // Read products.json
    const productsPath = path.join(process.cwd(), 'data/products.json');
    const productsData = fs.readFileSync(productsPath, 'utf-8');
    const legacyProducts: LegacyProduct[] = JSON.parse(productsData);

    console.log(`📦 Found ${legacyProducts.length} products to migrate\n`);

    let successCount = 0;
    let failureCount = 0;

    for (const legacyProduct of legacyProducts) {
      try {
        console.log(`⏳ Processing: ${legacyProduct.name}...`);

        // Upload images
        const uploadedImages: string[] = [];
        if (legacyProduct.images && legacyProduct.images.length > 0) {
          for (const imagePath of legacyProduct.images) {
            const publicUrl = await uploadImageToStorage(imagePath);
            if (publicUrl) {
              uploadedImages.push(publicUrl);
            }
          }
        }

        // Map legacy product to new schema
        const migratedProduct: MigratedProduct = {
          name: legacyProduct.name,
          description: legacyProduct.description || legacyProduct.shortDescription || '',
          price: legacyProduct.price.toString(),
          category: legacyProduct.category,
          subcategory: '', // No subcategory in legacy data
          stock_quantity: 10, // Default stock
          images: uploadedImages,
          artisan: 'By Sharon',
          care_instructions: legacyProduct.details?.join(' | ') || '',
          is_visible: true,
          is_featured: legacyProduct.featured || false,
          is_new: legacyProduct.newArrival || false,
        };

        // Insert into Supabase
        const { data, error } = await supabase
          .from('products')
          .insert([migratedProduct])
          .select();

        if (error) {
          console.error(`❌ Failed to insert ${legacyProduct.name}: ${error.message}`);
          failureCount++;
        } else {
          console.log(`✅ Successfully migrated: ${legacyProduct.name}`);
          successCount++;
        }
      } catch (err: any) {
        console.error(`❌ Error processing ${legacyProduct.name}: ${err.message}`);
        failureCount++;
      }
    }

    console.log('\n📊 Migration Summary');
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Failed: ${failureCount}`);
    console.log(`📦 Total: ${legacyProducts.length}`);

    if (failureCount === 0) {
      console.log('\n🎉 All products migrated successfully!');
    }
  } catch (err: any) {
    console.error(`❌ Migration failed: ${err.message}`);
    process.exit(1);
  }
}

// Run migration
migrateProducts().then(() => {
  console.log('\n✨ Migration complete');
  process.exit(0);
});
