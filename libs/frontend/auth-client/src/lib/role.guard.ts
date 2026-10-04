import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from './auth.store';

/**
 * Factory, not a plain guard: Angular's `canActivate` only accepts
 * `CanActivateFn` (token, no arguments), so the required roles have to be
 * bound via a closure at route-definition time, e.g.
 * `canActivate: [roleGuard(['ADMIN'], '/forbidden')]`.
 *
 * `forbiddenUrl` must NOT itself be guarded by (or redirect into) a route
 * that uses this guard, otherwise a logged-in user with the wrong role
 * bounces between the two forever.
 */
export function roleGuard(
  allowedRoles: string[],
  forbiddenUrl = '/',
): CanActivateFn {
  return () => {
    const authStore = inject(AuthStore);
    const router = inject(Router);

    if (!authStore.isAuthenticated()) {
      return router.createUrlTree(['/login']);
    }

    if (!allowedRoles.some((role) => authStore.hasRole(role))) {
      return router.createUrlTree([forbiddenUrl]);
    }

    return true;
  };
}
