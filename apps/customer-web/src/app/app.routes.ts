import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'menu', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/register/register.component').then(
        (m) => m.RegisterComponent,
      ),
  },
  {
    path: 'menu',
    loadComponent: () =>
      import('./pages/menu/menu.component').then((m) => m.MenuComponent),
  },
  {
    path: 'orders',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/orders/orders.component').then((m) => m.OrdersComponent),
  },
  {
    path: 'reservations',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/reservations/reservations.component').then(
        (m) => m.ReservationsComponent,
      ),
  },
  { path: '**', redirectTo: 'menu' },
];
