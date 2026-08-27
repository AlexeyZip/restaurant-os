import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ButtonComponent } from '@restaurant-os/ui';
import { AuthStore } from './stores/auth.store';

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ButtonComponent],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);

  get isAuthenticated() {
    return this.authStore.isAuthenticated();
  }

  onLogout() {
    this.authStore.logout();
    this.router.navigate(['/login']);
  }
}
