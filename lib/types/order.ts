export type OrderItem = {
  product_id: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
};

export type Order = {
  id: string;
  customer_name: string;
  customer_phone: string | null;
  customer_email: string | null;
  customer_location: string | null;
  customer_whatsapp: string | null;
  items: OrderItem[];
  total_amount: number;
  payment_method: string | null;
  payment_status: 'pending' | 'completed' | 'failed';
  order_status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  tracking_number: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateOrderInput = Omit<Order, 'id' | 'created_at' | 'updated_at'>;
export type UpdateOrderInput = Partial<CreateOrderInput>;
