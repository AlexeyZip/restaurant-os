export interface CartState {
  items: CartItem[];
  submitting: boolean;
  error: string | null;
}

export interface CartItem {
  dishId: string;
  quantity: number;
}
