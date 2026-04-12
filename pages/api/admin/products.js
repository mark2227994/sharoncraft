import { readProducts, writeProducts } from "../../../lib/store";

export default async function handler(req, res) {
  if (req.method === "GET") {
    return res.status(200).json(await readProducts());
  }

  if (req.method === "POST") {
    const incoming = req.body || {};
    const products = await readProducts();
    const index = products.findIndex((product) => product.id === incoming.id);

    if (index >= 0) {
      products[index] = { ...products[index], ...incoming };
    } else {
      products.unshift(incoming);
    }

    await writeProducts(products);
    return res.status(200).json({ ok: true, products });
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ error: "Method not allowed" });
}
