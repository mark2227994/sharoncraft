import { isAuthorizedRequest } from "../../../../lib/admin-auth";
import { readProducts, writeProducts } from "../../../../lib/store";

export default async function handler(req, res) {
  if (!isAuthorizedRequest(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Clear all products by writing empty array
    await writeProducts([]);
    return res.status(200).json({ ok: true, message: "All products deleted successfully" });
  } catch (error) {
    console.error("Error deleting all products:", error);
    return res.status(500).json({ error: "Failed to delete all products" });
  }
}
