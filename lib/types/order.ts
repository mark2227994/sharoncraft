export type OrderItem = {
  product_id?: string | null;
  name: string;
  quantity: number;
  price: number;
  image?: string | null;
};

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'in_production'
  | 'ready'
  | 'dispatched'
  | 'delivered'
  | 'cancelled';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export type Order = {
  id: string;
  order_id: string;
  customer_name: string;
  customer_phone: string | null;
  customer_email?: string | null;
  customer_location: string | null;
  items: OrderItem[];
  total_amount: number;
  designer_cost: number;
  profit: number;
  payment_method: string | null;
  payment_status: PaymentStatus | string | null;
  order_status: OrderStatus;
  notes: string | null;
  rider_name: string | null;
  rider_phone: string | null;
  estimated_delivery: string | null;
  delivered_at: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateOrderInput = Omit<Order, 'id' | 'order_id' | 'profit' | 'created_at' | 'updated_at'>;
export type UpdateOrderInput = Partial<CreateOrderInput>;
