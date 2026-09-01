import {
  signalStore,
  withState,
  withMethods,
  withComputed,
  patchState,
} from '@ngrx/signals';
import { computed, inject } from '@angular/core';
import { MenuCategory } from '../models/menu.model';
import { MenuApiService } from '../services/menu-api.service';

export interface MenuState {
  categories: MenuCategory[];
  loading: boolean;
  error: string | null;
  loaded: boolean;
}

const initialState: MenuState = {
  categories: [],
  loading: false,
  error: null,
  loaded: false,
};

export const MenuStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, menuApi = inject(MenuApiService)) => ({
    async loadCategories() {
      if (store.loaded()) {
        return;
      }

      try {
        patchState(store, { loading: true, error: null });
        const categories = await menuApi.getCategories();
        patchState(store, { categories, loading: false, loaded: true });
      } catch {
        patchState(store, {
          loading: false,
          error: 'Failed to load menu',
        });
      }
    },
  })),
  withComputed((store) => ({
    allDishes: computed(() =>
      store.categories().flatMap((category) => category.dishes),
    ),
  })),
);
