import { readProducts, writeProducts } from "../../../lib/store";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { productId, story } = req.body || {};
  const products = await readProducts();
  const nextProducts = products.map((product) => (product.id === productId ? { ...product, story: { ...product.story, ...story } } : product));

  await writeProducts(nextProducts);
  return res.status(200).json({ ok: true });
}
