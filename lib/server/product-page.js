import { createClient } from "@supabase/supabase-js";
import { isPublishedProduct } from "../products";
import { readProducts } from "../store";

async function fetchApprovedReviews(productId) {
  const supabaseUrl =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://vonzscriztdcdhobulhy.supabase.co";
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return [];
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("product_id", productId)
      .eq("is_approved", true)
      .order("created_at", { ascending: false });

    if (error || !Array.isArray(data)) {
      return [];
    }

    return data;
  } catch {
    return [];
  }
}

export async function getServerSideProps({ params }) {
  const products = await readProducts();
  const product = products.find((item) => item.slug === params.slug && isPublishedProduct(item));

  if (!product) {
    return { notFound: true };
  }

  const visibleProducts = products.filter((item) => {
    const isVisible = item.is_visible ?? item.isVisible ?? true;
    return item.id !== product.id && isVisible && isPublishedProduct(item);
  });

  const relatedProducts = [];
  const seenIds = new Set();

  for (const candidate of visibleProducts.filter(
    (item) => item.category === product.category && item.subcategory === product.subcategory,
  )) {
    if (seenIds.has(candidate.id)) continue;
    seenIds.add(candidate.id);
    relatedProducts.push(candidate);
    if (relatedProducts.length === 4) break;
  }

  if (relatedProducts.length < 4) {
    for (const candidate of visibleProducts.filter((item) => item.category === product.category)) {
      if (seenIds.has(candidate.id)) continue;
      seenIds.add(candidate.id);
      relatedProducts.push(candidate);
      if (relatedProducts.length === 4) break;
    }
  }

  const reviews = await fetchApprovedReviews(product.id);

  return {
    props: {
      product,
      relatedProducts,
      reviews,
    },
  };
}
