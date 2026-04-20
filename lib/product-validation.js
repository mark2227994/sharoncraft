/**
 * Product validation utilities
 * Checks for required fields and completeness
 */

const REQUIRED_FIELDS = [
  "name",
  "price",
  "category",
  "image",
  "description",
  "materials",
  "artisan",
  "stock",
  "jewelryType",
];

const LOW_STOCK_THRESHOLD = 3;

export function getProductCompleteness(product) {
  if (!product) return { isComplete: false, missingFields: REQUIRED_FIELDS, percentage: 0 };

  const missingFields = REQUIRED_FIELDS.filter((field) => {
    const value = product[field];
    // Check if field is missing or empty
    if (value === null || value === undefined || value === "") return true;
    // Check if array is empty
    if (Array.isArray(value) && value.length === 0) return true;
    return false;
  });

  const percentage = Math.round(((REQUIRED_FIELDS.length - missingFields.length) / REQUIRED_FIELDS.length) * 100);

  return {
    isComplete: missingFields.length === 0,
    missingFields,
    percentage,
    totalRequired: REQUIRED_FIELDS.length,
  };
}

export function isLowStock(product) {
  return product && product.stock !== undefined && product.stock !== null && product.stock < LOW_STOCK_THRESHOLD && !product.isSold;
}

export function getStockStatus(product) {
  if (!product) return "unknown";
  if (product.isSold) return "sold";
  if (product.stock < LOW_STOCK_THRESHOLD) return "low";
  if (product.stock === 0) return "out-of-stock";
  return "in-stock";
}

export function validateProductForSave(product) {
  const completeness = getProductCompleteness(product);

  if (!completeness.isComplete) {
    return {
      valid: false,
      errors: completeness.missingFields.map((field) => `${field} is required`),
      message: `Missing ${completeness.missingFields.length} required field(s): ${completeness.missingFields.join(", ")}`,
    };
  }

  // Validate price is positive
  if (product.price <= 0) {
    return {
      valid: false,
      errors: ["Price must be greater than 0"],
      message: "Price must be a positive number",
    };
  }

  // Validate stock is non-negative
  if (product.stock < 0) {
    return {
      valid: false,
      errors: ["Stock cannot be negative"],
      message: "Stock level cannot be negative",
    };
  }

  return {
    valid: true,
    errors: [],
    message: "Product is complete and valid",
  };
}

export function getProductDashboardStatus(product) {
  const completeness = getProductCompleteness(product);
  const stockStatus = getStockStatus(product);
  const isIncomplete = !completeness.isComplete;
  const isLowOrOutOfStock = stockStatus === "low" || stockStatus === "out-of-stock";

  return {
    id: product.id,
    name: product.name,
    isIncomplete,
    isLowOrOutOfStock,
    stockStatus,
    completeness,
    missingFields: completeness.missingFields,
    stock: product.stock,
    price: product.price,
  };
}

export function groupProductsByStatus(products) {
  const incomplete = [];
  const lowStock = [];
  const healthy = [];

  products.forEach((product) => {
    const status = getProductDashboardStatus(product);
    if (status.isIncomplete) incomplete.push(status);
    else if (status.isLowOrOutOfStock) lowStock.push(status);
    else healthy.push(status);
  });

  return {
    incomplete: incomplete.sort((a, b) => b.completeness.percentage - a.completeness.percentage),
    lowStock: lowStock.sort((a, b) => a.stock - b.stock),
    healthy,
    total: products.length,
    incompleteCount: incomplete.length,
    lowStockCount: lowStock.length,
    healthyCount: healthy.length,
  };
}
