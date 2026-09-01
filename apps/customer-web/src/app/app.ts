import { Component, inject } from '@angular/core';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { ButtonComponent } from '@restaurant-os/ui';
import { AuthStore } from './stores/auth.store';
import { MatIconModule } from '@angular/material/icon';
import { CartStore } from './stores/cart.store';
import { MatBadgeModule } from '@angular/material/badge';

@Component({
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    ButtonComponent,
    MatIconModule,
    MatBadgeModule,
  ],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly cartStore = inject(CartStore);

  get isAuthenticated() {
    return this.authStore.isAuthenticated();
  }

  get totalItems() {
    return this.cartStore.totalCount();
  }

  onLogout() {
    this.authStore.logout();
    this.router.navigate(['/login']);
  }
}
