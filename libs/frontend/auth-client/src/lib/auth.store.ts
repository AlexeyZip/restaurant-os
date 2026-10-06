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
            // Nest sends a string for most errors but an array of strings
            // when request validation fails (one entry per broken rule).
            const message: unknown = error.error?.message;
            patchState(store, {
              loading: false,
              error: Array.isArray(message)
                ? message.join('. ')
                : typeof message === 'string'
                  ? message
                  : 'Registration failed',
            });
          } else {
            patchState(store, {
              loading: false,
              error: 'Registration failed',
            });
          }
        }
      },
      // Resolves to true when a new access token was obtained. The interceptor
      // relies on this to decide between "retry the request" and "log out".
      async refreshToken(): Promise<boolean> {
        try {
          patchState(store, { loading: true, error: null });
          const response = await authApi.refreshToken();
          applyAccessToken(response.accessToken);
          patchState(store, { loading: false, error: null });
          return true;
        } catch {
          patchState(store, { loading: false });
          return false;
        }
      },
      async logout() {
        // Clear local state first so the UI reacts immediately, then tell the
        // server to invalidate the refresh token and drop its cookie. Without
        // this call the cookie survives and the app initializer would simply
        // log the user back in on the next page load.
        patchState(store, initialState);
        try {
          await authApi.logout();
        } catch {
          // Offline or already expired: local logout has still happened.
        }
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
