import { isAuthorizedRequest } from "../../../../lib/admin-auth";
import { writeProducts } from "../../../../lib/store";
import fs from "fs/promises";
import path from "path";

export default async function handler(req, res) {
  if (!isAuthorizedRequest(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Delete all products from Supabase
    await writeProducts([]);
    
    // Also clear the local JSON file so fallback doesn't restore old data
    const root = process.cwd();
    const jsonPath = path.join(root, "data", "store", "products.json");
    await fs.writeFile(jsonPath, "[]", "utf8");
    
    return res.status(200).json({ ok: true, message: "All products deleted successfully" });
  } catch (error) {
    console.error("Error deleting all products:", error);
    return res.status(500).json({ error: "Failed to delete all products" });
  }
}
