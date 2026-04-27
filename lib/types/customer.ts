export type Customer = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  location: string | null;
  total_orders: number;
  total_spent: number;
  created_at: string;
};

export type CreateCustomerInput = Omit<Customer, 'id' | 'total_orders' | 'total_spent' | 'created_at'>;
export type UpdateCustomerInput = Partial<CreateCustomerInput>;
