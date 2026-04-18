import { isAuthorizedRequest } from "../../../lib/admin-auth";
import { getDashboardSnapshot } from "../../../lib/store";

export default async function handler(req, res) {
  if (!isAuthorizedRequest(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { products = [] } = await getDashboardSnapshot();

  // Calculate inventory metrics
  let totalValue = 0;
  let itemCount = 0;
  const lowStockItems = [];
  const categories = {};

  products.forEach((product) => {
    const quantity = Number(product.quantity || 0);
    const price = Number(product.price || 0);
    const category = product.category || "Other";
    const reorderPoint = Number(product.reorderPoint || 10);

    itemCount += quantity;
    totalValue += quantity * price;

    if (quantity <= reorderPoint) {
      lowStockItems.push({
        name: product.name,
        sku: product.sku || product.id,
        quantity,
        reorderPoint,
        price,
      });
    }

    if (!categories[category]) {
      categories[category] = {
        name: category,
        itemCount: 0,
        value: 0,
      };
    }
    categories[category].itemCount += 1;
    categories[category].value += quantity * price;
  });

  // Sort low stock items by quantity
  lowStockItems.sort((a, b) => a.quantity - b.quantity);

  res.status(200).json({
    lowStockItems: lowStockItems.slice(0, 10),
    totalValue,
    itemCount,
    categories: Object.values(categories),
  });
}
