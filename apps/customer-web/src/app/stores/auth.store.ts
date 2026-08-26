import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { inject } from '@angular/core';
import { AuthApiService } from '../services/auth-api.service';
import { HttpErrorResponse } from '@angular/common/http';

export interface AuthState {
  accessToken: string | null;
  userId: string | null;
  email: string | null;
  roles: string[];
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  accessToken: null,
  userId: null,
  email: null,
  roles: [],
  loading: false,
  error: null,
};

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, authApi = inject(AuthApiService)) => ({
    async login(email: string, password: string) {
      try {
        patchState(store, { loading: true, error: null });
        const response = await authApi.login(email, password);
        patchState(store, {
          accessToken: response.accessToken,
          loading: false,
          error: null,
        });
      } catch (error) {
        patchState(store, {
          loading: false,
          error: 'Incorrect email or password',
        });
      }
    },
    async register(email: string, password: string) {
      try {
        patchState(store, { loading: true, error: null });
        await authApi.register(email, password);
        const response = await authApi.login(email, password);
        patchState(store, {
          accessToken: response.accessToken,
          loading: false,
          error: null,
        });
      } catch (error: unknown) {
        if (error instanceof HttpErrorResponse) {
          patchState(store, {
            loading: false,
            error: error.error.message,
          });
        } else {
          patchState(store, {
            loading: false,
            error: 'Registration failed',
          });
        }
      }
    },
    logout() {
      patchState(store, initialState);
    },
    isAuthenticated() {
      return !!store.accessToken();
    },
  })),
);
