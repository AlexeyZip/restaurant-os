import {
  signalStore,
  withState,
  withMethods,
  withComputed,
  patchState,
  withHooks,
} from '@ngrx/signals';
import { computed, effect, inject } from '@angular/core';
import { MenuStore } from './menu.store';
import { Dish } from '../models/menu.model';
import { CartItem, CartState } from '../models/cart.model';

const CART_STORAGE_KEY = 'cart';

function loadPersistedItems(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    // Corrupted/unexpected JSON in localStorage - start fresh rather than
    // crash the whole app on load.
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
  withMethods((store) => ({
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
    // TODO: implement alongside CartComponent - build a CreateOrderPayload
    // from `store.items()` + checkout form details, call
    // OrdersApiService.createOrder, then clear() on success.
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    submitOrder() {},
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
