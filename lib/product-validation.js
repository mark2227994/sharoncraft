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

// Enhanced form validation for Quick Add
export const FORM_VALIDATION_RULES = {
  NAME: {
    minLength: 3,
    maxLength: 120,
    pattern: /^[a-zA-Z0-9\s\-&'(),.éàâêîôûäöüßñ]+$/,
  },
  PRICE: {
    min: 50,
    max: 500000,
  },
};

export function validateQuickAddName(name) {
  if (!name || !name.trim()) {
    return { valid: false, message: "Product name is required" };
  }

  if (name.trim().length < FORM_VALIDATION_RULES.NAME.minLength) {
    return { valid: false, message: `Name must be at least ${FORM_VALIDATION_RULES.NAME.minLength} characters` };
  }

  if (name.length > FORM_VALIDATION_RULES.NAME.maxLength) {
    return { valid: false, message: `Name must not exceed ${FORM_VALIDATION_RULES.NAME.maxLength} characters` };
  }

  if (!FORM_VALIDATION_RULES.NAME.pattern.test(name)) {
    return { valid: false, message: "Name contains invalid characters" };
  }

  return { valid: true, message: "" };
}

export function validateQuickAddPrice(price) {
  if (!price) {
    return { valid: false, message: "Price is required" };
  }

  const numPrice = parseFloat(price);

  if (isNaN(numPrice)) {
    return { valid: false, message: "Price must be a number" };
  }

  if (numPrice < FORM_VALIDATION_RULES.PRICE.min) {
    return { valid: false, message: `Price must be at least KES ${FORM_VALIDATION_RULES.PRICE.min}` };
  }

  if (numPrice > FORM_VALIDATION_RULES.PRICE.max) {
    return { valid: false, message: `Price cannot exceed KES ${FORM_VALIDATION_RULES.PRICE.max}` };
  }

  return { valid: true, message: "" };
}

export function validateQuickAddCategory(category) {
  if (!category || !category.trim()) {
    return { valid: false, message: "Category is required" };
  }

  return { valid: true, message: "" };
}

export function validateQuickAddForm(form) {
  const errors = {};

  const nameValidation = validateQuickAddName(form.name);
  if (!nameValidation.valid) {
    errors.name = nameValidation.message;
  }

  const priceValidation = validateQuickAddPrice(form.price);
  if (!priceValidation.valid) {
    errors.price = priceValidation.message;
  }

  const categoryValidation = validateQuickAddCategory(form.category);
  if (!categoryValidation.valid) {
    errors.category = categoryValidation.message;
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export async function checkDuplicateProduct(name) {
  try {
    const response = await fetch("/api/admin/products/check-duplicate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ name: name.trim() }),
    });

    const data = await response.json();
    return data.exists || false;
  } catch (err) {
    console.error("Error checking duplicate:", err);
    return false;
  }
}
