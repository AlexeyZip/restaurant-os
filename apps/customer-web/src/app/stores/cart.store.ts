import {
  signalStore,
  withState,
  withMethods,
  withComputed,
  patchState,
  withHooks,
} from '@ngrx/signals';
import { computed, effect, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MenuStore } from './menu.store';
import { Dish } from '../models/menu.model';
import { CartItem, CartState } from '../models/cart.model';
import { CreateOrderPayload } from '../models/order.model';
import { OrdersApiService } from '../services/orders-api.service';

const CART_STORAGE_KEY = 'cart';

function loadPersistedItems(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    // Corrupted localStorage - start fresh instead of crashing the app.
    return [];
  }
}

const initialState: CartState = {
  items: loadPersistedItems(),
  submitting: false,
  error: null,
};

export const CartStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withHooks({
    onInit(store) {
      effect(() => {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(store.items()));
      });
    },
  }),
  withMethods((store, ordersApi = inject(OrdersApiService)) => ({
    addItem(dishId: string) {
      const items = store.items();
      const existing = items.find((item) => item.dishId === dishId);
      if (existing) {
        patchState(store, {
          items: items.map((item) =>
            item.dishId === dishId
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          ),
        });
      } else {
        patchState(store, { items: [...items, { dishId, quantity: 1 }] });
      }
    },
    setQuantity(dishId: string, quantity: number) {
      const items = store.items();

      if (quantity <= 0) {
        patchState(store, {
          items: items.filter((item) => item.dishId !== dishId),
        });
      } else {
        patchState(store, {
          items: items.map((item) =>
            item.dishId === dishId ? { ...item, quantity } : item,
          ),
        });
      }
    },
    removeItem(dishId: string) {
      patchState(store, {
        items: store.items().filter((item) => item.dishId !== dishId),
      });
    },
    clear() {
      patchState(store, { items: [] });
    },
    async submitOrder(payload: CreateOrderPayload): Promise<void> {
      patchState(store, { submitting: true, error: null });

      try {
        await ordersApi.createOrder(payload);
        patchState(store, { items: [], submitting: false });
      } catch (error: unknown) {
        const message =
          error instanceof HttpErrorResponse &&
          typeof error.error?.message === 'string'
            ? error.error.message
            : 'Failed to place order. Please try again.';
        patchState(store, { submitting: false, error: message });
      }
    },
  })),
  withComputed((store, menuStore = inject(MenuStore)) => {
    const itemsWithDetails = computed(() => {
      const dishes = menuStore.allDishes();

      return store
        .items()
        .map((item) => ({
          dishId: item.dishId,
          quantity: item.quantity,
          dish: dishes.find((dish) => dish.id === item.dishId),
        }))
        .filter(
          (item): item is { dishId: string; quantity: number; dish: Dish } =>
            item.dish !== undefined,
        );
    });

    return {
      totalCount: computed(() =>
        store.items().reduce((sum, item) => sum + item.quantity, 0),
      ),
      itemsWithDetails,
      totalPrice: computed(() =>
        itemsWithDetails().reduce(
          (sum, item) => sum + item.dish.basicPrice * item.quantity,
          0,
        ),
      ),
    };
  }),
);
