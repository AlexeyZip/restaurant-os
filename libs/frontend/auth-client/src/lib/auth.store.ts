import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthApiService } from './auth-api.service';
import { decodeAccessToken } from './jwt-payload';

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
  withMethods((store, authApi = inject(AuthApiService)) => {
    // Shared by login/register/refreshToken: the access token is the only
    // thing the backend returns, but userId/email/roles the rest of the app
    // needs (e.g. a future role-based guard) only exist inside its payload.
    function applyAccessToken(accessToken: string) {
      const payload = decodeAccessToken(accessToken);
      patchState(store, {
        accessToken,
        userId: payload.sub,
        email: payload.email,
        roles: payload.roles,
      });
    }

    return {
      async login(email: string, password: string) {
        try {
          patchState(store, { loading: true, error: null });
          const response = await authApi.login(email, password);
          applyAccessToken(response.accessToken);
          patchState(store, { loading: false, error: null });
        } catch {
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
          applyAccessToken(response.accessToken);
          patchState(store, { loading: false, error: null });
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
      async refreshToken() {
        try {
          patchState(store, { loading: true, error: null });
          const response = await authApi.refreshToken();
          applyAccessToken(response.accessToken);
          patchState(store, { loading: false, error: null });
        } catch {
          patchState(store, { loading: false });
        }
      },
      logout() {
        patchState(store, initialState);
      },
      isAuthenticated() {
        return !!store.accessToken();
      },
      hasRole(role: string) {
        return store.roles().includes(role);
      },
    };
  }),
);
