import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { supabaseAdmin } from "@/lib/supabase/server";

type LegacyProduct = {
  id?: string;
  name: string;
  category?: string;
  price?: number;
  description?: string;
  shortDescription?: string;
  details?: string[];
  images?: string[];
  featured?: boolean;
  newArrival?: boolean;
};

const SITE_URL = "https://www.sharoncraft.co.ke";

const CATEGORY_SEED = [
  {
    name: "Jewellery",
    subcategories: [
      "Necklaces",
      "Earrings",
      "Bracelets",
      "Bangles",
      "Anklets",
      "Rings",
      "Hair Accessories",
    ],
    display_order: 1,
  },
  {
    name: "African Wear",
    subcategories: [
      "T-Shirts",
      "Embroidered Tops",
      "Maasai Shuka Wraps",
      "Jumpsuit Suits",
      "Sudanese Occasion Sets",
    ],
    display_order: 2,
  },
  {
    name: "Accessories",
    subcategories: [
      "Beaded Sandals",
      "Kiondos",
      "Belts",
      "Bags & Pouches",
      "Key Holders",
    ],
    display_order: 3,
  },
  {
    name: "Art & Craft",
    subcategories: ["Wood Carvings", "Soapstone", "Mixed Media"],
    display_order: 4,
  },
  {
    name: "Home & Living",
    subcategories: ["Kitchen & Serving", "Baskets & Storage", "Wall & Table Decor"],
    display_order: 5,
  },
  {
    name: "Gifted Carry",
    subcategories: ["Gift Sets", "Gift Wrapping", "Custom Gift Boxes"],
    display_order: 6,
  },
];

function toAbsoluteImageUrl(imagePath: string) {
  const trimmed = String(imagePath || "").trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return `${SITE_URL}/${trimmed.replace(/^\/+/, "")}`;
}

function mapLegacyCategory(rawCategory: string | undefined) {
  const value = String(rawCategory || "").trim().toLowerCase();

  if (["necklaces", "earrings", "bracelets", "bangles", "anklets", "rings"].includes(value)) {
    return {
      category: "Jewellery",
      subcategory: value.charAt(0).toUpperCase() + value.slice(1),
    };
  }

  if (value === "gift-sets") {
    return { category: "Gifted Carry", subcategory: "Gift Sets" };
  }

  if (["home-decor", "home decor"].includes(value)) {
    return { category: "Home & Living", subcategory: "Wall & Table Decor" };
  }

  if (["bridal", "bridal-occasion", "occasion"].includes(value)) {
    return { category: "African Wear", subcategory: "Sudanese Occasion Sets" };
  }

  if (["accessories", "bags", "bag"].includes(value)) {
    return { category: "Accessories", subcategory: "Bags & Pouches" };
  }

  return { category: "Jewellery", subcategory: null as string | null };
}

function buildDescription(product: LegacyProduct) {
  return String(product.description || product.shortDescription || "").trim();
}

export async function POST(_request: NextRequest) {
  try {
    const productsPath = path.join(process.cwd(), "data", "products.json");

    if (!fs.existsSync(productsPath)) {
      return NextResponse.json(
        { error: `Migration source not found: ${productsPath}` },
        { status: 404 },
      );
    }

    const raw = fs.readFileSync(productsPath, "utf8");
    const legacyProducts = JSON.parse(raw) as LegacyProduct[];

    const { error: categoryError } = await supabaseAdmin
      .from("categories")
      .upsert(CATEGORY_SEED, { onConflict: "name" });

    if (categoryError) {
      return NextResponse.json(
        { error: `Category seed failed: ${categoryError.message}` },
        { status: 500 },
      );
    }

    const mappedProducts = legacyProducts.map((product) => {
      const mapped = mapLegacyCategory(product.category);

      return {
        name: product.name,
        description: buildDescription(product),
        price: Number(product.price || 0),
        sale_price: null,
        category: mapped.category,
        subcategory: mapped.subcategory,
        images: Array.isArray(product.images)
          ? product.images.map(toAbsoluteImageUrl).filter(Boolean)
          : [],
        is_visible: true,
        is_featured: false,
        is_new: true,
        artisan: "By Sharon",
        stock_quantity: 5,
        low_stock_alert: 2,
      };
    });

    const { data: existingProducts, error: existingProductsError } = await supabaseAdmin
      .from("products")
      .select("name");

    if (existingProductsError) {
      return NextResponse.json(
        { error: `Failed to read existing products: ${existingProductsError.message}` },
        { status: 500 },
      );
    }

    const existingNames = new Set(
      (existingProducts || [])
        .map((product) => String(product.name || "").trim().toLowerCase())
        .filter(Boolean),
    );

    const productsToInsert = mappedProducts.filter(
      (product) => !existingNames.has(String(product.name).trim().toLowerCase()),
    );

    if (productsToInsert.length === 0) {
      return NextResponse.json({
        message: "Migration skipped",
        source_file: productsPath,
        categories_seeded: CATEGORY_SEED.length,
        products_migrated: 0,
        skipped_existing: mappedProducts.length,
        products: [],
      });
    }

    const { data, error } = await supabaseAdmin
      .from("products")
      .insert(productsToInsert)
      .select("id, name");

    if (error) {
      return NextResponse.json(
        { error: `Product migration failed: ${error.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json({
      message: "Migration complete",
      source_file: productsPath,
      categories_seeded: CATEGORY_SEED.length,
      products_migrated: data?.length || 0,
      skipped_existing: mappedProducts.length - productsToInsert.length,
      products: data || [],
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown migration error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
