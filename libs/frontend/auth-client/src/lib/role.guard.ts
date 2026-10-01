import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from './auth.store';

/**
 * Factory, not a plain guard: Angular's `canActivate` only accepts
 * `CanActivateFn` (token, no arguments), so the required roles have to be
 * bound via a closure at route-definition time, e.g.
 * `canActivate: [roleGuard('ADMIN')]`.
 */
export function roleGuard(...allowedRoles: string[]): CanActivateFn {
  return () => {
    const authStore = inject(AuthStore);
    const router = inject(Router);

    if (!authStore.isAuthenticated()) {
      return router.createUrlTree(['/login']);
    }

    if (!allowedRoles.some((role) => authStore.hasRole(role))) {
      // Authenticated, just not allowed here - back to a safe page rather
      // than a dead end or a confusing re-prompt for login.
      return router.createUrlTree(['/']);
    }

    return true;
  };
}
