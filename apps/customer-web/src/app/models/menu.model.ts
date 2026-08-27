export type DishAvailability = 'AVAILABLE' | 'UNAVAILABLE' | 'HIDDEN';

export interface Dish {
  id: string;
  name: string;
  description: string | null;
  basicPrice: number;
  imageUrl: string | null;
  categoryId: string;
  availability: DishAvailability;
}

export interface MenuCategory {
  id: string;
  name: string;
  order: number;
  available: boolean;
  dishes: Dish[];
}
