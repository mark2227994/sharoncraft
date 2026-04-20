import { isAuthorizedRequest } from "../../../lib/admin-auth";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};

export default async function handler(req, res) {
  if (!isAuthorizedRequest(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { csvData } = req.body;
  if (!csvData || typeof csvData !== "string") {
    return res.status(400).json({ error: "CSV data is required" });
  }

  // Parse CSV
  const lines = csvData.trim().split("\n");
  if (lines.length < 2) {
    return res.status(400).json({ error: "CSV must have header row and at least one data row" });
  }

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const requiredFields = ["name", "price", "category"];
  const missingFields = requiredFields.filter((f) => !headers.includes(f));

  if (missingFields.length > 0) {
    return res.status(400).json({ error: `Missing required fields: ${missingFields.join(", ")}` });
  }

  const products = [];
  const errors = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim());
    if (values.length < requiredFields.length || !values[0]) continue;

    const product = {};
    headers.forEach((header, idx) => {
      product[header] = values[idx] || "";
    });

    // Validate required fields
    if (!product.name || !product.price || !product.category) {
      errors.push(`Row ${i + 1}: Missing required field`);
      continue;
    }

    // Validate price is number
    const priceNum = parseFloat(product.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      errors.push(`Row ${i + 1}: Invalid price`);
      continue;
    }

    // Prepare product object
    const newProduct = {
      name: product.name,
      price: priceNum,
      category: product.category,
      description: product.description || "",
      materials: product.materials || "",
      slug: (product.slug || product.name.toLowerCase().replace(/\s+/g, "-")).replace(/[^a-z0-9-]/g, ""),
      jewelryType: product.jewelrytype || "",
      fulfillmentType: product.fulfillmenttype || "ready_to_ship",
      stock: parseInt(product.stock, 10) || 1,
      artisanId: product.artisanid || "",
      tags: product.tags ? product.tags.split(";").map((t) => t.trim()) : [],
      publishStatus: product.publishstatus || "draft",
      image: product.image || "",
      stylingImage: product.stylingimage || "",
      detailImage: product.detailimage || "",
      gallery: [],
      wearItWithIds: [],
    };

    products.push(newProduct);
  }

  if (products.length === 0) {
    return res.status(400).json({ error: "No valid products found in CSV", errors });
  }

  // Return parsed products for preview/confirmation
  return res.status(200).json({
    success: true,
    productsToImport: products,
    totalCount: products.length,
    errors,
  });
}
