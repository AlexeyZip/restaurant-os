export type OrderType = 'DINE_IN' | 'DELIVERY' | 'TAKEAWAY';

export type OrderStatus =
  | 'CREATED'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'READY'
  | 'OUT_FOR_DELIVERY'
  | 'COMPLETED'
  | 'CANCELLED';

export interface OrderDetails {
  orderType: OrderType;
  tableNumber?: number;
  deliveryAddress?: string;
  notes?: string;
}

export interface CreateOrderItem {
  dishId: string;
  quantity: number;
}

export interface CreateOrderPayload extends OrderDetails {
  items: CreateOrderItem[];
}

export interface OrderItem {
  id: string;
  dishId: string;
  dishName: string;
  unitPrice: number;
  quantity: number;
}

export interface Order extends OrderDetails {
  id: string;
  userId: string;
  status: OrderStatus;
  totalPrice: number;
  items: OrderItem[];
}
