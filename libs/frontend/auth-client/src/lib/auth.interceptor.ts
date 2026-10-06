import {
  HttpErrorResponse,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, from, switchMap, throwError } from 'rxjs';
import { AuthStore } from './auth.store';

type AuthStoreInstance = InstanceType<typeof AuthStore>;

// Login/register/refresh/logout answer 401 for their own reasons (wrong
// password, dead refresh cookie). Retrying them through a refresh would at
// best be pointless and at worst loop forever, so they are left alone.
const AUTH_ENDPOINT = /\/auth\/(login|register|refresh|logout)(\?|$)/;

// Single-flight: when several requests hit 401 at the same time they must
// share ONE refresh call. The backend refresh token is single-use, so a
// second parallel refresh would be rejected and log the user out.
let refreshInFlight: Promise<boolean> | null = null;

function refreshOnce(authStore: AuthStoreInstance): Promise<boolean> {
  refreshInFlight ??= authStore.refreshToken().finally(() => {
    refreshInFlight = null;
  });
  return refreshInFlight;
}

// Returns a token that is worth retrying with, or null if the session is gone.
async function recoverToken(
  authStore: AuthStoreInstance,
  rejectedToken: string,
): Promise<string | null> {
  // Another request may already have refreshed while this one was in flight;
  // then the current token is newer than the one that was rejected.
  const current = authStore.accessToken();
  if (current && current !== rejectedToken) {
    return current;
  }

  const refreshed = await refreshOnce(authStore);
  return refreshed ? authStore.accessToken() : null;
}

function withToken(req: HttpRequest<unknown>, token: string) {
  return req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);
  const token = authStore.accessToken();

  return next(token ? withToken(req, token) : req).pipe(
    catchError((error: unknown) => {
      const isExpiredSession =
        token &&
        error instanceof HttpErrorResponse &&
        error.status === 401 &&
        !AUTH_ENDPOINT.test(req.url);

      if (!isExpiredSession) {
        return throwError(() => error);
      }

      return from(recoverToken(authStore, token)).pipe(
        switchMap((newToken) => {
          if (!newToken) {
            // Refresh failed: the session is really over.
            authStore.logout();
            router.navigate(['/login']);
            return throwError(() => error);
          }
          return next(withToken(req, newToken));
        }),
      );
    }),
  );
};
