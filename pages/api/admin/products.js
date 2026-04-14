import { isAuthorizedRequest } from "../../../lib/admin-auth";
import { normalizeProduct, normalizePublishStatus, slugify } from "../../../lib/products";
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
    const incomingId = String(incoming.id || "").trim();
    const incomingSlug = slugify(incoming.slug || incoming.name || incoming.id);
    const index = products.findIndex(
      (product) =>
        product.id === incomingId ||
        product.slug === incomingSlug,
    );
    const mergedProduct =
      index >= 0
        ? normalizeProduct({ ...products[index], ...incoming })
        : normalizeProduct(incoming);

    if (index >= 0) {
      products[index] = mergedProduct;
    } else {
      products.unshift(mergedProduct);
    }

    await writeProducts(products);
    return res.status(200).json({ ok: true, products });
  }

  if (req.method === "PATCH") {
    const { ids, action } = req.body || {};
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "ids required" });
    }
    if (!action) {
      return res.status(400).json({ error: "action required" });
    }

    const selectedIds = new Set(ids.map((value) => String(value)));
    const products = await readProducts();
    let changed = false;
    let nextProducts = products.map((product) => {
      if (!selectedIds.has(product.id)) return product;
      changed = true;

      if (action === "publish") {
        return normalizeProduct({ ...product, publishStatus: "published" });
      }
      if (action === "draft") {
        return normalizeProduct({ ...product, publishStatus: "draft" });
      }
      if (action === "feature") {
        return normalizeProduct({ ...product, featured: true });
      }
      if (action === "unfeature") {
        return normalizeProduct({ ...product, featured: false });
      }
      if (action === "mark-sold") {
        return normalizeProduct({ ...product, isSold: true, stock: 0 });
      }
      if (action === "mark-available") {
        return normalizeProduct({ ...product, isSold: false, stock: product.stock > 0 ? product.stock : 1 });
      }
      if (action === "set-publish-status") {
        return normalizeProduct({ ...product, publishStatus: normalizePublishStatus(req.body?.publishStatus) });
      }

      return product;
    });

    if (action === "delete") {
      nextProducts = nextProducts.filter((product) => !selectedIds.has(product.id));
      changed = true;
    }

    if (!changed) {
      return res.status(400).json({ error: "No matching products found" });
    }

    await writeProducts(nextProducts);
    return res.status(200).json({ ok: true, products: nextProducts });
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

  res.setHeader("Allow", "GET, POST, PATCH, DELETE");
  return res.status(405).json({ error: "Method not allowed" });
}
