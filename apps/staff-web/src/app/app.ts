import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthStore } from '@restaurant-os/auth-client';
import { ButtonComponent } from '@restaurant-os/ui';

@Component({
  imports: [RouterOutlet, ButtonComponent],
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

  get email() {
    return this.authStore.email();
  }

  onLogout() {
    this.authStore.logout();
    this.router.navigate(['/login']);
  }
}
