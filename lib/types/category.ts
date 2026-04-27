export type Category = {
  id: string;
  name: string;
  subcategories: string[];
  image_url: string | null;
  is_visible: boolean;
  display_order: number;
  created_at: string;
};

export type CreateCategoryInput = Omit<Category, 'id' | 'created_at'>;
export type UpdateCategoryInput = Partial<CreateCategoryInput>;
