import { cloneShopCategoryTree, normalizeShopCategoryTree } from "../../../data/site";
import { isAuthorizedRequest } from "../../../lib/admin-auth";
import { readAdminContentField, writeAdminContentField } from "../../../lib/admin-content";

export default async function handler(req, res) {
  if (req.method === "GET") {
    const data = normalizeShopCategoryTree(
      await readAdminContentField("shopTaxonomy", cloneShopCategoryTree()),
    );
    return res.status(200).json(data);
  }

  if (req.method === "POST") {
    if (!isAuthorizedRequest(req)) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const payload = normalizeShopCategoryTree(req.body);
      await writeAdminContentField("shopTaxonomy", payload);
      return res.status(200).json({ success: true, data: payload });
    } catch (error) {
      console.error("Error saving shop taxonomy:", error);
      return res.status(500).json({ error: "Failed to save shop taxonomy" });
    }
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ error: "Method not allowed" });
}
