import { isAuthorizedRequest } from "../../../lib/admin-auth";
import { readProducts, writeProducts } from "../../../lib/store";

export default async function handler(req, res) {
  if (!isAuthorizedRequest(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

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

  if (req.method === "DELETE") {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: "id required" });
    const products = await readProducts();
    const filtered = products.filter((product) => product.id !== id);
    if (filtered.length === products.length) {
      return res.status(404).json({ error: "Product not found" });
    }
    await writeProducts(filtered);
    return res.status(200).json({ ok: true });
  }

  res.setHeader("Allow", "GET, POST, DELETE");
  return res.status(405).json({ error: "Method not allowed" });
}
