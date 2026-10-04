import { Routes } from '@angular/router';
import { roleGuard } from '@restaurant-os/auth-client';

export const routes: Routes = [
  { path: '', redirectTo: 'kitchen', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'forbidden',
    loadComponent: () =>
      import('./pages/forbidden/forbidden.component').then(
        (m) => m.ForbiddenComponent,
      ),
  },
  {
    path: 'kitchen',
    canActivate: [roleGuard(['KITCHEN', 'ADMIN'], '/forbidden')],
    loadComponent: () =>
      import('./pages/kitchen/kitchen.component').then(
        (m) => m.KitchenComponent,
      ),
  },
  { path: '**', redirectTo: 'kitchen' },
];
