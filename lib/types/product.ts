export type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  sale_price: number | null;
  category: string;
  subcategory: string | null;
  stock_quantity: number;
  low_stock_alert: number;
  images: string[];
  sizes: string[];
  colors: string[];
  artisan: string;
  care_instructions: string | null;
  sku: string | null;
  is_visible: boolean;
  is_featured: boolean;
  is_new: boolean;
  created_at: string;
  updated_at: string;
};

export type CreateProductInput = Omit<Product, 'id' | 'created_at' | 'updated_at'>;
export type UpdateProductInput = Partial<CreateProductInput>;
